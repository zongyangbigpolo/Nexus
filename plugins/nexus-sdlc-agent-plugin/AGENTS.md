# AGENTS.md

nexus-sdlc-agent-plugin contains the structured software delivery workflows for desktop OS engineering: project initialization, architecture authoring, feature specification, planning, implementation coordination, end-to-end feature delivery, code review, testing, bug fixing, and security review. The assets in this folder orchestrate multi-step handoffs across specialized agents instead of implementing code directly.

## Project Overview

**Tech Stack**: Markdown-based Copilot assets, YAML frontmatter, JSON plugin manifests, task/spec Markdown artifacts
**Architecture**: Workflow-oriented agent plugin for SDLC orchestration and architecture documentation

This plugin is the primary authoring and execution layer for SDLC tasks in the Mac agent harness. It assumes nested AGENTS.md support and relies on repository scanning, prompt assets, and explicit handoff protocols.

## Development

### Build & Run

```bash
# No package-local build step is defined for this plugin

# Run the SDLC prompt evaluation suite from the repository root (Git Bash or equivalent)
bash eval/tests/nexus-sdlc-agent-plugin/run-all-evals.sh

# Reload VS Code after editing agent, command, or skill assets
```

### Code Conventions

- Preserve explicit phase structure, gates, and handoff requirements in workflow agents.
- Keep agent instructions actionable and deterministic; avoid hidden interpretation steps in coordinator-style agents.
- Use ASCII or Mermaid diagrams only when documenting architecture.
- When changing assets that affect repository context discovery, update AGENTS.md alongside the asset.
- Do not embed secrets, MCP credentials, or customer data in prompts, tasks, specs, or examples.

### Testing

**Framework**: Repository-level prompt evaluation suites plus manual prompt smoke testing
**Run tests**: `bash eval/tests/nexus-sdlc-agent-plugin/run-all-evals.sh`
**Coverage requirement**: Validate changed workflows with the relevant evals or a direct prompt smoke test before shipping

**Test patterns**:

- Use the eval suite after editing widely used prompts such as `/task`, `/feature-spec`, `/feature-plan`, `/architecture`, or `/project-init`.
- Re-check handoffs when changing agent contracts, especially between `architect`, `dev-coordinator`, `developer`, and `security-engineer`.
- Verify any new references to templates, specs, or tasks resolve to files that exist in this plugin.

## Key Components

**Key Components**:

- `agents/` - SDLC specialists including `architect`, `bugfix`, `dev-coordinator`, `developer`, `feature-planner`, `feature-testplan-author`, `router`, `security-engineer`, and `spec-author`
- `commands/` - User entry points for planning, implementation, review, testing, bugfix, architecture, E2E feature delivery, and initialization workflows
- `skills/` - Reusable skills for C4 diagrams, ADRs, test strategy, code review, security review, and threat modeling
- `agent-assets/` - Playbooks and templates for architecture, development, and task generation
- `instructions/` - Guardrails for code editing, copyright headers, security, and workflow execution
- `specs/` - Generated or curated specification artifacts
- `tasks/` - Execution artifacts and investigation/task files produced during workflow runs
- Root `DEV-GUIDE.md` and local `TODO.md` - Marketplace maintainer guidance and plugin backlog context
- `.mcp.json` - Currently empty at plugin level; consuming workspaces must supply the MCP servers required by the agents

## Copilot Assets

| Asset Type | Current Inventory | Notes |
| ---------- | ----------------- | ----- |
| Agents | 9 | `architect`, `bugfix`, `dev-coordinator`, `developer`, `feature-planner`, `feature-testplan-author`, `router`, `security-engineer`, `spec-author` |
| Commands | 15 | `/agentsmd`, `/architecture`, `/architecturemd`, `/bugfix`, `/code-review`, `/feature-e2e`, `/feature-plan`, `/feature-spec`, `/feature-testplan`, `/help`, `/project-init`, `/security`, `/start`, `/task`, `/test` |
| Skills | 10 | Includes architecture, JIRA context, code review, code submission, security, and threat modeling skills |
| Playbooks and Templates | 19 | Agent playbooks plus architecture and task templates under `agent-assets/` |
| Instructions | 5 | SDLC-specific instruction files under `instructions/` |
| Output Artifacts | `specs/`, `tasks/` | Workflow-generated documentation and execution state |

