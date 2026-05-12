---
name: git
description: Git operations - branch creation, checkout, commit, push, and PR summary generation.
agent: git-ops
argument-hint: "action=branch|checkout|pull|commit|push|pr jira=APP-12345"
---

Execute Git operations following team conventions.

**Inputs**:
- Action: ${input:action:branch}
- JIRA ID: ${input:jira}
- Message (for commit): ${input:message}
- Branch name (for checkout): ${input:branchName}

**Examples**:
```
/git action=branch jira=APP-12345
/git action=checkout jira=APP-12345
/git action=checkout branchName=feature/APP-12345-MyFeature
/git action=pull
/git action=commit jira=APP-12345 message="Add new endpoint"
/git action=push
/git action=pr jira=APP-12345
```

**Actions**:
| Action | Description |
|--------|-------------|
| `branch` | Create new branch from JIRA (auto-generates name) |
| `checkout` | Checkout branch by name or JIRA ID |
| `pull` | Fetch and pull from origin |
| `commit` | Stage and commit with proper message format |
| `push` | Push current branch to origin |
| `pr` | Generate PR summary from JIRA and commits |

**Branch Naming** (auto-generated):
- Stories → `feature/{JIRA-ID}-PascalCaseName`
- Bugs → `bugfix/{JIRA-ID}-PascalCaseName`

**Commit Format**: `{JIRA-ID} {Description} [AI-Generated]`
