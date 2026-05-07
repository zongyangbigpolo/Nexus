export const confluenceToolsSpecs = [
  {
    type: "function",
    function: {
      name: "mcp_atlassian_createContent",
      description: "Create a new Confluence page or content using the Confluence REST API content format",
      parameters: {
        type: "object",
        properties: {
          space: { type: "string", description: "Confluence space key (e.g. SPA, CWS)" },
          title: { type: "string", description: "Page title" },
          type: { type: "string", description: "Content type — typically 'page'" },
          body: {
            type: "object",
            description: "Page body in Confluence storage format",
            properties: {
              storage: {
                type: "object",
                properties: {
                  representation: { type: "string", description: "Content representation format — use 'storage'" },
                  value: { type: "string", description: "HTML content in Confluence storage format" }
                },
                required: ["representation", "value"]
              }
            },
            required: ["storage"]
          }
        },
        required: []
      }
    }
  },
  {
    type: "function",
    function: {
      name: "mcp_atlassian_createConfluencePage",
      description: "Create a new Confluence page in a specified space",
      parameters: {
        type: "object",
        properties: {
          space: { type: "string", description: "Confluence space key (e.g. SPA, CWS)" },
          title: { type: "string", description: "Page title" },
          body: { type: "string", description: "Page body content in Confluence storage format (HTML)" },
          parentId: { type: "string", description: "Optional parent page ID to nest the new page under" }
        },
        required: []
      }
    }
  },
  {
    type: "function",
    function: {
      name: "mcp_atlassian_updateConfluencePage",
      description: "Update an existing Confluence page by page ID",
      parameters: {
        type: "object",
        properties: {
          pageId: { type: "string", description: "Confluence page ID to update" },
          title: { type: "string", description: "Updated page title" },
          body: { type: "string", description: "Updated page body in Confluence storage format (HTML)" },
          version: { type: "number", description: "Current page version number (required for updates)" }
        },
        required: []
      }
    }
  },
  {
    type: "function",
    function: {
      name: "mcp_atlassian_getConfluencePage",
      description: "Get a Confluence page by page ID",
      parameters: {
        type: "object",
        properties: {
          pageId: { type: "string", description: "Confluence page ID" }
        },
        required: []
      }
    }
  },
  {
    type: "function",
    function: {
      name: "mcp_atlassian_getConfluenceSpaces",
      description: "List all accessible Confluence spaces",
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
      name: "mcp_atlassian_searchConfluenceUsingCql",
      description: "Search Confluence content using CQL (Confluence Query Language)",
      parameters: {
        type: "object",
        properties: {
          cql: { type: "string", description: "CQL query string (e.g. space=SPA AND title~\"Feature\")" },
          limit: { type: "number", description: "Maximum number of results to return" }
        },
        required: []
      }
    }
  },
  {
    type: "function",
    function: {
      name: "mcp_atlassian_getPagesInConfluenceSpace",
      description: "Get all pages in a Confluence space",
      parameters: {
        type: "object",
        properties: {
          space: { type: "string", description: "Confluence space key (e.g. SPA)" }
        },
        required: []
      }
    }
  }
];
