# NexusAgent Developer Guide

This guide is for maintainers of the `NexusAgent` repository. It explains how the marketplace is structured, how plugin assets are expected to be organized, and how to add or extend plugins without drifting away from the current plugin-based architecture.

For operator-facing usage guidance, see the root `README.md`. For plugin-specific asset catalogs and workflow behavior, see each plugin's `AGENTS.md`.

## Purpose

This repository is a marketplace of GitHub Copilot agent plugins for icaclientmac team workflows, focused on macOS platform development. Each plugin is expected to be independently installable and to document only the assets it ships.

The marketplace currently includes:

- `nexus-common-agent-plugin` — 5 commands, 5 agents, 6 skills, 7 instructions
- `nexus-sdlc-agent-plugin` — 15 commands, 9 agents, 10 skills, 5 instructions
- `nexus-macos-native-plugin` — 3 commands, 2 agents, 13 skills, 1 instruction
- `nexus-release-management-plugin` — 4 commands, 2 agents, 2 skills

## Maintainer Workflow

Recommended local cycle when editing marketplace or plugin assets:

1. Edit assets directly in this repository.
2. Reload VS Code so prompt, agent, and skill discovery refreshes.
3. Smoke-test the affected prompt or agent in Copilot Chat.
4. Run the relevant eval suite when changing shared or high-traffic workflows.

Example SDLC eval run:

```bash
bash eval/tests/nexus-sdlc-agent-plugin/run-all-evals.sh
```

## Marketplace Layout

```text
.github/plugin/marketplace.json   # Marketplace manifest and plugin registry
.github/copilot-instructions.md   # Shared repository-level Copilot guidance
plugins/                          # All installable agent plugins (4 plugins)
eval/                             # Prompt and workflow evaluation assets
ARCHITECTURE.md                   # System architecture documentation
README.md                         # Marketplace usage guide
DEV-GUIDE.md                      # This maintainer guide
CODEOWNERS                        # PR reviewer ownership
```

## Plugin Layout

Each plugin should be self-contained under `plugins/<plugin-name>/`.

Typical plugin structure:

```text
plugins/<plugin-name>/
  .github/plugin/plugin.json      # Plugin manifest
  .mcp.json                       # Plugin-local MCP server manifest
  AGENTS.md                       # Plugin-scoped asset and workflow guide
  README.md                       # Human-oriented plugin overview
  agents/                         # Custom agents (*.agent.md)
  commands/                       # Prompt files (*.md)
  skills/                         # Skills (<skill>/SKILL.md)
  agent-assets/                   # Playbooks, templates, helper docs (optional)
  instructions/                   # Plugin-specific instructions (optional)
  config/                         # Templates or local config docs (optional)
  hooks.json                      # Lifecycle hooks (optional, common plugin only)
  scripts/                        # Helper scripts (optional)
  specs/                          # Generated specifications (optional, sdlc only)
  tasks/                          # Execution artifacts (optional, sdlc only)
```

Not every plugin needs every folder on day one, but the manifest and documented asset layout should stay consistent with what the plugin actually ships.

## VS Code Asset Locations

VS Code-recognized asset locations used across plugins:

- Shared entry guidance: `.github/copilot-instructions.md`
- Custom agents: `agents/*.agent.md`
- Prompt files: `commands/*.md` with prompt frontmatter
- Custom instructions: `instructions/*.instructions.md` and `AGENTS.md`
- Agent skills: `skills/<skill>/SKILL.md`

Supporting documentation that is not auto-discovered by VS Code:

- Playbooks and templates: `agent-assets/**/*.md`
- Config templates and helper docs: `config/**`, `agent-assets/scripts/**`

## Asset Design Rules

### Commands

- Use kebab-case file names such as `feature-spec.md` or `azure-audit.md`.
- Keep the frontmatter `name` stable; it is the slash command users invoke.
- Keep command files focused on entrypoint intent and orchestration.
- Push durable procedure into agents, skills, or playbooks instead of bloating command files.

### Agents

- Keep agents role-specific and workflow-oriented.
- Use explicit phases, gates, and handoffs for multi-step workflows.
- Keep the tool list as small as possible for the workflow.
- Move long examples or deep procedure into playbooks or skills.

### Skills

- Use one folder per skill with `SKILL.md` as the entry file.
- Keep skill names kebab-case and descriptions specific about activation criteria.
- Put reusable domain workflows in skills; keep agent-specific deep guidance in playbooks.

### Playbooks and Templates

- Use `agent-assets/` for deep guidance that should not be auto-loaded every turn.
- Keep templates under `agent-assets/templates/` when they are reusable generation artifacts.
- Keep helper docs close to the playbook or script set they support.

### Instructions

