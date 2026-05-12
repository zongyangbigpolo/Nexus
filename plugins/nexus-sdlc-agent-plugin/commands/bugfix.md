---
name: bugfix
description: Investigate and fix bugs from JIRA tickets with root cause analysis.
agent: bugfix
argument-hint: "jira=APP-12345"
---

Investigate and fix a bug using structured root cause analysis.

**Inputs**:
- JIRA ID: ${input:jira}
- Additional logs: ${input:logs}

**Workflow**:
1. Read JIRA bug context
2. Form hypotheses (3-5 possible causes)
3. Investigate code to confirm/reject
4. Debug if needed (with terminal commands)
5. Create fix plan
6. Handoff to dev-coordinator for implementation
7. Run `/code-review scope=staged` on fix
8. Handoff to git-ops for commit/PR

**Examples**:
```
/bugfix jira=APP-12345
/bugfix jira=ENG-1234 logs="NullReferenceException at line 42"
```

**Output**:
- Bug context summary
- Hypotheses with confidence levels
- Investigation findings
- Fix plan with affected files
- Handoff to implementation

**Branch**: Auto-proposes `bugfix/{JIRA-ID}-{PascalCaseName}`
