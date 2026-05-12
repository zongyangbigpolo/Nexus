---
name: release-delta-analyzer
description: Identify JIRA issues (Bugs and Stories) fixed between two GitHub release branches. Fetches commits unique to the newer branch, extracts JIRA IDs, queries JIRA for issue type/status/affected version/fix version, and outputs a classified table.
---

# Release Delta Analyzer Skill

Given two GitHub release branches — a **newer** branch and an **older** branch — this skill finds
all commits present in the newer branch but not in the older, extracts every JIRA ID from those
commits (including IDs buried in squash-merge bodies), looks them up in JIRA, and produces a
classified table of Bugs and Stories.

---

## When to Use

- A release manager needs to know what was fixed or shipped between two release cuts
- Before publishing release notes or updating Fix Versions
- As input to the `release-manager` agent Phase 2A Step 5 (bug audit)

---

## Inputs

| Field | Required | Description |
|-------|----------|-------------|
| `repo` | Yes | GitHub repo in `owner/repo` format, e.g. `target repository/access-ui-setup-mfe` |
| `newer_branch` | Yes | The more recent release branch, e.g. `release/2605.1` |
| `older_branch` | Yes | The baseline release branch, e.g. `release/2602.3` |
| `cloudId` | Yes | Atlassian cloudId (resolve via `getAccessibleAtlassianResources` if unknown) |

---

## MANDATORY PROTOCOL — Always Use the Helper Scripts

> ### ⛔ NEVER CREATE AD-HOC PYTHON SCRIPTS
>
> The full pipeline is already implemented in
> `agent-assets/scripts/release-helpers/`. All commit ingestion, SHA-set
> diffing, JIRA-ID extraction, classification, and report generation is done
> by those scripts. **Do not recreate any of that logic inline or in temp
> files.** This applies even for "simple" or "quick" analyses.
>
> ### Standard Workdir
>
> Always derive the working directory from the repo and branch names:
> ```
> repo_slug  = last segment of repo name, lowercased   # e.g. access-ui-navigation-mfe
> newer_slug = newer_branch, replace / with -, truncated to 20 chars  # e.g. release-2605.1
> WORKDIR    = /tmp/rd_<repo_slug>_<newer_slug>         # e.g. /tmp/rd_access-ui-navigation-mfe_release-2605.1
> ```
> Create it with `mkdir -p $WORKDIR` before any script call.
>
> ### MCP Output File Protocol
>
> When any MCP tool (e.g. `list_commits`, `searchJiraIssuesUsingJql`) returns
> a large result, VS Code saves it to a file and reports the path. **Capture
> that path verbatim** and pass it as `--input` to the appropriate step script.
> Never re-read the raw output yourself — always let the step scripts parse it.
>
> Standard `--input` path pattern:
> ```
> ~/Library/Application Support/Code/User/workspaceStorage/<hash>/GitHub.copilot-chat/
>   chat-session-resources/<session-id>/<tool-call-id>/content.json
> ```
> Quote the path in shell commands to handle spaces:
> ```
> python3 step1_ingest_branch.py --mode older --input "<path>/content.json" --workdir $WORKDIR --page 1
> ```
>
> ### Scripts Reference Path
>
> Always run scripts from or reference them by absolute path:
> ```
> SCRIPTS=/path/to/repo/agent-assets/scripts/release-helpers
> python3 $SCRIPTS/step1_ingest_branch.py ...
> ```

---

## Helper Scripts

All analysis logic lives in `agent-assets/scripts/release-helpers/`. These scripts are
**always** used during the pipeline — never replaced by ad-hoc code.

| Script | Skill Step | Purpose |
|--------|-----------|---------|
| `step1_ingest_branch.py` | Step 2A / 2B | Ingest one page of `list_commits`; build SHA set (older) or find divergence + extract JIRA IDs (newer) |
| `step2_classify.py` | Step 3 | Classify IDs as delta-only vs cherry-picks; print ready-to-paste JQL batches |
| `step3_ingest_jira.py` | Step 4 | Merge one batch of `searchJiraIssuesUsingJql` results; check coverage with `--status` |
| `step4_build_report.py` | Step 5 | Generate final Markdown report from all state files |

**Complete pipeline command sequence (template):**

