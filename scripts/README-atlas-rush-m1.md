# Atlas Rush Migration 1: local Codex batch runner

Runs the 12 tasks in [parent issue #17](https://github.com/JurajKavka/mission-critical/issues/17), in order (#20–#31). Each issue defines its own `model:`, `reasoning:`, and `order:` fields. The runner passes those settings to `codex exec` without choosing a fallback model.

## Prerequisites

- Bash (macOS/Linux/WSL or Git Bash), Git, `jq`, `npm`, GitHub CLI (`gh`), and Codex CLI.
- Authenticate with `gh auth login` and `codex login`.
- Your Codex account must have access to the model identifiers specified by the GitHub issues.
- Run `npm ci` beforehand in your checkout.
- Use a clean working tree on a **dedicated migration branch**, not `main`.

## Usage

```bash
# Show the tasks and models without running them
DRY_RUN=1 bash scripts/run-atlas-rush-m1.sh

# Run the migration locally on a dedicated branch
git switch -c feat/atlas-rush-migration
bash scripts/run-atlas-rush-m1.sh

# Resume after successfully committing tasks #20-#24
START_ISSUE=25 bash scripts/run-atlas-rush-m1.sh
```

For each task, the runner validates issue metadata, starts one Codex agent with the declared model and reasoning effort, runs `npm run check` and `npm run build`, then creates one **local Git commit**. Execution stops on any command or validation failure, without silently proceeding. Output summaries are saved under `${TMPDIR:-/tmp}/atlas-rush-codex-logs` (override with `ATLAS_LOG_DIR`).

**No automatic push, deployment, issue edits, or pull request creation.** Review the generated code and test output before pushing. A successful build alone does not prove that all migration acceptance criteria are met.

For Windows use WSL or Git Bash, not PowerShell directly.
