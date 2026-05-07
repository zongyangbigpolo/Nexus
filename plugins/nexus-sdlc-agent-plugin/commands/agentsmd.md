---
name: agentsmd
description: Generate or update AGENTS.md — architect scans repo, prompt-engineer reviews for AI-prompt quality.
agent: architect
argument-hint: "source=<path> action=suggest|apply"
---

Generate or update AGENTS.md files by scanning the entire repository.

Use **system specialization** — load [architect-system playbook](../agent-assets/architect/architect-system.playbook.md), section "AGENTS.md Generation Workflow".

## Inputs
- **Source**: ${input:source:.} (path to repo root or folder to scan)
- **Action**: ${input:action:apply}
  - `suggest` = report findings + proposed additions (no file changes)
  - `apply` = create or update AGENTS.md files

## Examples
```
/agentsmd source=. action=apply
/agentsmd source=./my-project action=suggest
```

## Workflow

### Phase 1: Repository Scan (architect)
1. Scan repo structure — identify root and subprojects/modules/services
2. Detect tech stack, architecture patterns, build/test commands
3. Decide AGENTS.md locations (root always; subproject if distinct stack/build)
4. Generate or update AGENTS.md per [template](../agent-assets/templates/agents-md.template.md)
5. **Augment, don't replace** — only add missing sections, never remove existing content

### Phase 2: Review (handoff to prompt-engineer)
6. Handoff to `prompt-engineer` (mode=review): structure clarity, [agents.md spec](https://agents.md) completeness, path verification, security check

## Multi-file Support
- Root AGENTS.md always created/updated; subproject files when architect finds distinct modules
- Requires VS Code setting `chat.useNestedAgentsMdFiles: true`

## References
- [AGENTS.md Template](../agent-assets/templates/agents-md.template.md) | [ARCHITECTURE.md Template](../agent-assets/templates/architecture-md.template.md)
- [agents.md spec](https://agents.md) | [architecture.md spec](https://architecture.md/)