```
# Initialise
REPO_SLUG=<last-segment-of-repo-name>    # e.g. access-ui-navigation-mfe
NEWER_SLUG=<newer_branch-slug>           # e.g. release-2605.1  (replace / with -)
WORKDIR=/tmp/rd_${REPO_SLUG}_${NEWER_SLUG}
SCRIPTS=/path/to/repo/agent-assets/scripts/release-helpers
mkdir -p $WORKDIR

# Step 2A — older branch (repeat per MCP page until "Need more: NO")
python3 $SCRIPTS/step1_ingest_branch.py --mode older --input "<mcp_content.json>" --workdir $WORKDIR --page 1

# Step 2B — newer branch (repeat per MCP page until "Divergence found: YES")
python3 $SCRIPTS/step1_ingest_branch.py --mode newer --input "<mcp_content.json>" --workdir $WORKDIR --page 1

# Step 3 — classify + get JQL batches
python3 $SCRIPTS/step2_classify.py --workdir $WORKDIR

# Step 4 — JIRA lookup (repeat per MCP batch until coverage complete)
python3 $SCRIPTS/step3_ingest_jira.py --input "<mcp_content.json>" --workdir $WORKDIR
python3 $SCRIPTS/step3_ingest_jira.py --status --workdir $WORKDIR   # check coverage

# Step 5 — build report
python3 $SCRIPTS/step4_build_report.py \
  --newer-branch "<NEWER_BRANCH>" --older-branch "<OLDER_BRANCH>" \
  --repo "<OWNER/REPO>" --jira-base-url https://example.atlassian.net \
  --workdir $WORKDIR --output $WORKDIR/delta_report.md
```

See [release-helpers/README.md](../../agent-assets/scripts/release-helpers/README.md) for full argument
reference and state file schema.

---

## Step 1 — Resolve cloudId

If `cloudId` is not already known, call `getAccessibleAtlassianResources` and extract the UUID for
`example.atlassian.net`. Cache it for all subsequent JIRA calls.

---

## Step 2 — Exhaustively Fetch ALL Commits from Both Branches

⚠️ **CRITICAL: Do NOT stop at the first page. Paginate until the shared ancestor is found.**

### 2A — Fetch all commits of the older branch

Fetch page by page with `perPage=100`. After each MCP call, immediately pass the
result file to `step1_ingest_branch.py`. Stop when the script prints `Need more: NO`.

**For each page of `older_branch`:**
```
# 1. Call MCP
mcp: list_commits(owner=<OWNER>, repo=<REPO>, sha=<older_branch>, perPage=100, page=<N>)
# VS Code saves result to <path>/content.json — capture that path

# 2. Ingest into state
python3 $SCRIPTS/step1_ingest_branch.py \
  --mode older \
  --input "<path>/content.json" \
  --workdir $WORKDIR \
  --page <N>

# 3. Read stdout
# "Need more: YES — fetch page N+1" → call MCP again with page=N+1, repeat
# "Need more: NO — older branch complete" → proceed to Step 2B
```

State saved to `$WORKDIR/older_state.pkl` (SHA set, JIRA IDs, head SHA/date).

### 2B — Fetch newer branch commits until the divergence point is found

Fetch page by page with `perPage=100`. After each MCP call, pass the result file to
`step1_ingest_branch.py --mode newer`. Stop as soon as the script prints `Divergence found: YES`.

**For each page of `newer_branch`:**
```
# 1. Call MCP
mcp: list_commits(owner=<OWNER>, repo=<REPO>, sha=<newer_branch>, perPage=100, page=<N>)
# VS Code saves result to <path>/content.json — capture that path

# 2. Find divergence
python3 $SCRIPTS/step1_ingest_branch.py \
  --mode newer \
  --input "<path>/content.json" \
  --workdir $WORKDIR \
  --page <N>

# 3. Read stdout
# "Divergence found: YES — run step2_classify.py next" → STOP, proceed to Step 3
# "Divergence found: NO — fetch page N+1" → call MCP again with page=N+1, repeat
# WARNING (exhausted pages) → step1 sets done=True with fallback warning; proceed to Step 3
```

State saved to `$WORKDIR/newer_state.pkl` (delta commits, divergence SHA, JIRA ID map).

Report the divergence point to the user after Step 2B completes:
```
Divergence point: SHA {short_sha} ("{commit_subject}") — {date}
Delta: {N} commits unique to {newer_branch}
```

---

## Step 3 — Classify JIRA IDs (Step 2 already extracted them)

`step1_ingest_branch.py` already scanned the **full message body** of every delta commit
(including squash-merge bodies) and built the JIRA ID map stored in `newer_state.pkl`.

⛔ **Do NOT re-implement JIRA ID extraction.** Run `step2_classify.py` instead:

```
python3 $SCRIPTS/step2_classify.py \
  --workdir $WORKDIR \
  --batch-size 40
```

