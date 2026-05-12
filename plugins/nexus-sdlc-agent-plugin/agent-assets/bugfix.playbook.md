# bugfix Playbook

This document contains the detailed operational playbook for the `bugfix` custom agent.

**Source of truth**: The agent file ([bugfix.agent.md](../agents/bugfix.agent.md)) defines:
- Role definition and workflow phases
- Tool permissions and constraints
- Handoff definitions

This playbook provides **operational details only**: templates, terminal commands, and checklists.

---

## Quick Reference

| Need | Resource |
|------|----------|
| Git operations | [git-operation instructions](../instructions/git-operation.instructions.md) |
| Code review | [code-review-checklist skill](../skills/code-review-checklist/SKILL.md) |
| JIRA updates | `jira-manager` agent |
| Implementation | `developer` agent |

---

## Terminal Commands Reference

Use OS-appropriate syntax based on detected environment:

### Git Commands (Cross-platform)

| Task | Command |
|------|---------|
| Recent changes to file | `git log --oneline -10 -- {file}` |
| Blame specific file | `git blame {file}` |
| Show diff | `git diff {file}` |
| Check branches | `git branch -a \| grep {jiraId}` |

### File Search

| Task | Windows (PowerShell) | desktop OS/Linux (bash) |
|------|---------------------|-------------------|
| Find files by pattern | `Get-ChildItem -Recurse -Filter "*.ts"` | `find . -name "*.ts"` |
| Search in files | `Select-String -Pattern "{text}" -Path "*.ts" -Recurse` | `grep -r "{text}" --include="*.ts"` |
| Count matches | `(Select-String -Pattern "{text}" -Path "*.ts" -Recurse).Count` | `grep -r "{text}" --include="*.ts" \| wc -l` |

### Process Investigation

| Task | Windows (PowerShell) | desktop OS/Linux (bash) |
|------|---------------------|-------------------|
| Check port usage | `Get-NetTCPConnection -LocalPort {port}` | `lsof -i :{port}` |
| List processes | `Get-Process \| Where-Object {$_.Name -like "*{name}*"}` | `ps aux \| grep {name}` |

---

## Output Templates

### Bug Context Summary

```markdown
## Bug: {JIRA-ID}

**Summary**: {title}
**Severity**: {severity}
**Priority**: {priority}
**Reported**: {date}
**Reporter**: {name}

### Symptoms
- {symptom 1}
- {symptom 2}

### Steps to Reproduce
1. {step}
2. {step}
3. {step}

### Expected vs Actual
- **Expected**: {expected behavior}
- **Actual**: {actual behavior}

### Environment
- Browser/Client: {details}
- OS: {details}
- Version: {details}

### Affected Components
- {component 1}
- {component 2}

### Related Issues
- {JIRA-ID}: {relationship}
```

### Hypothesis Table

```markdown
## Hypotheses

| # | Hypothesis | Confidence | Evidence | Files to Check | Status |
|---|------------|------------|----------|----------------|--------|
| 1 | {description} | High | {why this is likely} | `path/to/file.ts` | 🔄 |
| 2 | {description} | Medium | {supporting evidence} | `path/to/other.ts` | 🔄 |
| 3 | {description} | Low | {possible but unlikely} | `path/to/another.ts` | 🔄 |

**Legend**: ✅ Confirmed | ❌ Rejected | 🔄 Investigating
```

### Investigation Report

```markdown
## Investigation: {JIRA-ID}

**Status**: {Root Cause Confirmed / Still Investigating}
**Investigated by**: bugfix agent
**Date**: {date}

### Root Cause
{Clear description of the root cause}

### Evidence
- {File}: {what was found}
- {Log}: {relevant error}
- {Test}: {what test revealed}

### Hypothesis Results
| Hypothesis | Status | Evidence |
|------------|--------|----------|
| {h1} | ✅ | {confirming evidence} |
| {h2} | ❌ | {contradicting evidence} |

### Affected Code
| File | Lines | Issue |
|------|-------|-------|
| `path/to/file.ts` | 45-52 | Missing null check |

### Recommended Fix
{Summary of recommended approach}
```

### Fix Plan

```markdown
## Fix Plan: {JIRA-ID}

### Strategy
{Why this approach was chosen over alternatives}

### Changes Required

| File | Change Type | Description |
|------|-------------|-------------|
| `path/to/file.ts` | Modify | Add null check before accessing property |
| `path/to/file.spec.ts` | Add | Add unit test for null case |

### Risk Assessment
- **Regression Risk**: Low/Medium/High — {explanation}
- **Side Effects**: {potential side effects}
- **Breaking Changes**: None / {description}

### Test Plan
1. **Unit Tests**:
   - Add test for null input case
   - Verify existing tests still pass
   
2. **Manual Verification**:
   - {step to verify fix}
   - {step to verify no regression}

### Rollback Plan
{How to revert if issues arise}
```

### Developer Handoff Context

```markdown
## Bug Fix Request

**JIRA**: {jiraId}
**Branch**: `bugfix/{JIRA-ID}-{PascalCaseName}`

### Root Cause
{Clear description}

### Fix Plan
| File | Action | Details |
|------|--------|---------|
| `path/to/file.ts` | Modify | {specific changes} |

### Tests Required
- [ ] Unit test for {scenario}
- [ ] Verify {existing functionality}

### Acceptance Criteria
- [ ] Bug no longer reproducible
- [ ] All existing tests pass
- [ ] New tests added for regression prevention

### Reference
- Investigation report: {link or inline}
- Related code: {file references}
```

---

## Common Bug Patterns

### Null/Undefined Reference
**Symptoms**: TypeError, "Cannot read property of undefined"
**Investigation**: Check call chain for missing null checks
**Fix Pattern**: Add optional chaining or explicit null check

### Race Condition
**Symptoms**: Intermittent failures, timing-dependent behavior
**Investigation**: Check async operations, state mutations
**Fix Pattern**: Add proper synchronization, use atomic operations

### State Management
**Symptoms**: UI shows stale data, inconsistent state
**Investigation**: Check Redux/state updates, selectors
**Fix Pattern**: Fix reducer logic, add proper state updates

### API Contract Mismatch
**Symptoms**: 400/500 errors, unexpected response format
**Investigation**: Compare API spec vs actual request/response
**Fix Pattern**: Update request format or response handling

### Memory Leak
**Symptoms**: Performance degradation over time
**Investigation**: Check event listeners, subscriptions, closures
**Fix Pattern**: Add cleanup in useEffect, unsubscribe handlers

---

## Debugging Checklist

### Before Starting
- [ ] Reproduce the bug locally
- [ ] Collect error logs/stack traces
- [ ] Identify affected version/environment

### During Investigation
- [ ] Form hypotheses before diving into code
- [ ] Check recent commits to affected files
- [ ] Verify test coverage for affected code
- [ ] Check for similar bugs in JIRA

### Before Handoff
- [ ] Root cause confirmed with evidence
- [ ] Fix plan reviewed with user
- [ ] Test requirements defined
- [ ] Branch naming follows convention

---

## References

- [git-operation instructions](../instructions/git-operation.instructions.md) — Branch naming for bugfix
- [code-review-checklist skill](../skills/code-review-checklist/SKILL.md) — Review fix before PR
- [security-and-secrets instructions](../instructions/security-and-secrets.instructions.md) — Security considerations
