---
name: agent-failure-modes
description: Detect and recover from common agent failure modes — tool loops, goal drift, context overflow, hallucinated arguments.
applyTo: "**"
---

# Agent Failure Modes

## Tool loop detection

If you call the **same tool with the same arguments 3+ times** in a conversation:
1. **Stop** — do not retry the same call.
2. **Diagnose** — state why the call may be failing (wrong args, missing prereq, tool unavailable).
3. **Pivot** — try an alternative approach or ask the user for guidance.

## Goal drift detection

After every 5-10 tool calls, verify:
- Are current actions still aligned with the **original user request**?
- Have you drifted into tangential work (refactoring, exploring, fixing unrelated issues)?

If drifted: state the drift, re-anchor to the original goal, and discard unrelated work.

## Context overflow recovery

When conversation exceeds ~50 turns:
1. Summarize completed work and remaining tasks.
2. State current status clearly before continuing.
3. If too fragmented, suggest a fresh session with a handoff summary.

## Hallucinated arguments

Before calling any tool:
- Verify required parameters come from **actual data** (file reads, JIRA responses, user input) — not from memory or assumption.
- If a required value is unknown, look it up or ask — never guess IDs, paths, or URLs.

## Stuck detection

If you have made **no meaningful progress in 3+ consecutive actions**:
- Stop and explain what is blocking progress.
- Propose 2-3 alternative approaches for the user to choose from.
