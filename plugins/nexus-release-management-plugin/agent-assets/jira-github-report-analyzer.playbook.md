# jira-github-report-analyzer Playbook

Operational playbook for the `jira-github-report-analyzer` agent.

## Configuration

### Config file setup

> **Setup required:** `jira-assignees-github-repos.json` is not committed to the repo (it is gitignored).
> On first setup, copy `../config/jira-assignees-github-repos.template.json` to `../config/jira-assignees-github-repos.json` and adjust the values for your team.

Default repo scope and assignee list: `../config/jira-assignees-github-repos.json`

### Config schema

| Field | Required | Description |
|-------|----------|-------------|
| `assignees` | Yes | List of JIRA display names (exactly as shown in JIRA) |
| `githubSPABaseProjectUrl` | Yes | Base GitHub org URL ending with trailing slash (e.g. `https://github.com/citrix/`) |
| `repos` | Yes | List of GitHub repository names (without org prefix) |
| `projects` | Yes | List of JIRA project codes (e.g. `SPA`, `SPAOP`) |

### Config override format

Users can provide overrides inline:

```json
{
  "repoPrefix": "ztna-ui",
  "repos": ["ztna-ui-cas-dashboard-mfe"],
  "timeframe": "-2w",
  "keywords": ["performance"]
}
```

## Prompt coordination

This agent orchestrates 4 sub-prompts in sequence:

```
Phase 2: /jira-completed-by-assignee --> table of completed issues
Phase 3: /jira-epic-enrichment       --> add Epic columns
Phase 4: /github-jira-commit-linkage  --> add commit/PR columns (optional)
Phase 5: /confluence-publish-report   --> publish to Confluence (optional)
```

## Confluence page naming

Page name format: `<requestor>_<PI>_<reportDate>_JIRA_progress_report`

Example: `himanshu.parihar_PI-2602_2026-03-05_JIRA_progress_report`
