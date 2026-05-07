---
name: jira-epic-enrichment
description: Enrich a list of Jira issue keys with their linked Epic (key, summary, status). Uses batched getJiraIssue calls (max 3 in parallel) for reliability. Outputs an augmented table with Epic columns added.
agent: jira-github-report-analyzer
argument-hint: "jiraKeys=SPA-123,SPA-456,SPAOP-789"
---

Enrich the given Jira issue keys with their linked Epic details.

## Inputs
- **Jira keys** (comma-separated): ${input:jiraKeys}

## Instructions

### Reliability rules
- Use `getJiraIssue` per key — **never** batch with `issuekey in (...)` JQL (times out reliably).
- Process keys in batches of **3 at a time** (max concurrency: 3 parallel calls).
- Fetch only: `summary`, `parent`, `customfield_10014`.

### Epic resolution logic (per issue)
1. Check `customfield_10014` — if non-null, this is the Epic link key. Fetch that Epic's `summary` and `status`.
2. If `customfield_10014` is null, inspect `parent`:
   - If `parent.fields.issuetype.name` is `Epic`, use parent as the Epic.
   - Otherwise output `No Epic linked`.
3. Fetch Epic details (`summary`, `status`) via a single `getJiraIssue` call per unique Epic key.

### Error handling
- If a call is cancelled or times out: mark that row `Not fetched (request cancelled)` and continue with remaining keys.
- If Epic fetch fails: mark Epic as `Not fetched` but keep the issue row.

## Output

Return a markdown table with Epic columns added:

```markdown
| Jira Key | Summary | Linked Epic | Epic Summary | Epic Status |
|---|---|---|---|---|
| SPA-12345 | Short summary | SPA-10000 | Epic title | In Progress |
| SPA-12346 | Short summary | No Epic linked | N/A | N/A |
| SPA-12347 | Short summary | Not fetched | N/A | N/A |
```
