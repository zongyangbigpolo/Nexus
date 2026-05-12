"""
step1_ingest_branch.py
======================
Processes one page of GitHub list_commits MCP output and updates the pipeline
state file.

Run in --mode older for every page of the older/baseline release branch until
the script reports "Need more: NO".

Run in --mode newer for every page of the newer release branch until the script
reports "Divergence found: YES".

Usage
-----
  python3 step1_ingest_branch.py \\
      --mode  older|newer \\
      --input /path/to/mcp_list_commits_output.json \\
      --workdir /tmp/rd_work \\
      --page  1 \\
      [--jira-prefixes APP2,APP,ENG,SPACON,SPATEC,access,ZTA]

State files written/updated
---------------------------
  older mode  -> <workdir>/older_state.pkl
  newer mode  -> <workdir>/newer_state.pkl  (reads older_state.pkl for SHA set)
"""

import argparse
import json
import os
import pickle
import re
import sys


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def build_jira_pattern(prefixes: str) -> re.Pattern:
    """Return a compiled regex for the given comma-separated JIRA project prefixes.

    Uses a non-capturing group so that re.findall() returns the *full* JIRA ID
    (e.g. "APP2-11092") rather than just the project-key prefix.
    Prefixes are sorted longest-first so that e.g. "APP2" is tried before
    "APP", preventing a partial match on the longer token.
    """
    parts = sorted(
        [re.escape(p.strip()) for p in prefixes.split(",") if p.strip()],
        key=len, reverse=True,
    )
    return re.compile(r"\b(?:" + "|".join(parts) + r")-[0-9]{2,8}\b")


def extract_jira_ids(message: str, pattern: re.Pattern) -> list:
    return pattern.findall(message)


def load_state(path: str) -> dict:
    if os.path.exists(path):
        with open(path, "rb") as f:
            return pickle.load(f)
    return None


def save_state(path: str, state: dict) -> None:
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "wb") as f:
        pickle.dump(state, f)


# ---------------------------------------------------------------------------
# Older branch processing
# ---------------------------------------------------------------------------

def process_older_page(commits: list, state: dict, pattern: re.Pattern) -> dict:
    """Add one page of commits to the older-branch state."""
    if state is None:
        state = {
            "sha_set": set(),
            "jira_ids": set(),
            "commits": [],
            "head_sha": None,
            "head_date": None,
            "pages_fetched": 0,
        }

    for c in commits:
        state["sha_set"].add(c["sha"])
        for jid in extract_jira_ids(c["commit"]["message"], pattern):
            state["jira_ids"].add(jid)
        state["commits"].append(c)

    if state["head_sha"] is None and commits:
        state["head_sha"] = commits[0]["sha"]
        state["head_date"] = commits[0]["commit"]["committer"]["date"]

    state["pages_fetched"] += 1
    return state


# ---------------------------------------------------------------------------
# Newer branch processing
# ---------------------------------------------------------------------------