This script:
- Reads `older_state.pkl` and `newer_state.pkl`
- Classifies IDs as **delta-only** or **cherry-picks** (present in both branches)
- Writes `$WORKDIR/classification.pkl` and `$WORKDIR/jira_ids.txt`
- Prints ready-to-paste JQL batches for Step 4 (JIRA lookup)

Default JIRA prefixes recognized: `APP2, APP, ENG, SPACON, SPATEC, access, ZTA`.
For other repos, pass `--jira-prefixes PREFIX1,PREFIX2,...`.

Report count to the user:
```
Found {N} unique JIRA IDs ({M} delta-only + {K} cherry-picks)
jira_ids.txt written to $WORKDIR/jira_ids.txt
```

---

## Step 4 — Query JIRA for All Issues

Use the **JQL batches printed by `step2_classify.py`** (Step 3 stdout) to fetch all issues.
For each batch, call the MCP tool then immediately ingest the result:

```
# 1. Call MCP with the JQL from step2_classify.py stdout
mcp: searchJiraIssuesUsingJql(
  cloudId   = <cloudId>,
  jql       = "key in (APP2-1234, APP-5678, ...)",
  fields    = ["summary", "issuetype", "status", "priority", "versions", "fixVersions"],
  maxResults = 50
)
# VS Code saves result to <path>/content.json

# 2. Ingest into jira_results.pkl
python3 $SCRIPTS/step3_ingest_jira.py \
  --input "<path>/content.json" \
  --workdir $WORKDIR

# 3. Check coverage after each batch
python3 $SCRIPTS/step3_ingest_jira.py --status --workdir $WORKDIR
# "All JIRA IDs covered" → proceed to Step 5
# "Not yet queried: ..." → issue another MCP batch for the missing IDs
```

Repeat for each batch until `--status` reports **all JIRA IDs covered**.
State saved to `$WORKDIR/jira_results.pkl`.

---

## Step 5 — Build the Report

Once `step3_ingest_jira.py --status` confirms all IDs are covered, generate the final report:

```
python3 $SCRIPTS/step4_build_report.py \
  --newer-branch "<newer_branch>" \
  --older-branch "<older_branch>" \
  --repo "<owner>/<repo>" \
  --jira-base-url https://example.atlassian.net \
  --workdir $WORKDIR \
  --output $WORKDIR/delta_report.md
```

Optional flags:
- `--summary-only` — print counts + risk summary only (no full tables)
- `--no-cherry-picks` — omit Section A2/B2 (cherry-pick tables)
- `--jira-prefixes PREFIX1,PREFIX2` — extend JIRA project matching if needed

The script prints a one-line risk summary on stdout and writes the full Markdown report
to `$WORKDIR/delta_report.md`. Read that file and present its content to the user.

---

## Step 6 — Present Report and Offer Actions

Read `$WORKDIR/delta_report.md` and present its full content to the user. The report is
generated by `step4_build_report.py` and already includes:

- **Section A** — Bugs (A1: delta-only, A2: cherry-picks), prioritised Blocker → Critical → Major → Minor → Trivial
- **Section B** — Stories, Epics & Features (B1: delta-only, B2: cherry-picks)
- **Section C** — JIRA IDs not accessible (external projects, permissions)
- **Risk Summary** — HIGH/MEDIUM/INFO findings (missing Fix Version, open bugs, status mismatches)
- **Summary Counts** — commit and issue totals
- **Recommended Actions** — numbered list scoped to actual findings

After presenting, ask the user which recommended actions to proceed with:

1. **Add Fix Versions / update JIRA** (HIGH bugs with empty Fix Version) → handoff `jira-manager`
2. **Investigate open Critical/Major bugs** → handoff `bugfix`
3. **Resolve JIRA status mismatches** — code committed but JIRA not Done → Step 7 below
4. **Publish report to Confluence** → handoff `article-publisher`

---

## Step 7 — Interactive JIRA Comment & Reassignment (for flagged bugs)

After presenting the report and Recommended Actions, prompt the user with a confirmation
**before taking any action**. Show exactly what will be done so the user can approve or adjust:

```
Found {N} flagged bug(s) with missing Fix Version or incorrect status:

  Bug              | Issue
  ---------------- | -------------------------------------------
  {bug_id}         | Fix Version missing — suggest {fix_version}
  {bug_id}         | Status is {status}, should be Done

Proposed steps:
  1. Add a comment on each bug (mentioning the reporter and the person who
     fixed the bug) asking them to update the Fix Version and/or Status.
  2. Reassign each bug to the person who fixed it (if different from current
     assignee).

For each bug the comment will say:
---
  Hi {reporter_display_name} and {fixer_display_name} — flagged during release
  delta analysis (`{newer_branch}` vs `{older_branch}`):

  [sections that apply — see 7B below]
---

Shall I proceed? (yes / no / select specific bugs / adjust the comment)
```

