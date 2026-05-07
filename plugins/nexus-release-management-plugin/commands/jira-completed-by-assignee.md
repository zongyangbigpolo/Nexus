---
name: jira-completed-by-assignee
description: Query Jira for completed issues by one or more assignees within a timeframe using fast, reliable JQL. Returns a table of Jira keys, summaries, statuses, and assignees.
agent: jira-github-report-analyzer
argument-hint: "assignees=john.doe,jane.smith timeframe=-2w projects=SPA,SPAOP"
---

Fetch completed Jira issues for the specified assignees and timeframe.

## Inputs
- **Assignees** (display names or Jira account IDs): ${input:assignees}
- **Timeframe** (default: `-2w`): ${input:timeframe:-2w}
- **Projects** (default: load `projects` array from config file): ${input:projects}

## Instructions

### 1. Resolve account IDs
- Load assignee display names from [../config/jira-assignees-github-repos.json](../config/jira-assignees-github-repos.json).
- Resolve each display name to an account ID via `lookupJiraAccountId` — the config file does not store account IDs.
- Always use account IDs in JQL — never display names — to avoid matching failures.

### 2. Run primary JQL query (fast path)
Build the `project in (...)` clause using `${input:projects}` if provided; otherwise load the `projects` array from [../config/jira-assignees-github-repos.json](../config/jira-assignees-github-repos.json).
Use this template — substitute resolved project codes and account IDs:

```jql
project in (<project1>, <project2>, ...)
AND assignee in (<accountId1>, <accountId2>)
AND status in (Done, Closed, Resolved)
AND resolved >= ${input:timeframe:-2w}
ORDER BY assignee ASC, resolved DESC
```

Request minimal fields only: `summary`, `status`, `assignee`, `resolved`.

### 3. Fallback (if primary returns 0 results)
```jql
assignee = <accountId>
AND status CHANGED TO (Done, Closed, Resolved) AFTER ${input:timeframe:-2w}
ORDER BY updated DESC
```

### 4. Rate-limit safety
- Run at most 2 concurrent Jira calls.
- If a call is cancelled or times out, stop the current batch, return partial results with marker `Not fetched (request cancelled)`, and ask the user whether to continue.

## Output

Return a markdown table:

```markdown
| Assignee | Jira Key | Jira Status | Summary |
|---|---|---|---|
| john.doe | SPA-12345 | Done | Short one-line summary |
```

List all issues grouped by assignee, sorted by resolved date descending. If an assignee has no completed issues, include a row: `| <name> | — | — | No completed issues in period |`.
