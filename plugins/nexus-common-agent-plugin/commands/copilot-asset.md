---
name: copilot-asset
description: Create, review, or validate Copilot assets (agents, prompts, instructions, skills).
agent: prompt-engineer
argument-hint: "mode=create|review|validate target=agent|prompt|instruction|skill|all name=<name>"
---

# Copilot Asset Management

Manage VS Code Copilot assets using prompt-engineer agent.

## Skills

| Skill | Purpose |
|-------|---------|
| [copilot-asset-workflow](../skills/copilot-asset-workflow/SKILL.md) | CREATE and REVIEW workflows |
| [copilot-asset-validation](../skills/copilot-asset-validation/SKILL.md) | Validation rules and checks |

## Inputs

- **Mode**: `${input:mode:review}` — `create`, `review`, `validate`
- **Target**: `${input:target:agent}` — `agent`, `prompt`, `instruction`, `skill`, `all`
- **Name**: `${input:name:}` (kebab-case)

## Mode Routing

| Mode | Primary Skill | Final Step |
|------|---------------|------------|
| `create` | workflow | → validation |
| `review` | workflow | → validation |
| `validate` | validation | — |

## Constraints

- Follow [security-and-secrets](../instructions/security-and-secrets.instructions.md)
- Update AGENTS.md when creating/modifying assets
- Keep agents <150 lines (use playbooks)
- Keep skills <250 lines (compress or split)
- Keep prompts <50 lines

## Examples
```
/copilot-asset mode=review target=all
/copilot-asset mode=create target=agent name=my-agent
/copilot-asset mode=validate target=all
```

## Reference

https://code.visualstudio.com/docs/copilot/copilot-customization