def process_newer_page(commits: list, state: dict, older_sha_set: set,
                       pattern: re.Pattern) -> dict:
    """
    Process one page of newer-branch commits.
    Appends to delta_commits until a SHA in older_sha_set is encountered.
    Sets state['done'] = True once divergence is found.
    """
    if state is None:
        state = {
            "delta_commits": [],
            "delta_jira_ids": {},   # jira_id -> [commit_subject, ...]
            "divergence_sha": None,
            "divergence_commit": None,
            "done": False,
            "pages_fetched": 0,
            "head_sha": None,
            "head_date": None,
        }

    if state["done"]:
        print("Divergence already found in a previous page — nothing to do.")
        return state

    if state["head_sha"] is None and commits:
        state["head_sha"] = commits[0]["sha"]
        state["head_date"] = commits[0]["commit"]["committer"]["date"]

    for c in commits:
        if c["sha"] in older_sha_set:
            # Found the shared ancestor — divergence point
            state["divergence_sha"] = c["sha"]
            state["divergence_commit"] = c
            state["done"] = True
            subj = c["commit"]["message"].split("\n")[0][:80]
            print(f"\nDivergence found: SHA {c['sha'][:8]}  \"{subj}\"")
            print(f"  Date: {c['commit']['committer']['date'][:10]}")
            break
        else:
            state["delta_commits"].append(c)
            msg = c["commit"]["message"]
            subj = msg.split("\n")[0]
            for jid in extract_jira_ids(msg, pattern):
                state["delta_jira_ids"].setdefault(jid, []).append(subj)

    state["pages_fetched"] += 1
    return state


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(
        description="Ingest one page of list_commits MCP output into pipeline state."
    )
    parser.add_argument("--mode", required=True, choices=["older", "newer"],
                        help="older: build SHA reference set; newer: find delta commits")
    parser.add_argument("--input", required=True,
                        help="Path to MCP list_commits JSON output file")
    parser.add_argument("--workdir", default="/tmp/rd_work",
                        help="Directory for state files (default: /tmp/rd_work)")
    parser.add_argument("--page", type=int, default=1,
                        help="Page number being processed (for display only)")
    parser.add_argument("--jira-prefixes", default="APP2,APP,ENG,SPACON,SPATEC,access,ZTA",
                        help="Comma-separated JIRA project prefixes to match")
    args = parser.parse_args()

    os.makedirs(args.workdir, exist_ok=True)
    pattern = build_jira_pattern(args.jira_prefixes)

    # Load commits from MCP output
    with open(args.input) as f:
        raw = json.load(f)

    # MCP tool may wrap the array in an object — handle both shapes
    if isinstance(raw, list):
        commits = raw
    elif isinstance(raw, dict):
        commits = raw.get("items", raw.get("commits", []))
    else:
        print(f"ERROR: unexpected JSON structure in {args.input}", file=sys.stderr)
        sys.exit(1)

    print(f"[page {args.page}] Loaded {len(commits)} commits from {args.input}")

    if args.mode == "older":
        state_path = os.path.join(args.workdir, "older_state.pkl")
        state = load_state(state_path)
        state = process_older_page(commits, state, pattern)
        save_state(state_path, state)
        need_more = len(commits) == 100  # perPage=100 → more pages if full page returned
        print(f"  Total SHAs: {len(state['sha_set'])}")
        print(f"  Total JIRA IDs in older branch: {len(state['jira_ids'])}")
        print(f"  Last commit SHA:  {state['commits'][-1]['sha'][:12]}")
        print(f"  Last commit date: {state['commits'][-1]['commit']['committer']['date'][:10]}")
        print(f"Need more: {'YES — fetch page ' + str(args.page + 1) if need_more else 'NO — older branch complete'}")

    elif args.mode == "newer":
        older_path = os.path.join(args.workdir, "older_state.pkl")
        older_state = load_state(older_path)
        if older_state is None:
            print(f"ERROR: {older_path} not found — run --mode older first.", file=sys.stderr)
            sys.exit(1)

        state_path = os.path.join(args.workdir, "newer_state.pkl")
        state = load_state(state_path)
        state = process_newer_page(commits, state, older_state["sha_set"], pattern)
        save_state(state_path, state)

        print(f"  Delta commits so far: {len(state['delta_commits'])}")
        print(f"  JIRA IDs in delta:    {len(state['delta_jira_ids'])}")
        if state["done"]:
            print(f"Divergence found: YES — run step2_classify.py next")
        else:
            need_more = len(commits) == 100
            if need_more:
                print(f"Divergence found: NO — fetch page {args.page + 1} and run again")
            else:
                print("WARNING: Exhausted all commits without finding a shared ancestor.")
                print("  Date-cutoff fallback: use older_state['head_date'] as cutoff.")
                print("  Saving state as done=True with warning.")
                state["done"] = True
                state["fallback_warning"] = (
                    "Shared ancestor not found — results may include noise. "
                    f"Date cutoff used: {older_state['head_date']}"
                )
                save_state(state_path, state)


if __name__ == "__main__":
    main()
