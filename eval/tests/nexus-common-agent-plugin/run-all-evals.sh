#!/usr/bin/env bash
# run-all-evals.sh — Run promptfoo evals for all test suites sequentially.
# Usage: ./run-all-evals.sh [WAIT_SECONDS] [suite1 suite2 ...]
# Default wait between runs: 60 seconds (1 minute)
# Passing no suite names (or an empty list) runs ALL discovered suites.
# Examples:
#   ./run-all-evals.sh                              # all suites, 60s wait
#   ./run-all-evals.sh 30                           # all suites, 30s wait
#   ./run-all-evals.sh 0 task-command bugfix-command # only those two, no wait

set -euo pipefail

WAIT_SECONDS="${1:-60}"
shift || true          # consume WAIT_SECONDS; ignore error if no args at all
INCLUDE=("$@")         # remaining args = suites to include; empty = run all

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Collect all sub-directories (sibling to this script) that contain a promptfooconfig.yaml
SUITES=()
while IFS= read -r suite; do
  SUITES+=("$suite")
done < <(
  for dir in "$SCRIPT_DIR"/*/; do
    [[ -f "$dir/promptfooconfig.yaml" ]] && echo "$(basename "$dir")"
  done | sort
)

# Filter to requested suites when an include list was provided
if [[ ${#INCLUDE[@]} -gt 0 ]]; then
  FILTERED=()
  for suite in "${SUITES[@]}"; do
    for inc in "${INCLUDE[@]}"; do
      if [[ "$suite" == "$inc" ]]; then
        FILTERED+=("$suite")
        break
      fi
    done
  done
  SUITES=("${FILTERED[@]}")
fi

TOTAL="${#SUITES[@]}"
echo "Found $TOTAL eval suite(s). Wait between runs: ${WAIT_SECONDS}s"
echo "========================================================"

for i in "${!SUITES[@]}"; do
  SUITE="${SUITES[$i]}"
  RUN_NUM=$((i + 1))

  echo ""
  echo "[${RUN_NUM}/${TOTAL}] Running: promptfoo eval -c ${SUITE}"
  echo "--------------------------------------------------------"

  (cd "$SCRIPT_DIR" && promptfoo eval -c "$SUITE") || {
    echo "WARNING: eval for '${SUITE}' exited with non-zero status — continuing."
  }

  if [[ $RUN_NUM -lt $TOTAL ]]; then
    echo ""
    echo "Waiting ${WAIT_SECONDS}s before next run..."
    sleep "$WAIT_SECONDS"
  fi
done

echo ""
echo "========================================================"
echo "All $TOTAL eval suite(s) complete."
