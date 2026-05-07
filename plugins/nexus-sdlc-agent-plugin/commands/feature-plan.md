---
name: feature-plan
description: Create or update JIRA hierarchy (CTXENG → Epics → Stories) from a specification.
agent: feature-planner
argument-hint: "action=create|update source=<ConfluenceURL> jira=<CTXENG-ID>"
---

Plan and create JIRA work items hierarchy from a feature specification.

## Inputs
- **Action**: ${input:action:create}
  - `create` = create new CTXENG → Epics → Stories hierarchy
  - `update` = add stories to existing CTXENG (replaces old "incremental")
- **Source**: ${input:source} (Confluence spec URL)
- **JIRA ID**: ${input:jira} (existing CTXENG ID for update action)

## Examples
```
/feature-plan action=create source=https://citrix.atlassian.net/wiki/spaces/SPA/pages/123456/My+Feature+Spec
/feature-plan action=update source=https://citrix.atlassian.net/wiki/...#NewSection jira=CTXENG-1234
```

## Workflow
1. Read specification from Confluence
2. Analyze and break down into work items
3. **Checkpoint**: Show planned hierarchy, ask for confirmation
4. Create CTXENG feature ticket
5. Create Epics under CTXENG
6. Create Stories under Epics (uses `/jira` internally)
7. All tickets include `AI-Generated` label

## Output
- CTXENG feature ticket linked to spec
- Epics organized by component/phase
- Stories with acceptance criteria
