# Nexus Setup and Marketplace Validation

This guide is for maintainers and contributors who develop, validate, or publish this repository. End users who only want to install and use NexusAgent in VS Code should start with `README.md` instead.

This guide covers the checks maintainers should run before publishing Nexus plugins through the VS Code marketplace flow.

## Prerequisites

- Node.js 22 or newer
- npm
- promptfoo, if you plan to run full eval suites
- VS Code with Copilot plugin support enabled

Install promptfoo when full eval execution is needed:

```bash
npm install -g promptfoo@latest
```

Install eval provider dependencies:

```bash
cd eval/providers
npm install
cd ../..
```

## Model Provider Configuration

Eval provider smoke tests do not call a live model API. Full promptfoo evals do require model credentials.

Use shell environment variables or copy `eval/providers/.env.example` to `eval/providers/.env`:

```bash
EVAL_PROVIDER=openai
EVAL_MODEL=gpt-4o
EVAL_API_KEY=<your-key>

GRADER_PROVIDER=openai
GRADER_MODEL=gpt-4o-mini
GRADER_API_KEY=<your-key>
```

Supported provider values include `openai`, `deepseek`, `openrouter`, `gemini`, and `ollama`. All providers are accessed through the generic OpenAI-compatible chat completions client.

## Phase 0 Validation

Run all stabilization checks before publishing marketplace updates:

```bash
npm run phase0
```

This runs:

```bash
npm run validate
npm run check:runtime
npm run smoke:eval-provider
```

## What The Checks Cover

`npm run validate` checks:

- Every plugin folder with a plugin manifest is registered in `.github/plugin/marketplace.json`.
- Every marketplace plugin source exists.
- Every plugin manifest points to existing command, agent, skill, and MCP paths.
- Command, agent, skill, and instruction files contain required frontmatter.
- Command agent references and agent handoff references point to known agents.
- Eval `__promptFile` paths and `file://` provider references resolve to existing files.

`npm run check:runtime` checks:

- Node and npm availability.
- promptfoo availability, with a warning if not installed.
- Eval provider dependencies.
- Required marketplace, MCP sample, and provider configuration templates.

`npm run smoke:eval-provider` checks:

- The eval provider imports successfully with environment-driven model selection.
- Mock repository tools load.
- Mock Atlassian tools load.
- Generic mock datasets are present.

## Marketplace Deployment Notes

The VS Code marketplace deployment reads `.github/plugin/marketplace.json` first, then follows each plugin `source` to its `.github/plugin/plugin.json`. A plugin that exists under `plugins/` but is missing from the marketplace manifest will not be visible to users who install through the marketplace.

When adding a plugin:

1. Add `plugins/<plugin>/.github/plugin/plugin.json`.
2. Add the plugin to `.github/plugin/marketplace.json`.
3. Run `npm run phase0`.
4. Update root `README.md`, `DEV-GUIDE.md`, and plugin `AGENTS.md` inventories.
5. Reload VS Code and verify the plugin appears under `@agentPlugins`.

## CI

The repository includes `.github/workflows/phase0-validation.yml`. It runs the same validation flow on PRs and pushes that touch marketplace, plugin, eval, script, or root documentation files.
