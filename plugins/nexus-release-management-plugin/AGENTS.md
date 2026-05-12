# AGENTS.md

nexus-release-management-plugin contains release-readiness and reporting workflows that correlate JIRA hierarchy, GitHub pull requests, release branches, and Confluence publication steps. It is currently a focused plugin with a small set of release-management assets and a local configuration template for team-specific mappings.

## Project Overview

**Tech Stack**: Markdown-based Copilot assets, YAML frontmatter, JSON plugin manifests, JSON config template
**Architecture**: Focused workflow plugin for release analysis and reporting

This plugin is designed for release audits rather than code authoring. It emphasizes traceability from ENG and bug tickets to GitHub repos, merged PRs, and release branches.

## Development

### Build & Run

```bash
# No package-local build step is defined for this plugin

# Load the plugin from source in VS Code and run the release prompts for smoke testing

# Reload VS Code after editing agent, command, skill, or config-template assets
```

### Code Conventions

- Resolve Atlassian `cloudId` before JIRA/Confluence MCP operations when the workflow requires it.
- Keep report templates deterministic so release outputs are comparable across runs.
- Preserve local-team configuration boundaries; do not commit filled-in copies of config templates with private mappings.
- Update AGENTS.md when new release workflows, agents, or commands are added.

### Testing

**Framework**: Manual prompt smoke testing and config/template validation
**Run tests**: No plugin-local automated test runner is defined in this folder
**Coverage requirement**: Verify that updated commands, agents, and config templates still support the intended release-reporting flow

**Test patterns**:

- Smoke-test the affected release command in VS Code after editing asset logic.
- Re-check config references when changing agents that depend on `config/jira-assignees-github-repos.json`.
- Confirm prompt output still covers both JIRA and GitHub evidence paths.

## Key Components

**Key Components**:

- `agents/` - `release-manager` and `jira-github-report-analyzer` workflows
- `commands/` - Release-oriented prompts for epic enrichment, completed work, linkage checks, and Confluence publishing
- `skills/` - Helper skills for release delta analysis and bug-fix branch tracing
- `agent-assets/` - Release playbook with JQL, report formats, and branch detection guidance
- `config/` - Local configuration template for JIRA assignee to GitHub repository mapping
- `.mcp.json` - Currently empty at plugin level; consuming workspaces must provide required MCP connectivity

## Copilot Assets

| Asset Type | Current Inventory | Notes |
| ---------- | ----------------- | ----- |
| Agents | 2 | `release-manager`, `jira-github-report-analyzer` |
| Commands | 4 | `jira-epic-enrichment`, `jira-completed-by-assignee`, `github-jira-commit-linkage`, `confluence-publish-report` |
| Skills | 2 | `release-delta-analyzer`, `bug-fix-branch-finder` |
| Playbooks | 2 | One playbook per agent under `agent-assets/` |
| Config Templates | 1 | `config/jira-assignees-github-repos.template.json` |

## Detailed Asset Catalog

This section documents only the assets that currently ship inside `nexus-release-management-plugin`.

## Asset Relationship Summary

```text
/jira-epic-enrichment -> jira-github-report-analyzer
/jira-completed-by-assignee -> jira-github-report-analyzer
/github-jira-commit-linkage -> jira-github-report-analyzer
/confluence-publish-report -> jira-github-report-analyzer

release-manager is the deeper release-audit agent and is supported by:
- release-manager.playbook.md
- release-delta-analyzer
- bug-fix-branch-finder
```

### Slash Commands (`commands/`)

| Prompt | Description | Agent |
| ------ | ----------- | ----- |
| `/confluence-publish-report` | Publish JIRA completion or release reports to Confluence | `jira-github-report-analyzer` |
| `/github-jira-commit-linkage` | Correlate GitHub commits and pull requests with JIRA keys | `jira-github-report-analyzer` |
| `/jira-completed-by-assignee` | Query JIRA for completed issues by assignee over a time range | `jira-github-report-analyzer` |
| `/jira-epic-enrichment` | Enrich JIRA issue lists with linked epic information | `jira-github-report-analyzer` |

### Custom Agents (`agents/`)

