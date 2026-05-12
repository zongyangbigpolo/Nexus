"""
step4_build_report.py
=====================
Generates the final Release Delta Markdown report from the pipeline state files.

Reads:
  <workdir>/classification.pkl
  <workdir>/jira_results.pkl

Writes:
  <output>  (default: <workdir>/delta_report.md)

Usage
-----
  python3 step4_build_report.py \\
      --newer-branch release/hybrid/2601 \\
      --older-branch release/hybrid/2511 \\
      --repo csg-organization-secure-private-access/spa-onprem-service \\
      --jira-base-url https://example.atlassian.net \\
      [--workdir /tmp/rd_work] \\
      [--output /tmp/delta_report.md] \\
      [--summary-only] \\
      [--no-cherry-picks]
"""

import argparse
import os
import pickle
import sys


# ---------------------------------------------------------------------------
# Constants / helpers
# ---------------------------------------------------------------------------

DONE_STATES = {"Done", "Resolved", "Closed", "Cancelled", "Canceled", "Won't Do"}

PRIO_ORDER = {
    "Blocker":  0,
    "Critical": 1,
    "Major":    2,
    "Minor":    3,
    "Trivial":  4,
    "Unset":    5,
    "?":        6,
}


def prio_key(jid: str, issues_map: dict) -> int:
    p = issues_map.get(jid, {}).get("priority", "Unset")
    return PRIO_ORDER.get(p, 5)


def jira_link(jid: str, base_url: str) -> str:
    return "[" + jid + "](" + base_url.rstrip("/") + "/browse/" + jid + ")"


def status_fmt(s: str) -> str:
    """Bold non-Done statuses to make anomalies visible."""
    return s if s in DONE_STATES else "**" + s + "**"


def fix_ver_fmt(v: str) -> str:
    return "**(empty)**" if not v else v


def load_state(path: str) -> dict:
    if not os.path.exists(path):
        return None
    with open(path, "rb") as f:
        return pickle.load(f)


# ---------------------------------------------------------------------------
# Report sections
# ---------------------------------------------------------------------------

def section_bugs(bugs_delta: list, bugs_cherry: list, issues_map: dict,
                 base_url: str, newer: str, older: str,
                 include_cherry: bool) -> list:
    lines = []
    lines.append("### Section A -- Bugs")
    lines.append("")

    # A1 -- delta-only
    lines.append(f"#### A1 -- Bugs unique to `{newer}` ({len(bugs_delta)} bugs)")
    lines.append("")
    lines.append("| JIRA ID | Summary | Priority | Status | Affects Version | Fix Version | Classification |")
    lines.append("|---------|---------|----------|--------|----------------|-------------|----------------|")
    for jid in bugs_delta:
        v = issues_map.get(jid, {})
        st = v.get("status", "?")
        fv = fix_ver_fmt(v.get("fix_version", ""))
        if st not in DONE_STATES:
            cl = "**MEDIUM -- status: " + st + "**"
        elif not v.get("fix_version"):
            cl = "**HIGH -- Fix Version missing**"
        else:
            cl = "OK"
        summary = v.get("summary", "?")[:65].replace("|", "-")
        lines.append(
            "| " + jira_link(jid, base_url)
            + " | " + summary
            + " | " + v.get("priority", "?")
            + " | " + status_fmt(st)
            + " | " + (v.get("affects", "") or "--")
            + " | " + fv
            + " | " + cl + " |"
        )

    if include_cherry and bugs_cherry:
        lines.append("")
        lines.append(f"#### A2 -- Bugs also in `{older}` (cherry-picks) ({len(bugs_cherry)} bugs)")
        lines.append("")
        lines.append("| JIRA ID | Summary | Priority | Status | Affects Version | Fix Version | Notes |")
        lines.append("|---------|---------|----------|--------|----------------|-------------|-------|")
        for jid in bugs_cherry:
            v = issues_map.get(jid, {})
            st = v.get("status", "?")
            fv = fix_ver_fmt(v.get("fix_version", ""))
            if st not in DONE_STATES:
                note = "**MEDIUM -- status: " + st + "** -- also in older branch"
            elif not v.get("fix_version"):
                note = "**HIGH -- Fix Version missing** -- also in older branch"
            else:
                note = "OK -- also in older branch"
            summary = v.get("summary", "?")[:65].replace("|", "-")
            lines.append(
                "| " + jira_link(jid, base_url)
                + " | " + summary
                + " | " + v.get("priority", "?")
                + " | " + status_fmt(st)
                + " | " + (v.get("affects", "") or "--")
                + " | " + fv
                + " | " + note + " |"
            )

    return lines


