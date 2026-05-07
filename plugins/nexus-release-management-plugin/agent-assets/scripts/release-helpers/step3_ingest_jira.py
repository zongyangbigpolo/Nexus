"""
step3_ingest_jira.py
====================
Processes one batch of searchJiraIssuesUsingJql MCP output and merges it into
the accumulated jira_results.pkl state file.

Intended to be called once per MCP response batch (20–50 issues typical).

Usage
-----
  python3 step3_ingest_jira.py \\
      --input /path/to/mcp_jira_search_batch1.json \\
      --workdir /tmp/rd_work

Repeat for every batch until all JIRA IDs from jira_ids.txt are covered.
Run step3_ingest_jira.py --status at any point to check coverage.
"""

import argparse
import json
import os
import pickle
import sys


def load_state(path: str) -> dict:
    if os.path.exists(path):
        with open(path, "rb") as f:
            return pickle.load(f)
    return {}


def save_state(path: str, data: dict) -> None:
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "wb") as f:
        pickle.dump(data, f)


def parse_issue(issue: dict) -> dict:
    """Extract a flat dict from a raw JIRA issue object."""
    key = issue["key"]
    fields = issue.get("fields", {})

    itype    = (fields.get("issuetype") or {}).get("name", "?")
    status   = (fields.get("status")    or {}).get("name", "?")
    priority_obj = fields.get("priority")
    priority = priority_obj.get("name", "Unset") if priority_obj else "Unset"
    summary  = fields.get("summary", "?")

    versions    = fields.get("versions",    []) or []
    fix_versions = fields.get("fixVersions", []) or []

    affects  = ", ".join(v["name"] for v in versions    if v.get("name")) or ""
    fix_ver  = ", ".join(v["name"] for v in fix_versions if v.get("name")) or ""

    return {
        "key":        key,
        "summary":    summary,
        "type":       itype,
        "status":     status,
        "priority":   priority,
        "affects":    affects,
        "fix_version": fix_ver,
    }


def main():
    parser = argparse.ArgumentParser(
        description="Merge one batch of JIRA search results into jira_results.pkl."
    )
    parser.add_argument("--input",
                        help="Path to MCP searchJiraIssuesUsingJql JSON output file")
    parser.add_argument("--workdir", default="/tmp/rd_work",
                        help="Directory for state files (default: /tmp/rd_work)")
    parser.add_argument("--status", action="store_true",
                        help="Print coverage status of jira_results.pkl vs jira_ids.txt")
    args = parser.parse_args()

    results_path = os.path.join(args.workdir, "jira_results.pkl")
    ids_path     = os.path.join(args.workdir, "jira_ids.txt")

    issues_map: dict = load_state(results_path)

    if args.status:
        known = set(issues_map.keys())
        if os.path.exists(ids_path):
            with open(ids_path) as f:
                all_ids = {line.strip() for line in f if line.strip()}
            missing = all_ids - known
            print(f"jira_results.pkl: {len(known)} issues loaded")
            print(f"jira_ids.txt    : {len(all_ids)} total IDs")
            print(f"Coverage        : {len(all_ids) - len(missing)}/{len(all_ids)}")
            if missing:
                print(f"\nNot yet queried ({len(missing)}):")
                for jid in sorted(missing):
                    print(f"  {jid}")
            else:
                print("\nAll JIRA IDs covered. Ready for step4_build_report.py.")
        else:
            print(f"jira_results.pkl: {len(known)} issues loaded")
            print(f"jira_ids.txt    : not found (run step2_classify.py first)")
        return

    if not args.input:
        parser.error("--input is required unless --status is used")

    with open(args.input) as f:
        raw = json.load(f)

    # Handle both list of issues and wrapped object
    if isinstance(raw, list):
        issues = raw
    elif isinstance(raw, dict):
        issues = raw.get("issues", raw.get("items", []))
    else:
        print(f"ERROR: unexpected JSON structure in {args.input}", file=sys.stderr)
        sys.exit(1)

    added = 0
    updated = 0
    for issue in issues:
        parsed = parse_issue(issue)
        key = parsed["key"]
        if key in issues_map:
            updated += 1
        else:
            added += 1
        issues_map[key] = parsed

    save_state(results_path, issues_map)

    print(f"Processed {len(issues)} issues from {args.input}")
    print(f"  Added: {added}  |  Updated: {updated}")
    print(f"  Total in jira_results.pkl: {len(issues_map)}")

    # Coverage check if ids file exists
    if os.path.exists(ids_path):
        with open(ids_path) as f:
            all_ids = {line.strip() for line in f if line.strip()}
        covered = all_ids & set(issues_map.keys())
        missing = all_ids - set(issues_map.keys())
        print(f"  Coverage: {len(covered)}/{len(all_ids)} JIRA IDs")
        if missing:
            print(f"  Still needed ({len(missing)}): {', '.join(sorted(missing)[:10])}"
                  + (" ..." if len(missing) > 10 else ""))
        else:
            print("  All JIRA IDs covered. Ready for step4_build_report.py.")

    # Summary by type
    by_type: dict = {}
    for v in issues_map.values():
        t = v.get("type", "?")
        by_type[t] = by_type.get(t, 0) + 1
    type_str = "  |  ".join(f"{t}: {n}" for t, n in sorted(by_type.items()))
    print(f"  By type: {type_str}")


if __name__ == "__main__":
    main()
