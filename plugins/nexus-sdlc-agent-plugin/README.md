# Mac SDLC Agent Plugin

`nexus-sdlc-agent-plugin` contains the structured delivery workflows for macOS engineering. It packages the prompts, agents, skills, templates, and instructions used for project initialization, specification authoring, architecture work, planning, implementation coordination, review, testing, and security analysis.

## What This Plugin Provides

- SDLC entry commands such as `/task`, `/feature-spec`, `/feature-plan`, `/architecture`, `/project-init`, `/code-review`, `/test`, and `/security`
- Workflow agents such as `architect`, `dev-coordinator`, `developer`, `spec-author`, `feature-planner`, `bugfix`, and `security-engineer`
- SDLC skills for ADRs, C4 diagrams, JIRA context discovery, code review, test strategy, and local environment management
- Playbooks and templates under `agent-assets/`
- SDLC-specific instruction files under `instructions/`
- Generated workflow artifacts under `specs/` and `tasks/`

## When To Install It

Install this plugin when you want end-to-end engineering workflows for planning and implementation, or when you need repository authoring helpers such as AGENTS and architecture generation.

## Install From Source

You can load this plugin directly from its folder in VS Code.

1. Open the Command Palette.
2. Run `Chat: Install Plugin From Source`.
3. Select `plugins/nexus-sdlc-agent-plugin`.
4. Reload VS Code.

If you are using the marketplace, install `nexus-sdlc-agent-plugin@NexusAgent` after the common plugin.

## Typical Flows

```text
/start -> router -> correct SDLC workflow
/feature-spec -> spec-author -> implementation-ready specification
/feature-plan -> feature-planner -> JIRA hierarchy
/task -> dev-coordinator -> developer -> review and completion handoff
/architecture or /project-init -> architect -> repository documentation artifacts
```

## Plugin Layout

```text
agent-assets/            # Playbooks and templates
agents/                  # SDLC workflow agents (*.agent.md)
commands/                # SDLC slash-command definitions
instructions/            # SDLC-specific instruction files
skills/                  # Reusable SDLC skills (<skill>/SKILL.md)
specs/                   # Generated or curated specification artifacts
tasks/                   # Workflow task and investigation artifacts
TODO.md                  # Plugin backlog and follow-up ideas
.github/plugin/          # Plugin manifest
.mcp.json                # Plugin-local MCP manifest
AGENTS.md                # Full asset catalog and maintenance guidance
README.md                # Plugin overview
```

## Validation

Run the SDLC eval suite from the repository root when you change broadly used SDLC prompts.

```bash
bash eval/tests/nexus-sdlc-agent-plugin/run-all-evals.sh
```

## Related Documentation

- See `AGENTS.md` for the full inventory of SDLC assets and workflow rules.
- See `../../DEV-GUIDE.md` for marketplace maintainer guidance.
- See `../../.github/copilot-instructions.md` for shared repository-level Copilot guidance.
