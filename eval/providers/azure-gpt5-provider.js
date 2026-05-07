// Copyright © 2026. Citrix Systems, Inc. All Rights Reserved. Confidential & Proprietary.

import { fileURLToPath } from 'url';
import path from 'path';
import { AzureOpenAI } from 'openai';
import { callApi as handleMockAtlassianApi } from './tools/atlassian/atlassian-mock-tool-impl.js';
import { callApi as handleMockGeneralToolsApi } from './tools/general/general-tools-api.js';
import { jiraToolsSpecs } from './tools/atlassian/jira-tools-spec.js';
import { confluenceToolsSpecs } from './tools/atlassian/confluence-tools-spec.js';
import { generalToolsSpecs } from './tools/general/general-tools-spec.js';
import { loadAgentContext, buildEnhancedSystemPrompt } from './tools/agent-context-loader.js';

export const SYSTEM_PROMPT_ATLASSIAN_MCP_TOOLS = `
You are an AI coding assistant with access to Atlassian MCP tools for JIRA and Confluence operations as well as repository filesystem and git tools.
For Atlassian, use the available functions when you need to interact with JIRA and Confluence (https://support.atlassian.com/atlassian-rovo-mcp-server/docs/supported-tools/).
Use the available functions when you need to interact with the repository filesystem and git tools.
The tools you will use are mock tools for evaluation purposes.
Do not wait for user confirmation before calling the tools.
If a tool does not respond or returns an error, do not repeatedly retry the same call; instead, continue the task using the information you already have and clearly explain any resulting limitations in your answer.
`;
export const MODEL_NAME = process.env.EVAL_MODEL || 'gpt-4o';
export const VERSION = process.env.AZURE_API_VERSION || '2025-04-01-preview';

const client = new AzureOpenAI({
  apiKey: process.env.AZURE_API_KEY || (() => { throw new Error('AZURE_API_KEY not provided. Set: export AZURE_API_KEY="<your-key>"'); })(),
  endpoint: process.env.AZURE_OPENAI_ENDPOINT || 'https://tirupatitestai5314270769.cognitiveservices.azure.com',
  apiVersion: VERSION,
  deployment: MODEL_NAME
});

export default class CombinedProvider {

  id = () => 'combined-azure-atlassian';

  async callApi(prompt, options, context) {
    // Use Grader provider
    if (prompt.includes('You are grading output according to a user-specified rubric')) {
      return callAzureForGrading(prompt, options, context);
    }

    // Use Agent provider
    // Load agent context from workspace (auto-discovered) based on the provided prompt
    // This simulates a client (e.g VSCode) requesting the agent context based on the prompt and referencing 
    // files under .github folder
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const workspaceRoot = path.resolve(__dirname, '../..', 'plugins/', options.vars?.__promptFile?.split('/')?.[0] ?? '');
    const agentContext = loadAgentContext(prompt, workspaceRoot);
    
    // Define available functions for the LLM
    const tools = [
        ...jiraToolsSpecs,
        ...confluenceToolsSpecs,
        ...generalToolsSpecs
    ];
    
    if(tools.length > 128) {
      throw new Error(`Too many tools defined (${tools.length}). Maximum allowed is 128 according to Azure OpenAI limits.`);
    }

    const enhancedSystemPrompt = buildEnhancedSystemPrompt(
      SYSTEM_PROMPT_ATLASSIAN_MCP_TOOLS, 
      agentContext, 
      {
        skills: true, 
        instructions: true,
        agents: true,
        agentsMd: true,
        playbooks: true,

        //TODO: Implement templates support        
        templates: true
      }
    );

    const messages = [
      { role: 'system', content: enhancedSystemPrompt },
      { role: 'user', content: prompt }
    ];

    const response = await client.chat.completions.create({
      model: MODEL_NAME,
      messages,
      tools,
      parallel_tool_calls: false,
      tool_choice: options?.vars?.tool_choice ?? 'auto'
    });

    let currentResponse = response;
    let currentMessage = currentResponse.choices[0].message;
    messages.push(currentMessage); // push the real message object — preserves tool_calls as-is

    const totalUsage = {
      total: response.usage?.total_tokens || 0,
      prompt: response.usage?.prompt_tokens || 0,
      completion: response.usage?.completion_tokens || 0
    };

    // Agentic loop: handle multiple rounds of tool calls
    while (currentMessage.tool_calls) {
      for (const toolCall of currentMessage.tool_calls) {
        const functionName = toolCall.function.name;
        const functionArgs = JSON.parse(toolCall.function.arguments);

        // Route tool call to the unified Atlassian mock
        const mockPrompt = `${functionName} ${JSON.stringify(functionArgs)}`;
        const mockResult = handleMockGeneralToolsApi(mockPrompt, options, context) || handleMockAtlassianApi(mockPrompt, options, context);

        if (!mockResult) {
          throw new Error(`Failed to get a mock result for tool call: ${functionName}`);
        }

        messages.push({
          tool_call_id: toolCall.id,
          role: 'tool',
          name: functionName,
          content: mockResult?.output ?? ''
        });
      }

      // Send tool results back to LLM; response may contain more tool calls
      const followupResponse = await client.chat.completions.create({
        model: MODEL_NAME,
        messages,
        tools,
        parallel_tool_calls: false,
        tool_choice: options?.vars?.tool_choice ?? 'auto'
      });

      totalUsage.total += followupResponse.usage?.total_tokens || 0;
      totalUsage.prompt += followupResponse.usage?.prompt_tokens || 0;
      totalUsage.completion += followupResponse.usage?.completion_tokens || 0;

      currentMessage = followupResponse.choices[0].message;
      messages.push(currentMessage);
    }

    return {
      output: currentMessage.content,
      tokenUsage: totalUsage
    };
  }
}

async function callAzureForGrading(prompt) {
  const messages = JSON.parse(prompt);

  const response = await client.chat.completions.create({
    model: MODEL_NAME,
    messages
  });

  return {
    output: response.choices[0].message.content,
    tokenUsage: {
      total: response.usage?.total_tokens,
      prompt: response.usage?.prompt_tokens,
      completion: response.usage?.completion_tokens
    }
  };
}
