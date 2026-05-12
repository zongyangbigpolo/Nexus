# Release Delta Analyzer — Helper Scripts

These Python helper scripts are used by the **release-manager** agent (via the
`release-delta-analyzer` skill) to process commit data and JIRA results fetched
through GitHub and Atlassian MCP tools.

They are intentionally decoupled from the MCP layer: each script reads JSON files
written by MCP tool calls and writes pickle state files that feed the next step.

---

## ⛔ Never Create Custom Scripts

The agent **MUST** use only the scripts in this directory. Do **NOT** write new Python
scripts or inline logic to process commits or JIRA data. If you find yourself wanting
to implement commit-processing or classification logic, stop — call these scripts
with the correct arguments instead.

Script path variable (set once at the start of every workflow):

```
SCRIPTS=~/.vscode-server/data/User/workspaceStorage/.../nexus-common-agent-plugin/agent-assets/scripts/release-helpers
# or, from workspace root:
SCRIPTS=$(pwd)/agent-assets/scripts/release-helpers
```

---

## Workdir Naming Convention

All state files for a single analysis run are stored in a dedicated workdir.
Always create the workdir using this naming pattern:

```
/tmp/rd_<repo-slug>_<newer-branch-slug>
```

**Rules:**
- `<repo-slug>` — last component of the repo name in kebab-case (e.g. `access-ui-navigation-mfe`)
- `<newer-branch-slug>` — branch name with `/` replaced by `-` (e.g. `release-2605.1`)

**Example:**
```
# Repo: target repository/access-ui-navigation-mfe
# Newer branch: release/2605.1
WORKDIR=/tmp/rd_access-ui-navigation-mfe_release-2605.1
mkdir -p $WORKDIR
```

---

## MCP File Capture Protocol

VS Code sometimes saves large MCP tool responses to a `content.json` file on disk
instead of returning the full JSON inline. When this happens, the tool output panel
shows a path like:

```
/var/folders/xyz.../content.json
```

Pass this path verbatim as the `--input` argument:

```
python3 $SCRIPTS/step1_ingest_branch.py \
  --mode older \
  --input "/var/folders/xyz.../content.json" \
  --workdir $WORKDIR \
  --page 1
```

**Rules:**
- Quote the path in case it contains spaces
- Do **NOT** copy the file or rename it — use the path exactly as displayed
- If the MCP tool returns JSON inline (no file path), save it to a temp file first:
  ```
  echo '<json>' > $WORKDIR/mcp_page1.json
  python3 $SCRIPTS/step1_ingest_branch.py --mode older --input $WORKDIR/mcp_page1.json ...
  ```

---

## Pipeline Overview

```
  [MCP: list_commits (older branch, all pages)]
            |
            v
  step1_ingest_branch.py  --mode older  --input <mcp_json> ...
            |  (repeatable per page until "Need more: NO")
            v
  older_state.pkl   (SHA set + JIRA IDs + all commits)

  [MCP: list_commits (newer branch, page by page)]
            |
            v
  step1_ingest_branch.py  --mode newer  --input <mcp_json> ...
            |  (repeatable per page until divergence found or "done")
            v
  newer_state.pkl   (delta commits + divergence point + JIRA ID map)

            |
            v
  step2_classify.py
            |
            v
  classification.pkl  +  jira_ids.txt

  [MCP: searchJiraIssuesUsingJql  key in (...) — batches of 20-50]
            |
            v
  step3_ingest_jira.py  --input <jira_json> ...
            |  (repeatable per batch)
            v
  jira_results.pkl

            |
            v
  step4_build_report.py  --newer-branch X  --older-branch Y  --repo Z  ...
            |
            v
  <report>.md
```

---

## Scripts

### `step1_ingest_branch.py`

Processes one page of `list_commits` output, updating the persistent state file.

**Older branch** mode — builds the SHA reference set and extracts JIRA IDs:
```
python3 step1_ingest_branch.py \
  --mode older \
  --input /path/to/mcp_commits_page1.json \
  --workdir /tmp/rd_work \
  --page 1
```
Run once per page. The script prints "Need more: YES" when the branch has more commits.
Stop when it prints "Need more: NO".

**Newer branch** mode — finds delta commits and identifies divergence point:
```
python3 step1_ingest_branch.py \
  --mode newer \
  --input /path/to/mcp_commits_page1.json \
  --workdir /tmp/rd_work \
  --page 1
```
Run once per page. The script prints "Divergence found: YES" and exits as soon as the
shared ancestor SHA is found. Stop calling once divergence is confirmed.

---

### `step2_classify.py`

Classifies delta JIRA IDs as delta-only vs cherry-picks (present in both branches).
Run once after all branch pages have been ingested.

```
python3 step2_classify.py --workdir /tmp/rd_work
```

Outputs:
- `classification.pkl` — structured classification data
- `jira_ids.txt` — flat list of JIRA IDs to query

---

### `step3_ingest_jira.py`

Processes one batch of `searchJiraIssuesUsingJql` output.
Call once per MCP response batch (20-50 issues per batch recommended).

```
python3 step3_ingest_jira.py \
  --input /path/to/mcp_jira_batch1.json \
  --workdir /tmp/rd_work
```

Repeatable — each call merges into `jira_results.pkl`.

---

### `step4_build_report.py`

Generates the final Markdown report. All release-specific context is passed as arguments.

```
python3 step4_build_report.py \
  --newer-branch release/hybrid/2601 \
  --older-branch release/hybrid/2511 \
  --repo target repository/spa-onprem-service \
  --jira-base-url https://example.atlassian.net \
  --workdir /tmp/rd_work \
  --output /tmp/delta_report.md
```

