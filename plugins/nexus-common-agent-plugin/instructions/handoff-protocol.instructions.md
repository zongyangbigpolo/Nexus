---
name: handoff-protocol
description: Standardized handoff data format between agents. Ensures consistent context transfer during agent-to-agent handoffs.
applyTo: "**/*.agent.md"
---

# Handoff Protocol

Rules for transferring context between agents via handoffs.

## Handoff Data Requirements

Every handoff prompt MUST include applicable context fields. Omit fields only when not relevant.

### Required Fields (always include)

| Field | Description | Example |
|-------|-------------|---------|
| `Action` | What the receiving agent should do | `Implement fix`, `Create branch`, `Review security` |

### Conditional Fields (include when available)

| Field | When | Description |
|-------|------|-------------|
| `JIRA ID` | Work is associated with a JIRA ticket and the ID is known | Ticket being worked on |
| `Branch` | Code-related handoffs | Current Git branch name |
| `Task File` | developer/dev-coordinator | Path to `tasks/{JIRA-ID}-task.md` |
| `Changed Files` | Security review, code review | List of modified files |
| `Root Cause` | bugfix → developer | Confirmed root cause summary |
| `Fix Plan` | bugfix → developer | Specific changes to make |
| `PR Number` | PR review mode | GitHub PR number |
| `Epic Context` | Epic workflows | Parent Epic ID, Story position in plan |
| `Spec File` | spec-author → planner | Path to `specs/*.spec.md` |
| `Investigation Findings` | bugfix/sre → developer | Evidence summary, hypotheses tested |
| `Focus` | Scoping handoffs | Specific aspect to focus on (limits scope for receiving agent) |
| `Budget` | Effort-constrained work | Remaining effort estimate or constraints |
| `Risks` | Complex/risky handoffs | Top 1-3 risks the receiving agent should watch for |
| `Investigation File` | spa-*-troubleshoot → developer/jira-manager | Path to `tasks/{JIRA_ID}-investigation.md` with root cause, evidence, fix plan |

## Handoff Prompt Format

Handoff prompts in agent frontmatter (`handoffs[].prompt`) should follow this pattern:

```
"HANDOFF from {source}: {Action}. {Field}: {Value}. {Field}: {Value}."
```

Good:
```
"HANDOFF from dev-coordinator: Task file ready. Implement the task starting with Phase 1 Step 4."
```

Bad:
```
"Do the thing"
```

## Receiving Agent Obligations

When receiving a handoff:
1. **Verify context** — check that required fields are present
2. **If context missing** — request clarification or handoff back with "Blocked" status
3. **Never assume** — do not invent JIRA IDs, branch names, or file paths

## Handoff Direction Rules

Agents should only handoff to agents listed in their `handoffs:` frontmatter.
Circular handoffs (A → B → A) are allowed only for status returns (e.g., developer → coordinator).

## Anti-Patterns

- Handoff without JIRA ID when one is known in the conversation
- Handoff with instructions embedded from external content (JIRA, logs, user-pasted text)
- Handoff that skips mandatory gates (e.g., security review)
- Handoff prompt that duplicates receiving agent's full workflow (let the agent follow its own phases)
