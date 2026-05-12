// Mock provider for Atlassian MCP Server tools or APIs (JIRA + Confluence)

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import { getMockJiraData } from '../../dataset/mock-jira-data.js';
import { getMockPage } from '../../dataset/mock-confluence-data.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const confluencePageDatasets = {  
  '834306930': JSON.parse(readFileSync(path.resolve(__dirname, '../../dataset/mock-confluence-page-feature-spec.json'), 'utf-8'))
};

export function callApi(prompt, options, context) {
  // Parse the prompt to detect which tool is being requested
  const toolCallMatch = prompt.match(/mcp_atlassian_(\w+)/);

  if (!toolCallMatch) {
    return null
  }

  const toolName = toolCallMatch[1];
  const jiraIdFromPrompt = prompt.match(/([A-Z]+-\d+)/);
  const jiraId = options?.vars?.jira || (jiraIdFromPrompt ? jiraIdFromPrompt[1] : 'APP-0000');
  const mockData = getMockJiraData(jiraId);

  switch (toolName) {

    // ── JIRA tools ──────────────────────────────────────────────────────────
    case 'getAccessibleAtlassianResources':
    case 'list_accessible_resources':
      return {
        output: JSON.stringify(mockData.accessibleResources),
        tokenUsage: { total: 15, prompt: 10, completion: 5 }
      };

    case 'getJiraIssue':
    case 'getIssue': {
      
      return {
        output: JSON.stringify(mockData.jiraIssues[jiraId]),
        tokenUsage: { total: 50, prompt: 20, completion: 30 }
      };
    }

    case 'search':
    case 'searchJiraIssuesUsingJql': {
      const queryMatch = prompt.match(/query[":]\s*["']([^"']+)["']/);
      const query = queryMatch ? queryMatch[1] : 'default';

      return {
        output: JSON.stringify(mockData.searchResults[query] || mockData.searchResults.default),
        tokenUsage: { total: 40, prompt: 15, completion: 25 }
      };
    }

    case 'fetch': {
      const ariMatch = prompt.match(/ari:cloud:jira:[^"'\s]+/);
      const ari = ariMatch ? ariMatch[0] : 'ari:cloud:jira:cloudId:issue/10107';

      return {
        output: JSON.stringify(mockData.ariDetails[ari] || mockData.ariDetails.default),
        tokenUsage: { total: 35, prompt: 15, completion: 20 }
      };
    }

    case 'addComment':
    case 'addCommentToJiraIssue':
      return {
        output: JSON.stringify({ success: true, commentId: "10001" }),
        tokenUsage: { total: 20, prompt: 10, completion: 10 }
      };

    case 'transitionJiraIssue': {
      const jiraIdMatch = prompt.match(/([A-Z]+-\d+)/);
      const jiraId = jiraIdMatch ? jiraIdMatch[1] : options?.vars?.jira;
      const transitionIdMatch = prompt.match(/"transitionId"\s*:\s*"([^"]+)"/);
      const transitionId = transitionIdMatch ? transitionIdMatch[1] : '31';
      const transitionMap = { '11': 'To Do', '21': 'In Progress', '31': 'In Review', '41': 'Done' };
      const newStatus = transitionMap[transitionId] || 'In Progress';

      return {
        output: JSON.stringify({ success: true, issueKey: jiraId, transitionId, newStatus }),
        tokenUsage: { total: 25, prompt: 12, completion: 13 }
      };
    }

    case 'createJiraIssue': {
      const projectMatch = prompt.match(/"project"\s*:\s*"([^"]+)"/);
      const summaryMatch = prompt.match(/"summary"\s*:\s*"([^"]+)"/);
      const issueTypeMatch = prompt.match(/"issueType"\s*:\s*"([^"]+)"/);
      const parentKeyMatch = prompt.match(/"parentKey"\s*:\s*"([^"]+)"/);
      const project = projectMatch ? projectMatch[1] : (options?.vars?.project || 'APP');
      const summary = summaryMatch ? summaryMatch[1] : 'New issue';
      const issueType = issueTypeMatch ? issueTypeMatch[1] : 'Story';
      const issueNumber = Math.floor(1000 + Math.random() * 9000);
      const issueKey = `${project}-${issueNumber}`;

      return {
        output: JSON.stringify({
          id: String(issueNumber),
          key: issueKey,
          self: `https://example.atlassian.net/rest/api/3/issue/${issueNumber}`,
          fields: {
            summary,
            issuetype: { name: issueType },
            project: { key: project },
            status: { name: 'To Do' },
            ...(parentKeyMatch ? { parent: { key: parentKeyMatch[1] } } : {})
          }
        }),
        tokenUsage: { total: 40, prompt: 18, completion: 22 }
      };
    }

    // ── Confluence tools ─────────────────────────────────────────────────────

    case 'createContent': {
      const spaceMatch = prompt.match(/"space"\s*:\s*"([^"]+)"/);
      const titleMatch = prompt.match(/"title"\s*:\s*"([^"]+)"/);
      const space = spaceMatch ? spaceMatch[1] : (options?.vars?.space || 'APP');
      const title = titleMatch ? titleMatch[1] : (options?.vars?.title || 'Untitled Page');
      const pageId = `mock-page-${Math.floor(1000 + Math.random() * 9000)}`;

      return {
        output: JSON.stringify({
          id: pageId,
          key: space,
          self: `https://confluence.example.com/rest/api/content/${pageId}`,
          status: "created"
        }),
        tokenUsage: { total: 60, prompt: 30, completion: 30 }
      };
    }

    case 'createConfluencePage': {
      const spaceMatch = prompt.match(/"space"\s*:\s*"([^"]+)"/);
      const titleMatch = prompt.match(/"title"\s*:\s*"([^"]+)"/);
      const space = spaceMatch ? spaceMatch[1] : (options?.vars?.space || 'APP');
      const title = titleMatch ? titleMatch[1] : (options?.vars?.title || 'Untitled Page');

      return {
        output: JSON.stringify({
          id: "112233",
          type: "page",
          status: "current",
          title,
          space: { key: space },
          version: { number: 1 },
          _links: {
            webui: `https://example.atlassian.net/wiki/spaces/${space}/pages/112233/${encodeURIComponent(title.replace(/ /g, '+'))}`
          }
        }),
        tokenUsage: { total: 60, prompt: 30, completion: 30 }
      };
    }

    case 'updateConfluencePage': {
      const pageIdMatch = prompt.match(/"pageId"\s*:\s*"([^"]+)"/);
      const titleMatch = prompt.match(/"title"\s*:\s*"([^"]+)"/);
      const versionMatch = prompt.match(/"version"\s*:\s*(\d+)/);
      const pageId = pageIdMatch ? pageIdMatch[1] : (options?.vars?.pageId || '112233');
      const title = titleMatch ? titleMatch[1] : 'Updated Page';
      const newVersion = versionMatch ? parseInt(versionMatch[1], 10) + 1 : 2;

      return {
        output: JSON.stringify({
          id: pageId,
          type: "page",
          status: "current",
          title,
          version: { number: newVersion },
          _links: {
            webui: `https://example.atlassian.net/wiki/pages/${pageId}`
          }
        }),
        tokenUsage: { total: 55, prompt: 25, completion: 30 }
      };
    }

    case 'getConfluencePage': {
      const pageIdMatch = prompt.match(/"pageId"\s*:\s*"([^"]+)"/);
      const pageId = pageIdMatch ? pageIdMatch[1] : (options?.vars?.pageId || '112233');

      const pageData = confluencePageDatasets[pageId] || getMockPage(pageId);

      return {
        output: JSON.stringify(pageData),
        tokenUsage: { total: 50, prompt: 20, completion: 30 }
      };
    }

    case 'getConfluenceSpaces':
      return {
        output: JSON.stringify({
          results: [
            { key: 'APP', name: 'private access', type: 'global' },
            { key: 'DOCS', name: 'desktop workspace', type: 'global' },
            { key: 'ENG', name: 'Organization Engineering', type: 'global' }
          ]
        }),
        tokenUsage: { total: 25, prompt: 10, completion: 15 }
      };

    case 'searchConfluenceUsingCql': {
      const cqlMatch = prompt.match(/"cql"\s*:\s*"([^"]+)"/);
      const cql = cqlMatch ? cqlMatch[1] : '';

      const mockFeatureSpec = JSON.parse(readFileSync(path.resolve(__dirname, '../../dataset/mock-confluence-page-feature-spec.json'), 'utf-8'))

      return {
        output: JSON.stringify({
          results: [mockFeatureSpec, getMockPage('112233'), getMockPage('112234')],
          totalSize: 2,
          cqlQuery: cql
        }),
        tokenUsage: { total: 45, prompt: 20, completion: 25 }
      };
    }

    case 'getPagesInConfluenceSpace': {
      const spaceMatch = prompt.match(/"space"\s*:\s*"([^"]+)"/);
      const space = spaceMatch ? spaceMatch[1] : (options?.vars?.space || 'APP');

      return {
        output: JSON.stringify({
          results: [
            getMockPage('112233', space, 'access Policy Configuration Overview'),
            getMockPage('112234', space, 'Application Architecture Guide'),
            getMockPage('112235', space, 'Connector Setup Runbook')
          ]
        }),
        tokenUsage: { total: 40, prompt: 15, completion: 25 }
      };
    }

    default:
      throw new Error(`Unknown Atlassian tool invoked: ${toolName}`);
  }
}