## Detailed Asset Catalog

This section documents only the assets that currently ship inside `nexus-sdlc-agent-plugin`.

## Asset Relationship Summary

```text
/start -> router
/task -> dev-coordinator -> developer -> security-engineer -> dev-coordinator
/feature-spec -> spec-author
/feature-e2e -> spec-author (end-to-end: design -> Confluence -> stories -> code -> PR)
/feature-plan -> feature-planner
/feature-testplan -> feature-testplan-author
/architecture, /architecturemd, /agentsmd, /project-init -> architect
/bugfix -> bugfix
/code-review, /test -> developer
/security -> security-engineer

Shared SDLC skills support architecture generation, JIRA discovery, testing,
code review, code submission, and security review.
```

### Slash Commands (`commands/`)

| Prompt | Description | Agent |
| ------ | ----------- | ----- |
| `/agentsmd` | Generate or update AGENTS.md files using the system-architect workflow | `architect` |
| `/architecture` | Design architecture artifacts such as diagrams, ADRs, and threat models | `architect` |
| `/architecturemd` | Generate or update `ARCHITECTURE.md` at the repository root | `architect` |
| `/bugfix` | Investigate a bug, form hypotheses, and drive root-cause-oriented fixes | `bugfix` |
| `/code-review` | Review code for correctness, security, tests, and maintainability | `developer` |
| `/feature-e2e` | End-to-end feature delivery: design doc → Confluence → JIRA stories → implementation → PR | `spec-author` |
| `/feature-plan` | Generate JIRA hierarchy from a feature specification | `feature-planner` |
| `/feature-spec` | Turn requirements into a detailed technical specification | `spec-author` |
| `/feature-testplan` | Generate and publish a test plan from a feature specification | `feature-testplan-author` |
| `/help` | Show available SDLC prompts and workflow guidance | `router` |
| `/project-init` | Initialize AI-oriented repository context such as AGENTS.md and ARCHITECTURE.md | `architect` |
| `/security` | Perform deep security analysis of code, infrastructure, config, or logs | `security-engineer` |
| `/start` | Classify the request and route to the most appropriate SDLC workflow | `router` |
| `/task` | Execute the implementation workflow for a JIRA story | `dev-coordinator` |
| `/test` | Define a testing strategy for a feature or change | `developer` |

### Custom Agents (`agents/`)

| Agent | Description |
| ----- | ----------- |
| `architect` | Multi-specialization architecture agent for solution, cloud, security, and system-documentation workflows |
| `bugfix` | Bug investigation agent with structured debugging and evidence gathering |
| `dev-coordinator` | SDLC coordinator that handles JIRA setup, branch flow, task files, and developer handoff |
| `developer` | Implementation agent responsible for analysis, code changes, testing, and completion handoff |
| `feature-planner` | Planning agent that breaks specifications into JIRA hierarchy and delivery structure |
| `feature-testplan-author` | QA-oriented agent that creates detailed feature test plans |
| `router` | Entry-point router for selecting the right SDLC workflow |
| `security-engineer` | Security review agent for code, infrastructure, logs, and configurations |
| `spec-author` | Specification authoring agent for producing implementation-ready feature specs |

### Playbooks and Templates (`agent-assets/`)

| Asset | Used By | Purpose |
| ----- | ------- | ------- |
| `architect/architect-cloud.playbook.md` | `architect` | Cloud/platform architecture guidance |
| `architect/architect-security.playbook.md` | `architect` | Security architecture guidance |
| `architect/architect-solution.playbook.md` | `architect` | Solution and enterprise architecture guidance |
| `architect/architect-system.playbook.md` | `architect` | System analysis and documentation generation |
| `bugfix.playbook.md` | `bugfix` | Root-cause investigation workflow and report patterns |
| `developer/developer.playbook.md` | `developer` | Base implementation workflow |
| `developer/developer-dotnet.playbook.md` | `developer` | .NET implementation guidance |
| `developer/developer-frontend.playbook.md` | `developer` | JavaScript, TypeScript, and React implementation guidance |
| `developer/developer-go.playbook.md` | `developer` | Go implementation guidance |
| `developer/developer-netscaler.playbook.md` | `developer` | NetScaler and C workflow guidance |
| `developer/developer-python.playbook.md` | `developer` | Python implementation guidance |
| `feature-planner.playbook.md` | `feature-planner` | JIRA planning workflow and hierarchy rules |
| `feature-testplan-author.playbook.md` | `feature-testplan-author` | Test-plan structure and publication guidance |
| `router.playbook.md` | `router` | Request classification and routing guidance |
| `security-engineer.playbook.md` | `security-engineer` | Security review frameworks and reporting |
| `spec-author.playbook.md` | `spec-author` | Feature-spec authoring workflow and output structure |
| `templates/agents-md.template.md` | `architect` | AGENTS.md generation template |
| `templates/architecture-md.template.md` | `architect` | ARCHITECTURE.md generation template |
| `templates/task-file.template.md` | `dev-coordinator` | Task file template for implementation workflows |

