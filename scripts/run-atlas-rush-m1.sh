#!/usr/bin/env bash
# Run Atlas Rush Migration 1 issues with their declared Codex models.
set -euo pipefail
REPO='JurajKavka/mission-critical'
LABEL='atlas-rush-m1'
ARCHITECTURE_DOC='docs/atlas-rush-migration.md'
DRY_RUN="${DRY_RUN:-0}"
START_ISSUE="${START_ISSUE:-20}"
fail() { printf 'ERROR: %s\n' "$*" >&2; exit 1; }
need() { command -v "$1" >/dev/null 2>&1 || fail "Missing command: $1"; }
for tool in gh git jq; do need "$tool"; done
if [[ "$DRY_RUN" != 1 ]]; then need codex; need npm; fi
[[ "$START_ISSUE" =~ ^(2[0-9]|3[01])$ ]] || fail 'START_ISSUE must be 20..31'
repo_root="$(git rev-parse --show-toplevel)"
cd "$repo_root"
result_schema="$repo_root/scripts/atlas-rush-task-result.schema.json"
[[ -f "$result_schema" ]] || fail "Missing result schema: $result_schema"
[[ "$(gh repo view --json nameWithOwner --jq '.nameWithOwner')" == "$REPO" ]] || fail "Run from $REPO"
[[ -z "$(git status --porcelain)" ]] || fail 'Working tree must be clean'
if [[ "$DRY_RUN" != 1 ]]; then
  branch="$(git branch --show-current)"
  [[ -n "$branch" && "$branch" != main && "$branch" != master ]] || fail 'Use a dedicated migration branch, not main'
fi
# Capture API failures before reading the list; Bash 3.2 has no mapfile builtin.
issue_list="$(gh issue list --repo "$REPO" --label "$LABEL" --state all \
  --limit 100 --json number --jq '.[].number' | sort -n)"
issue_numbers=()
while IFS= read -r issue_number; do
  if [[ -n "$issue_number" ]]; then
    issue_numbers+=("$issue_number")
  fi
done <<< "$issue_list"
[[ "${#issue_numbers[@]}" -eq 12 ]] || fail "Expected 12 labeled issues; found ${#issue_numbers[@]}"
for i in "${!issue_numbers[@]}"; do
  [[ "${issue_numbers[$i]}" == "$((i + 20))" ]] || fail 'Expected issues #20-#31'
done
parent_body="$(gh issue view 17 --repo "$REPO" --json body --jq '.body')"
[[ -n "$parent_body" ]] || fail 'Parent issue #17 has no requirements'

# Preflight every issue, failing on missing model/effort rather than silently substituting.
declare -a titles bodies models efforts
for i in "${!issue_numbers[@]}"; do
  num="${issue_numbers[$i]}"
  data="$(gh issue view "$num" --repo "$REPO" --json title,body,state)"
  titles[$i]="$(jq -r '.title' <<< "$data")"
  bodies[$i]="$(jq -r '.body' <<< "$data")"
  state="$(jq -r '.state' <<< "$data")"
  models[$i]="$(sed -n 's/^model:[[:space:]]*//p' <<< "${bodies[$i]}" | head -1 | tr -d '\r')"
  efforts[$i]="$(sed -n 's/^reasoning:[[:space:]]*//p' <<< "${bodies[$i]}" | head -1 | tr -d '\r')"
  order="$(sed -n 's/^order:[[:space:]]*//p' <<< "${bodies[$i]}" | head -1 | tr -d '\r')"
  case "${models[$i]}" in
    gpt-6-astra|gpt-6.1-sol|gpt-6.1-terra) ;;
    *) fail "Invalid model for #$num: ${models[$i]}" ;;
  esac
  case "${efforts[$i]}" in
    low|medium|high|xhigh) ;;
    *) fail "Invalid reasoning for #$num: ${efforts[$i]}" ;;
  esac
  [[ "$order" == "$(printf '%02d/12' "$((i + 1))")" ]] || fail "Invalid order for #$num: $order"
  if [[ "$DRY_RUN" != 1 && "$num" -ge "$START_ISSUE" && "$state" != OPEN ]]; then
    fail "Issue #$num is $state; refusing to rerun closed issue"
  fi
done

