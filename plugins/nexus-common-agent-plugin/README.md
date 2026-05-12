# Mac Common Agent Plugin

`nexus-common-agent-plugin` is the shared foundation for the Mac Copilot marketplace. It packages the reusable commands, agents, instruction files, hooks, and skills that other desktop OS workflows build on.

## What This Plugin Provides

- Shared commands such as `/analyze`, `/article`, `/copilot-asset`, `/git`, and `/jira`
- Reusable agents such as `analyzer`, `article-publisher`, `git-ops`, `jira-manager`, and `prompt-engineer`
- Shared instruction files under `instructions/`
- Reusable skills for analysis frameworks, Git workflow, and Copilot asset authoring
- Shared MCP and hook configuration through `.mcp.json` and `hooks.json`

## When To Install It

Install this plugin first when you want the shared operational workflows, common JIRA and Git helpers, or repository-level policy and MCP support that other plugins assume.

## Install From Source

You can load this plugin directly from its folder in VS Code.

1. Open the Command Palette.
2. Run `Chat: Install Plugin From Source`.
3. Select `plugins/nexus-common-agent-plugin`.
4. Reload VS Code.

If you are using the marketplace, install `nexus-common-agent-plugin@NexusAgent` first.

## Plugin Layout

```text
agent-assets/            # Shared playbooks for common agents
agents/                  # Common agents (*.agent.md)
commands/                # Shared slash-command definitions
instructions/            # Shared instruction files (*.instructions.md)
scripts/                 # Supporting maintenance scripts
skills/                  # Reusable skills (<skill>/SKILL.md)
hooks.json               # Hook configuration
.github/plugin/          # Plugin manifest
.mcp.json                # MCP server manifest
AGENTS.md                # Full asset catalog and maintenance guidance
README.md                # Plugin overview
```

## Typical Workflows

- Use `/git` or `git-ops` for branch, commit, push, and PR operations.
- Use `/jira` or `jira-manager` for ticket creation and updates.
- Use `/analyze` for general technical analysis.
- Use `/copilot-asset` or `prompt-engineer` when creating or reviewing prompts, agents, or instructions.

## Related Documentation

- See `AGENTS.md` for the complete asset inventory and workflow rules.
- See `../../.github/copilot-instructions.md` for shared repository-level Copilot guidance.
- See `../../DEV-GUIDE.md` for marketplace maintainer guidance.
