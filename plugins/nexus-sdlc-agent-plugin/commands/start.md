---
name: start
description: Intelligent entry point — analyzes your request and routes to the best specialized prompt/agent
agent: router
---

# Start Here

Don't know which prompt to use? Just describe what you need!

## How it works

1. **Describe your task** in natural language
2. **Attach relevant files** if you have them (configs, logs, screenshots)
3. **Router will analyze** your request and route to the best agent

## Routing Guide

| Need | Routes to |
|------|-----------|
| Fix a bug | `/bugfix` |
| Implement feature | `/task` |
| Plan work | `/feature-plan` |
| Write spec | `/feature-spec` |
| Test plan | `/feature-testplan` |
| Testing strategy | `/test` |
| Architecture | `/architecture` |
| Generate ARCHITECTURE.md | `/architecturemd` |
| Initialize repo for AI | `/project-init` |
| Generate AGENTS.md | `/agentsmd` |
| Git operations | `/git` |
| Analyze anything | `/analyze` |
| Azure costs | `/azure-costs` |
| Azure audit | `/azure-audit` |
| Local dev | `/local-env` |
| Security analysis | `/security` |
| JIRA tickets | `/jira` |
| Move stories to sprint | `/move-my-stories-to-sprint` |
| Code review | `/code-review` |
| Confluence article | `/article` |
| Test Citrix Cloud API | `/cc-api` |
| Copilot assets | `/copilot-asset` |

---

For SPA troubleshooting or SRE workflows, install `mac-troubleshooting-agent-plugin` from the same marketplace.

**Your request**: ${input:request:describe what you need}
