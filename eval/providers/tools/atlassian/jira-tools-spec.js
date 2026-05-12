export const jiraToolsSpecs = [
  {
    type: "function",
    function: {
      name: "mcp_atlassian_getAccessibleAtlassianResources",
      description: "Get accessible Atlassian resources for the current user, including cloudId, name, and scopes",
      parameters: {
        type: "object",
        properties: {},
        required: []
      }
    }
  },
  {
    type: "function",
    function: {
      name: "mcp_atlassian_getJiraIssue",
      description: "Get JIRA issue details by issue ID or key",
      parameters: {
        type: "object",
        properties: {
          cloudId: { type: "string", description: "Atlassian cloud URL (optional)" },
          issueIdOrKey: { type: "string", description: "JIRA issue ID or key like APP-1234 (alias for issueKey)" },  
          responseContentFormat: { type: "string", description: "Format of the response content, e.g., 'markdown'" }        
        },
        required: []
      }
    }
  },
  {
    type: "function",
    function: {
      name: "mcp_atlassian_getIssue",
      description: "Get JIRA issue details by issue ID or key",
      parameters: {
        type: "object",
        properties: {          
          cloudId: { type: "string", description: "Atlassian cloud URL (optional)" },
          issueIdOrKey: { type: "string", description: "JIRA issue ID or key like APP-1234 (alias for issueKey)" },  
          responseContentFormat: { type: "string", description: "Format of the response content, e.g., 'markdown'" }        
        },
        required: []
      }
    }
  },
  {
    type: "function",
    function: {
      name: "mcp_atlassian_search",
      description: "Search JIRA and Confluence using Rovo Search",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Search query" }
        },
        required: []
      }
    }
  },
  {
    type: "function",
    function: {
      name: "mcp_atlassian_fetch",
      description: "Fetch details by Atlassian Resource Identifier (ARI)",
      parameters: {
        type: "object",
        properties: {
          id: { type: "string", description: "ARI like ari:cloud:jira:cloudId:issue/10107" }
        },
        required: []
      }
    }
  },
  {
    type: "function",
    function: {
      name: "mcp_atlassian_addComment",
      description: "Add a comment to a JIRA issue",
      parameters: {
        type: "object",
        properties: {
          issueKey: { type: "string", description: "JIRA issue key like APP-1234" },
          body: { type: "string", description: "Comment text to add to the issue" }
        },
        required: []
      }
    }
  },
  {
    type: "function",
    function: {
      name: "mcp_atlassian_transitionJiraIssue",
      description: "Transition a JIRA issue to a new status (e.g. In Progress, Done, In Review)",
      parameters: {
        type: "object",
        properties: {
          cloudId: { type: "string", description: "Atlassian cloud URL (optional)" },
          issueKey: { type: "string", description: "JIRA issue key like APP-1234" },
          issueIdOrKey: { type: "string", description: "JIRA issue ID or key like APP-1234 (alias for issueKey)" },
          transitionId: { type: "string", description: "ID of the transition to apply (from getTransitionsForJiraIssue)" },
          transition: { type: "object", description: "Transition to apply" },
          comment: { type: "string", description: "Optional comment to add when transitioning" },
        },
        required: []
      }
    }
  },
  {
    type: "function",
    function: {
      name: "mcp_atlassian_createJiraIssue",
      description: "Create a new JIRA issue (Story, Bug, Task, Epic, etc.) in a project",
      parameters: {
        type: "object",
        properties: {
          project: { type: "string", description: "JIRA project key, e.g. APP or ENG" },
          summary: { type: "string", description: "Issue title/summary" },
          issueType: { type: "string", description: "Issue type: Story, Bug, Task, Epic, Sub-task" },
          description: { type: "string", description: "Detailed description of the issue" },
          priority: { type: "string", description: "Priority: Highest, High, Medium, Low, Lowest" },
          labels: { type: "array", items: { type: "string" }, description: "Labels to apply, e.g. AI-Generated" },
          parentKey: { type: "string", description: "Parent issue key for Stories under an Epic" }
        },
        required: []
      }
    }
  }
];