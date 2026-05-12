---
name: jira-ops
description: JIRA operations conventions — project codes, MCP tools, labels, transitions. Auto-applied to agents with atlassian/* tools.
applyTo: "**/*.agent.md"
---

# JIRA Operations

Common rules for agents working with JIRA via Atlassian MCP.

## CRITICAL: cloudId Resolution — MUST DO FIRST

Our Atlassian site is **`https://example.atlassian.net/`** — always and only this one.

`cloudId` is **NOT** a URL or hostname. It is a **UUID** that identifies this site internally. You MUST obtain it dynamically.

**BEFORE making ANY Atlassian MCP call** (`getJiraIssue`, `createJiraIssue`, `searchJiraIssue`, etc.):

1. Call `list_accessible_resources` (Atlassian MCP) — this is your **very first** Atlassian call
2. In the response, find the entry for `https://example.atlassian.net/`
3. Copy its `id` field — a UUID like `"a1b2c3d4-e5f6-7890-abcd-ef1234567890"`
4. Pass this UUID as `cloudId` in ALL subsequent Atlassian MCP calls
5. Cache it for the session — do not call `list_accessible_resources` again

> **`cloudId` must be a UUID.** Never pass a URL, hostname, or any invented string. Any non-UUID value returns 404.

## Valid JIRA Project Codes

Primary: `APP`, `APP2`, `ENG`, `CTXBV`, `AAUTH`, `RDXDEV`
Other: `AAUTHHELP`, `ATH`, `CC`, `CCOPS`, `CCUI`, `CGS`, `CGSHELP`, `CINC`, `CINF`, `COUT`, `DPS`, `LUI`, `SPAHELP`, `UNICON`, `WSSUCE`, `WSSHELP`

URL: `https://example.atlassian.net/browse/{JIRA-ID}`

## Atlassian MCP Tools

### Primary Tools

| Tool | Purpose | When to Use |
|------|---------|-------------|
| `getJiraIssue` | Get issue details | Fetch type, status, description, parent |
| `transitionJiraIssue` | Change status | Move to "In Progress", "Ready for Test", etc. |
| `getTransitionsForJiraIssue` | List available transitions | Before transitioning, get valid transition IDs |
| `addCommentToJiraIssue` | Add comment | Progress updates, linking PRs |
| `createJiraIssue` | Create new ticket | Bug, Story, Task, Epic creation |
| `updateJiraIssue` | Update fields | Change summary, description, labels |

### ⚠️ Search vs Get

- Use `getJiraIssue` for **known issue ID** — returns full details
- Use `mcp_atlassian_search` for **text search** — uses Rovo Search
- **Never** use search when you have exact JIRA ID

## Issue Types

| Type | Use Case | Routing |
|------|----------|---------|
| `Epic` | Container for related Stories | → `dev-coordinator` (Epic mode) |
| `Story` | User-facing feature | → `dev-coordinator` |
| `Task` | Technical work item | → `dev-coordinator` |
| `Bug` | Defect report | → `bugfix` |
| `Sub-task` | Part of Story/Task | → `dev-coordinator` |

## Mandatory Labels

All AI-created/modified tickets must include:

| Label | When | Purpose |
|-------|------|---------|
| `AI-Generated` | Always | Track AI contributions |

## Status Transitions

Common workflow statuses:

| Status | Meaning | Transition From |
|--------|---------|-----------------|
| `Open` / `To Do` | Not started | Initial |
| `In Progress` | Actively working | Open |
| `In Review` / `Code Review` | PR submitted | In Progress |
| `Ready for Test` | Code merged, needs QA | In Review |
| `Done` | Completed | Ready for Test |

**Note**: Exact status names vary by project. Always use `getTransitionsForJiraIssue` to get valid transitions.

## Mandatory Fields for `createJiraIssue`

**`components` is required** — see [jira-common playbook](../agent-assets/jira-common.playbook.md) for component resolution order, examples, and `additional_fields` format.

If the surfaced MCP tool schema does **not** list `additional_fields`, do **not** assume the create flow is blocked. In this repository, agents should still attempt the repo-prescribed payload shape with `additional_fields` when `components` or `labels` are required.

## Best Practices

**Always**: Verify issue type before routing · Include JIRA link in PRs · Add `AI-Generated` label · Use `getJiraIssue` for known IDs · **Include `components` via `additional_fields.components` in every `createJiraIssue` call** · **Try `additional_fields` even if the tool signature does not document it when repo guidance requires it**

**Never**: Assume type from ID prefix · Create tickets without confirmation · Include secrets in tickets · Skip transitions · **Omit `components` field** · **Guess `cloudId`** — always resolve via `list_accessible_resources` first