Optional flags:
- `--summary-only` — print counts and risk summary, suppress full tables
- `--no-cherry-picks` — omit Section A2/B2 (cherry-pick tables) from output

---

## State Files (in `--workdir`)

| File | Written by | Read by | Contents |
|------|-----------|---------|---------|
| `older_state.pkl` | step1 `--mode older` | step1 `--mode newer`, step2 | SHA set, JIRA IDs, commit objects |
| `newer_state.pkl` | step1 `--mode newer` | step2 | Delta commits, divergence point, JIRA ID→commit map |
| `classification.pkl` | step2 | step4 | delta_only, cherry_picks, unique, commits, divergence |
| `jira_ids.txt` | step2 | (manual use for MCP JQL construction) | One JIRA ID per line |
| `jira_results.pkl` | step3 | step4 | Dict: JIRA key → {summary, type, status, priority, affects, fix_version} |

---

## JIRA ID Regex

All scripts use the following pattern to extract JIRA IDs from commit messages:

```
\b((?:APP2|APP|ENG|SPACON|SPATEC|access|ZTA)-[0-9]{3,6})\b
```

To extend to additional projects, modify the `--jira-prefixes` argument (step1, step2).
Default: `APP2,APP,ENG,SPACON,SPATEC,access,ZTA`

---

## Example Full Agent Workflow

```
# 0. Set up variables (do this once per analysis)
SCRIPTS=agent-assets/scripts/release-helpers   # adjust if not at workspace root
WORKDIR=/tmp/rd_spa-onprem-service_release-hybrid-2601
mkdir -p $WORKDIR

# --- OLDER BRANCH (release/hybrid/2511) ---
# Call MCP: list_commits(owner, repo, sha="release/hybrid/2511", perPage=100, page=1)
# MCP output saved to: /var/folders/.../content.json  (use that path as --input)
python3 $SCRIPTS/step1_ingest_branch.py --mode older --input "/var/folders/.../content.json" --workdir $WORKDIR --page 1
# If "Need more: YES" → call MCP page=2, process again, repeat until "Need more: NO"

# --- NEWER BRANCH (release/hybrid/2601) ---
# Call MCP: list_commits(owner, repo, sha="release/hybrid/2601", perPage=100, page=1)
python3 $SCRIPTS/step1_ingest_branch.py --mode newer --input "/var/folders/.../content.json" --workdir $WORKDIR --page 1
# If "Divergence found: NO" → call MCP page=2, process again, repeat until divergence

# --- CLASSIFY ---
python3 $SCRIPTS/step2_classify.py --workdir $WORKDIR
# Read jira_ids.txt → batch into groups of 40 for MCP JQL queries

# --- JIRA LOOKUP ---
# Call MCP: searchJiraIssuesUsingJql(cloudId, "key in (APP2-1, APP-2, ...)", fields=[...])
python3 $SCRIPTS/step3_ingest_jira.py --input "/var/folders/.../content.json" --workdir $WORKDIR
# Repeat for each batch until step3 --status shows 100% coverage

# --- BUILD REPORT ---
python3 $SCRIPTS/step4_build_report.py \
  --newer-branch release/hybrid/2601 \
  --older-branch release/hybrid/2511 \
  --repo target repository/spa-onprem-service \
  --jira-base-url https://example.atlassian.net \
  --workdir $WORKDIR \
  --output $WORKDIR/report.md
```

---

## Real-World Example: access-ui-navigation-mfe (2605.1 vs 2602.3)

This example is from a live analysis comparing `release/2605.1` (Mar 2026) against
`release/2602.3` (Feb 2026) in `target repository/access-ui-navigation-mfe`.

**Branch characteristics:**
- Older branch (`release/2602.3`) had 3 pages of commits (page 3 partially full)
- Newer branch (`release/2605.1`) diverged at page 1 — only 1 MCP call needed for newer
- Divergence SHA: `ca809bef` — `APP-30004 Update OnPremMfe to SetUp mfe (#581)` — 2025-12-05
- Delta: 31 commits unique to `release/2605.1`
- JIRA IDs found: 15 unique IDs (all `APP-*` or `APP2-*`)

**Command sequence used:**
```
WORKDIR=/tmp/rd_navmfe
mkdir -p $WORKDIR

# Older branch — 3 pages (page 3 had <100 commits = done)
python3 step1_ingest_branch.py --mode older --input older_p1.json --workdir $WORKDIR --page 1
python3 step1_ingest_branch.py --mode older --input older_p2.json --workdir $WORKDIR --page 2
python3 step1_ingest_branch.py --mode older --input older_p3.json --workdir $WORKDIR --page 3
# → Need more: NO

# Newer branch — divergence found at page 1
python3 step1_ingest_branch.py --mode newer --input newer_p1.json --workdir $WORKDIR --page 1
# → Divergence found: YES — SHA ca809bef

# Classify
python3 step2_classify.py --workdir $WORKDIR
# → 15 unique JIRA IDs; 1 JQL batch needed

# JIRA lookup (one batch covered all 15 IDs)
python3 step3_ingest_jira.py --input jira_batch1.json --workdir $WORKDIR

# Build report
python3 step4_build_report.py \
  --newer-branch release/2605.1 \
  --older-branch release/2602.3 \
  --repo target repository/access-ui-navigation-mfe \
  --workdir $WORKDIR \
  --output $WORKDIR/delta_report.md
```

**Findings:** 5 bugs -- 3 OK (Fix Version set), 2 HIGH (Fix Version missing); 10 stories/tasks.
