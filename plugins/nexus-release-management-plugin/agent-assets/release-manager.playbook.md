# release-manager Playbook

Operational details for the `release-manager` custom agent.

**Source of truth**: [release-manager.agent.md](../agents/release-manager.agent.md) defines role, workflow, and constraints.

This playbook provides: JQL templates, output report templates, GitHub search patterns, release branch conventions.

---

## Quick Reference

| Need | Resource |
|------|----------|
| JIRA hierarchy traversal | [jira-context-discovery skill](../skills/jira-context-discovery/SKILL.md) |
| Update Fix Versions | `jira-manager` agent |
| Publish report | `article-publisher` agent |
| Bug deep-dive | `bugfix` agent |
| Git operations reference | [git-operation instructions](../instructions/git-operation.instructions.md) |

---

## JQL Templates

### Fetch all Epics under a CTXENG

```
parent = {CTXENG-ID} AND issuetype = Epic
```

Alternative (when Epics are linked rather than children):
```
"Epic Link" = {CTXENG-ID}
```

### Fetch all Stories under an Epic

```
"Epic Link" = {EPIC-ID} ORDER BY key ASC
```

### Fetch all Stories/Tasks under a CTXENG (multi-level)

```
project in (SPA, SPAOP) AND "Epic Link" in (
  linkedIssues({CTXENG-ID}, "is Epic of")
) ORDER BY key ASC
```

### Bug Track A — Fixed bugs missing Fix Version

```
project = {PROJECT} AND issuetype = Bug
AND "Affects Version" is not EMPTY
AND "Fix Version" is EMPTY
AND status in (Done, Resolved, Closed)
ORDER BY priority ASC
```

### Bug Track B — Open / Unfixed bugs (Affects Version set)

```
project = {PROJECT} AND issuetype = Bug
AND status not in (Done, Resolved, Closed, Canceled)
AND "Affects Version" is not EMPTY
ORDER BY priority ASC, created ASC
```

### Bugs linked to a CTXENG feature (all statuses)

```
issueFunction in linkedIssuesOf("issue = {CTXENG-ID}", "has bug") AND issuetype = Bug
ORDER BY status ASC, priority ASC
```

Alternative when bugs are linked at Epic/Story level:
```
project = {PROJECT} AND issuetype = Bug
AND issue in linkedIssues({EPIC-ID})
ORDER BY status ASC, priority ASC
```

### All bugs with Affects Version in a specific version

```
project = {PROJECT} AND issuetype = Bug
AND "Affects Version" in ({VERSION_LIST})
ORDER BY priority ASC, created ASC
```

---

## GitHub Search Patterns

### Find PRs by JIRA ID (in title or body)

Search GitHub with: `{JIRA-ID} in:title,body type:pr repo:{org}/{repo}`

### Find merge commits referencing a JIRA ID

```bash
git log --all --oneline --grep="{JIRA-ID}"
```

### Check if a commit is on a release branch

```bash
git branch -r --contains {COMMIT-SHA}
```

### List release branches matching a pattern

```bash
git branch -r | grep "release/"
```

### Find cherry-picks of a commit

```bash
git log --all --oneline --grep="cherry picked from commit {COMMIT-SHA}"
```

---

## Release Branch Conventions

| Pattern | Example | Notes |
|---------|---------|-------|
| `release/{year}.{month}` | `release/25.03` | Monthly cadence |
| `release/{major}.{minor}` | `release/2.4` | Semantic versioning |
| `release/{feature-name}` | `release/hybrid-v3` | Feature-based |
| `hotfix/{version}` | `hotfix/25.03.1` | Patch releases |

When the user does not specify a pattern, list all branches matching `release/*` and `hotfix/*` and ask user to confirm the target.

---

## Output Report Templates

### Feature Release Mapping Report

```markdown
## Release Mapping Report -- {CTXENG-ID}: {Feature Title}

**Generated**: {date}
**Release Target**: {branch or version}
**Scope**: {n} Epics, {n} Stories

---

### CTXENG Summary

| Field | Value |
|-------|-------|
| JIRA | [{CTXENG-ID}](https://citrix.atlassian.net/browse/{CTXENG-ID}) |
| Status | {status} |
| Fix Version | {fix version or "Not set"} |
| Confluence | {link or "Not found"} |

---

### Epic & Story Hierarchy

| Epic | Story | Summary | Status | PR | Repo | Release Branch |
|------|-------|---------|--------|----|------|----------------|
| {EPIC-ID} | {STORY-ID} | {summary} | [Done] | #{PR} | {repo} | [OK] release/25.03 |
| {EPIC-ID} | {STORY-ID} | {summary} | [In Progress] | #{PR} | {repo} | [WARN] main only |
| {EPIC-ID} | {STORY-ID} | {summary} | [To Do] | -- | -- | [FAIL] No PR |

---

### Repository Summary

| Repo | PRs Merged | Release Branch | Main Only | Open PRs |
|------|-----------|----------------|-----------|----------|
| {org}/{repo} | {n} | {n} | {n} | {n} |

---

### Release Branch Coverage

| Branch | Stories Merged | PRs |
|--------|---------------|-----|
| release/25.03 | {n} | {list} |
| main/master | {n} (NOT in release) | {list} |

---

### Risk Flags

| Severity | Issue | Story/Bug | Details |
|----------|-------|-----------|---------|
| HIGH | Merged to main only | {STORY-ID} | PR #{n} merged to main, not in release/25.03 |
| MEDIUM | No PR linked | {STORY-ID} | Status Done but no code change found |

---

### Recommended Actions

1. Cherry-pick {n} Stories to release/25.03 (see HIGH flags above)
2. Add Fix Version to {n} Stories in JIRA
3. Link missing PRs to {n} Stories
```

