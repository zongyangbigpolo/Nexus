---
name: jira
description: Create, update, or list JIRA items (bug, story, task, epic).
agent: jira-manager
argument-hint: "action=create|update|list type=bug|story|task|epic jira=<ID>"
---

Manage individual JIRA tickets.

## Inputs
- **Action**: ${input:action:create}
- **Type**: ${input:type:story}
- **JIRA ID** (for update): ${input:jira}

## Actions

| Action | Description |
|--------|-------------|
| `create` | Create new ticket of specified type |
| `update` | Update existing ticket fields |
| `list` | Show my open JIRA issues |

## Examples
```
/jira action=create type=bug
/jira action=create type=story
/jira action=update jira=SPA-12345
/jira action=list
```

## When to Use
- Creating single bug/story/task/epic
- Updating existing ticket
- Viewing your open issues

## SPAOP Note

For `SPAOP` ticket creation, `components` is required. If the visible Atlassian MCP schema does not show `additional_fields`, still attempt creation using the repo playbook pattern with `additional_fields.components` and `additional_fields.labels`.

**For feature hierarchy** (CTXENG → Epics → Stories), use `/feature-plan` instead.
