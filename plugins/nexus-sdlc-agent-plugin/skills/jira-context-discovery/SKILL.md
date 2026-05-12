---
name: jira-context-discovery
description: Discover full JIRA context by traversing hierarchy upward (Story→Epic→ENG) and analyzing sibling stories. Use before implementation, investigation, or planning.
---

# JIRA Context Discovery Skill

## Purpose

Systematically gather full context for any JIRA issue by:
1. Reading the complete hierarchy upward (Story → Epic → ENG → Confluence)
2. Analyzing sibling stories (Done, Current, Future)
3. Extracting patterns and learnings from completed work
4. Planning for compatibility with upcoming work

## When to Use

| Agent | Trigger |
|-------|---------|
| developer | Before implementing any Story/Task |
| bugfix | Before investigating any Bug |
| spec-author | When creating specs for existing features |
| feature-planner | When adding Stories to existing Epic |
| analyzer | When analyzing JIRA-related artifacts |

## Execution Steps

### Step 1: Identify JIRA Type

```
IF JIRA.type == "Epic":
    Skip to Step 4 (Epic is the top of component context)
    
IF JIRA.type == "Story" OR "Task" OR "Bug":
    Proceed with full hierarchy traversal
    
IF JIRA.type == "ENG":
    Read directly, skip to Confluence links
```

### Step 2: Read Current JIRA

Extract from the given JIRA:

| Field | Extract |
|-------|---------|
| Summary | Task title |
| Description | Requirements, scope |
| Acceptance Criteria | Success conditions |
| Story Points | Effort estimate |
| Labels | Categorization |
| Comments | Additional context, decisions |
| Attachments | Specs, screenshots, diagrams |
| Linked Issues | Dependencies, related work |

### Step 3: Traverse Hierarchy Upward

```
Current JIRA (Story/Task/Bug)
    │
    └── Parent Epic
        │   - Component scope
        │   - Technical design
        │   - All sibling Stories
        │
        └── Parent ENG (if exists)
            │   - Business value
            │   - Success criteria
            │   - All Epics in feature
            │
            └── Linked Confluence
                    - Detailed specifications
                    - Architecture decisions
                    - Requirements
```

**JQL for finding parent**:
```
# Find Epic for Story
issue = {STORY_ID} -> read "Epic Link" field

# Find ENG for Epic
issue = {EPIC_ID} -> read "Parent Link" or search:
project = ENG AND issue in linkedIssues({EPIC_ID})
```

### Step 4: Analyze Sibling Stories

**Fetch all Stories in the same Epic**:
```
JQL: "Epic Link" = {EPIC_ID} ORDER BY key ASC
```

**Categorize by status**:

| Category | Status Values | Analysis Purpose |
|----------|---------------|------------------|
| **Done** | Done, Closed, Resolved | Learn patterns, reuse code |
| **In Progress** | In Progress, In Review | Coordinate, avoid conflicts |
| **Future** | To Do, Backlog, Open | Plan for compatibility |

### Step 5: Extract from Done Stories

For each Done story, gather:

| Data | Source | Use |
|------|--------|-----|
| Files modified | Git commits / PR | Know where to look |
| Patterns used | Code review | Follow conventions |
| Shared utilities | New files created | Reuse, don't duplicate |
| PR feedback | Review comments | Avoid same mistakes |
| Test patterns | Test files | Follow testing style |

**Output template**:
```markdown
### Done Stories Analysis

| Story | Summary | Key Files | Patterns | Reusable |
|-------|---------|-----------|----------|----------|
| APP2-001 | DB Migration | migrations/001.sql | EF Core | Migration template |
| APP2-002 | Base API | Controllers/Base.cs | REST+Service | BaseController |
```

### Step 6: Plan for Future Stories

For each Future story, consider:

| Question | Impact |
|----------|--------|
| Does my implementation support this? | Avoid rework |
| Should I create abstractions now? | Reduce future changes |
| Are there shared interfaces to define? | Enable parallel work |
| Will my naming conflict? | Maintain consistency |

**Output template**:
```markdown
### Future Stories Consideration

| Story | Summary | Impact on Current | Action |
|-------|---------|-------------------|--------|
| APP2-004 | Add caching | Cache-friendly API design | Add ETag support |
| APP2-005 | Multi-tenant | Tenant context needed | Add tenantId param |
```

### Step 7: Follow Confluence Links

From any level (Story, Epic, ENG), follow linked Confluence pages:

| Link Type | Content to Extract |
|-----------|-------------------|
| Specification | Detailed requirements, edge cases |
| Architecture | Design decisions, constraints |
| API Design | Contracts, schemas |
| Security | Compliance requirements |

## Output Format

```markdown
## JIRA Context Discovery Report

### Hierarchy

```
ENG-XXX: {Feature Title}
    │
    └── Epic APP2-YYY: {Component} - {Feature}
        │
        ├── ✅ APP2-001: {Done Story 1}
        ├── ✅ APP2-002: {Done Story 2}
        ├── 🔄 **APP2-003: {Current Story}** ← YOU ARE HERE
        ├── ⏳ APP2-004: {Future Story 1}
        └── ⏳ APP2-005: {Future Story 2}
```

### Feature Context (ENG)

- **ID**: ENG-XXX
- **Business Goal**: {from description}
- **Success Criteria**: {from description}
- **Confluence**: {URL}

### Component Context (Epic)

- **ID**: APP2-YYY
- **Component**: {component name}
- **Technical Design**: {summary}
- **Progress**: {x}/{n} Stories done

### Current Task

- **ID**: APP2-ZZZ
- **Scope**: {description}
- **Acceptance Criteria**: {list}
- **Blocked By**: {dependencies}
- **Blocks**: {dependent stories}

### Learnings from Done Stories

| Pattern | Source | Apply to Current |
|---------|--------|------------------|
| {pattern} | {story} | {how to use} |

### Considerations for Future Stories

| Consideration | Future Story | Action Now |
|---------------|--------------|------------|
| {consideration} | {story} | {action} |

### Confluence Specifications

| Document | Key Points |
|----------|------------|
| {title} | {relevant requirements} |
```

## Error Handling

| Error | Action |
|-------|--------|
| No parent Epic | Warn user, proceed with available context |
| No ENG | Proceed with Epic as top level |
| Confluence link broken | Note in report, ask user for alternative |
| No Done stories | No patterns to learn, proceed carefully |
| No Future stories | No forward planning needed |

## Integration with Agents

### Developer Agent
```markdown
Use [jira-context-discovery](../jira-context-discovery/SKILL.md) in Phase 2 
to gather full context before implementation.
```

### Bugfix Agent
```markdown
Use [jira-context-discovery](../jira-context-discovery/SKILL.md) to understand 
the feature context where the bug occurs.
```

### Spec-Author Agent
```markdown
Use [jira-context-discovery](../jira-context-discovery/SKILL.md) when updating
specifications for existing features.
```
