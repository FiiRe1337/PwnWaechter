#!/usr/bin/env python3
"""Lokaler Webserver für den Zabbix Template Generator. Keine Drittanbieter-Pakete."""

from __future__ import annotations

import argparse
import http.server
import os
import socketserver
import sys
import webbrowser

ROOT = os.path.dirname(os.path.abspath(__file__))
STATIC = os.path.join(ROOT, "static")


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=STATIC, **kwargs)

    def log_message(self, fmt, *args):
        sys.stderr.write("  " + (fmt % args) + "\n")


def main():
    parser = argparse.ArgumentParser(description="Zabbix Template Generator")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8765)
    parser.add_argument("--no-browser", action="store_true")
    args = parser.parse_args()

    if not os.path.isdir(STATIC):
        sys.exit("static/ fehlt – App unvollständig.")

    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer((args.host, args.port), Handler) as httpd:
        url = f"http://{args.host}:{args.port}/"
        print(f"Zabbix Template Generator: {url}")
        print("Strg+C zum Beenden.")
        if not args.no_browser:
            try:
                webbrowser.open(url)
            except Exception:
                pass
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nGestoppt.")


if __name__ == "__main__":
    main()
