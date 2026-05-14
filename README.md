# NexusAgent

[![Claude Compatible](https://img.shields.io/badge/Claude-Compatible-191919?style=for-the-badge)](https://www.anthropic.com/claude)

Read this in Chinese: [README.zh-CN.md](README.zh-CN.md)

NexusAgent is a VS Code + GitHub Copilot multi-agent harness for engineering teams, with Claude-compatible prompt and evaluation workflows. It packages installable Copilot agent plugins that help teams move from requirements to specifications, JIRA work items, implementation handoff, review, testing, release reporting, and troubleshooting inside Copilot Chat.

For normal users, this README is the only document you need to start. Maintainer documents such as [SETUP.md](SETUP.md), [DEV-GUIDE.md](DEV-GUIDE.md), [ARCHITECTURE.md](ARCHITECTURE.md), and [CAPABILITY_ARCHITECTURE.md](CAPABILITY_ARCHITECTURE.md) are for people developing, validating, or publishing this repository.

## Highlights

- Feature E2E delivery: `/feature-e2e` connects requirement understanding, feature specification, Confluence publishing, JIRA Story breakdown, implementation handoff, review, and PR preparation.
- Multi-agent collaboration: specialized agents cover specification, planning, development coordination, coding, security review, testing, release reporting, and troubleshooting.
- Copilot-native workflow: use NexusAgent directly from VS Code Copilot Chat with slash commands such as `/help`, `/start`, `/feature-spec`, `/task`, and `/bugfix`.
- Modular installation: install the shared plugin first, then add SDLC, native development, release management, or cloud troubleshooting plugins as needed.
- Measured improvement: current evals show a 27% task completion rate improvement and a 47% token usage reduction.

## Core Workflows

| Entry Point | When To Use It | Output |
| --- | --- | --- |
| `/feature-e2e` | Deliver a feature from a JIRA Feature or requirement | Feature spec, Confluence page, JIRA Stories, implementation tasks, review flow, PR preparation |
| `/feature-spec` | Turn rough requirements into a reviewable design | Markdown feature specification ready for review, publishing, or planning |
| `/feature-plan` | Break an approved spec into executable JIRA work | Epic, Stories, acceptance criteria, and estimation guidance |
| `/task` | Start implementation for a JIRA Story | Branch/task setup, implementation plan, code/test handoff, PR preparation |
| `/bugfix` | Investigate a bug ticket, log, or observed failure | Hypotheses, evidence, root-cause direction, fix plan, development handoff |
| `/code-review`, `/security`, `/test` | Add quality, security, or test strategy review | Findings, risk notes, remediation guidance, and coverage strategy |

## Capability Overview

| Area | What It Helps With | Common Commands |
| --- | --- | --- |
| Common engineering operations | Technical analysis, Git, JIRA, Confluence, Copilot asset work | `/analyze`, `/git`, `/jira`, `/article`, `/copilot-asset` |
| SDLC delivery | Specs, planning, implementation, bug investigation, review, security, testing | `/start`, `/feature-spec`, `/feature-plan`, `/feature-e2e`, `/task`, `/bugfix`, `/code-review`, `/security`, `/test` |
| Native desktop development | Build, test, native platform patterns, integration channel scaffolding | `/xcode-build`, `/xcode-test`, `/vc-scaffold` |
| Release management | Completed work reports, JIRA/GitHub traceability, Confluence reporting | `/jira-completed-by-assignee`, `/github-jira-commit-linkage`, `/jira-epic-enrichment`, `/confluence-publish-report` |
| Cloud troubleshooting | Kubernetes, Docker, service dependencies, logs, metrics, alerts, infrastructure triage | `/sre`, `/cloud-alert-triage`, `/service-troubleshoot`, `/cloud-infra-troubleshoot` |

## Install And Use

### 1. Prepare VS Code

1. Install the latest stable VS Code or VS Code Insiders.
2. Install and sign in to GitHub Copilot and GitHub Copilot Chat.
3. Enable Copilot plugin support in VS Code settings.
4. Get the NexusAgent marketplace name or URL published by your team.

### 2. Add The Marketplace

Recommended path from VS Code Settings:

1. Open VS Code Settings.
2. Search for `Chat Plugins Marketplaces`.
3. Add the NexusAgent marketplace name or URL provided by your team.
4. Search for `Chat Plugins Enabled` and confirm it is enabled.
5. Reload VS Code.

You can also use Copilot Chat:

```text
/plugin marketplace add NexusAgent
/plugin marketplace browse NexusAgent
```

If your team publishes the marketplace under a different name, replace `NexusAgent` with that name.

### 3. Install Plugins

Recommended path from the VS Code Command Palette:

1. Press `Cmd+Shift+P` on macOS, or `Ctrl+Shift+P` on Windows/Linux.
2. Run `Plugins: Install Agent Plugin`, or search for `agent plugin install`.
3. Select the NexusAgent marketplace.
4. Install `nexus-common-agent-plugin` first.
5. Install any specialized plugins your workflow needs.

You can also install from Copilot Chat. Install the shared plugin first:

```text
/plugin install nexus-common-agent-plugin@NexusAgent
```

Then install specialized plugins as needed:

```text
/plugin install nexus-sdlc-agent-plugin@NexusAgent
/plugin install nexus-macos-native-plugin@NexusAgent
/plugin install nexus-release-management-plugin@NexusAgent
/plugin install cloud-troubleshooting-plugin@NexusAgent
```

### 4. Verify Installation

1. Reload VS Code.
2. Open the Extensions view and search for `@agentPlugins`.
3. Confirm the installed NexusAgent plugins are enabled.
4. Open Copilot Chat and check that these commands appear in autocomplete:

```text
/help
/analyze
/jira
/feature-spec
```

## Common Starting Points

- Not sure what to use: start with `/start` or `/help`.
- Analyze logs, configs, screenshots, or requirements: use `/analyze`.
- Create a feature specification from requirements: use `/feature-spec`.
- Convert a spec into JIRA work items: use `/feature-plan`.
- Deliver a feature end to end: use `/feature-e2e`.
- Start implementation for a JIRA Story: use `/task`.
- Investigate a bug: use `/bugfix`.
- Review code or security risk: use `/code-review` or `/security`.
- Plan tests: use `/test` or `/feature-testplan`.
- Run native build or tests: use `/xcode-build` or `/xcode-test`.

## Evaluation And Grader

NexusAgent is evaluated with promptfoo suites, mock repository context, mock JIRA data, and mock Confluence data. Current evaluations show a 27% task completion rate improvement and a 47% token usage reduction.

The grader uses a generic OpenAI-compatible model API. During eval, the provider first runs the target command with the agent model. When promptfoo runs an `llm-rubric` assertion, the provider switches to the grader model and checks the output against the rubric in the test case.

Model configuration is environment driven:

```text
Agent model:  EVAL_PROVIDER / EVAL_MODEL / EVAL_API_KEY / EVAL_BASE_URL
Grader model: GRADER_PROVIDER / GRADER_MODEL / GRADER_API_KEY / GRADER_BASE_URL
```

If `GRADER_*` is not configured, the grader falls back to `EVAL_*`. This evaluation setup is for repository maintainers; normal plugin users do not need to configure these variables.

## Documentation Map

| Document | Audience | Purpose |
| --- | --- | --- |
| [README.md](README.md) | End users and first-time readers | What NexusAgent does and how to install/use it |
| [README.zh-CN.md](README.zh-CN.md) | Chinese readers | Chinese version of this user guide |
| [SETUP.md](SETUP.md) | Maintainers and contributors | Local validation, model env vars, Phase 0 checks |
| [DEV-GUIDE.md](DEV-GUIDE.md) | Maintainers and plugin authors | Marketplace and plugin maintenance guidance |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Maintainers and architects | Technical architecture and eval internals |
| [CAPABILITY_ARCHITECTURE.md](CAPABILITY_ARCHITECTURE.md) | Maintainers and stakeholders | Capability map, support level, and current gaps |

## Troubleshooting

- Plugins do not appear: reload VS Code and search for `@agentPlugins` again.
- Commands do not autocomplete: confirm the corresponding plugin is installed and enabled.
- Marketplace cannot be browsed: confirm the marketplace name or URL from your team.
- External systems are unavailable: confirm access to GitHub, JIRA, Confluence, cloud platforms, or observability systems as required by your workflow.

We warmly welcome engineers who want to join in and contribute to NexusAgent together.
