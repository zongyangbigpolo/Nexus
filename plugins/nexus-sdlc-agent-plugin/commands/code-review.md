---
name: code-review
description: Review code changes for quality, security, and correctness. Used standalone or as part of /bugfix and /task workflows.
agent: developer
argument-hint: "scope=staged|branch|file path=<path>"
---

Review code changes using the comprehensive checklist.

## Inputs

- **Scope**: ${input:scope:staged} — `staged` (default), `branch` (vs master), `file` (path)
- **Path**: ${input:path:} — file or folder (for `scope=file`)
- **Focus**: ${input:focus:all} — `all`, `security`, `tests`, `perf`

## Workflow

1. **Gather** — Get changes based on scope
2. **Context** — Read AGENTS.md, load [code-review-checklist](../skills/code-review-checklist/SKILL.md)
3. **Review** — Apply checklist categories per focus
4. **Report** — Summary (PASS/NEEDS_CHANGES/CRITICAL), findings by severity, checklist results

---

## Usage

```
/code-review                      # Staged changes
/code-review scope=branch         # All branch changes vs master
/code-review scope=file path=src/ # Specific folder
/code-review focus=security       # Security-focused
```

Also invoked by `/task` (Phase 4) and `/bugfix` (after fix).