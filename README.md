# NexusAgent — Mac Copilot Multi-Agent Harness

This repository publishes the icaclientmac team's GitHub Copilot multi-agent harness for macOS platform development. It contains installable plugins under `plugins/`, the marketplace manifest under `.github/plugin/marketplace.json`, shared repository guidance under `.github/copilot-instructions.md`, and evaluation assets under `eval/`.

## What This Repository Contains

- 4 installable Copilot agent plugins packaged under `plugins/`
- 27 slash commands, 18 agents, 31 skills, 13 instruction files
- Marketplace registration in `.github/plugin/marketplace.json`
- Shared repository-level Copilot guidance in `.github/copilot-instructions.md`
- Repository and plugin documentation in `DEV-GUIDE.md` and each plugin `AGENTS.md`
- Prompt and workflow eval suites in `eval/tests/`

## Included Plugins

| Plugin | Commands | Agents | Skills | Purpose |
| ------ | -------- | ------ | ------ | ------- |
| `nexus-common-agent-plugin` | 5 | 5 | 6 | Shared cross-cutting commands, agents, instructions, hooks, and reusable skills |
| `nexus-sdlc-agent-plugin` | 15 | 9 | 10 | SDLC workflows: `/task`, `/feature-spec`, `/feature-plan`, `/feature-e2e`, architecture, review, testing |
| `nexus-macos-native-plugin` | 3 | 2 | 13 | Native macOS development — Xcode build/test, ObjC/Swift, Virtual Channel scaffolding |
| `nexus-release-management-plugin` | 4 | 2 | 2 | Release-readiness analysis, JIRA/GitHub correlation, and reporting |

## Using The Marketplace In VS Code

Add the marketplace through VS Code settings or the Copilot plugin commands.

### Settings UI

1. Open VS Code settings.
2. Go to `Chat > Plugins: Marketplaces`.
3. Add `todo/NexusAgent`.
4. Enable `Chat > Plugins: Enabled` if it is not already on.
5. Open the Extensions view and search for `@agentPlugins`.
6. Install the plugins you want.

For local development, add the repository as a local marketplace path such as `file:///Users/<your-user>/srv_code/HarnessAgent/NexusAgent`.

### Copilot Plugin Commands

```text
/plugin marketplace add NexusAgent
/plugin marketplace browse NexusAgent
/plugin install nexus-common-agent-plugin@NexusAgent
```

Install `nexus-common-agent-plugin` first, then add only the specialized plugins you need.

## Repository Layout

```text
.github/plugin/marketplace.json   # Marketplace manifest
.github/copilot-instructions.md   # Shared repository-level Copilot guidance
plugins/                          # Installable plugins (4 plugins)
eval/                             # Prompt and workflow evaluation assets
ARCHITECTURE.md                   # System architecture documentation
DEV-GUIDE.md                      # Maintainer guide for this repository
CODEOWNERS                        # PR reviewer ownership
README.md                         # This file
```

## Plugin Documentation

Each plugin documents only the assets it owns.

- Start with the plugin `README.md` for a human-oriented overview.
- Use the plugin `AGENTS.md` for the full asset catalog, workflow rules, and maintenance guidance.

## Maintainer Notes

- Update `.github/plugin/marketplace.json` when adding or removing plugins.
- Keep each plugin's `README.md` and `AGENTS.md` aligned with the assets that actually ship in that plugin.
- Use `DEV-GUIDE.md` for marketplace-level maintenance rules, plugin creation guidance, and repo layout details.

## Troubleshooting

- If plugins do not appear immediately, reload VS Code and search for `@agentPlugins` again.
- If a command or agent does not show up, confirm the plugin is installed and the workspace has reloaded.
- If shared guidance seems stale, check `.github/copilot-instructions.md` and the owning plugin `AGENTS.md`.
