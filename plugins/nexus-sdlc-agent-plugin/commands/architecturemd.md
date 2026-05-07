---
name: architecturemd
description: Generate or update ARCHITECTURE.md at repo root using architect agent (system specialization). Augments existing content — never replaces.
agent: architect
argument-hint: "depth=standard|quick|deep"
---

# Generate ARCHITECTURE.md

Scan the repository and generate (or update) a comprehensive `ARCHITECTURE.md` at the repo root.

## Inputs

- **Depth**: ${input:depth:standard}
  - `quick` = project structure + stack + basic components
  - `standard` = full analysis, all 14 template sections, 2+ diagrams
  - `deep` = code-level analysis, detailed data flows, tech debt identification

## Workflow

1. **Specialization**: System. Load [architect-system playbook](../agent-assets/architect/architect-system.playbook.md).
2. **Check existing** ARCHITECTURE.md — if present, **augment don't replace**.
3. **Scan repository** per playbook phases.
4. **Generate** all 14 sections per [template](../agent-assets/templates/architecture-md.template.md).
5. **Validate** — all sections present, diagram exists, no secrets.

## Rules

- Single file: `ARCHITECTURE.md` at repo root
- Augment existing content, never overwrite
- ASCII or Mermaid diagrams (no Unicode box-drawing)
- Based on [architecture.md](https://architecture.md/) specification

## Usage

```
/architecturemd
/architecturemd depth=quick
/architecturemd depth=deep
```
