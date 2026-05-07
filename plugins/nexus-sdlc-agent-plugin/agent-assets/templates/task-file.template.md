# Task File Template

Template for task files at `tasks/{JIRA_ID}-task.md`.

**Ownership**:

- **dev-coordinator** creates file with JIRA context (sections 1-2)
- **developer** adds analysis and implementation plan (sections 3-4)

---

## Template

```markdown
# Task: {JIRA_ID} - {Title}

## Status: 🔵 Ready for Development

<!-- =============================================================== -->
<!-- SECTION 1-2: FILLED BY dev-coordinator (JIRA context only)     -->
<!-- =============================================================== -->

## Context
| Field | Value |
|-------|-------|
| Story | {JIRA_ID} - {title} |
| Type | {Story/Bug} |
| Epic | {EPIC_ID} - {epic_title} |
| Branch | `feature/{JIRA_ID}-{Name}` |

## Requirements (from JIRA)

### Acceptance Criteria
- [ ] {AC1 from JIRA}
- [ ] {AC2 from JIRA}
- [ ] {AC3 from JIRA}

### Description
{copy from JIRA description — do NOT interpret or expand}

<!-- =============================================================== -->
<!-- SECTION 3-4: FILLED BY developer (after code analysis)         -->
<!-- =============================================================== -->

## Implementation Plan
<!-- developer: fill this section after analyzing codebase -->

_To be completed by developer after code analysis_

### Assumptions
| Assumption | Confidence | Impact if Wrong |
|------------|------------|------------------|
| _TBD_ | _High/Med/Low_ | _TBD_ |

### Constraints
- _TBD_

### Files to Modify
| File | Change |
|------|--------|
| _TBD_ | _TBD_ |

### Phases
_TBD_

### Artifacts
| Artifact | Path | Status |
|----------|------|--------|
| _TBD_ | _TBD_ | _TBD_ |

## Progress Log
| Time | Action | Status |
|------|--------|--------|
| {timestamp} | Task created by coordinator | ✅ |
```

---

## Status Values

| Status | Owner | Meaning |
|--------|-------|---------|
| 🔵 Ready for Development | coordinator | JIRA context captured, ready for developer |
| 🟢 In Progress | developer | Developer analyzing and implementing |
| 🟡 Pending Security Review | developer | Code complete, awaiting security review |
| ✅ Complete | developer | All done, ready for PR |
| 🔴 Blocked | any | Cannot proceed, needs clarification |

---

## Ownership & Flow

```
dev-coordinator                          developer
     │                                       │
     ├─ Create task file (JIRA only)         │
     ├─ Set status: 🔵 Ready                 │
     ├─ Handoff ────────────────────────────►│
     │                                       ├─ Analyze code
     │                                       ├─ Create implementation plan
     │                                       ├─ Set status: 🟢 In Progress
     │                                       ├─ Implement
     │                                       ├─ Set status: 🟡 Pending Review
     │                                       ├─ Security review
     │                                       ├─ Set status: ✅ Complete
     │◄──────────────────────────────────────┤
     ├─ PR, JIRA update, cleanup             │
     │                                       │
```

---

## Handoff Checklist

### coordinator → developer (before handoff)

- [ ] JIRA status = "In Progress"
- [ ] Branch created from master
- [ ] Branch name follows convention
- [ ] Task file exists at `tasks/{JIRA_ID}-task.md`
- [ ] Task file has: Context, Requirements, Acceptance Criteria
- [ ] Task file "Implementation Plan" has only placeholders (developer fills)

### developer → coordinator (before return)

- [ ] Task file status = ✅ Complete
- [ ] All acceptance criteria checked
- [ ] Implementation plan filled
- [ ] Security review passed
- [ ] All tests pass
