export function getMockJiraData(jiraId = 'APP-0000') {
  const issue = {
    id: '10107',
    key: jiraId,
    fields: {
      summary: 'Sample workflow improvement',
      description: 'Generic mock issue used by the evaluation provider.',
      issuetype: { name: 'Story' },
      status: { name: 'To Do' },
      project: { key: jiraId.split('-')[0] || 'APP' },
      labels: ['eval', 'sample']
    }
  };

  return {
    accessibleResources: [
      {
        id: 'mock-cloud-id',
        name: 'Example Workspace',
        url: 'https://example.atlassian.net',
        scopes: ['read:jira-work', 'write:jira-work']
      }
    ],
    jiraIssues: {
      [jiraId]: issue,
      'APP-0000': issue
    },
    searchResults: {
      default: {
        issues: [issue],
        total: 1
      }
    },
    ariDetails: {
      default: issue,
      'ari:cloud:jira:cloudId:issue/10107': issue
    }
  };
}
