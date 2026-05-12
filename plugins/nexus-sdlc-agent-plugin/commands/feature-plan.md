---
name: feature-plan
description: Create or update JIRA hierarchy (ENG → Epics → Stories) from a specification.
agent: feature-planner
argument-hint: "action=create|update source=<ConfluenceURL> jira=<ENG-ID>"
---

Plan and create JIRA work items hierarchy from a feature specification.

## Inputs
- **Action**: ${input:action:create}
  - `create` = create new ENG → Epics → Stories hierarchy
  - `update` = add stories to existing ENG (replaces old "incremental")
- **Source**: ${input:source} (Confluence spec URL)
- **JIRA ID**: ${input:jira} (existing ENG ID for update action)

## Examples
```
/feature-plan action=create source=https://example.atlassian.net/wiki/spaces/APP/pages/123456/My+Feature+Spec
/feature-plan action=update source=https://example.atlassian.net/wiki/...#NewSection jira=ENG-1234
```

## Workflow
1. Read specification from Confluence
2. Analyze and break down into work items
3. **Checkpoint**: Show planned hierarchy, ask for confirmation
4. Create ENG feature ticket
5. Create Epics under ENG
6. Create Stories under Epics (uses `/jira` internally)
7. All tickets include `AI-Generated` label

## Output
- ENG feature ticket linked to spec
- Epics organized by component/phase
- Stories with acceptance criteria
