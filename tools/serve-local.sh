#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
GAME_DIR="$ROOT_DIR/game"
HOST="127.0.0.1"
PORT="8765"

if ! python3 - <<'PY'
import socket
import sys

sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)

try:
    sock.bind(("127.0.0.1", 8765))
except OSError:
    sys.exit(1)
finally:
    sock.close()
PY
then
  printf 'Server already running or port %s is busy at http://%s:%s/\n' "$PORT" "$HOST" "$PORT"
  exit 0
fi

cd "$GAME_DIR"
exec python3 -m http.server "$PORT" --bind "$HOST"