Only proceed after the user confirms. If the user asks to adjust the comment, update the
draft and re-show it before posting.

If the user says **yes** (or selects specific bugs), hand off all JIRA writes to
**`jira-manager`** — do not call JIRA MCP tools directly from this skill.

---

### 7A — Identify the Fixer

For each flagged bug, find the fix details:

1. Look up `jira_id_to_commits[bug_id]` — maps the bug ID to the commit subject(s) in the delta.
2. From the commit object extract the **author** (`commit.author.name`) — the Git author of the fix.
3. From Step 4 JIRA data read `reporter.displayName` and `assignee.displayName`.
4. If commit author name does not match the JIRA assignee, note both — the comment will mention both.

⚠️ **Do NOT use `accountId` strings in comment text.** Use the person's **display name** only —
`[~accountId:...]` syntax is escaped by the MCP tooling and renders as raw text.

---

### 7B — Generate the Comment

Build the comment text for each flagged bug using this template:

```
Hi {reporter_display_name} and {fixer_display_name} — flagged during release delta
analysis (`{newer_branch}` vs `{older_branch}`):

**Fix Version is not set**                           ← include only if fixVersions is empty
The fix for this bug was committed in {repo}
({commit_sha_short}: "{commit_subject}") and is present in `{newer_branch}`.
Please set the **Fix Version/s** field to `{suggested_fix_version}` (matching
other bugs fixed in this release).

**Status needs updating**                            ← include only if status is not Done/Resolved/Closed
The ticket is currently **{current_status}**, but the fix has been merged and is
shipping in `{newer_branch}`. Please transition the status to **Done** (or the
appropriate closed state).

_This comment was generated by the Release Delta Analyzer during the `{newer_branch}` audit._
```

Placeholder rules:
- `{reporter_display_name}` — `reporter.displayName` from Step 4
- `{fixer_display_name}` — Git commit author name from Step 7A; if same as reporter, address
  just one person (omit "and {fixer_display_name}")
- `{suggested_fix_version}` — most common Fix Version value set on other Done bugs in the same
  delta (Step 5 report data)
- `{commit_sha_short}` — first 8 chars of the commit SHA that references this bug
- `{commit_subject}` — subject line of that commit
- Include only the section(s) that apply

---

### 7C — Hand off to `jira-manager`

After user confirmation, **do not call JIRA MCP tools directly**. Instead prepare a structured
handoff to `jira-manager` with all required information pre-filled:

```
Handoff to: jira-manager

For each bug below, please perform the following steps in order:

Bug: {bug_id}
  Step 1 — Add comment:
    addCommentToJiraIssue(
      cloudId  = {cloudId},
      issueKey = {bug_id},
      body     = """
        {fully_rendered_comment_text}   ← plain text, display names only
      """
    )

  Step 2 — Reassign (only if fixer differs from current assignee):
    Fixer display name : {fixer_display_name}
    Current assignee   : {current_assignee_display_name}
    Action             : look up fixer accountId by display name, then call
    editJiraIssue(
      cloudId      = {cloudId},
      issueIdOrKey = {bug_id},
      fields       = { "assignee": { "accountId": "<resolved_fixer_account_id>" } }
    )

  Step 3 — Confirm:
    Print: ✅ Comment added to {bug_id} (comment ID: {id})
    Print: ✅ {bug_id} reassigned to {fixer_display_name}
           OR
           ℹ️  {bug_id} already assigned to {fixer_display_name} — no reassignment needed
```

`jira-manager` executes these steps and reports back with confirmation.

---

### 7D — Summary

After `jira-manager` completes, print:

```
## Step 7 Summary — JIRA Updates

| Bug ID | Comment Added | Reassigned To | Notes |
|--------|--------------|---------------|-------|
| {bug_id} | ✅ (comment #{id}) | {name or "already assignee"} | {what was flagged} |
```

---

## Common Pitfalls — How to Avoid Missing Bugs

| Pitfall | Root Cause | Prevention |
|---------|-----------|-----------|
| Stopping at page 1 of commits | `perPage=100` only returns the most recent 100 | Always paginate until shared ancestor SHA is found |
| Missing IDs in squash commits | Only scanning commit subject (first line) | Scan `commit.message` in full — squash bodies contain dozens of inner JIRA refs |
| Silently dropping cherry-picks | Excluding IDs present in older branch | Flag as `also in {older_branch}` but still show in table |
| False divergence on date cutoff | Cherry-pick commits may have the same date | Prefer SHA-set divergence; use date only as final fallback |
| Missing IDs from CI/infra commits | Commits referencing APP IDs only in body | Full-body scan catches these |

