---
name: code-submission
description: Submit code changes — commit, push, create PR, update JIRA. Handles AI-Generated markers and PR templates.
---

# Code Submission Skill

⛔ **CRITICAL: Use GitHub MCP tools (`github/*`), NOT `gh` CLI!**

The `gh` CLI is forbidden for PR creation. Use `create_pull_request` MCP tool instead.

## Purpose

Standardized workflow for submitting code changes:
1. Git commit with proper message format
2. Push branch to remote
3. Create Pull Request with AI-Generated disclaimer
4. Update JIRA status to "In Review"
5. Provide completion summary

## When to Use

| Agent | Trigger |
|-------|---------|
| developer | After implementation is verified (Phase 5 complete) |
| bugfix | After fix is implemented (via developer handoff) |
| architect | After creating code artifacts (if applicable) |

## Prerequisites

Before using this skill:
- [ ] All changes are tested and verified
- [ ] Build passes without errors
- [ ] All tests pass
- [ ] Self-review completed (code-review-checklist)
- [ ] JIRA status is "Ready for Test"

## Execution Steps

### Step 0: Extract JIRA ID from Current Branch (MANDATORY)

Follow [JIRA ID Extraction](../git-workflow/SKILL.md) from git-workflow skill.

**CRITICAL**: The extracted JIRA ID **MUST** be used in commit message. Never use placeholder `SPA-00000` when on a named branch.

### Step 1: Handle Task File (if exists)

⚠️ **Task file must NOT be in PR!**

Task file path: `{WORKSPACE_ROOT}/tasks/{JIRA_ID}-task.md` (use JIRA ID from Step 0).

1. Check if file exists — if not found → Skip to Step 2
2. Read task file content
3. Post **FULL content** (not summary!) as JIRA comment via `addCommentToJiraIssue`
   - Must include ALL sections: Context, Requirements, Plan, Files, Progress Log
   - If MCP unavailable → log warning, continue (don't block)
4. Verify comment added (log warning on failure, don't block)
5. Delete from repo: `git rm tasks/{JIRA_ID}-task.md`

### Step 2: Stage Changes

```bash
# Stage specific files (including task file deletion)
git add <file1> <file2> ...

# Or stage all changes (use with caution)
git add .
```

**Verify staged files**:
```bash
git status
# Should show: deleted: tasks/{JIRA_ID}-task.md
```

### Step 3: Commit with Proper Message

Follow [git-operation](../../instructions/git-operation.instructions.md) instructions.

**Format**:
```
{JIRA-ID-FROM-BRANCH} {Description at least 10 chars} [AI-Generated]
```

**CRITICAL**: Use JIRA ID extracted in Step 0 from branch name!

**Examples**:
```bash
# Current branch: feature/SPAOP-1234-GatewayDiscovery
# JIRA ID from branch: SPAOP-1234

# ✅ CORRECT - Uses JIRA ID from branch
git commit -m "SPAOP-1234 Implement gateway discovery API endpoint [AI-Generated]"

# ❌ WRONG - Different JIRA ID
git commit -m "SPA-00000 Implement gateway discovery API endpoint [AI-Generated]"
```

**Multiple commits** (same JIRA ID from branch):
```bash
# Current branch: feature/SPAOP-1234-GatewayDiscovery
git commit -m "SPAOP-1234 Add data model for gateway regions [AI-Generated]"
git commit -m "SPAOP-1234 Implement gateway discovery service [AI-Generated]"
git commit -m "SPAOP-1234 Add unit tests for gateway discovery [AI-Generated]"
```

**REQUIRED**: Always include `[AI-Generated]` marker at the end.

### Step 4: Push Branch

```bash
git push origin {branch-name}
```

**If branch doesn't exist on remote**:
```bash
git push -u origin {branch-name}
```

### Step 5: Create Pull Request

⛔ **Use GitHub MCP tools ONLY — NOT `gh` CLI!**

Determine `owner`/`repo` from `git remote get-url origin` — all tools below require them.

1. `get_me` — Verify authentication
2. `get_file_contents(owner, repo, path=".github/PULL_REQUEST_TEMPLATE.md")` — Check for PR template (try `pull_request_template.md` if 404)
3. `create_pull_request(owner, repo, title="{JIRA-ID}: {desc}", body, head={branch}, base="master")` — Create PR
4. `issue_write(owner, repo, issue_number={pullNumber}, method="update", labels=["AI-Generated"])` — Add `AI-Generated` label to PR
5. `pull_request_read(owner, repo, pullNumber)` — Verify state = "open"

**Target**: Always target `master` branch (PRs required, no direct merges).

**PR Title**: `{JIRA-ID}: {Brief description}`

#### PR Body Formatting Rules

⚠️ **CRITICAL**: The `body` parameter must be **plain markdown text with real line breaks**.

- **DO** write multi-line markdown naturally — each line separated by an actual newline
- **DO NOT** insert literal `\n` escape sequences — the MCP tool handles JSON serialization
- **DO NOT** escape quotes (`\"`) or HTML-encode characters (`&#34;`) — write them as-is
- **DO NOT** wrap the body in extra quotes or backticks

**Wrong** (causes `\\n` and `\\&#34;` in rendered PR):
```
body = "## Summary\n\nAdded feature X.\n\n## Changes\n- File \"foo.ts\""
```

**Correct** (natural multi-line string):
```
body =
## Summary

Added feature X.

## Changes
- File "foo.ts"
```

#### Default PR Body Template

Use this template when no `.github/PULL_REQUEST_TEMPLATE.md` exists:

```markdown
> ⚠️ **AI-Generated Code**: This PR was generated by an AI agent. Please review carefully for correctness, security, and adherence to project standards.

## Summary

{Brief description of what was done and why}

## JIRA

[{JIRA-ID}](https://citrix.atlassian.net/browse/{JIRA-ID}): {JIRA Title}

## Changes

- {Change 1}
- {Change 2}

## Testing

- Tests added/modified: {count}
- Coverage: {before}% → {after}%

## Checklist

- [ ] Code follows project conventions
- [ ] All tests passing
- [ ] No secrets committed
- [ ] Documentation updated (if needed)
- [ ] No breaking changes (or documented)
```

### Step 6: Update JIRA Status

1. `getTransitionsForJiraIssue(issueIdOrKey: "{JIRA_ID}")` — Get valid transitions
2. `transitionJiraIssue(issueIdOrKey: "{JIRA_ID}", transitionId: "{id}")` — Transition to "In Review"
3. `addCommentToJiraIssue(issueIdOrKey: "{JIRA_ID}", body: "PR created: {URL}")` — Add PR link
4. Verify: re-fetch issue, confirm status. If fails → log warning, continue (PR is more important).

### Step 7: Completion Summary

Provide: JIRA link, branch name, PR number/URL, changed files table, tests added, next steps (wait for review → address feedback → merge).

## Error Handling

| Error | Action |
|-------|--------|
| Commit fails (no staged files) | Stage files first with `git add` |
| Commit message invalid | Fix format: `{JIRA-ID} {10+ chars} [AI-Generated]` |
| Push fails (no upstream) | Use `git push -u origin {branch}` |
| Push fails (conflicts) | Pull changes, resolve conflicts, push again |
| PR creation fails | Check GitHub/Azure DevOps permissions |
| JIRA update fails | Manually update, report error to user |

## AI-Generated Marker

**Required in**: commit messages (`[AI-Generated]` at end), PR description (warning banner), PR labels (`AI-Generated` via `issue_write`), JIRA labels (`AI-Generated`).
**Not in**: code comments, file names, branch names.
