// Copyright © 2026. Organization Systems, Inc. All Rights Reserved. Confidential & Proprietary.

import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { callApi as handleMockAtlassianApi } from './tools/atlassian/atlassian-mock-tool-impl.js';
import { callApi as handleMockGeneralToolsApi } from './tools/general/general-tools-api.js';
import { jiraToolsSpecs } from './tools/atlassian/jira-tools-spec.js';
import { confluenceToolsSpecs } from './tools/atlassian/confluence-tools-spec.js';
import { generalToolsSpecs } from './tools/general/general-tools-spec.js';
import { loadAgentContext, buildEnhancedSystemPrompt } from './tools/agent-context-loader.js';
import { createModelClient } from './model-client.js';

export const SYSTEM_PROMPT_ATLASSIAN_MCP_TOOLS = `
You are an AI coding assistant with access to Atlassian MCP tools for JIRA and Confluence operations as well as repository filesystem and git tools.
For Atlassian, use the available functions when you need to interact with JIRA and Confluence (https://support.atlassian.com/atlassian-rovo-mcp-server/docs/supported-tools/).
Use the available functions when you need to interact with the repository filesystem and git tools.
The tools you will use are mock tools for evaluation purposes.
Do not wait for user confirmation before calling the tools.
If a tool does not respond or returns an error, do not repeatedly retry the same call; instead, continue the task using the information you already have and clearly explain any resulting limitations in your answer.
`;

const agentModel = createModelClient('agent');
const graderModel = createModelClient('grader');

export const MODEL_NAME = agentModel.model;

export default class GenericLlmProvider {
  id = () => `generic-${agentModel.provider}-agent-${graderModel.provider}-grader`;

  async callApi(prompt, options = {}, context = {}) {
    if (isPromptfooGradingPrompt(prompt)) {
      return callModelForGrading(prompt);
    }

    const agentContext = loadAgentContext(prompt, resolveWorkspaceRoot(options));
    const tools = getToolSpecs();
    const messages = [
      { role: 'system', content: buildAgentSystemPrompt(agentContext) },
      { role: 'user', content: prompt }
    ];

    let currentResponse = await callAgentModel(messages, tools, options);
    let currentMessage = currentResponse.message;
    messages.push(currentMessage);

    const totalUsage = createUsageCounter(currentResponse.usage);

    while (currentMessage.tool_calls) {
      appendToolResults(messages, currentMessage.tool_calls, options, context);
      currentResponse = await callAgentModel(messages, tools, options);
      currentMessage = currentResponse.message;
      addUsage(totalUsage, currentResponse.usage);
      messages.push(currentMessage);
    }

    return {
      output: currentMessage.content,
      tokenUsage: totalUsage
    };
  }
}

function isPromptfooGradingPrompt(prompt) {
  return prompt.includes('You are grading output according to a user-specified rubric');
}

function resolveWorkspaceRoot(options) {
  const dirname = path.dirname(fileURLToPath(import.meta.url));
  const pluginName = options.vars?.__promptFile?.split('/')?.[0] ?? '';
  return path.resolve(dirname, '../..', 'plugins/', pluginName);
}

function getToolSpecs() {
  const tools = [
    ...jiraToolsSpecs,
    ...confluenceToolsSpecs,
    ...generalToolsSpecs
  ];

  if (tools.length > 128) {
    throw new Error(`Too many tools defined (${tools.length}). Maximum allowed is 128 for the evaluation model.`);
  }

  return tools;
}

function buildAgentSystemPrompt(agentContext) {
  return buildEnhancedSystemPrompt(
    SYSTEM_PROMPT_ATLASSIAN_MCP_TOOLS,
    agentContext,
    {
      skills: true,
      instructions: true,
      agents: true,
      agentsMd: true,
      playbooks: true,
      templates: true
    }
  );
}

async function callAgentModel(messages, tools, options) {
  const response = await agentModel.client.chat.completions.create({
    model: agentModel.model,
    messages,
    tools,
    parallel_tool_calls: false,
    tool_choice: options?.vars?.tool_choice ?? 'auto'
  });

  return {
    message: response.choices[0].message,
    usage: response.usage
  };
}

function appendToolResults(messages, toolCalls, options, context) {
  for (const toolCall of toolCalls) {
    const functionName = toolCall.function.name;
    const functionArgs = JSON.parse(toolCall.function.arguments);
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
}

async function callModelForGrading(prompt) {
  const messages = JSON.parse(prompt);
  const response = await graderModel.client.chat.completions.create({
    model: graderModel.model,
    messages
  });

  return {
    output: response.choices[0].message.content,
    tokenUsage: toTokenUsage(response.usage)
  };
}

function createUsageCounter(usage) {
  return toTokenUsage(usage, 0);
}

function addUsage(totalUsage, usage) {
  const tokenUsage = toTokenUsage(usage, 0);
  totalUsage.total += tokenUsage.total;
  totalUsage.prompt += tokenUsage.prompt;
  totalUsage.completion += tokenUsage.completion;
}

function toTokenUsage(usage, fallback) {
  return {
    total: usage?.total_tokens ?? fallback,
    prompt: usage?.prompt_tokens ?? fallback,
    completion: usage?.completion_tokens ?? fallback
  };
}
