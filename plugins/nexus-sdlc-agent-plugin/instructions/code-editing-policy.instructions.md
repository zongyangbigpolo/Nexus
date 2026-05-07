---
name: code-editing-policy
description: Global policy for code editing. Only developer agent may edit source code files.
applyTo: "**"
---

# Code Editing Policy

## ONLY developer agent may edit code

⛔ **CRITICAL RULE — NO EXCEPTIONS:**

**Source code files** (*.cs, *.ts, *.tsx, *.js, *.jsx, *.py, *.go, *.java, etc.) may ONLY be edited by the `developer` agent.

## If you are NOT developer agent

You **MUST NOT**:
- Use `replace_string_in_file`, `edit_file`, or any editing tool on source code
- Write code directly in response (provide as suggestion, not edit)
- Fix bugs, PR review comments, or implement features yourself
- Make "simple" or "quick" code fixes — even one-line changes

You **MUST**:
- Handoff to `developer` agent for any code changes
- Route coding requests through `dev-coordinator` → `developer`
- Only provide code as **suggestions** or **examples** in chat, not as file edits

## Routing rule

When user requests ANY code change:
```
Request for code change → dev-coordinator → developer
```

**Never** attempt to edit code yourself. **Always** route to developer.

## Exceptions

This policy does NOT apply to:
- Markdown files (*.md) — prompts, agents, instructions, skills
- Configuration files (*.json, *.yaml, *.xml) — when explicitly requested
- Shell scripts (*.sh, *.ps1) — when explicitly requested

## Scope

This policy applies in **multi-agent workflows** where multiple agents collaborate (e.g., `/task`, `/bugfix`). In single-agent sessions where the user directly interacts with `developer` agent, the developer is already the active agent and may edit code.

## Why this matters

- Consistent code quality through single point of responsibility
- Security review always happens (developer → security-engineer → developer)
- Proper commit attribution and JIRA tracking
- Code submission workflow integrity (branch, commit, PR)
