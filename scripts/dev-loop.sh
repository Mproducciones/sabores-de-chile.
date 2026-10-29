#!/usr/bin/env bash
set -uo pipefail

# Controlled Claude Code iteration loop. Run from the repository root.
MAX_ITERATIONS="${MAX_ITERATIONS:-5}"
MAX_TURNS="${MAX_TURNS:-12}"

if ! command -v claude >/dev/null 2>&1; then echo "ERROR: Claude Code CLI (claude) is not installed." >&2; exit 1; fi
if ! command -v npm >/dev/null 2>&1; then echo "ERROR: npm is not installed." >&2; exit 1; fi
if ! git rev-parse --show-toplevel >/dev/null 2>&1; then echo "ERROR: Run this script inside the project Git repository." >&2; exit 1; fi
if [[ "$(git branch --show-current)" == "main" || "$(git branch --show-current)" == "master" ]]; then
  echo "ERROR: Switch to a feature branch before starting. The loop will not work on main/master." >&2; exit 1
fi
if [[ -n "$(git status --porcelain)" ]]; then
  echo "ERROR: Working tree is not clean. Commit or stash existing changes before running the loop." >&2; exit 1
fi
if ! [[ "$MAX_ITERATIONS" =~ ^[1-9][0-9]*$ ]]; then echo "ERROR: MAX_ITERATIONS must be a positive integer." >&2; exit 1; fi

LOG_DIR=".loop-logs"
mkdir -p "$LOG_DIR"
LAST_RESULT="No previous iteration."

for ((i=1; i<=MAX_ITERATIONS; i++)); do
  echo
  echo "========== Sabores de Chile loop: iteration $i/$MAX_ITERATIONS =========="
  PROMPT=$(cat <<EOF
You are the implementation agent for the Sabores de Chile restaurant platform.

Read CLAUDE.md and relevant project docs first. Inspect git status and existing code before editing.
Your task is to complete ONE small, high-value implementation task in this iteration. Prefer working application code and tests over adding planning documents.
Prioritize in this order: customer storefront/cart and ethical add-on recommendations; restaurant order/kitchen workflows; inventory and food-waste alerts; tenant-safe backend foundations; payment integration design (never fake a live payment).

Iteration $i of $MAX_ITERATIONS. Previous iteration result: $LAST_RESULT

Rules:
- Preserve the existing React/Vite architecture unless a concrete need justifies a change.
- Do not deploy, push, merge, commit, run remote migrations, or alter production.
- Do not read or expose secrets, tokens, environment values, or private credentials.
- Do not disable auth, RLS, input validation, tests, or security checks.
- Do not install dependencies or modify lockfiles unless necessary; explain why.
- Keep demo data and nonfunctional integrations explicitly labeled as demo.
- Do not claim tests passed unless you ran them.
- Never use destructive shell commands or overwrite user data.
- Do not implement real payment capture without provider credentials, verified official integration docs, and an explicit safe test setup.
- Inspect the current diff before modifying files; preserve prior iteration work.
- If blocked by missing business decisions or credentials, make safe progress elsewhere and document the blocker.
- Do not commit changes. Leave all work for human review.

After implementing, run relevant checks if available. The wrapper will run npm test (if defined) and npm run build.
At the end, output a concise summary, files changed, checks actually run, known risks, and the single next task.
If no safe, useful implementation task remains, output the exact marker LOOP_DONE on its own line.
EOF
  )
  OUT="$LOG_DIR/iteration-$i.log"
  set +e
  claude -p "$PROMPT" --permission-mode acceptEdits --max-turns "$MAX_TURNS" 2>&1 | tee "$OUT"
  CLAUDE_STATUS=${PIPESTATUS[0]}
  set -e
  if grep -q '^LOOP_DONE$' "$OUT"; then echo "Claude marked the loop complete."; break; fi

  TEST_STATUS=0
  npm run test --if-present || TEST_STATUS=$?
  BUILD_STATUS=0
  npm run build || BUILD_STATUS=$?
  LAST_RESULT="Claude exit=$CLAUDE_STATUS; test exit=$TEST_STATUS; build exit=$BUILD_STATUS. Log: $OUT"
  printf '%s\n' "$LAST_RESULT"
  if [[ "$CLAUDE_STATUS" -ne 0 || "$TEST_STATUS" -ne 0 || "$BUILD_STATUS" -ne 0 ]]; then
    echo "A check failed. The next iteration will receive the failure status to attempt a correction."
  fi
done

echo
echo "Loop finished. Review git diff, git status, and logs in $LOG_DIR before committing or deploying."
echo "No commits, pushes, merges, or deployments were performed by this script."
