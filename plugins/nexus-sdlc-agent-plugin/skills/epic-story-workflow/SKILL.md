---
name: epic-story-workflow
description: Manage Epic-to-Story workflow — resolve Epic to Stories, track progress, handle status transitions, and auto-continue through Stories sequentially.
---

# Epic Story Workflow Skill

## Purpose

Centralized workflow for implementing Epics through their child Stories:
- Resolve Epic ID to ordered list of Stories
- Track implementation progress across Stories
- Handle JIRA status transitions
- Manage git branches per Story
- **Auto-continue** to next Story (no user prompts between Stories)

## Auto-Continue Mode

⚠️ **DEFAULT BEHAVIOR**: Automatic progression through Stories.

Flow: `plan_execution` → auto-start Story #1 → implement → complete → `next_story` → auto-start Story #2 → ... repeat → `complete_epic` (summary with all PRs).
User can interrupt at any point, but default is continuous execution.

## When to Use

| Agent | Operation | Trigger |
|-------|-----------|---------|
| router | `collect_epic_context` | User provides Epic ID |
| developer | `start_story`, `complete_story`, `next_story` | Story implementation lifecycle |
| bugfix | `start_story`, `complete_story`, `next_story` | Bug fix within Epic context |

## Operations

### 1. collect_epic_context

**Used by**: router

**Purpose**: Fetch Epic and ALL child Stories (unfiltered).

**Input**:
```
epic_id: "SPAOP-10702"
```

**Process**:
```
1. Fetch Epic from JIRA
2. Fetch ALL linked Stories (any status)
3. Build epic_context object
```

**Output**: `epic_context` object with `epic_id`, `epic_title`, `epic_status`, and `all_stories[]` array (each with id, title, status). Router does NOT filter or order — passes raw data to developer.

---

### 2. plan_execution

**Used by**: developer (Phase 1)

**Purpose**: Analyze Stories and create execution plan.

**Input**:
```
epic_context: { ... from router ... }
```

**Process**:
```
1. Filter: exclude status IN ("Done", "Fixed", "Closed")
2. Check dependencies: look for "Blocked By" links
3. Order:
   - IF has dependencies: topological sort
   - ELSE: by JIRA ID ascending
4. Build execution_plan
```

**Output**: `execution_plan` (ordered Story IDs), `skipped` (Done/Fixed/Closed), `total`, `current_index: 0`.

**AUTO-CONTINUE**: Present plan (informational), then automatically start `execution_plan[0]`. No checkpoint.

---

### 3. start_story

**Used by**: developer, bugfix (Phase 2)

**Purpose**: Begin work on a Story — update statuses, create branch.

**Input**:
```
story_id: "SPAOP-10708"
epic_context: { ... }  # optional, for Epic status update
```

**Process**:
```
1. IF epic_context AND epic_status != "In Progress":
      INVOKE mcp_atlassian: transition_issue(epic_id, "In Progress")
2. INVOKE mcp_atlassian: transition_issue(story_id, "In Progress")
3. VERIFY: Check story status changed (re-fetch and confirm)
4. Create git branch:
   - git checkout master && git pull
   - git checkout -b feature/{STORY_ID}-{PascalCaseTitle}
```

⚠️ **MANDATORY**: Use Atlassian MCP to transition issues. Verify status change after transition. If fails: STOP and report error.

**Output**: `epic_updated`, `story_status: "In Progress"`, `branch` name.

**Git branch naming**: Follow [git-operation](../../instructions/git-operation.instructions.md).

---

### 4. complete_story

**Used by**: developer, bugfix (Phase 6)

**Purpose**: Finalize Story — commit, push, update status.

**Input**:
```
story_id: "SPAOP-10708"
commit_message: "Add GoogleUserIdType column to SiteSettings"
```

**Process**:
```
1. Verify: git branch --show-current contains story_id
   - Branch: feature/SPAOP-10708-AddGoogleUserIdTypeColumn
   - Expected JIRA ID in commit: SPAOP-10708 ✓
2. Stage all changes: git add .
3. Commit: git commit -m "{STORY_ID} {message} [AI-Generated]"
   - CRITICAL: STORY_ID must match JIRA ID from branch name
4. Push: git push -u origin {branch}
5. INVOKE mcp_atlassian: transition_issue(story_id, "Ready for Test")
6. VERIFY: Re-fetch story to confirm status = "Ready for Test"
```

⚠️ After push, transition to "Ready for Test" via Atlassian MCP. Verify status. If fails: report but don't block.

**Validation**: JIRA ID in commit **MUST** match JIRA ID in branch name. Mismatch → abort.

**Output**: `committed`, `pushed`, `story_status: "Ready for Test"`, `branch`.

---

### 5. next_story

**Used by**: developer, bugfix (Phase 7)

**Purpose**: Finalize current Story branch and prepare for next Story.

**Input**: `execution_plan`, `current_index`, `current_branch`.

**Process**: Ensure current branch pushed → checkout master → pull → determine next: if `next_index < plan.length` → `has_next: true`, else `epic_complete: true`.

**AUTO-CONTINUE**: When `has_next = true`, show progress ("✅ Story N complete. Continuing to {next}..."), then **immediately** call `start_story(next)` — NO user prompt.

**CRITICAL**: After `next_story`, you are on `master`. MUST call `start_story` to create NEW branch. Each Story gets its own feature branch. NEVER continue on previous Story's branch.

---

### 6. complete_epic

**Used by**: developer (Phase 8)

**Purpose**: Generate Epic completion summary.

**Input**:
```
epic_context: { ... }
completed_stories: [
  { id: "SPAOP-10708", branch: "feature/...", status: "Ready for Test" },
  { id: "SPAOP-10709", branch: "feature/...", status: "Ready for Test" },
  { id: "SPAOP-10710", branch: "feature/...", status: "Ready for Test" }
]
```

**Output**: Epic completion summary with: Epic link + title, stories count, table (Story link, Branch, Status for each), next steps (code review, QA, merge).

---

## Error Handling

| Error | Action |
|-------|--------|
| Epic has no Stories | Return error, suggest `feature-planner` |
| All Stories already Done | Return message: "Epic complete, no work needed" |
| JIRA fetch fails | Return error with JIRA ID for manual check |
| Git branch exists | Checkout existing branch, warn user |
| Git push fails | Return error, suggest manual resolution |
| Story blocked | Skip to next, add to blocked list |
| **JIRA ID mismatch** | Commit message JIRA ID must match branch JIRA ID — abort if different |
| **Wrong branch** | Verify current branch contains Story ID before commit |
| **JIRA transition failed** | Re-try once, report error but proceed (work is more important than status) |
| **Story still in Backlog** | STOP start_story, report MCP error, ask user to verify connection |
| **Epic transition failed** | Log warning, continue (Epic status is secondary) |
| **Status unchanged after transition** | Re-fetch issue, log warning, proceed |

## Dependencies

- [git-operation](../../instructions/git-operation.instructions.md) — Branch naming, commit format
- [jira-context-discovery](../jira-context-discovery/SKILL.md) — Additional JIRA context if needed