### Instruction Files (`instructions/`)

| Instruction | Purpose |
| ----------- | ------- |
| `ascii-diagrams.instructions.md` | Enforce ASCII-only diagram output where required |
| `code-editing-policy.instructions.md` | Restrict code editing responsibilities to the correct agent workflow |
| `copyright-headers.instructions.md` | Define source-file copyright header policy |
| `security-and-secrets.instructions.md` | Handle secrets and sensitive material safely |
| `source-code-size.instructions.md` | Apply file-size and complexity constraints |

### Agent Skills (`skills/`)

| Skill | Purpose |
| ----- | ------- |
| `adr-generator` | Generate ADRs for significant architecture decisions |
| `c4-diagrams` | Generate C4-style architecture diagrams |
| `code-review-checklist` | Structured code review checklist for implementation changes |
| `code-submission` | Submission workflow for commits, pushes, PRs, and JIRA updates |
| `epic-story-workflow` | Manage epic-to-story execution sequencing |
| `jira-context-discovery` | Discover JIRA hierarchy and related planning context |
| `repository-context-discovery` | Scan repository structure and conventions before implementation |
| `security-code-review` | Perform deep security code review |
| `test-strategy` | Define test types, targets, and coverage expectations |
| `threat-modeling` | Build threat models using STRIDE-oriented methodology |

## Where Things Live

```text
agent-assets/            # SDLC playbooks and templates
agents/                  # SDLC workflow agents (*.agent.md)
commands/                # SDLC slash-command definitions
instructions/            # SDLC-specific instruction files
skills/                  # Reusable SDLC skills (<skill>/SKILL.md)
specs/                   # Specification artifacts produced by SDLC workflows
tasks/                   # Task and investigation artifacts produced by SDLC workflows
../../.github/copilot-instructions.md  # Shared repository-level Copilot guidance
TODO.md                  # Plugin backlog and follow-up ideas
.github/plugin/          # Plugin registration metadata
.mcp.json                # Plugin-local MCP manifest
```

## Using This Plugin

### Prompt Entry Points

In Copilot Chat, type `/` and choose one of the 15 commands defined under `commands/`.

### Agent Entry Points

Select one of the 9 SDLC agents from the agent picker when you want a role-specific workflow instead of a single prompt execution.

### Typical Flows

```text
/feature-spec -> spec-author -> specification artifact
/feature-plan -> feature-planner -> JIRA hierarchy
/task -> dev-coordinator -> developer -> security-engineer -> completion handoff
/architecturemd or /agentsmd -> architect -> documentation updates
```

### Troubleshooting

Prompt files do not show up after typing `/`:

- Ensure the plugin is installed from source and the workspace has reloaded.
- Ensure the source command files exist under `commands/` and retain valid prompt frontmatter.

Custom agents do not show up:

- Ensure the plugin is installed from source and the workspace has reloaded.
- Ensure agent files remain under `agents/` and end with `.agent.md`.

Agent skills do not activate:

- Ensure `chat.useAgentSkills` is enabled.
- Ensure each skill remains under `skills/<skill>/SKILL.md`.

## External Dependencies

- GitHub MCP: branch, PR, issue, and repository workflows used during implementation and submission
- Atlassian MCP: JIRA and Confluence context discovery, planning, and tracking workflows
- Azure MCP: available to architecture and operational workflows when required by the target system
- Organization Cloud APIs: used by the CC API tester workflow and related skills

## Team & Ownership

- **Domain**: desktop OS SDLC workflow automation and architecture documentation
- **Primary Use**: Project initialization, feature lifecycle orchestration, and developer/security handoff management
