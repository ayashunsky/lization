#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="$ROOT_DIR/tools/serve-local-detached.log"

nohup "$ROOT_DIR/tools/serve-local-linux.sh" "$@" >"$LOG_FILE" 2>&1 &
PID=$!

sleep 0.2

if kill -0 "$PID" 2>/dev/null; then
  printf 'Started detached server (pid %s). Log: %s\n' "$PID" "$LOG_FILE"
  exit 0
fi

if grep -q "Server already running or port" "$LOG_FILE" 2>/dev/null; then
  cat "$LOG_FILE"
  exit 0
fi

printf 'Server exited immediately. Check log: %s\n' "$LOG_FILE" >&2
exit 1
