#!/usr/bin/env python3
"""Verify and restore the checked-in, split archives. Python 3.9+, no dependencies."""
import argparse
import hashlib
import json
import shutil
import tarfile
import tempfile
from pathlib import Path, PurePosixPath

ROOT = Path(__file__).resolve().parents[1]

def sha256(path):
    h = hashlib.sha256()
    with path.open('rb') as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b''):
            h.update(block)
    return h.hexdigest()

def restore(manifest_path, verify_only=False):
    spec = json.loads(manifest_path.read_text(encoding='utf-8'))
    destination = ROOT / spec['restore_directory']
    with tempfile.TemporaryDirectory(prefix='ashen-restore-') as temporary:
        archive_path = Path(temporary) / 'archive.tar.gz'
        with archive_path.open('wb') as output:
            for part in spec['parts']:
                path = ROOT / part['path']
                if not path.is_file() or path.stat().st_size != part['bytes'] or sha256(path) != part['sha256']:
                    raise RuntimeError('Missing or corrupt archive part: ' + str(path))
                with path.open('rb') as stream:
                    shutil.copyfileobj(stream, output)
        if sha256(archive_path) != spec['archive_sha256']:
            raise RuntimeError('Combined archive checksum mismatch')
        expected = {entry['path']: entry for entry in spec['files']}
        with tarfile.open(archive_path, 'r:gz') as archive:
            members = archive.getmembers()
            for member in members:
                name = PurePosixPath(member.name)
                if name.is_absolute() or '..' in name.parts or not (member.isdir() or member.isfile() or member.islnk()):
                    raise RuntimeError('Unsafe archive member: ' + member.name)
                if member.islnk():
                    link = PurePosixPath(member.linkname)
                    if link.is_absolute() or '..' in link.parts:
                        raise RuntimeError('Unsafe archive link: ' + member.name)
            file_members = [member for member in members if not member.isdir()]
            if {member.name for member in file_members} != set(expected):
                raise RuntimeError('Archive inventory mismatch')
            # Preflight every existing path before writing anything; preserve local edits.
            for member in file_members:
                target = destination / member.name
                if destination.resolve() not in target.resolve().parents:
                    raise RuntimeError('Unsafe destination: ' + member.name)
                if not verify_only and target.exists() and (not target.is_file() or sha256(target) != expected[member.name]['sha256']):
                    raise RuntimeError('Preserving modified local file: ' + str(target))
            for member in file_members:
                record = expected[member.name]
                stream = archive.extractfile(member)
                if stream is None:
                    raise RuntimeError('Unreadable member: ' + member.name)
                digest = hashlib.sha256()
                target = destination / member.name
                write = not verify_only and not target.exists()
                handle = None
                if write:
                    target.parent.mkdir(parents=True, exist_ok=True)
                    handle = target.open('xb')
                size = 0
                try:
                    for block in iter(lambda: stream.read(1024 * 1024), b''):
                        size += len(block)
                        digest.update(block)
                        if handle:
                            handle.write(block)
                finally:
                    stream.close()
                    if handle:
                        handle.close()
                if size != record['bytes'] or digest.hexdigest() != record['sha256']:
                    if write:
                        target.unlink()
                    raise RuntimeError('Member checksum mismatch: ' + member.name)
    print(('Verified' if verify_only else 'Restored') + ': ' + manifest_path.name + ' (' + str(len(expected)) + ' files)')

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--all', action='store_true', help='Also restore historical originals')
    parser.add_argument('--verify-only', action='store_true')
    args = parser.parse_args()
    names = ['runtime-assets.manifest.json']
    if args.all:
        names.append('library-originals.manifest.json')
    for name in names:
        restore(ROOT / 'archives' / name, args.verify_only)

if __name__ == '__main__':
    main()
