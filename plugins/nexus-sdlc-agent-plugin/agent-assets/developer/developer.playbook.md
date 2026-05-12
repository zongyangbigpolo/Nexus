# developer Playbook

This document contains the detailed operational playbook for the `developer` custom agent.

**Source of truth**: The agent file ([developer.agent.md](../../agents/developer.agent.md)) defines:

- Role definition and competencies
- Execution workflow (phases)
- Tool permissions and constraints
- Handoff definitions

This playbook provides **operational details only**: procedures, checklists, and reference material.

---

## Quick Reference

| Need             | Resource                                                                                     |
| ---------------- | -------------------------------------------------------------------------------------------- |
| Code review      | [code-review-checklist skill](../../skills/code-review-checklist/SKILL.md)                   |
| Git workflow     | [git-operation instructions](../../instructions/git-operation.instructions.md)               |
| Testing strategy | [test-strategy skill](../../skills/test-strategy/SKILL.md)                                   |
| Security         | [security-and-secrets instructions](../../instructions/security-and-secrets.instructions.md) |
| Stack patterns   | See stack-specific playbooks below                                                           |

---

## Stack-Specific Playbooks

Load ONE based on primary stack detected in repository's `AGENTS.md`:

| Stack Keywords                 | Playbook                                                         |
| ------------------------------ | ---------------------------------------------------------------- |
| .NET, C#, ASP.NET Core         | [developer-dotnet.playbook.md](developer-dotnet.playbook.md)     |
| Python, FastAPI, Django, Flask | [developer-python.playbook.md](developer-python.playbook.md)     |
| Go, Golang                     | [developer-go.playbook.md](developer-go.playbook.md)             |
| JavaScript, TypeScript, React  | [developer-frontend.playbook.md](developer-frontend.playbook.md) |
| C, NetScaler ADC, Gateway       | [developer-netscaler.playbook.md](developer-netscaler.playbook.md) |

> If stack not listed or multi-stack project: skip stack playbook, derive patterns from existing code.

---

## Repository Context Discovery

### Reading AGENTS.md

Every implementation starts with understanding the repository context.

**What to extract from AGENTS.md**:

```yaml
# Expected sections to parse:
project_overview:
  - Project name and purpose
  - Business domain
  
tech_stack:
  - Languages (C#, TypeScript, Python, etc.)
  - Frameworks (ASP.NET Core, React, Django, etc.)
  - Databases (SQL Server, PostgreSQL, MongoDB, etc.)
  - Cloud services (Azure, AWS, etc.)
  - Build tools (MSBuild, npm, pip, etc.)
  - Test frameworks (xUnit, Jest, pytest, etc.)

architecture:
  - Architecture style (monolith, microservices, modular monolith)
  - Layer organization (Controllers/Services/Repositories, etc.)
  - Project structure conventions
  - Dependency injection approach
  
conventions:
  - Naming conventions
  - File organization
  - Code style guides
  - Git workflow
  
dependencies:
  - External services
  - Internal services
  - Third-party libraries
```

### Fallback Discovery

If AGENTS.md is incomplete:

1. Scan project files (`.csproj`, `package.json`, `requirements.txt`)
2. Look for config files (`tsconfig.json`, `appsettings.json`)
3. Examine folder structure
4. Check existing code patterns
5. Ask user for clarification

---

## Implementation Approach

**Stack-Agnostic Principle**: This playbook does NOT provide language-specific code snippets.

When implementing:

1. **Follow instruction files first** — auto-applied instructions (copyright headers, security, code size) always override codebase patterns
2. **Discover patterns** from repository's AGENTS.md and existing code
3. **Mimic existing patterns** found in the codebase — but never override instruction file rules
4. **Follow conventions** documented in the repository
5. **Ask if unclear** about stack-specific best practices

The agent learns the stack at runtime by reading:

- `AGENTS.md` for documented conventions
- Existing code for patterns to follow
- Test files for testing patterns

---

## JIRA Status Workflow

```text
Backlog → In Progress → Ready for Test → In Review → Done
           ↑ Phase 0    ↑ Phase 4        ↑ Phase 5
```

| Phase | JIRA Status    | Trigger                         |
| ----- | -------------- | ------------------------------- |
| 0     | In Progress    | Starting work                   |
| 4     | Ready for Test | Implementation + tests complete |
| 5     | In Review      | PR created                      |

---

## Epic Handling Workflow

When user provides an Epic instead of a Story:

### Step 1: Fetch Child Stories

```text
JQL: "Epic Link" = {EPIC_ID} ORDER BY key ASC
```

### Step 2: Determine Execution Order

1. **If Stories have "Blocked By" links**: Use dependency order (topological sort)
2. **If no dependencies**: Use JIRA ID ascending order

### Step 3: Present Execution Plan

