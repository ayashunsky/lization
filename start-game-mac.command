#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="$ROOT_DIR/tools/serve-local.log"
URL="http://127.0.0.1:8765/"

nohup "$ROOT_DIR/tools/serve-local-mac.sh" >"$LOG_FILE" 2>&1 &

sleep 0.6

open "$URL" >/dev/null 2>&1 &

exit 0