---

## Notes

- Release branch naming convention: `release/YYMM.patch`
  - `2605.1` = May 2026 release, patch 1
  - `2602.3` = February 2026 release, patch 3
  - "Newer" = higher `YYMM` or higher patch at same `YYMM`
- JIRA `versions` field = **Affects Version/s** — the version where the bug was reported/observed
- JIRA `fixVersions` field = **Fix Version/s** — the version where the fix was shipped
  These are independent fields. Never assume one equals the other.
- Squash-merge repos (common in APP) produce commits whose `message` body contains the full
  history of the squashed branch, including every inner commit message and its JIRA IDs.
  Scanning only the first line can miss 80%+ of referenced JIRA IDs.

---

## Example Workflow Invocation

```
User: Find bugs fixed between release/2605.1 and release/2602.3 in access-ui-setup-mfe

SCRIPTS = /path/to/repo/agent-assets/scripts/release-helpers
WORKDIR = /tmp/rd_access-ui-setup-mfe_release-2605.1

→ Step 1: Resolve cloudId → 70cbc59a-...

→ Step 2A: Fetch release/2602.3 (older branch) — 2 pages
   [MCP] list_commits(sha=release/2602.3, page=1, perPage=100) → content_p1.json
   python3 $SCRIPTS/step1_ingest_branch.py --mode older --input content_p1.json --workdir $WORKDIR --page 1
   stdout: “Need more: YES — fetch page 2”
   [MCP] list_commits(sha=release/2602.3, page=2, perPage=100) → content_p2.json
   python3 $SCRIPTS/step1_ingest_branch.py --mode older --input content_p2.json --workdir $WORKDIR --page 2
   stdout: “Need more: NO — older branch complete”
   → older_state.pkl: 112 SHAs, 38 JIRA IDs

→ Step 2B: Fetch release/2605.1 (newer branch) — divergence at page 2
   [MCP] list_commits(sha=release/2605.1, page=1, perPage=100) → content_n1.json
   python3 $SCRIPTS/step1_ingest_branch.py --mode newer --input content_n1.json --workdir $WORKDIR --page 1
   stdout: “Divergence found: NO — fetch page 2”
   [MCP] list_commits(sha=release/2605.1, page=2, perPage=100) → content_n2.json
   python3 $SCRIPTS/step1_ingest_branch.py --mode newer --input content_n2.json --workdir $WORKDIR --page 2
   stdout: “Divergence found: SHA 545cfd12 \"APP2-10510 Add warning modal...\" — 2025-12-05”
   → newer_state.pkl: 107 delta commits, 43 JIRA IDs extracted from full message bodies

→ Step 3: Classify
   python3 $SCRIPTS/step2_classify.py --workdir $WORKDIR
   stdout: 43 unique IDs (38 delta-only, 5 cherry-picks)
           JQL Batch 1: key in (APP2-10510, APP-30004, ...)

→ Step 4: JIRA lookup
   [MCP] searchJiraIssuesUsingJql(cloudId, “key in (...)”, fields=[...]) → jira_b1.json
   python3 $SCRIPTS/step3_ingest_jira.py --input jira_b1.json --workdir $WORKDIR
   python3 $SCRIPTS/step3_ingest_jira.py --status --workdir $WORKDIR
   stdout: “All JIRA IDs covered. Ready for step4_build_report.py.”

→ Step 5: Build report
   python3 $SCRIPTS/step4_build_report.py \
     --newer-branch release/2605.1 --older-branch release/2602.3 \
     --repo target repository/access-ui-setup-mfe \
     --jira-base-url https://example.atlassian.net \
     --workdir $WORKDIR --output $WORKDIR/delta_report.md
   stdout: “Report written to /tmp/rd_access-ui-setup-mfe_release-2605.1/delta_report.md”
   stdout: “HIGH risks: 1 missing Fix Version, 0 open critical bugs”

→ Step 6: Present $WORKDIR/delta_report.md to user.
   Report shows:
     Section A1 (Bugs delta-only): APP2-10746 — Fix Version: (empty) — HIGH
     Section A2 (Bugs cherry-picks): 0
     Section B1 (Stories delta-only): 42 Stories
     Section B2 (Stories cherry-picks): 5
     Risk Summary: HIGH | Fixed bugs with no Fix Version | APP2-10746

→ Step 7 (optional): Prompt user re: flagged bugs:
   "Found 1 bug (APP2-10746) with Fix Version missing.
    Shall I add a comment and request the fixer to update it? (yes/no)"
   ...(Step 7A–7D proceeds if user confirms)”
```
