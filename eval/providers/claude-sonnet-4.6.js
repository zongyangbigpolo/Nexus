// Copyright © 2026. Citrix Systems, Inc. All Rights Reserved. Confidential & Proprietary.

// Combined provider that uses AWS Bedrock via OpenAI SDK with mock Atlassian tools
// NOTE: Under development still need access to claude model in AWS Bedrock
import OpenAI from 'openai';
import { callApi as mockAtlassianApi } from './tools/atlassian/atlassian-mock-tool-impl.js';
import { jiraToolsSpecs } from './tools/atlassian/jira-tools-spec.js';
import { confluenceToolsSpecs } from './tools/atlassian/confluence-tools-spec.js';
import { loadAgentContext, buildEnhancedSystemPrompt } from './tools/agent-context-loader.js';

export const SYSTEM_PROMPT_ATLASSIAN_MCP_TOOLS = `
You are an AI coding assistant with access to Atlassian MCP tools for JIRA and Confluence operations.
Use the available functions when you need to interact with JIRA and Confluence (https://support.atlassian.com/atlassian-rovo-mcp-server/docs/supported-tools/).
Do not invent tool names or mangle tool names.
`;

export const MODEL_NAME = 'us.anthropic.claude-sonnet-4-6-20251001-v1:0';
const client = new OpenAI({
  baseURL: 'https://bedrock-mantle.us-west-2.api.aws/v1',
  apiKey: process.env['OPENAI_API_KEY'], // This is the default and can be omitted
})

export default class CombinedProvider {

  id = () => 'combined-claude-sonnet-4.6-atlassian';

  async callApi(prompt, options, context) {
    // Load agent context from workspace (auto-discovered) based on the provided prompt
    const agentContext = loadAgentContext(prompt);
    
    // Define available functions for the LLM
    const tools = [
        ...jiraToolsSpecs,
        ...confluenceToolsSpecs
    ];
    
    const enhancedSystemPrompt = buildEnhancedSystemPrompt(
      SYSTEM_PROMPT_ATLASSIAN_MCP_TOOLS, 
      agentContext, 
      {
        skills: true,
        agents: true,
        instructions: true,
        agentsMd: true
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
      tool_choice: options?.vars?.tool_choice ?? 'auto'
    });

    const responseMessage = response.choices[0].message;
    messages.push(responseMessage);

    // Handle tool calls
    if (responseMessage.tool_calls) {
      for (const toolCall of responseMessage.tool_calls) {
        const functionName = toolCall.function.name;
        const functionArgs = JSON.parse(toolCall.function.arguments);

        // Route tool call to the unified Atlassian mock
        const mockPrompt = `${functionName} ${JSON.stringify(functionArgs)}`;
        const mockResult = mockAtlassianApi(mockPrompt, options, context);

        messages.push({
          tool_call_id: toolCall.id,
          role: 'tool',
          name: functionName,
          content: mockResult.output
        });
      }

      // Send tool results back to LLM for final response
      const followupResponse = await client.chat.completions.create({
        model: MODEL_NAME,
        messages
      });

      return {
        output: followupResponse.choices[0].message.content,
        tokenUsage: {
          total: (response.usage?.total_tokens || 0) + (followupResponse.usage?.total_tokens || 0),
          prompt: (response.usage?.prompt_tokens || 0) + (followupResponse.usage?.prompt_tokens || 0),
          completion: (response.usage?.completion_tokens || 0) + (followupResponse.usage?.completion_tokens || 0)
        }
      };
    }

    return {
      output: responseMessage.content,
      tokenUsage: {
        total: response.usage?.total_tokens || 100,
        prompt: response.usage?.prompt_tokens || 50,
        completion: response.usage?.completion_tokens || 50
      }
    };
  }
}