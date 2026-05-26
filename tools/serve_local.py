#!/usr/bin/env python3
from __future__ import annotations

import argparse
import errno
import functools
import http.server
import os
import sys
from pathlib import Path


class NoStoreRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self) -> None:
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Serve the game directory over a local HTTP server."
    )
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8765)
    parser.add_argument("--root", required=True)
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    root = Path(args.root).resolve()

    if not root.is_dir():
        print(
            f"Game directory does not exist or is not a directory: {root}",
            file=sys.stderr,
        )
        return 1

    handler = functools.partial(NoStoreRequestHandler, directory=os.fspath(root))
    server_class = http.server.ThreadingHTTPServer
    server_class.allow_reuse_address = True

    try:
        httpd = server_class((args.host, args.port), handler)
    except OSError as error:
        if error.errno == errno.EADDRINUSE:
            print(
                f"Server already running or port {args.port} is busy at "
                f"http://{args.host}:{args.port}/"
            )
            return 0
        print(
            f"Failed to bind http://{args.host}:{args.port}/: {error}",
            file=sys.stderr,
        )
        return 1

    print(f"Serving {root} at http://{args.host}:{args.port}/")

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        httpd.server_close()

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
