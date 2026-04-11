#!/usr/bin/env bash
set -u

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG_DIR="$ROOT_DIR/docs/operations/test-artifacts"
TIMESTAMP="$(date -u +"%Y%m%dT%H%M%SZ")"
LOG_FILE="$LOG_DIR/qa-regression-$TIMESTAMP.log"

mkdir -p "$LOG_DIR"

run_step() {
  local name="$1"
  shift

  echo ""
  echo "===== $name =====" | tee -a "$LOG_FILE"
  "$@" 2>&1 | tee -a "$LOG_FILE"
  local cmd_exit=${PIPESTATUS[0]}

  if [ $cmd_exit -eq 0 ]; then
    echo "[PASS] $name" | tee -a "$LOG_FILE"
  else
    echo "[FAIL] $name (exit=$cmd_exit)" | tee -a "$LOG_FILE"
  fi

  return $cmd_exit
}

overall_exit=0

echo "QA regression run started at $(date -u +"%Y-%m-%dT%H:%M:%SZ")" | tee "$LOG_FILE"

action_backend=(bash -lc "cd '$ROOT_DIR/backend' && npm test")
action_frontend_install=(bash -lc "cd '$ROOT_DIR/frontend' && npm ci --include=dev")
action_frontend_unit=(bash -lc "cd '$ROOT_DIR/frontend' && npm test")
action_frontend_e2e=(bash -lc "cd '$ROOT_DIR/frontend' && npm run test:e2e")

run_step "Backend unit tests" "${action_backend[@]}" || overall_exit=1
run_step "Frontend install (dev deps)" "${action_frontend_install[@]}" || overall_exit=1
run_step "Frontend unit tests" "${action_frontend_unit[@]}" || overall_exit=1
run_step "Frontend E2E tests" "${action_frontend_e2e[@]}" || overall_exit=1

echo "" | tee -a "$LOG_FILE"
if [ $overall_exit -eq 0 ]; then
  echo "QA regression run completed: PASS" | tee -a "$LOG_FILE"
else
  echo "QA regression run completed: FAIL (see $LOG_FILE)" | tee -a "$LOG_FILE"
fi

exit $overall_exit
