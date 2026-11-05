#!/usr/bin/env bash
# Run Atlas Rush Migration 1 issues with their declared Codex models.
set -euo pipefail
REPO='JurajKavka/mission-critical'
LABEL='atlas-rush-m1'
DRY_RUN="${DRY_RUN:-0}"
START_ISSUE="${START_ISSUE:-20}"
fail() { printf 'ERROR: %s\n' "$*" >&2; exit 1; }
need() { command -v "$1" >/dev/null 2>&1 || fail "Missing command: $1"; }
for tool in gh git jq; do need "$tool"; done
if [[ "$DRY_RUN" != 1 ]]; then need codex; need npm; fi
[[ "$START_ISSUE" =~ ^(2[0-9]|3[01])$ ]] || fail 'START_ISSUE must be 20..31'
cd "$(git rev-parse --show-toplevel)"
[[ "$(gh repo view --json nameWithOwner --jq '.nameWithOwner')" == "$REPO" ]] || fail "Run from $REPO"
[[ -z "$(git status --porcelain)" ]] || fail 'Working tree must be clean'
if [[ "$DRY_RUN" != 1 ]]; then
  branch="$(git branch --show-current)"
  [[ -n "$branch" && "$branch" != main && "$branch" != master ]] || fail 'Use a dedicated migration branch, not main'
fi
mapfile -t issue_numbers < <(gh issue list --repo "$REPO" --label "$LABEL" --state all \
  --limit 100 --json number --jq '.[].number' | sort -n)
[[ "${#issue_numbers[@]}" -eq 12 ]] || fail "Expected 12 labeled issues; found ${#issue_numbers[@]}"
for i in "${!issue_numbers[@]}"; do
  [[ "${issue_numbers[$i]}" == "$((i + 20))" ]] || fail 'Expected issues #20-#31'
done

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
if [[ "$DRY_RUN" != 1 ]]; then mkdir -p "$log_dir"; fi
for i in "${!issue_numbers[@]}"; do
  num="${issue_numbers[$i]}"
  [[ "$num" -ge "$START_ISSUE" ]] || continue
  printf '\nIssue #%s: %s | %s / %s\n' "$num" "${titles[$i]}" "${models[$i]}" "${efforts[$i]}"
  [[ "$DRY_RUN" != 1 ]] || continue
  prompt=$(cat <<PROMPT
Implement Atlas Rush Migration 1 sub-issue #$num (parent #17).
Read AGENTS.md, REACT.md, DESIGN.md and root/Atlas Rush READMEs.
Implement only this issue, preserving existing gameplay and unrelated games.
Run relevant tests. Do not push, deploy, change branches or modify remote issues.
Report blockers and failures without claiming completion.

Issue #$num: ${titles[$i]}

${bodies[$i]}
PROMPT
)
  if ! printf '%s\n' "$prompt" | codex exec \
    --model "${models[$i]}" \
    -c "model_reasoning_effort=\"${efforts[$i]}\"" \
    --sandbox workspace-write --ask-for-approval never \
    --output-last-message "$log_dir/issue-$num.txt" -; then
    fail "Codex failed on #$num; see $log_dir/issue-$num.txt"
  fi
  npm run check || fail "Checks failed after #$num"
  npm run build || fail "Build failed after #$num"
  [[ -n "$(git status --porcelain)" ]] || fail "Issue #$num made no file changes"
  git add -A
  git commit -m "atlas-rush: implement issue #$num"
done
echo 'Batch complete: review local commits; no push or deployment performed.'
