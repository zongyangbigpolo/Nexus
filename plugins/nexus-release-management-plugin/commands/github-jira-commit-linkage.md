---
name: github-jira-commit-linkage
description: Find GitHub commits and pull requests that reference a given set of Jira keys within a repo scope and timeframe. Returns a table mapping each Jira key to its repo, commit SHA, and PR.
agent: jira-github-report-analyzer
argument-hint: "jiraKeys=SPA-123,SPA-456 repoScope=ztna-ui* timeframe=-2w"
---

Find GitHub references (commits and PRs) for the given Jira keys.

## Inputs
- **Jira keys** (comma-separated): ${input:jiraKeys}
- **Repo scope** (prefix glob or explicit list — default: load from `../config/jira-assignees-github-repos.json`): ${input:repoScope}
- **Timeframe** (default: `-2w`): ${input:timeframe:-2w}

## Instructions

### 1. Resolve repo list
If `repoScope` is a prefix glob (e.g., `ztna-ui*`), expand it using `search_repositories` and use the `full_name` field (`<owner>/<repo>`) from each matching repository.
If no `repoScope` provided:
- Load `repos` array and `githubSPABaseProjectUrl` from [../config/jira-assignees-github-repos.json](../config/jira-assignees-github-repos.json).
- Derive the GitHub owner/org from `githubSPABaseProjectUrl` (e.g., `https://github.com/citrix/` → `citrix`).
- Construct the full repo identifier as `<owner>/<repoName>` for each entry in `repos`.
- Use these full `owner/repo` identifiers for all GitHub MCP calls.

### 2. Search commits per repo
For each full repo identifier (`owner/repo`), use `list_commits` with the `since` parameter set to the timeframe start date.
Scan each commit message for Jira key pattern: `[A-Z]+-\d+`.
Collect all matches, then filter to only those present in the input `jiraKeys` list.

### 3. Search PRs
For each Jira key and each full repo identifier (`owner/repo`), use `search_pull_requests` with query `<JIRA-KEY> repo:<owner>/<repo>`.
Record PR number and URL where found.

### 4. Deduplicate
If multiple commits reference the same Jira key, list the most recent commit SHA and any associated PR.

### 5. Handle misses
If no commit or PR references a Jira key in the scoped repos/timeframe, output `Not found` for that row.

## Output

Return a markdown table:

```markdown
| Jira Key | Repo | Commit SHA | Commit URL | PR |
|---|---|---|---|---|
| SPA-12345 | ztna-ui-cas-dashboard-mfe | abc1234 | https://github.com/… | #456 |
| SPA-12346 | Not found | Not found | Not found | Not found |
```