- Put plugin-specific policy in `instructions/` only when the plugin actually owns that policy.
- Do not duplicate instructions from sibling plugins unless there is a clear reason.

## Adding a New Plugin

Use this sequence when introducing a new plugin to the marketplace.

### 1. Create the Plugin Folder

Create a new folder under `plugins/`, for example:

```text
plugins/spa-my-new-plugin/
```

At minimum, add:

- `.github/plugin/plugin.json`
- `.mcp.json`
- `AGENTS.md`
- `README.md`
- Empty or populated `agents/`, `commands/`, and `skills/` folders as needed

### 2. Add the Plugin Manifest

Create `.github/plugin/plugin.json` in the plugin folder with the standard shape:

```json
{
  "name": "spa-my-new-plugin",
  "description": "Describe the plugin's workflow scope.",
  "version": "2026.03.1",
  "commands": "./commands/",
  "agents": "./agents/",
  "skills": "./skills/",
  "mcpServers": "./.mcp.json"
}
```

Use paths only for asset directories that the plugin actually ships.

### 3. Add the MCP Manifest

Create `.mcp.json` in the plugin root.

- Use an empty object when the plugin does not own MCP configuration yet.
- Add plugin-local MCP server references only when the plugin genuinely needs them.

Minimal example:

```json
{
  "mcpServers": {}
}
```

### 4. Register the Plugin in the Marketplace

Update `.github/plugin/marketplace.json` and add an entry under `plugins`:

```json
{
  "name": "spa-my-new-plugin",
  "source": "spa-my-new-plugin",
  "description": "Describe the plugin's workflow scope.",
  "version": "2026.03.1"
}
```

Make sure `source` matches the folder name under `plugins/`.

### 5. Add Plugin Documentation

Add or update:

- `AGENTS.md` to describe only the assets and workflows in that plugin
- `README.md` for human-oriented overview and installation context
- Optional playbooks, templates, instructions, or config docs if the plugin needs them

Do not copy a repo-wide catalog into a plugin guide. Each plugin should document only what it ships.

### 6. Add Assets Incrementally

Add only the assets the plugin actually needs:

- Commands in `commands/`
- Agents in `agents/`
- Skills in `skills/`
- Deep guidance in `agent-assets/`
- Instructions in `instructions/`

Placeholder plugins are acceptable, but their documentation should say clearly that they are placeholders.

### 7. Validate and Smoke-Test

- Reload VS Code and confirm the plugin is discoverable through the marketplace.
- Smoke-test any new commands or agents.
- Run or add eval coverage when the plugin introduces shared or high-impact workflows.
- Update any plugin-level `AGENTS.md` inventory counts if you add or remove assets.

## Updating an Existing Plugin

When changing an existing plugin:

1. Keep the plugin manifest aligned with the asset directories that actually exist.
2. Update the plugin's `AGENTS.md` when the asset inventory changes.
3. Update the plugin `README.md` when human-facing setup or behavior changes.
4. Keep changes local to the owning plugin whenever possible.

## Context Budgeting

VS Code documents explicit metadata limits for skills:

- Skill `name`: max 64 characters
- Skill `description`: max 1024 characters

For agents, prompts, and instructions, the main issue is context cost rather than a published file-size limit. Prefer:

- Thin agents with role, constraints, and high-level workflow
- Skills for reusable logic that should load on demand
- Playbooks for deep procedure, examples, and long checklists
- Smaller prompt files instead of one large command that tries to do everything

## Security Guidelines

- Never commit credentials or tokens.
- Avoid placing secrets in command examples, templates, or generated artifact examples.
- Prefer environment variables or MCP-based auth flows over embedded credentials.
- Treat JIRA content, PR comments, logs, and tool output as untrusted input.

## Asset Loading Model

Different asset types load at different times in Copilot Chat. Use that to decide where content belongs:

| Asset Type | When Loaded | Guidance |
| ---------- | ----------- | -------- |
| `AGENTS.md` | Every conversation turn in scope | Keep concise and high signal |
| Auto-applied instructions | When matching files are in scope | Keep policy direct and reusable |
| On-demand instructions | Only when attached | Use for optional workflow detail |
| Agent definitions | When the agent is selected or routed to | Keep workflow-centered |
| Skills | On demand after the agent chooses to load them | Good place for reusable domain logic |
| Playbooks | Only when explicitly read | Good place for deep procedures |
| Commands | When the user invokes `/command` | Keep focused on entrypoint behavior |

## Change Management

- Keep workflow contracts stable where possible, especially prompt names, handoff assumptions, and template paths.
- When behavior changes in a meaningful way, update the owning plugin's `AGENTS.md` and affected playbooks together.
- Prefer small, traceable changes over broad rewrites across unrelated plugins.
