---
name: bug-fix-branch-finder
description: For a list of fixed bugs, finds the exact GitHub PRs and release branch commits where each fix landed. Outputs a full evidence table with Main PR, Release PR, Release Branch, and Commit SHA columns.
---

# Bug Fix Branch Finder Skill

Given a list of JIRA bug IDs that are Done/Resolved/Closed, this skill traces each fix through
GitHub to identify **exactly which release branch** contains the fix and produces an evidence table.

---

## When to Use

- During Fix Version hygiene audit (Bug Track A in release-manager)
- Any time a bug is Done but its Fix Version field is empty
- When you need to confirm a fix landed in a specific release branch before updating JIRA

---

## Step 1 — Search GitHub for PRs by Bug ID

For each bug ID, run a GitHub PR search scoped to the org:

```
{BUG-ID} org:{org-name}
```

Example: `SPA-32145 org:icaclientmac`

Collect all matching PRs. A typical fix produces 2–3 PRs:
- **Main PR** — merged to `master` or `main` (the primary fix)
- **Release PR** — cherry-pick merged to `release/{version}` (title usually contains the version, e.g. `(2605.1)`)
- **CD/deployment PR** — in a deployment repo (e.g. `spa-mfe-cd`) — skip these for branch analysis

Distinguish main vs release PR by:
1. Title contains a version pattern like `2605.1`, `26Q2`, or the word `cherry-pick`
2. PR body references `release/` branch or links to original PR as "Original PR"
3. PR `base.ref` if accessible via GitHub PR read tool

---

## Step 2 — Confirm Commit in Release Branch

For each release PR found, confirm the fix commit is present in the release branch:

```
list_commits(owner, repo, sha=release/{version}, perPage=30)
```

Scan commit messages for the bug ID (e.g. `SPA-32145`). Record:
- **Commit SHA** (first 7 chars for display)
- **Commit date**
- **Commit message** (first line)

If commit found → classification = `Fix merged, Fix Version missing` (when fixVersions is empty)
If commit NOT found → classification = `Fix unverified — not in release branch`

---

## Step 3 — Build Evidence Table

Output one row per bug with these columns:

| Column | Source |
|--------|--------|
| Bug ID | JIRA issue key, linked to Atlassian |
| Summary | JIRA summary field |
| Priority | JIRA priority field |
| Status | JIRA status field |
| Affects Version | JIRA `versions` field |
| Fix Version | JIRA `fixVersions` field — highlight **EMPTY** in bold if missing |
| Main PR | GitHub PR number linked to `html_url`, with merge date |
| Release PR | GitHub cherry-pick PR number linked to `html_url`, with merge date |
| Release Branch | Branch name from release PR base, e.g. `release/2605.1` |
| Commit SHA | Short SHA linked to commit `html_url` |
| Classification | One of: `Fix Version set correctly` / `Fix merged, Fix Version missing` / `Fix unverified` |

### Example Output

| Bug ID | Summary | Priority | Status | Affects Version | Fix Version | Main PR | Release PR | Release Branch | Commit SHA | Classification |
|--------|---------|----------|--------|----------------|-------------|---------|-----------|----------------|------------|----------------|
| SPA-32145 | Browser Policies Saving with Empty Condition Inputs | Major | Done | SPA Service 26Q2.1 | **EMPTY** | #1068 merged Feb 16 | #1069 merged Feb 17 | `release/2605.1` | 25a237d | Fix merged, Fix Version missing |
| SPA-32291 | Numbering Alignment in Condition Column is Off Center | Trivial | Done | SPA Service 26Q2.1 | **EMPTY** | #1075 merged Feb 25 | #1076 merged Feb 25 | `release/2605.1` | bd526f6 | Fix merged, Fix Version missing |

---

## Step 4 — Recommended Actions

After producing the table, always offer:

1. **Fix Version set correctly** → no action needed
2. **Fix merged, Fix Version missing** → offer handoff to `jira-manager` to set `fixVersions = {release version}`
3. **Fix unverified** → offer handoff to `bugfix` for investigation, or flag for manual review

---

## Notes

- A bug may have fixes in **multiple release branches** (e.g. hotfix backported to `release/2605.1` AND `release/2508.5`). List all rows.
- CD/deployment PRs (repos like `spa-mfe-cd`) indicate the build was promoted to an environment — useful context but not the source fix PR.
- If `search_pull_requests` returns no results, try searching by the bug summary keywords as a fallback.
- The `list_commits` call must be on the **release branch SHA**, not `master`.
