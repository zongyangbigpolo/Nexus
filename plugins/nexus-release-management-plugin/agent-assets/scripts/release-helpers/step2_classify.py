"""
step2_classify.py
=================
Reads the older_state.pkl and newer_state.pkl produced by step1_ingest_branch.py
and classifies all JIRA IDs found in the delta commits into two buckets:

  delta_only    -- IDs present only in the newer branch delta
  cherry_picks  -- IDs present in both branches (backports / cherry-picks)

Writes:
  <workdir>/classification.pkl   structured classification data for step4
  <workdir>/jira_ids.txt         flat list of all unique JIRA IDs (feed to MCP JQL)

Usage
-----
  python3 step2_classify.py --workdir /tmp/rd_work

Optional
--------
  python3 step2_classify.py --workdir /tmp/rd_work --batch-size 40
  # Prints batched JQL snippets for pasting into MCP calls
"""

import argparse
import os
import pickle
import sys


def load_state(path: str) -> dict:
    if not os.path.exists(path):
        return None
    with open(path, "rb") as f:
        return pickle.load(f)


def save_state(path: str, data: dict) -> None:
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "wb") as f:
        pickle.dump(data, f)


def main():
    parser = argparse.ArgumentParser(
        description="Classify delta JIRA IDs as delta-only vs cherry-picks."
    )
    parser.add_argument("--workdir", default="/tmp/rd_work",
                        help="Directory for state files (default: /tmp/rd_work)")
    parser.add_argument("--batch-size", type=int, default=40,
                        help="Print JIRA IDs in batches of this size for MCP JQL queries")
    args = parser.parse_args()

    older_path = os.path.join(args.workdir, "older_state.pkl")
    newer_path = os.path.join(args.workdir, "newer_state.pkl")

    older = load_state(older_path)
    newer = load_state(newer_path)

    if older is None:
        print(f"ERROR: {older_path} not found — run step1_ingest_branch.py --mode older first.",
              file=sys.stderr)
        sys.exit(1)
    if newer is None:
        print(f"ERROR: {newer_path} not found — run step1_ingest_branch.py --mode newer first.",
              file=sys.stderr)
        sys.exit(1)
    if not newer.get("done"):
        print("WARNING: newer_state.pkl has done=False — divergence was not confirmed.",
              file=sys.stderr)
        print("  Proceeding with whatever delta_commits have been collected so far.",
              file=sys.stderr)

    older_jira_ids: set = older["jira_ids"]
    delta_jira_id_map: dict = newer["delta_jira_ids"]   # jira_id -> [commit_subjects]
    unique_jira_ids: set = set(delta_jira_id_map.keys())

    delta_only    = unique_jira_ids - older_jira_ids
    cherry_picks  = unique_jira_ids & older_jira_ids

    # Print summary
    print(f"Total unique JIRA IDs in delta :  {len(unique_jira_ids)}")
    print(f"  Delta-only                   :  {len(delta_only)}")
    print(f"  Cherry-picks (in both)       :  {len(cherry_picks)}")

    if newer.get("fallback_warning"):
        print(f"\nWARNING: {newer['fallback_warning']}")

    print()
    print("All delta JIRA IDs:")
    for jid in sorted(unique_jira_ids):
        marker = "  [cherry-pick]" if jid in cherry_picks else ""
        print(f"  {jid}{marker}")

    # Save classification
    cls_path = os.path.join(args.workdir, "classification.pkl")
    save_state(cls_path, {
        "unique":            unique_jira_ids,
        "delta_only":        delta_only,
        "cherry_picks":      cherry_picks,
        "delta_commits":     newer["delta_commits"],
        "jira_id_to_commits": delta_jira_id_map,
        "divergence_sha":    newer.get("divergence_sha"),
        "divergence_commit": newer.get("divergence_commit"),
        "older_head_sha":    older.get("head_sha"),
        "older_head_date":   older.get("head_date"),
    })
    print(f"\nClassification saved to: {cls_path}")

    # Write flat ID list
    ids_path = os.path.join(args.workdir, "jira_ids.txt")
    with open(ids_path, "w") as f:
        for jid in sorted(unique_jira_ids):
            f.write(jid + "\n")
    print(f"JIRA ID list saved to:   {ids_path}")

    # Print MCP JQL batches
    ids_list = sorted(unique_jira_ids)
    batches = [ids_list[i:i + args.batch_size]
               for i in range(0, len(ids_list), args.batch_size)]
    print(f"\nMCP JQL batches (batch-size={args.batch_size}):")
    for i, batch in enumerate(batches, 1):
        jql = "key in (" + ", ".join(batch) + ")"
        print(f"\n  Batch {i}/{len(batches)} ({len(batch)} IDs):")
        print(f"    {jql}")
    print()
    print("Use these JQL strings with searchJiraIssuesUsingJql MCP tool,")
    print("then pass each response file to step3_ingest_jira.py.")


if __name__ == "__main__":
    main()
