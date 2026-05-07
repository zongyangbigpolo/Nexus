// Copyright © 2026. Citrix Systems, Inc. All Rights Reserved. Confidential & Proprietary.
// Mock provider for general repository filesystem and git tools

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export function callApi(prompt, options, context) {
	const toolCallMatch = prompt.match(/\b(repo_\w+|git_\w+)\b/);

	if (!toolCallMatch) {
        return null;
	}

	const toolName = toolCallMatch[1];
	const args = parseArgs(prompt, toolName);
	const mockData = getMockRepoData(prompt, options, context, args);

	switch (toolName) {
        case 'repo_listDir': {
            return {
                output: JSON.stringify({
                    path: args.path || mockData.repoRoot,
                    entries: getDirectoryEntries(args.path || mockData.repoRoot, mockData)
                }),
                tokenUsage: { total: 20, prompt: 10, completion: 10 }
            };
        }
		case 'repo_readFile': {
			const filePath = args.path || `${mockData.repoRoot}/AGENTS.md`;

			let content;

			// Prefer in-memory mock files when available
			if (mockData && mockData.files) {
				// Try exact key first
				if (Object.prototype.hasOwnProperty.call(mockData.files, filePath)) {
					content = mockData.files[filePath];
				} else if (args.path && Object.prototype.hasOwnProperty.call(mockData.files, args.path)) {
					// Also try the raw args.path as a key (repo-root-relative)
					content = mockData.files[args.path];
				}
			}

			// If no path was specified and nothing is in mockData, fall back to AGENTS.md
			if (content == null) {
				if (!args.path) {
					content = readFileSync(join(__dirname, '../../dataset/AGENTS.md'), 'utf8');
				} else {
					// When a specific path is requested but not found in mock data,
					// do not fall back to AGENTS.md; return empty content instead.
					content = '';
				}
			}
			// Normalize and apply line range if provided
			const startLine = args.startLine != null ? Number(args.startLine) : 1;
			const endLine = args.endLine != null ? Number(args.endLine) : null;

			let slicedContent = content;
			if ((startLine && startLine > 1) || endLine != null) {
				const lines = content.split('\n');
				const startIndex = Math.max(0, (startLine || 1) - 1);
				const endIndex = endLine != null ? Math.min(lines.length, endLine) : lines.length;
				slicedContent = lines.slice(startIndex, endIndex).join('\n');
			}

			return {
				output: JSON.stringify({
					path: filePath,
					content: slicedContent,
					startLine,
					endLine
				}),
				tokenUsage: { total: 25, prompt: 12, completion: 13 }
			};
		}

		case 'repo_search': {
                return {
                    output: JSON.stringify({
                        query: args.query || '',
                        glob: args.glob || null,
                        mode: args.mode || 'content',
                        results: getSearchResults(args, mockData)
                    }),
                    tokenUsage: { total: 30, prompt: 15, completion: 15 }
                };

            }

		case 'repo_fileExists': {
			const filePath = args.path || `${mockData.repoRoot}/AGENTS.md`;
			return {
				output: JSON.stringify({ path: filePath, exists: fileExists(filePath, mockData) }),
				tokenUsage: { total: 12, prompt: 6, completion: 6 }
			};
		}

		case 'repo_createDirectory':
			return {
				output: JSON.stringify({
					success: true,
					path: args.path || `${mockData.repoRoot}/.github/tasks`,
					created: true
				}),
				tokenUsage: { total: 16, prompt: 8, completion: 8 }
			};

		case 'repo_writeFile':
			return {
				output: JSON.stringify({
					success: true,
					path: args.path || `${mockData.repoRoot}/.github/tasks/${mockData.jiraId}-task.md`,
					overwrite: Boolean(args.overwrite),
					bytesWritten: (args.content || '').length
				}),
				tokenUsage: { total: 18, prompt: 9, completion: 9 }
			};

		case 'repo_editFile':
			return {
				output: JSON.stringify({
					success: true,
					path: args.path || `${mockData.repoRoot}/.github/tasks/${mockData.jiraId}-task.md`,
					replacements: 1
				}),
				tokenUsage: { total: 18, prompt: 9, completion: 9 }
			};

		case 'git_status':
			return {
				output: JSON.stringify({
					repositoryPath: args.repositoryPath || mockData.repoRoot,
					branch: mockData.currentBranch,
					clean: true,
					staged: [],
					unstaged: [],
					untracked: []
				}),
				tokenUsage: { total: 18, prompt: 8, completion: 10 }
			};

		case 'git_currentBranch':
			return {
				output: JSON.stringify({
					repositoryPath: args.repositoryPath || mockData.repoRoot,
					branch: mockData.currentBranch
				}),
				tokenUsage: { total: 12, prompt: 6, completion: 6 }
			};

		case 'git_createBranch': {
			const branchName = args.branchName || mockData.featureBranch;
			return {
				output: JSON.stringify({
					success: true,
					repositoryPath: args.repositoryPath || mockData.repoRoot,
					branchName,
					baseBranch: args.baseBranch || 'master',
					checkedOut: args.checkout !== false
				}),
				tokenUsage: { total: 20, prompt: 10, completion: 10 }
			};
		}

		case 'git_checkoutBranch':
			return {
				output: JSON.stringify({
					success: true,
					repositoryPath: args.repositoryPath || mockData.repoRoot,
					branchName: args.branchName || mockData.featureBranch
				}),
				tokenUsage: { total: 14, prompt: 7, completion: 7 }
			};

		case 'git_commit':
			return {
				output: JSON.stringify({
					success: true,
					repositoryPath: args.repositoryPath || mockData.repoRoot,
					branch: mockData.featureBranch,
					commit: 'abc1234',
					message: args.message || `${mockData.jiraId} Update task implementation`
				}),
				tokenUsage: { total: 20, prompt: 10, completion: 10 }
			};

		case 'git_push':
			return {
				output: JSON.stringify({
					success: true,
					repositoryPath: args.repositoryPath || mockData.repoRoot,
					remote: args.remote || 'origin',
					branchName: args.branchName || mockData.featureBranch,
					pushed: true
				}),
				tokenUsage: { total: 18, prompt: 9, completion: 9 }
			};

		default:
			throw new Error(`Unknown general tool invoked: ${toolName}`);
	}
}