log_dir="${ATLAS_LOG_DIR:-${TMPDIR:-/tmp}/atlas-rush-codex-logs}"
if [[ "$DRY_RUN" != 1 ]]; then
  if [[ "$START_ISSUE" -gt 20 ]]; then
    [[ -f "$ARCHITECTURE_DOC" ]] || fail "Resume requires $ARCHITECTURE_DOC from #20"
  fi
  mkdir -p "$log_dir"
  log_dir="$(cd "$log_dir" && pwd -P)"
  [[ "$log_dir" != "$repo_root" && "$log_dir" != "$repo_root/"* ]] || fail 'Keep logs outside the checkout'
  log_dir="$(mktemp -d "$log_dir/run.XXXXXX")"
  printf 'Run reports: %s\n' "$log_dir"
fi

run_test_gate() {
  local script_name="$1" required_from="$2" issue_number="$3"
  if jq -e --arg name "$script_name" '.scripts[$name] | strings | length > 0' package.json >/dev/null; then
    npm run "$script_name" || fail "$script_name failed after #$issue_number"
  elif [[ "$issue_number" -ge "$required_from" ]]; then
    fail "Missing npm run $script_name after #$issue_number (required from #$required_from)"
  fi
}

for i in "${!issue_numbers[@]}"; do
  num="${issue_numbers[$i]}"
  [[ "$num" -ge "$START_ISSUE" ]] || continue
  printf '\nIssue #%s: %s | %s / %s\n' "$num" "${titles[$i]}" "${models[$i]}" "${efforts[$i]}"
  [[ "$DRY_RUN" != 1 ]] || continue
  if [[ "$num" -gt 20 ]]; then
    [[ -f "$ARCHITECTURE_DOC" ]] || fail "Missing shared handoff: $ARCHITECTURE_DOC"
  fi
  starting_head="$(git rev-parse HEAD)"
  result_file="$log_dir/issue-$num.json"
  prompt=$(cat <<PROMPT
Implement Atlas Rush Migration 1 sub-issue #$num (parent #17).
Read AGENTS.md, REACT.md, DESIGN.md and root/Atlas Rush READMEs.
Use $ARCHITECTURE_DOC as the shared architecture and handoff record: create it in #20,
then read it before later tasks and update only decisions, validation and handoff details
affected by this issue. Reuse prior decisions and tooling; do not repeat the full audit.
Implement only this issue, preserving existing gameplay and unrelated games.
Run focused tests while implementing. The runner enforces check/build and all available
test suites before committing. npm run test must run once without watching from #21;
npm run test:e2e must run Playwright without watching from #23 (start with a smoke test).
Do not commit, push, deploy, change branches or modify remote issues.
Return JSON matching the supplied schema, with issue_number $num. Use status complete
only when every acceptance criterion for this issue is met and blockers is empty;
otherwise use blocked and describe missing work. Record actual test results honestly.

Parent #17 requirements (context for this task, not permission to implement later tasks):

$parent_body

Issue #$num: ${titles[$i]}

${bodies[$i]}
PROMPT
)
  if ! printf '%s\n' "$prompt" | codex --ask-for-approval never exec \
    --model "${models[$i]}" \
    -c "model_reasoning_effort=\"${efforts[$i]}\"" \
    --sandbox workspace-write \
    --output-schema "$result_schema" \
    --output-last-message "$result_file" -; then
    fail "Codex failed on #$num; see $log_dir"
  fi
  [[ -f "$result_file" ]] || fail "Missing completion report for #$num"
  if ! jq -e --argjson issue "$num" '
    type == "object" and .issue_number == $issue and .status == "complete"
    and (.blockers | type == "array" and length == 0)
    and (.summary | type == "string" and length > 0)
    and (.tests | type == "array" and all(.[]; type == "string"))
  ' "$result_file" >/dev/null; then
    fail "Issue #$num is blocked or its report is invalid; review $result_file"
  fi
  [[ "$(git branch --show-current)" == "$branch" && "$(git rev-parse HEAD)" == "$starting_head" ]] || fail 'Agent changed branch or created a commit'
  [[ -f "$ARCHITECTURE_DOC" ]] || fail "Issue #$num must preserve $ARCHITECTURE_DOC"
  npm run check || fail "Checks failed after #$num"
  run_test_gate test 21 "$num"
  run_test_gate test:e2e 23 "$num"
  npm run build || fail "Build failed after #$num"
  [[ -n "$(git status --porcelain)" ]] || fail "Issue #$num made no file changes"
  git add -A
  git commit -m "atlas-rush: implement issue #$num"
done
echo 'Batch complete: review local commits; no push or deployment performed.'