```markdown
## Epic: {EPIC_ID} - {Title}

**Child Stories** (execution order):

| #   | Story                   | Depends On | Status |
| --- | ----------------------- | ---------- | ------ |
| 1   | APP2-001: DB Migration | -          | To Do  |
| 2   | APP2-002: API Endpoint | APP2-001  | To Do  |
| 3   | APP2-003: Unit Tests   | APP2-002  | To Do  |

**Proceed with Story #1?**
```

### Step 4: Sequential Implementation

- Implement one Story at a time
- After each Story: checkpoint with user
- On completion: mark Story as "Ready for Test", proceed to next

---

## JIRA Context Discovery

For full hierarchy traversal and sibling story analysis, use:
**[jira-context-discovery skill](../../skills/jira-context-discovery/SKILL.md)**

The skill provides:

- Hierarchy traversal (Story → Epic → ENG → Confluence)
- Sibling story analysis (Done/Current/Future)
- Pattern extraction from completed work
- Forward planning for upcoming stories
- Output templates and report format

---

## File Size Constraints

### Limits

| Constraint      | Limit     | Rationale                               |
| --------------- | --------- | --------------------------------------- |
| Lines per file  | ≤300      | Maintainability, code review efficiency |
| File size       | ≤30KB     | Performance, readability                |
| Function/method | ≤50 lines | Single responsibility                   |

### Validation Checkpoint (After Each Edit)

```bash
# Check modified files
for file in $(git diff --name-only):
    lines=$(wc -l < "$file")
    size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file")
    
    if [ $lines -gt 300 ]; then
        echo "⚠️ $file exceeds 300 lines ($lines) - breakdown required"
    fi
    if [ $size -gt 30720 ]; then
        echo "⚠️ $file exceeds 30KB ($size bytes) - breakdown required"
    fi
done
```

### Breakdown Strategy

1. **Identify cohesive groups** of functions/methods
2. **Extract to new file** following naming patterns:
   - `{Original}Service.cs` → `{Original}Service.cs` + `{Original}ValidationService.cs`
   - `{Original}.ts` → `{Original}.ts` + `{Original}.utils.ts`
3. **Update imports** in original and dependent files
4. **Verify build** passes after extraction

---

## Error Handling Patterns

### When Build Fails

1. Read error message carefully
2. Identify the file and line
3. Common causes:
   - Missing import/using
   - Type mismatch
   - Syntax error
   - Missing dependency
4. Fix and rebuild

### When Tests Fail

1. Identify which test failed
2. Check the assertion message
3. Common causes:
   - Logic error in implementation
   - Test setup incorrect
   - Mock not configured
   - Async timing issues
4. Debug or fix implementation

### When Blocked

1. Document what's blocking
2. Update JIRA with blocker
3. Ask user for guidance
4. Consider alternative approaches

---

## PR Template

> **Formatting rule**: When passing `body` to `create_pull_request`, write plain multi-line markdown with real line breaks. Do NOT insert literal `\n` sequences or escape quotes — the MCP tool handles JSON serialization automatically.

```markdown
⚠️ **AI-Generated Code**: This PR was generated by an AI agent. Please review carefully for correctness, security, and adherence to project standards.

## Summary
{Brief description of changes}

## JIRA
{JIRA-ID}: {JIRA Title}

## Changes
- {List of changes}

## Testing
- {Tests added/modified}
- {Coverage before/after}

## Checklist
- [ ] Code follows project conventions
- [ ] All tests passing
- [ ] No secrets committed
- [ ] Documentation updated (if needed)
```

---

## Handoff Decision Matrix

| Scenario                | Handoff To                  | Trigger                    |
| ----------------------- | --------------------------- | -------------------------- |
| Spec incomplete/unclear | spec-author                 | Requirements ambiguity     |
| JIRA needs breakdown    | feature-planner             | Task too large             |
| Security review needed  | security-engineer           | Post-implementation review |
| UI-heavy task           | (future) frontend-developer | React/Vue/Angular focus    |
| Infrastructure changes  | (future) devops-engineer    | CI/CD, Terraform           |

---

## PR Review Comment Addressing

When handling PR review comments, **critically evaluate each comment** before acting.

### Decision Matrix

| Evaluate                     | Fix | Decline           | Discuss       |
| ---------------------------- | --- | ----------------- | ------------- |
| Improves code quality?       | Yes | No (or trade-off) | Unclear       |
| Reviewer has full context?   | Yes | No (missing info) | Partially     |
| Aligns with requirements?    | Yes | Conflicts         | Ambiguous     |
| Follows project conventions? | Yes | Violates          | No convention |
| Safe to change?              | Yes | Breaks something  | Risk unknown  |

### Valid Reasons to DECLINE