function parseArgs(prompt, toolName) {
	const trimmed = prompt.slice(prompt.indexOf(toolName) + toolName.length).trim();

	if (!trimmed) {
		return {};
	}

	try {
		return JSON.parse(trimmed);
	} catch {
		return {};
	}
}

function getMockRepoData(prompt, options, context, args) {
	const jiraId = options?.vars?.jira ?? (prompt.match(/\b([A-Z]+-\d+)\b/)?.[1] ?? 'SPA-0000');
	const repoRoot = args.repositoryPath || '/workspace/ztna-ui-hello-world-mfe';
	const branchSuffix = jiraId.replace(/[^A-Za-z0-9-]/g, '-');
	const mfeName = 'ztna-ui-hello-world-mfe';

	return {
		jiraId,
		repoRoot,
		currentBranch: 'master',
		featureBranch: `feature/${branchSuffix}-implement-task`,
		files: {
			// Root-level files
			[`${repoRoot}/AGENTS.md`]: readFileSync(join(__dirname, '../../dataset/AGENTS.md'), 'utf8'),
			[`${repoRoot}/ARCHITECTURE.md`]: '# ARCHITECTURE.md\n\nRepository architecture overview for AI agents.\n',
			[`${repoRoot}/README.md`]: `# ${mfeName}\n\nReact 18 micro-frontend for the SPA console.\n`,

			// app/package.json
			[`${repoRoot}/app/package.json`]: JSON.stringify({
				name: `@citrix/${mfeName}`,
				version: '1.0.0',
				scripts: {
					start: 'webpack serve --config webpack.config.js',
					'start:onprem': 'webpack serve --config webpack.onprem.config.js',
					build: 'npm run build:base && npm run build:onprem',
					test: 'jest',
					coverage: 'jest --coverage'
				},
				dependencies: {
					react: '^18.2.0',
					'react-dom': '^18.2.0',
					'react-router-dom': '^6.14.0',
					'@reduxjs/toolkit': '^1.9.5',
					'react-redux': '^8.1.1',
					'single-spa-react': '^6.0.0',
					'@citrix/rdx': '^4.0.0',
					'@citrix/ztna-ui-utility-module': '^3.0.0',
					'semantic-ui-react': '^2.1.4'
				}
			}, null, 2),

			// MFE single-spa entry point
			[`${repoRoot}/app/src/${mfeName}.js`]: [
				"import React from 'react';",
				"import ReactDOM from 'react-dom';",
				"import singleSpaReact from 'single-spa-react';",
				"import App from './App';",
				'',
				'const lifecycles = singleSpaReact({',
				'  React,',
				'  ReactDOM,',
				'  rootComponent: App,',
				"  errorBoundary: (err) => <div>Error: {err.message}</div>",
				'});',
				'',
				'export const { bootstrap, mount, unmount } = lifecycles;'
			].join('\n'),

			// App root
			[`${repoRoot}/app/src/App.js`]: [
				"import React from 'react';",
				"import { Provider } from 'react-redux';",
				"import { store } from './data/store';",
				"import Routes from './Routes';",
				'',
				'export default function App() {',
				'  return (',
				'    <Provider store={store}>',
				'      <Routes />',
				'    </Provider>',
				'  );',
				'}'
			].join('\n'),

			// Routes
			[`${repoRoot}/app/src/Routes.js`]: [
				"import React from 'react';",
				"import { Switch, Route } from 'react-router-dom';",
				"import HelloWorldPage from './features/HelloWorld/HelloWorldPage';",
				'',
				'export default function Routes() {',
				'  return (',
				'    <Switch>',
				"      <Route exact path='/helloWorld' component={HelloWorldPage} />",
				'    </Switch>',
				'  );',
				'}'
			].join('\n'),

			// Feature component
			[`${repoRoot}/app/src/features/HelloWorld/HelloWorldPage.jsx`]: [
				"import React from 'react';",
				"import { useSelector } from 'react-redux';",
				"import { Container, Header } from 'semantic-ui-react';",
				"import { selectItems } from '../../data/helloWorldSlice';",
				"import './HelloWorldPage.css';",
				'',
				'export default function HelloWorldPage() {',
				'  const items = useSelector(selectItems);',
				'  return (',
				'    <Container>',
				'      <Header as="h1" data-cy="hello-world-heading">Hello World</Header>',
				'    </Container>',
				'  );',
				'}'
			].join('\n'),
			[`${repoRoot}/app/src/features/HelloWorld/HelloWorldPage.css`]: '.hello-world-page { padding: 1rem; }\n',
			[`${repoRoot}/app/src/features/HelloWorld/HelloWorldPage.spec.js`]: [
				"import React from 'react';",
				"import { render, screen } from '@testing-library/react';",
				"import { Provider } from 'react-redux';",
				"import { store } from '../../data/store';",
				"import HelloWorldPage from './HelloWorldPage';",
				'',
				"describe('HelloWorldPage', () => {",
				"  it('renders heading', () => {",
				'    render(<Provider store={store}><HelloWorldPage /></Provider>);',
				"    expect(screen.getByText('Hello World')).toBeInTheDocument();",
				'  });',
				'});'
			].join('\n'),

			// Redux slice + API + store
			[`${repoRoot}/app/src/data/helloWorldSlice.js`]: [
				"import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';",
				"import { fetchItems } from './helloWorldApi';",
				'',
				"export const loadItems = createAsyncThunk('helloWorld/loadItems', () => fetchItems());",
				'',
				'const helloWorldSlice = createSlice({',
				"  name: 'helloWorld',",
				'  initialState: { items: [], status: null },',
				'  reducers: {},',
				'  extraReducers: (builder) => {',
				'    builder.addCase(loadItems.fulfilled, (state, action) => {',
				'      state.items = action.payload;',
				'    });',
				'  }',
				'});',
				'',
				'export const selectItems = (state) => state.helloWorld.items;',
				'export default helloWorldSlice.reducer;'
			].join('\n'),
			[`${repoRoot}/app/src/data/helloWorldApi.js`]: [
				"import axios from 'axios';",
				'',
				'export async function fetchItems() {',
				"  const { data } = await axios.get('/api/hello-world/items');",
				'  return data;',
				'}'
			].join('\n'),
			[`${repoRoot}/app/src/data/store.js`]: [
				"import { configureStore } from '@reduxjs/toolkit';",
				"import helloWorldReducer from './helloWorldSlice';",
				'',
				'export const store = configureStore({',
				'  reducer: { helloWorld: helloWorldReducer }',
				'});'
			].join('\n'),

			// i18n
			[`${repoRoot}/app/src/lang/en-US.json`]: JSON.stringify({
				'helloWorld.title': 'Hello World',
				'helloWorld.description': 'Welcome to the Hello World MFE.'
			}, null, 2),

			// Cypress Page Object + selectors
			[`${repoRoot}/test/cypress/e2e/pageobjects/HelloWorldPage.js`]: [
				"import selectors from '../selectors.json';",
				'',
				'export class HelloWorldPage {',
				'  visit() { cy.visit("/helloWorld"); }',
				'  getHeading() { return cy.get(selectors.helloWorld.heading); }',
				'}'
			].join('\n'),
			[`${repoRoot}/test/cypress/e2e/selectors.json`]: JSON.stringify({
				helloWorld: { heading: '[data-cy="hello-world-heading"]' }
			}, null, 2),

			// .github task files
			[`${repoRoot}/.github/agent-assets/templates/task-file.template.md`]: [
				'# ${JIRA_ID} Task',
				'',
				'## JIRA Context',
				'${JIRA_CONTEXT}',
				'',
				'## Implementation Plan',
				'',
				'## Progress',
				''
			].join('\n'),
			[`${repoRoot}/.github/tasks/${jiraId}-task.md`]: [
				`# ${jiraId} Task`,
				'',
				'## JIRA Context',
				`- Issue: ${jiraId}`,
				'- Status: In Progress',
				'',
				'## Implementation Plan',
				'',
				'## Progress',
				''
			].join('\n')
		},
		directories: {
			[repoRoot]: ['AGENTS.md', 'ARCHITECTURE.md', 'README.md', '.github/', 'app/', 'test/'],
			[`${repoRoot}/app`]: ['package.json', 'src/'],
			[`${repoRoot}/app/src`]: [`${mfeName}.js`, 'App.js', 'Routes.js', 'features/', 'data/', 'common/', 'assets/', 'lang/'],
			[`${repoRoot}/app/src/features`]: ['HelloWorld/'],
			[`${repoRoot}/app/src/features/HelloWorld`]: ['HelloWorldPage.jsx', 'HelloWorldPage.css', 'HelloWorldPage.spec.js'],
			[`${repoRoot}/app/src/data`]: ['store.js', 'helloWorldSlice.js', 'helloWorldApi.js'],
			[`${repoRoot}/app/src/common`]: [],
			[`${repoRoot}/app/src/assets`]: [],
			[`${repoRoot}/app/src/lang`]: ['en-US.json'],
			[`${repoRoot}/test`]: ['cypress/'],
			[`${repoRoot}/test/cypress`]: ['e2e/'],
			[`${repoRoot}/test/cypress/e2e`]: ['pageobjects/', 'selectors.json'],
			[`${repoRoot}/test/cypress/e2e/pageobjects`]: ['HelloWorldPage.js'],
			[`${repoRoot}/.github`]: ['agent-assets/', 'prompts/', 'tasks/'],
			[`${repoRoot}/.github/tasks`]: [`${jiraId}-task.md`],
			[`${repoRoot}/.github/agent-assets`]: ['templates/'],
			[`${repoRoot}/.github/agent-assets/templates`]: ['task-file.template.md']
		}
	};
}

function getDirectoryEntries(path, mockData) {
	const normalizedPath = path in mockData.directories ? path : mockData.repoRoot;
	return (mockData.directories[normalizedPath] || []).map(name => ({ name }));
}

function getFileContent(path, mockData) {
	return mockData.files[path] || `Mock file content for ${path}`;
}

function getSearchResults(args, mockData) {
	const mode = args.mode || 'content';
	const query = (args.query || '').toLowerCase();

	if (mode === 'files') {
		return Object.keys(mockData.files)
			.filter(path => path.toLowerCase().includes(query) || query.length === 0)
			.map(path => ({ path }));
	}

	return Object.entries(mockData.files)
		.filter(([path, content]) => path.toLowerCase().includes(query) || content.toLowerCase().includes(query))
		.map(([path, content]) => ({
			path,
			snippet: content.split('\n').slice(0, 4).join('\n')
		}));
}

function fileExists(path, mockData) {
	return path === 'AGENTS.md' || Boolean(mockData.files[path] || mockData.directories[path]);
}
