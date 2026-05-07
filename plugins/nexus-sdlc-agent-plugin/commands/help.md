---
name: help
description: Quick reference for all available prompts and agents with usage examples.
---

# Mac Copilot — Quick Reference

## SDLC Prompts (`nexus-sdlc-agent-plugin`)

| Prompt | Description |
|--------|-------------|
| `/start` | **Intelligent router** — describe your need |
| `/task` | Start development task (JIRA + Git + code + PR) |
| `/feature-e2e` | End-to-end feature delivery (design → Confluence → stories → code → PR) |
| `/feature-spec` | Create spec from requirements |
| `/feature-plan` | Create JIRA hierarchy from spec |
| `/feature-testplan` | Generate test plan from spec |
| `/bugfix` | Investigate and fix bug |
| `/code-review` | Review code changes |
| `/test` | Define testing strategy |
| `/security` | Deep security analysis (OWASP, NIST) |
| `/architecture` | Diagrams, ADRs, threat models |
| `/architecturemd` | Generate/update ARCHITECTURE.md |
| `/agentsmd` | Generate/update AGENTS.md |
| `/project-init` | Initialize AI-oriented repo context |

## Common Prompts (`nexus-common-agent-plugin`)

| Prompt | Description |
|--------|-------------|
| `/git` | Git operations (branch, commit, PR) |
| `/jira` | Create/update single JIRA item |
| `/analyze` | Universal analysis (configs, logs, specs) |
| `/article` | Confluence articles |
| `/copilot-asset` | Create/review Copilot assets |

## Native Dev Prompts (`nexus-macos-native-plugin`)

| Prompt | Description |
|--------|-------------|
| `/xcode-build` | Build icaclientmac Xcode project |
| `/xcode-test` | Run XCTest tests |
| `/vc-scaffold` | Scaffold Virtual Channel code |

## Release Management Prompts (`nexus-release-management-plugin`)

| Prompt | Description |
|--------|-------------|
| `/jira-completed-by-assignee` | Query JIRA for completed issues by assignee |
| `/jira-epic-enrichment` | Enrich JIRA issues with linked Epic data |
| `/github-jira-commit-linkage` | Find GitHub commits/PRs for JIRA keys |
| `/confluence-publish-report` | Publish JIRA report to Confluence |

## Agents

**SDLC**: router · dev-coordinator · developer · spec-author · feature-planner · feature-testplan-author · bugfix · architect · security-engineer
**Common**: analyzer · article-publisher · git-ops · jira-manager · prompt-engineer
**Native Dev**: build-engineer · vc-developer
**Release**: release-manager · jira-github-report-analyzer

## Related plugin

Install `mac-troubleshooting-agent-plugin` if you need `/sre`, `/spa-hybrid-troubleshoot`, or `/spa-service-troubleshoot`.

**Don't know which prompt?** Start with `/start` — it routes to the right agent.