| Category                  | Example                                                    |
| ------------------------- | ---------------------------------------------------------- |
| **Context Gap**           | Reviewer didn't see related code that explains the pattern |
| **Requirements**          | Suggestion conflicts with acceptance criteria              |
| **Intentional Trade-off** | Performance over readability (documented in comment)       |
| **Convention**            | Project uses pattern X, not Y (per AGENTS.md)              |
| **Breaking Change**       | Would affect other dependent code                          |
| **Scope Creep**           | Valid improvement, but unrelated to this PR                |

### Response Templates

#### For DECLINED comments (add as PR reply)

```markdown
**Not addressed** — {reason}

{Explanation of why current implementation is correct}

{Optional: link to code/docs that support the decision}
```

**Example**:

```markdown
**Not addressed** — intentional trade-off

The `Dictionary<K,V>` was chosen over `ConcurrentDictionary` because:
1. This code path is single-threaded (called only from `InitializeAsync`)
2. We need the lower memory footprint for batch operations
3. Thread-safety is handled at the service level via `SemaphoreSlim`

See `ServiceBase.cs:42` for the locking pattern.
```

#### For DISCUSS comments (add as PR reply)

```markdown
**Needs clarification** — {question}

{Context of what you understand}
{Specific question for reviewer}
```

### Evaluation Checklist

Before addressing each comment:

1. [ ] Read the full comment thread (may have context)
2. [ ] Check if similar pattern exists elsewhere in codebase
3. [ ] Review original requirements in task file
4. [ ] Consider if suggestion introduces new risks
5. [ ] Verify if project has conventions for this case

### Post Reply to GitHub (MANDATORY)

After evaluating and applying fixes, **reply to EVERY review comment** via `add_reply_to_pull_request_comment`:

| Decision | Reply format |
|----------|--------------|
| ✅ Fixed | `**Fixed** — {1-2 sentence summary of what changed}` |
| ❌ Declined | `**Not addressed** — {reason and brief justification}` |
| 💬 Discuss | `**Needs clarification** — {specific question for reviewer}` |

⛔ Do NOT skip this step. Every comment must get a reply so reviewers see resolution status without checking code.

### Return Summary Format

After processing all comments, return to coordinator with:

---


```markdown
## PR Review Response Summary

**PR**: #{pr_number}
**Comments processed**: {total}

| Type       | Count |
| ---------- | ----- |
| ✅ Fixed    | {n}   |
| ❌ Declined | {n}   |
| 💬 Discuss  | {n}   |

### Fixes Applied
| File     | Change              |
| -------- | ------------------- |
| `{file}` | {brief description} |

### Declined (with reasons)
| Comment     | Reason                   |
| ----------- | ------------------------ |
| "{summary}" | {why current is correct} |

### Need Discussion
| Topic   | Question                |
| ------- | ----------------------- |
| {topic} | {question for reviewer} |
```

---

## Security Review Request Template

```markdown
## Security Review Request

**JIRA**: {JIRA_ID}
**Branch**: {branch_name}
**Task File**: `tasks/{JIRA_ID}-task.md`

**Changed files**:
- {file1}
- {file2}

**Review scope**: Post-implementation security check
```

---

## Task File Progress Log Format

Update after each significant step:

```markdown
## Progress Log

| Time        | Action                  | Status |
| ----------- | ----------------------- | ------ |
| {timestamp} | Task created            | ✅      |
| {timestamp} | Implemented {component} | ✅      |
| {timestamp} | Added unit tests        | ✅      |
| {timestamp} | Security review passed  | ✅      |
| {timestamp} | Implementation complete | ✅      |
```

---

## Interaction Patterns

### Asking for Clarification

```markdown
I need additional information before proceeding:

1. **{Question 1}**
   Context: {why this matters}
   
2. **{Question 2}**
   Options: A) {option} B) {option}

Please advise, or I can proceed with assumption: {safe default}
```

### Reporting Progress

```markdown
**Progress Update**

**Phase**: {current phase}
**Status**: {In Progress / Blocked / Complete}

**Completed**:
- {item 1}
- {item 2}

**Next Steps**:
- {next item}

**Blockers** (if any):
- {blocker}
```

### Completion Summary

```markdown
**Implementation Complete**

**JIRA**: {JIRA-ID}
**Branch**: {branch-name}
**PR**: {PR-link}

**Changes Made**:
- {file1}: {description}
- {file2}: {description}

**Tests Added**:
- {test1}
- {test2}

**Next Steps**:
1. Review PR
2. Address feedback
3. Merge to master
```

## References

- [git-operation instructions](../../instructions/git-operation.instructions.md)
- [security-and-secrets instructions](../../instructions/security-and-secrets.instructions.md)
- [code-review-checklist skill](../../skills/code-review-checklist/SKILL.md)
- [test-strategy skill](../../skills/test-strategy/SKILL.md)
