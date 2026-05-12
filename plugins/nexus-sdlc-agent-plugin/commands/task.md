---
name: task
description: Start development task — coordinates JIRA context, Git setup, and delegates to developer.
agent: dev-coordinator
---

# Development Task

Coordinate and execute a development task (Story, Bug, or Epic).

## JIRA ID

${input:jira:JIRA ID (e.g., APP2-12345, ENG-1234)}

---

## What happens

1. **Read JIRA context** — Story/Bug details, parent Epic, ENG
2. **Create branch** — following naming conventions
3. **Create task file** — structured plan in `.github/tasks/`
4. **Delegate to developer** — for implementation
5. **On completion** — PR, add task as JIRA comment, update status

## For Epics

If JIRA ID is an Epic:
- Plan execution order of child Stories
- Execute Stories one-by-one
- Track progress across all Stories

---

**JIRA**: ${input:jira}