| Agent | Description |
| ----- | ----------- |
| `jira-github-report-analyzer` | Reporting agent for JIRA issue lists, GitHub linkage, and Confluence publishing |
| `release-manager` | Release-readiness agent for ENG mapping, branch correlation, and fix-version hygiene |

### Playbooks (`agent-assets/`)

| Playbook | Used By | Purpose |
| -------- | ------- | ------- |
| `jira-github-report-analyzer.playbook.md` | `jira-github-report-analyzer` | Reporting workflow, configuration schema, and query patterns |
| `release-manager.playbook.md` | `release-manager` | Release-audit workflow, JQL templates, GitHub search patterns, and report formats |

Additional support material:

- `agent-assets/scripts/release-helpers/README.md` documents helper script context for release tooling.

### Agent Skills (`skills/`)

| Skill | Purpose |
| ----- | ------- |
| `bug-fix-branch-finder` | Trace fixed bugs to the exact release branch and commit evidence |
| `release-delta-analyzer` | Compare JIRA-referenced changes between release branches |

### Configuration (`config/`)

| File | Purpose |
| ---- | ------- |
| `jira-assignees-github-repos.template.json` | Template for mapping JIRA assignees or teams to GitHub repositories used in release reporting |

## Where Things Live

```text
agent-assets/            # Release-analysis playbooks and helper docs
agents/                  # Release-management agents (*.agent.md)
commands/                # Release reporting prompt definitions
config/                  # Team-local configuration templates
skills/                  # Release-management skills (<skill>/SKILL.md)
../../.github/copilot-instructions.md  # Shared repository-level Copilot guidance
.github/plugin/          # Plugin registration metadata
.mcp.json                # Plugin-local MCP manifest
README.md                # Human-oriented plugin overview
```

## Using This Plugin

### Prompt Entry Points

In Copilot Chat, type `/` and choose one of the four release-management commands defined under `commands/`.

### Agent Entry Points

Use `jira-github-report-analyzer` for report-oriented workflows and `release-manager` for deeper release readiness analysis.

### Typical Flows

```text
/jira-completed-by-assignee -> issue list -> epic enrichment -> GitHub linkage -> optional Confluence publish
release-manager -> ENG or bug audit -> branch correlation -> risk summary -> release report
```

### Troubleshooting

Prompt files do not show up after typing `/`:

- Ensure the plugin is installed from source and the workspace has reloaded.
- Ensure the source command files exist under `commands/` and retain valid prompt frontmatter.

Custom agents do not show up:

- Ensure the plugin is installed from source and the workspace has reloaded.
- Ensure agent files remain under `agents/` and end with `.agent.md`.

Configuration-based workflows fail:

- Ensure the local runtime copy of `jira-assignees-github-repos.json` exists when required by the agent workflow.
- Keep private repository mappings out of version control; derive them from the template in `config/`.

## Security

- Do not commit filled-in private config files with internal team mappings.
- Treat JIRA and GitHub results as operational data that may contain sensitive delivery context.
- Resolve Atlassian and GitHub scope deliberately before publishing release reports.

## Standards & Documentation

File structures and formats in this plugin repo must align with VS Code Copilot documentation:

- **Reference**: <https://code.visualstudio.com/docs/copilot/copilot-customization>

### File Format Requirements

| Asset Type | Location | Extension | Frontmatter |
| ---------- | -------- | --------- | ----------- |
| Custom agents | `agents/` | `*.agent.md` | `chatagent` YAML |
| Prompt files | `commands/` | `*.md` | `prompt` YAML |
| Agent Skills | `skills/<skill>/` | `SKILL.md` | YAML |
| Playbooks | `agent-assets/` | `*.md` | Markdown |

## External Dependencies

- Atlassian MCP: JIRA hierarchy, bug audit, and Confluence publication workflows
- GitHub MCP: PR, commit, branch, and repository correlation
- Team-local config: repository mappings copied from the template under `config/`

## Team & Ownership

- **Domain**: Release readiness, traceability, and reporting
- **Primary Use**: Release audits, bug fix-version hygiene, and publishable release summaries
