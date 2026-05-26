#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MANIFEST_PATH="$ROOT_DIR/tools/serve-local-windows/Cargo.toml"
TARGET_TRIPLE="x86_64-pc-windows-gnullvm"
TARGET_BINARY="$ROOT_DIR/tools/serve-local-windows/target/$TARGET_TRIPLE/release/serve-local-windows.exe"
OUTPUT_DIR="$ROOT_DIR/bin/windows"
OUTPUT_BINARY="$OUTPUT_DIR/serve-local.exe"

if ! rustup target list --installed | grep -qx "$TARGET_TRIPLE"; then
  printf 'Rust target not installed: %s\n' "$TARGET_TRIPLE" >&2
  printf 'Install it with: rustup target add %s\n' "$TARGET_TRIPLE" >&2
  exit 1
fi

cargo build --manifest-path "$MANIFEST_PATH" --release --target "$TARGET_TRIPLE"

mkdir -p "$OUTPUT_DIR"
cp "$TARGET_BINARY" "$OUTPUT_BINARY"

printf 'Built Windows server binary: %s\n' "$OUTPUT_BINARY"
