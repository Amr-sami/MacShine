"""
Duplicate file finder.
Scans ~/Downloads, ~/Desktop. Groups by MD5 hash, keeps first occurrence.
Does NOT scan ~/Documents or ~/Pictures.
"""

import os
import hashlib
from collections import defaultdict
from utils.safety import is_safe_to_scan, filter_paths

SCAN_DIRS = [
    os.path.expanduser('~/Downloads'),
    os.path.expanduser('~/Desktop'),
]

# Only hash files >= 1KB to skip tiny files
MIN_SIZE = 1024


def _md5_file(path: str, chunk_size: int = 8192) -> str:
    """Compute MD5 hash of a file."""
    h = hashlib.md5()
    with open(path, 'rb') as f:
        while True:
            chunk = f.read(chunk_size)
            if not chunk:
                break
            h.update(chunk)
    return h.hexdigest()


def scan(options: dict = None, progress_cb=None) -> dict:
    """Find duplicate files by MD5 hash."""
    # Group files by size first (quick filter)
    size_groups: dict[int, list[str]] = defaultdict(list)
    checked = 0

    for scan_dir in SCAN_DIRS:
        if not os.path.isdir(scan_dir):
            continue
        try:
            for root, dirs, files in os.walk(scan_dir):
                if not is_safe_to_scan(root):
                    dirs.clear()
                    continue
                for f in files:
                    fp = os.path.join(root, f)
                    checked += 1

                    if progress_cb and checked % 20 == 0:
                        progress_cb(fp, 0, checked)

                    if not is_safe_to_scan(fp):
                        continue
                    try:
                        size = os.path.getsize(fp)
                        if size >= MIN_SIZE:
                            size_groups[size].append(fp)
                    except (PermissionError, OSError):
                        continue
        except PermissionError:
            continue

    # For groups with same size, compute MD5
    hash_groups: dict[str, list[dict]] = defaultdict(list)

    for size, file_list in size_groups.items():
        if len(file_list) < 2:
            continue
        for fp in file_list:
            try:
                file_hash = _md5_file(fp)
                hash_groups[file_hash].append({
                    'path': fp,
                    'sizeBytes': size,
                    'name': os.path.basename(fp),
                })
            except (PermissionError, OSError):
                continue

    # Filter to only actual duplicates (2+ files with same hash)
    duplicate_groups = []
    total = 0
    paths = []

    for file_hash, group in hash_groups.items():
        if len(group) < 2:
            continue
        # Mark first as "keep", rest as potential deletes
        for i, item in enumerate(group):
            item['isOriginal'] = (i == 0)
            item['groupHash'] = file_hash
            if not item['isOriginal']:
                total += item['sizeBytes']
            paths.append(item)

        duplicate_groups.append({
            'hash': file_hash,
            'count': len(group),
            'fileSize': group[0]['sizeBytes'],
            'files': group,
        })

    return {
        'total': total,
        'paths': paths,
        'groups': duplicate_groups,
        'groupCount': len(duplicate_groups),
    }


def delete(paths: list) -> dict:
    """Delete selected duplicate files."""
    freed = 0
    safe_paths, _ = filter_paths(paths)

    for path in safe_paths:
        try:
            if os.path.isfile(path):
                freed += os.path.getsize(path)
                os.remove(path)
        except (PermissionError, OSError):
            continue

    return {'freedBytes': freed}
