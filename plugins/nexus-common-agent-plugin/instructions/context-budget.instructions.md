---
name: context-budget
description: Token budget guidance per asset type. Keeps assets concise for reliable context window usage.
applyTo: "**"
---

# Context Budget

## Size targets by asset type

| Asset Type | Max Lines | Rationale |
|------------|-----------|-----------|
| Instruction file | ~60 | Auto-injected into every turn; must be small |
| Prompt file | ~30 | Entry point only; delegates to agents |
| Agent definition | ~100 | Loaded once per session; moderate budget |
| Skill (SKILL.md) | ~150 | Loaded on-demand; can be larger |
| Playbook | ~300 | Loaded conditionally; largest budget |

## Progressive disclosure

- **Start minimal** — load only what the current step requires.
- **Defer details** — reference playbooks and skills instead of inlining their content.
- **Trim on read** — when reading large files, select relevant sections rather than the entire file.

## Per-turn discipline

- Avoid attaching more than 2-3 skills per turn.
- Prefer targeted `read_file` ranges over full-file reads.
- When context grows large (>50 turns), summarize prior work before continuing.

## When creating assets

- Prefer bullet points and tables over prose.
- Remove redundant phrasing — every line should add unique value.
- If an asset exceeds its budget, split into a concise definition + a referenced playbook.
