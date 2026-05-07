# Mac Release Management Plugin

`nexus-release-management-plugin` contains release-readiness and reporting workflows that correlate JIRA hierarchy, GitHub pull requests, release branches, and Confluence publication steps.

## What This Plugin Provides

- Release commands such as `/jira-epic-enrichment`, `/jira-completed-by-assignee`, `/github-jira-commit-linkage`, and `/confluence-publish-report`
- Release-analysis agents `release-manager` and `jira-github-report-analyzer`
- Helper skills for release delta analysis and bug-fix branch tracing
- Release playbooks under `agent-assets/`
- A team-local config template under `config/` for JIRA assignee to GitHub repository mapping

## When To Install It

Install this plugin when you need release audits, fix-version hygiene checks, JIRA to GitHub correlation, or structured release reporting.

## Install From Source

You can load this plugin directly from its folder in VS Code.

1. Open the Command Palette.
2. Run `Chat: Install Plugin From Source`.
3. Select `plugins/nexus-release-management-plugin`.
4. Reload VS Code.

If you are using the marketplace, install `nexus-release-management-plugin@NexusAgent` alongside the common plugin.

## Plugin Layout

```text
agent-assets/            # Release-analysis playbooks and helper docs
agents/                  # Release-management agents (*.agent.md)
commands/                # Release reporting prompt definitions
config/                  # Team-local configuration templates
skills/                  # Release-management skills (<skill>/SKILL.md)
.github/plugin/          # Plugin manifest
.mcp.json                # Plugin-local MCP manifest
AGENTS.md                # Full asset catalog and maintenance guidance
README.md                # Plugin overview
```

## Team Configuration

Before using workflows that depend on assignee-to-repository mapping, copy `config/jira-assignees-github-repos.template.json` to `config/jira-assignees-github-repos.json`. This is the local runtime config file expected by the default release commands and agents. Do not commit a filled-in copy with private mappings; keep `config/jira-assignees-github-repos.json` local-only or gitignored.

## Related Documentation

- See `AGENTS.md` for the full release-management asset inventory and workflow rules.
- See `../../.github/copilot-instructions.md` for shared repository-level Copilot guidance.
- See `agent-assets/scripts/release-helpers/README.md` for helper script context when working on release tooling.
