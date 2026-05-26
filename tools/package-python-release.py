#!/usr/bin/env python3
from __future__ import annotations

import argparse
from pathlib import Path
import zipfile


PLATFORM_LAUNCHERS = {
    "linux": "tools/serve-local-linux.sh",
    "mac": "tools/serve-local-mac.sh",
    "windows": "tools/serve-local-windows.cmd",
}

ROOT_STARTERS = {
    "linux": "start-game-linux.sh",
    "mac": "start-game-mac.command",
    "windows": "start-game-windows.cmd",
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Create a platform-specific zip archive for the Python launcher setup."
    )
    parser.add_argument("platform", choices=sorted(PLATFORM_LAUNCHERS))
    return parser.parse_args()


def add_file(zip_file: zipfile.ZipFile, source: Path, destination: str) -> None:
    info = zipfile.ZipInfo.from_file(source, destination)
    if source.suffix in {".sh", ".command"}:
        info.external_attr = 0o755 << 16
    with source.open("rb") as handle:
        zip_file.writestr(info, handle.read(), compress_type=zipfile.ZIP_DEFLATED)


def main() -> int:
    args = parse_args()
    root_dir = Path(__file__).resolve().parent.parent
    dist_dir = root_dir / "dist"
    dist_dir.mkdir(exist_ok=True)

    package_root = f"Schtroumpfilization-{args.platform}"
    zip_path = dist_dir / f"schtroumpfilization-{args.platform}-python.zip"

    files_to_add = [
        (root_dir / "tools" / "serve_local.py", f"{package_root}/tools/serve_local.py"),
        (
            root_dir / ROOT_STARTERS[args.platform],
            f"{package_root}/{ROOT_STARTERS[args.platform]}",
        ),
        (
            root_dir / PLATFORM_LAUNCHERS[args.platform],
            f"{package_root}/{PLATFORM_LAUNCHERS[args.platform]}",
        ),
    ]

    game_dir = root_dir / "game"
    for source in sorted(game_dir.rglob("*")):
        if source.is_file():
            relative = source.relative_to(root_dir).as_posix()
            files_to_add.append((source, f"{package_root}/{relative}"))

    with zipfile.ZipFile(zip_path, "w") as zip_file:
        for source, destination in files_to_add:
            add_file(zip_file, source, destination)

    print(f"Built {zip_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
