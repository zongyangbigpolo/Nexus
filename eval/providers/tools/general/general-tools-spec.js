
export const generalToolsSpecs = [
	{
		type: 'function',
		function: {
			name: 'repo_listDir',
			description: 'List files and folders in a repository directory. Use this to discover project structure and verify folders such as .github/tasks exist.',
			parameters: {
				type: 'object',
				properties: {
					path: { type: 'string', description: 'Absolute or workspace-relative directory path to list.' }
				},
				required: ['path']
			}
		}
	},
	{
		type: 'function',
		function: {
			name: 'repo_readFile',
			description: 'Read the contents of a repository file. Use this for AGENTS.md, templates, task files, and source files needed for context.',
			parameters: {
				type: 'object',
				properties: {
					path: { type: 'string', description: 'Absolute or workspace-relative file path to read.' },
					startLine: { type: 'number', description: 'Optional 1-based start line.' },
					endLine: { type: 'number', description: 'Optional 1-based end line.' }
				},
				required: ['path']
			}
		}
	},
	{
		type: 'function',
		function: {
			name: 'repo_search',
			description: 'Search for files or text in the repository. Use this to find AGENTS.md, task templates, and relevant implementation files.',
			parameters: {
				type: 'object',
				properties: {
					query: { type: 'string', description: 'Text or regex query to search for.' },
					glob: { type: 'string', description: 'Optional glob filter such as **/*.md or .github/**.' },
					mode: { type: 'string', description: 'Search mode: files or content.' }
				},
				required: ['query']
			}
		}
	},
	{
		type: 'function',
		function: {
			name: 'repo_fileExists',
			description: 'Check whether a file or directory exists. Use this before creating .github/tasks files or branch-related artifacts.',
			parameters: {
				type: 'object',
				properties: {
					path: { type: 'string', description: 'Absolute or workspace-relative file or directory path.' }
				},
				required: ['path']
			}
		}
	},
	{
		type: 'function',
		function: {
			name: 'repo_createDirectory',
			description: 'Create a directory in the repository, including parents as needed. Use this to create .github/tasks when missing.',
			parameters: {
				type: 'object',
				properties: {
					path: { type: 'string', description: 'Absolute or workspace-relative directory path to create.' }
				},
				required: ['path']
			}
		}
	},
	{
		type: 'function',
		function: {
			name: 'repo_writeFile',
			description: 'Create or overwrite a repository file. Use this to create task files such as .github/tasks/{JIRA_ID}-task.md.',
			parameters: {
				type: 'object',
				properties: {
					path: { type: 'string', description: 'Absolute or workspace-relative file path.' },
					content: { type: 'string', description: 'Full file content to write.' },
					overwrite: { type: 'boolean', description: 'Whether an existing file may be overwritten.' }
				},
				required: ['path', 'content']
			}
		}
	},
	{
		type: 'function',
		function: {
			name: 'repo_editFile',
			description: 'Edit an existing repository file by replacing text. Use this to update task files during coordination.',
			parameters: {
				type: 'object',
				properties: {
					path: { type: 'string', description: 'Absolute or workspace-relative file path.' },
					find: { type: 'string', description: 'Exact text to replace.' },
					replace: { type: 'string', description: 'Replacement text.' }
				},
				required: ['path', 'find', 'replace']
			}
		}
	},
	{
		type: 'function',
		function: {
			name: 'git_status',
			description: 'Get the current git working tree status. Use this before branch creation or submission steps.',
			parameters: {
				type: 'object',
				properties: {
					repositoryPath: { type: 'string', description: 'Optional repository root path.' }
				},
				required: []
			}
		}
	},
	{
		type: 'function',
		function: {
			name: 'git_currentBranch',
			description: 'Get the currently checked out git branch for the repository.',
			parameters: {
				type: 'object',
				properties: {
					repositoryPath: { type: 'string', description: 'Optional repository root path.' }
				},
				required: []
			}
		}
	},
	{
		type: 'function',
		function: {
			name: 'git_createBranch',
			description: 'Create a new branch from a specified base branch. Use this for feature/[JIRA-ID]-[BranchName] branches required by the task workflow.',
			parameters: {
				type: 'object',
				properties: {
					repositoryPath: { type: 'string', description: 'Optional repository root path.' },
					branchName: { type: 'string', description: 'Branch to create.' },
					baseBranch: { type: 'string', description: 'Base branch to create from, typically master or main.' },
					checkout: { type: 'boolean', description: 'Whether to switch to the new branch immediately.' }
				},
				required: ['branchName', 'baseBranch']
			}
		}
	},
	{
		type: 'function',
		function: {
			name: 'git_checkoutBranch',
			description: 'Switch the repository to an existing branch.',
			parameters: {
				type: 'object',
				properties: {
					repositoryPath: { type: 'string', description: 'Optional repository root path.' },
					branchName: { type: 'string', description: 'Branch to check out.' }
				},
				required: ['branchName']
			}
		}
	},
	{
		type: 'function',
		function: {
			name: 'git_commit',
			description: 'Commit staged changes in the repository. Needed for the completion phase after code and task file updates are ready.',
			parameters: {
				type: 'object',
				properties: {
					repositoryPath: { type: 'string', description: 'Optional repository root path.' },
					message: { type: 'string', description: 'Commit message.' }
				},
				required: ['message']
			}
		}
	},
	{
		type: 'function',
		function: {
			name: 'git_push',
			description: 'Push the current or specified branch to a remote repository. Needed before opening a pull request.',
			parameters: {
				type: 'object',
				properties: {
					repositoryPath: { type: 'string', description: 'Optional repository root path.' },
					remote: { type: 'string', description: 'Remote name, usually origin.' },
					branchName: { type: 'string', description: 'Branch to push.' }
				},
				required: []
			}
		}
	}
];