---

### Bug Audit Report

```markdown
## Bug Audit Report -- {PROJECT / CTXENG-ID} -- {date}

**Scope**: Bugs linked to feature or project, grouped by fix status

---

### Summary

| Category | Count |
|----------|-------|
| [FAIL] Fixed but Fix Version missing | {n} |
| [WARN] Fixed but unverified (no PR found) | {n} |
| [BLOCK] Open Critical/Major bugs | {n} |
| [REVIEW] Open Minor/Trivial bugs | {n} |
| [OK] Fixed with Fix Version set | {n} |
| **Total bugs** | **{n}** |

---

### Track A: Fixed Bugs -- Fix Version Hygiene

> Bugs in Done / Resolved / Closed status. Fix Version should be set.

#### Needs Fix Version Updated

| Bug | Summary | Affects Version | Fix Branch | PR | Action |
|-----|---------|----------------|------------|----|--------|
| [{BUG-ID}](https://citrix.atlassian.net/browse/{BUG-ID}) | {summary} | {version} | release/2605.1 | #{n} | Set Fix Version = 26Q2.1 |

#### Fix Unverified (Done but no PR found)

| Bug | Summary | Affects Version | Status | Recommendation |
|-----|---------|----------------|--------|----------------|
| [{BUG-ID}](https://citrix.atlassian.net/browse/{BUG-ID}) | {summary} | {version} | Done | Manual review -- no fix PR found |

---

### Track B: Open / Unfixed Bugs -- Release Blocker Review

> Bugs NOT in Done / Resolved / Closed / Canceled. Review before release.

#### Critical / Major (Release Blockers)

| Bug | Summary | Status | Priority | Affects Version | Assignee | Notes |
|-----|---------|--------|----------|----------------|----------|-------|
| [{BUG-ID}](https://citrix.atlassian.net/browse/{BUG-ID}) | {summary} | In Progress | Major | {version} | {name} | PR open: #{n} |
| [{BUG-ID}](https://citrix.atlassian.net/browse/{BUG-ID}) | {summary} | Backlog | Critical | {version} | Unassigned | No fix started |

#### Minor / Trivial (Review Needed)

| Bug | Summary | Status | Priority | Affects Version | Assignee |
|-----|---------|--------|----------|----------------|----------|
| [{BUG-ID}](https://citrix.atlassian.net/browse/{BUG-ID}) | {summary} | Backlog | Minor | {version} | {name} |

---

### Recommended Actions

1. Update Fix Version on {n} fixed bugs via `jira-manager`
2. Manually review {n} fixed-but-unverified bugs
3. Resolve or defer {n} Critical/Major open bugs before release GA
4. Triage {n} Minor/Trivial open bugs -- accept or defer to next release
```

---

## JIRA Field Reference

| JIRA Field | API Name | Notes |
|------------|----------|-------|
| Affects Version/s | `versions` | Array of version objects — version where bug was found |
| Fix Version/s | `fixVersions` | Array of version objects — version where fix is released |
| Epic Link | `customfield_10014` | Parent Epic for Stories |
| Parent Link | `customfield_10800` (varies) | CTXENG parent for Epics |
| Story Points | `customfield_10016` | May vary by project |
| Remote Links | `getJiraIssueRemoteIssueLinks` | GitHub PR links attached to issue |

---

## Common Pitfalls

| Pitfall | Mitigation |
|---------|-----------|
| "Fix Version" and "Affects Version" confused | Fix Version = version where fix ships; Affects Version = version where bug occurs |
| Cherry-pick creates new commit SHA | Search release branch by JIRA ID pattern in commit message, not just original SHA |
| PR merged to wrong branch | Always record `base.ref` from GitHub PR, not just PR merged status |
| JIRA Done != code merged | Verify PR exists and is merged before declaring Story release-ready |
| Multiple repos per CTXENG | Aggregate per-repo summaries; report each repo row separately |
| Epics linked vs parented to CTXENG | Try both `parent =` and linked issues queries when children are not found |
