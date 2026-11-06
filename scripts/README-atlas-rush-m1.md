# Atlas Rush Migration 1: local Codex batch runner

Runs the 12 tasks in [parent issue #17](https://github.com/JurajKavka/mission-critical/issues/17), in order (#20–#31). Each issue defines its own `model:`, `reasoning:`, and `order:` fields. The runner passes those settings to `codex exec` without choosing a fallback model.

## Prerequisites

- Bash 3.2 or later (including the macOS system Bash), Git, `jq`, `npm`, GitHub CLI (`gh`), and Codex CLI with `exec --output-schema` support.
- Authenticate with `gh auth login` and `codex login`.
- Your Codex account must have access to the model identifiers specified by the GitHub issues.
- Run `npm ci` beforehand in your checkout.
- Use a clean working tree on a **dedicated migration branch**, not `main`.
- Ensure the sandbox permits the package installation, local server and browser operations needed by the migration. `npm ci` installs current dependencies; tasks #21/#23 introduce new test/React dependencies. Install Playwright browsers once when #23 establishes tooling (or before resuming later tasks). A blocked installation must be resolved before retrying; the runner does not bypass sandbox restrictions.

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

The runner fetches parent #17 once and includes its requirements alongside each child issue. #20 creates `docs/atlas-rush-migration.md`; subsequent tasks reuse and update this fixed architecture/handoff record. Resuming after #20 requires the document to exist. The recommended allocation uses `gpt-6.1-sol` for implementation and `gpt-6-astra` for initial/final review, with the effort controlled by each issue.

For each task, the runner validates issue metadata and starts one Codex agent with the declared model and reasoning effort. The agent must return JSON matching `atlas-rush-task-result.schema.json`: the correct issue number, `status: complete`, a summary, an empty blockers array and test results. Missing, malformed or blocked reports stop execution even when Codex exits successfully. Agents are instructed not to create commits; a changed branch or HEAD stops the runner.

Before creating one **local Git commit**, the runner enforces:

- `npm run check` (TypeScript, ESLint, Prettier and Astro).
- `npm run test` once available, required from #21 onward. #21 establishes Vitest.
- `npm run test:e2e` once available, required from #23 onward. #23 establishes Playwright and an initial smoke test; #28/#30 extend it.
- `npm run build`.

Both test commands must terminate without watch mode. The runner fails if a required command is missing; it never silently skips a required suite. Agents use focused checks during implementation; the runner performs the final gates.

Execution stops on any command or validation failure and leaves uncommitted changes for inspection. Resolve the failure and commit or otherwise reconcile those changes before resuming at that issue; the runner requires a clean checkout and does not reset work. Structured reports are saved in a unique run directory under `${TMPDIR:-/tmp}/atlas-rush-codex-logs` (override the parent with `ATLAS_LOG_DIR`, outside the checkout). This prevents stale reports from satisfying later runs. A completion report is an agent assertion; tests and final review still provide the evidence.

The runner uses the global `--ask-for-approval never` option before `exec` and retains the `workspace-write` sandbox. No model fallback or automatic effort escalation is performed.

**No automatic push, deployment, issue edits, or pull request creation.** Review the generated code and test output before pushing. A successful build alone does not prove that all migration acceptance criteria are met.

For Windows use WSL or Git Bash, not PowerShell directly.

Run the runner's isolated regression checks with `node --test scripts/tests/atlas-rush-runner.test.mjs`. They use mocked GitHub/Codex/npm commands and temporary Git repositories; they do not run the migration or contact remote services.
