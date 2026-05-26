#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
GAME_DIR="$ROOT_DIR/game"

exec python3 "$ROOT_DIR/tools/serve_local.py" \
  --host 127.0.0.1 \
  --port 8765 \
  --root "$GAME_DIR" \
  "$@"
