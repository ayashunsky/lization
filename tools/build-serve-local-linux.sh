#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MANIFEST_PATH="$ROOT_DIR/tools/serve-local-linux/Cargo.toml"
TARGET_BINARY="$ROOT_DIR/tools/serve-local-linux/target/release/serve-local-linux"
OUTPUT_DIR="$ROOT_DIR/bin/linux"
OUTPUT_BINARY="$OUTPUT_DIR/serve-local"

cargo build --manifest-path "$MANIFEST_PATH" --release

mkdir -p "$OUTPUT_DIR"
cp "$TARGET_BINARY" "$OUTPUT_BINARY"
chmod +x "$OUTPUT_BINARY"

printf 'Built Linux server binary: %s\n' "$OUTPUT_BINARY"
