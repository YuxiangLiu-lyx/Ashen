#!/usr/bin/env python3
"""Restore original assets, then serve the game locally."""
import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from restore_archives import ROOT, restore

parser = argparse.ArgumentParser()
parser.add_argument('--port', type=int, default=5173)
args = parser.parse_args()
import json
manifest = ROOT / 'archives/runtime-assets.manifest.json'
spec = json.loads(manifest.read_text(encoding='utf-8'))
missing = [entry['path'] for entry in spec['files'] if not (ROOT / spec['restore_directory'] / entry['path']).is_file()]
if missing:
    restore(manifest)
# When all assets already exist, serve them as-is so current development edits remain usable.
server = ThreadingHTTPServer(('127.0.0.1', args.port), partial(SimpleHTTPRequestHandler, directory=str(ROOT / 'dist')))
print('Ashen: http://127.0.0.1:' + str(args.port), flush=True)
try:
    server.serve_forever()
except KeyboardInterrupt:
    server.server_close()