def section_stories(stories_delta: list, stories_cherry: list, issues_map: dict,
                    base_url: str, newer: str, older: str,
                    include_cherry: bool) -> list:
    lines = []
    lines.append("### Section B -- Stories, Epics & Features")
    lines.append("")

    lines.append(f"#### B1 -- Delta-only (unique to `{newer}`) ({len(stories_delta)} items)")
    lines.append("")
    lines.append("| JIRA ID | Summary | Type | Priority | Status | Fix Version |")
    lines.append("|---------|---------|------|----------|--------|-------------|")
    for jid in stories_delta:
        v = issues_map.get(jid, {})
        fv = v.get("fix_version", "") or "--"
        summary = v.get("summary", "?")[:65].replace("|", "-")
        lines.append(
            "| " + jira_link(jid, base_url)
            + " | " + summary
            + " | " + v.get("type", "?")
            + " | " + v.get("priority", "?")
            + " | " + status_fmt(v.get("status", "?"))
            + " | " + fv + " |"
        )

    if include_cherry and stories_cherry:
        lines.append("")
        lines.append(f"#### B2 -- Cherry-picks (also in `{older}`) ({len(stories_cherry)} items)")
        lines.append("")
        lines.append("| JIRA ID | Summary | Type | Priority | Status | Fix Version |")
        lines.append("|---------|---------|------|----------|--------|-------------|")
        for jid in stories_cherry:
            v = issues_map.get(jid, {})
            fv = v.get("fix_version", "") or "--"
            summary = v.get("summary", "?")[:65].replace("|", "-")
            lines.append(
                "| " + jira_link(jid, base_url)
                + " | " + summary
                + " | " + v.get("type", "?")
                + " | " + v.get("priority", "?")
                + " | " + status_fmt(v.get("status", "?"))
                + " | " + fv + " |"
            )

    return lines


