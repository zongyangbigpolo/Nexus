// Copyright © 2026. Organization Systems, Inc. All Rights Reserved. Confidential & Proprietary.

const previousEnv = { ...process.env };

process.env.EVAL_PROVIDER = process.env.EVAL_PROVIDER || 'openai';
process.env.EVAL_MODEL = process.env.EVAL_MODEL || 'gpt-4o-mini';
process.env.EVAL_API_KEY = process.env.EVAL_API_KEY || process.env.OPENAI_API_KEY || 'smoke-test-key';
process.env.GRADER_PROVIDER = process.env.GRADER_PROVIDER || process.env.EVAL_PROVIDER;
process.env.GRADER_MODEL = process.env.GRADER_MODEL || process.env.EVAL_MODEL;
process.env.GRADER_API_KEY = process.env.GRADER_API_KEY || process.env.EVAL_API_KEY;

try {
  const providerModule = await import('../eval/providers/generic-llm-provider.js');
  const Provider = providerModule.default;
  const provider = new Provider();
  const providerId = provider.id();

  if (!providerId.includes('generic-')) {
    throw new Error(`unexpected provider id: ${providerId}`);
  }

  const generalTools = await import('../eval/providers/tools/general/general-tools-api.js');
  const atlassianTools = await import('../eval/providers/tools/atlassian/atlassian-mock-tool-impl.js');

  const repoResult = generalTools.callApi('repo_listDir {"path":"/workspace/sample-ui-module"}', {}, {});
  if (!repoResult?.output) {
    throw new Error('general mock repo tool did not return output');
  }

  const jiraResult = atlassianTools.callApi('mcp_atlassian_getJiraIssue {"issueIdOrKey":"APP-123"}', { vars: { jira: 'APP-123' } }, {});
  if (!jiraResult?.output) {
    throw new Error('Atlassian mock JIRA tool did not return output');
  }

  console.log(`Eval provider smoke test passed: ${providerId}`);
} finally {
  process.env = previousEnv;
}