def section_risk(bugs_all: list, unique_all: set, issues_map: dict,
                 stories_all: list, base_url: str, older: str) -> tuple:
    """Return (risk_lines, high_missing_fv, open_critical, code_not_done)."""
    high_missing_fv = [
        jid for jid in bugs_all
        if issues_map.get(jid, {}).get("status", "") in DONE_STATES
        and not issues_map.get(jid, {}).get("fix_version", "")
    ]
    open_critical = [
        jid for jid in bugs_all
        if issues_map.get(jid, {}).get("status", "") not in DONE_STATES
        and issues_map.get(jid, {}).get("priority", "") in ("Critical", "Blocker", "Major")
    ]
    code_not_done = sorted([
        jid for jid in unique_all
        if issues_map.get(jid) is not None
        and issues_map[jid].get("status", "") not in DONE_STATES
        and issues_map[jid].get("status", "") not in ("Cancelled", "Canceled")
    ])
    info_no_fv = [
        jid for jid in stories_all
        if issues_map.get(jid, {}).get("status", "") in DONE_STATES
        and not issues_map.get(jid, {}).get("fix_version", "")
    ]

    lines = []
    lines.append("### Risk Summary")
    lines.append("")
    lines.append("| Severity | Risk | Items |")
    lines.append("|----------|------|-------|")

    if high_missing_fv:
        items = ", ".join(jira_link(j, base_url) for j in high_missing_fv)
        lines.append("| **HIGH** | Fixed bugs with no Fix Version | " + items + " |")

    if open_critical:
        items = ", ".join(
            jira_link(j, base_url) + " (" + issues_map[j]["status"] + ")"
            for j in open_critical
        )
        lines.append("| **HIGH** | Open Critical/Major/Blocker bugs | " + items + " |")

    if code_not_done:
        items = ", ".join(
            jira_link(j, base_url) + " ("
            + issues_map[j].get("type", "?") + " -- "
            + issues_map[j].get("status", "?") + ")"
            for j in code_not_done
        )
        lines.append("| **MEDIUM** | Code committed but JIRA not Done | " + items + " |")

    if info_no_fv:
        items = ", ".join(jira_link(j, base_url) for j in info_no_fv[:5])
        if len(info_no_fv) > 5:
            items += " (+" + str(len(info_no_fv) - 5) + " more)"
        lines.append("| INFO | Stories/Tasks with no Fix Version (Done) | " + items + " |")

    return lines, high_missing_fv, open_critical, code_not_done


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(
        description="Generate the Release Delta Markdown report."
    )
    parser.add_argument("--newer-branch", required=True,
                        help="The more recent release branch (e.g. release/hybrid/2601)")
    parser.add_argument("--older-branch", required=True,
                        help="The baseline release branch (e.g. release/hybrid/2511)")
    parser.add_argument("--repo", required=True,
                        help="GitHub repo in owner/repo format")
    parser.add_argument("--jira-base-url", default="https://example.atlassian.net",
                        help="JIRA base URL for issue links (default: https://example.atlassian.net)")
    parser.add_argument("--workdir", default="/tmp/rd_work",
                        help="Directory containing state files (default: /tmp/rd_work)")
    parser.add_argument("--output",
                        help="Path for the output Markdown file "
                             "(default: <workdir>/delta_report.md)")
    parser.add_argument("--summary-only", action="store_true",
                        help="Emit only counts + risk summary, not full tables")
    parser.add_argument("--no-cherry-picks", action="store_true",
                        help="Omit Section A2/B2 (cherry-pick tables) from output")
    args = parser.parse_args()

    output_path = args.output or os.path.join(args.workdir, "delta_report.md")
    base_url    = args.jira_base_url.rstrip("/")
    include_cp  = not args.no_cherry_picks

    # Load state
    cls_path     = os.path.join(args.workdir, "classification.pkl")
    results_path = os.path.join(args.workdir, "jira_results.pkl")

    cls = load_state(cls_path)
    if cls is None:
        print(f"ERROR: {cls_path} not found — run step2_classify.py first.", file=sys.stderr)
        sys.exit(1)

    issues_map: dict = load_state(results_path) or {}
    if not issues_map:
        print(f"WARNING: {results_path} is empty — run step3_ingest_jira.py first.",
              file=sys.stderr)

    delta_only    = cls["delta_only"]
    cherry_picks  = cls["cherry_picks"]
    unique_all    = cls["unique"]
    delta_commits = cls["delta_commits"]
    div_sha      = cls.get("divergence_sha") or ""
    div_commit   = cls.get("divergence_commit")

    div_sha_short = div_sha[:8] if div_sha else "unknown"
    if div_commit:
        div_subj = div_commit["commit"]["message"].split("\n")[0][:70]
        div_date = div_commit["commit"]["committer"]["date"][:10]
    else:
        div_subj = "unknown"
        div_date = "unknown"

    # Sort helpers
    def bug_prio(jid):
        return prio_key(jid, issues_map)

    # IDs with no JIRA data (inaccessible project, permission, etc.) — kept separate
    not_found_delta  = sorted([k for k in delta_only  if k not in issues_map])
    not_found_cherry = sorted([k for k in cherry_picks if k not in issues_map])

    bugs_delta_only  = sorted([k for k in delta_only   if issues_map.get(k, {}).get("type") == "Bug"], key=bug_prio)
    bugs_cherry      = sorted([k for k in cherry_picks  if issues_map.get(k, {}).get("type") == "Bug"], key=bug_prio)
    stories_delta    = sorted([k for k in delta_only   if k in issues_map and issues_map[k].get("type") != "Bug"])
    stories_cherry   = sorted([k for k in cherry_picks  if k in issues_map and issues_map[k].get("type") != "Bug"])

    bugs_all    = bugs_delta_only + bugs_cherry
    stories_all = stories_delta + stories_cherry
    not_found_all = not_found_delta + not_found_cherry

    # Risk analysis
    risk_lines, high_missing_fv, open_critical, code_not_done = section_risk(
        bugs_all, unique_all, issues_map, stories_all, base_url, args.older_branch
    )

    # Build report
    lines = []
    lines.append("## Release Delta Report: `" + args.newer_branch + "` vs `" + args.older_branch + "`")
    lines.append("")
    lines.append("**Repo:** `" + args.repo + "`")
    lines.append("**Divergence point:** SHA `" + div_sha_short + "` -- `" + div_subj + "` -- " + div_date)
    lines.append("**Delta:** " + str(len(delta_commits)) + " commits unique to `" + args.newer_branch + "`")
    if cls.get("divergence_sha") is None:
        lines.append("")
        lines.append("> WARNING: Shared ancestor not found. Results may include noise.")
    lines.append("")
    lines.append("---")
    lines.append("")

    if not args.summary_only:
        lines += section_bugs(bugs_delta_only, bugs_cherry, issues_map,
                               base_url, args.newer_branch, args.older_branch, include_cp)
        lines.append("")
        lines.append("---")
        lines.append("")
        lines += section_stories(stories_delta, stories_cherry, issues_map,
                                  base_url, args.newer_branch, args.older_branch, include_cp)
        lines.append("")
        lines.append("---")
        lines.append("")

    lines += risk_lines
    lines.append("")

    # Not-found IDs section (accessible only after risk_lines so we have context)
    if not_found_all:
        lines.append("### Section C -- JIRA IDs Not Accessible")
        lines.append("")
        lines.append("> These IDs appear in commit messages but could not be retrieved from JIRA.")
        lines.append("> Possible causes: different project (e.g. DPS, CWA), permission restrictions,")
        lines.append("> or IDs referenced in squash-merge bodies from other repos.")
        lines.append("")
        lines.append("| JIRA ID | Notes |")
        lines.append("|---------|-------|")
        for jid in sorted(not_found_delta):
            lines.append("| " + jira_link(jid, base_url) + " | delta-only -- not in JIRA results |")
        for jid in sorted(not_found_cherry):
            lines.append("| " + jira_link(jid, base_url) + " | cherry-pick -- not in JIRA results |")
        lines.append("")
        lines.append("---")
        lines.append("")

    # Summary counts
    lines.append("### Summary Counts")
    lines.append("")
    lines.append("| Category | Count |")
    lines.append("|----------|-------|")
    lines.append("| Total delta commits (unique to `" + args.newer_branch + "`) | " + str(len(delta_commits)) + " |")
    lines.append("| Total unique JIRA IDs | " + str(len(unique_all)) + " |")
    lines.append("| Delta-only JIRA IDs | " + str(len(delta_only)) + " |")
    lines.append("| Cherry-picks (also in `" + args.older_branch + "`) | " + str(len(cherry_picks)) + " |")
    lines.append("| Bugs -- delta-only | " + str(len(bugs_delta_only)) + " |")
    lines.append("| Bugs -- cherry-picks | " + str(len(bugs_cherry)) + " |")
    lines.append("| **Fixed bugs missing Fix Version** | **" + str(len(high_missing_fv)) + " (HIGH)** |")
    lines.append("| Issues code-committed but not Done | " + str(len(code_not_done)) + " |")
    if not_found_all:
        lines.append("| IDs not accessible in JIRA | " + str(len(not_found_all)) + " (see Section C) |")
    lines.append("")
    lines.append("---")
    lines.append("")

    # Recommended actions
    lines.append("### Recommended Actions")
    lines.append("")
    n = 1
    if high_missing_fv:
        lines.append(str(n) + ". **Add Fix Versions** on " + str(len(high_missing_fv))
                     + " fixed bugs with empty Fix Version -- hand off to `jira-manager`.")
        n += 1
    if open_critical:
        lines.append(str(n) + ". **Audit open Critical/Major bugs** (" + str(len(open_critical))
                     + " found) -- potential release blockers -- hand off to `bugfix`.")
        n += 1
    if code_not_done:
        lines.append(str(n) + ". **Resolve JIRA status mismatches** -- " + str(len(code_not_done))
                     + " issues have code committed but are not Done -- confirm with team.")
        n += 1
    if not_found_all:
        lines.append(str(n) + ". **Review Section C** -- " + str(len(not_found_all))
                     + " JIRA IDs in commits could not be retrieved (external project or permissions). "
                     + "Re-run step3_ingest_jira.py after adding the correct `--jira-prefixes` or project scope.")
        n += 1
    lines.append(str(n) + ". **Publish this report to Confluence** -- hand off to `article-publisher`.")

    report = "\n".join(lines)

    # Write output
    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    with open(output_path, "w") as f:
        f.write(report)

    print(f"Report written to: {output_path}")
    print(f"  Newer branch  : {args.newer_branch}")
    print(f"  Older branch  : {args.older_branch}")
    print(f"  Total commits : {len(delta_commits)}")
    print(f"  Total JIRAs   : {len(unique_all)}  ({len(bugs_delta_only + bugs_cherry)} bugs / {len(stories_all)} stories)")
    print(f"  HIGH risks    : {len(high_missing_fv)} missing Fix Version, {len(open_critical)} open critical bugs")
    print(f"  MEDIUM risks  : {len(code_not_done)} code-committed but not Done")
    if not_found_all:
        print(f"  Not in JIRA   : {len(not_found_all)} IDs (inaccessible project or permissions -- see Section C)")


if __name__ == "__main__":
    main()
