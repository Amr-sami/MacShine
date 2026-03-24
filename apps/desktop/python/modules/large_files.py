"""
Large files scanner.
Scans ~/Downloads, ~/Desktop, ~/Movies, ~/Music.
Configurable threshold (default 200 MB). Shows selectable list sorted by size.
Does NOT scan ~/Documents or ~/Pictures (sensitive).
"""

import os
from utils.safety import is_safe_to_scan, filter_paths
from utils.sizes import get_file_size

DEFAULT_THRESHOLD_MB = 200

SCAN_DIRS = [
    os.path.expanduser('~/Downloads'),
    os.path.expanduser('~/Desktop'),
    os.path.expanduser('~/Movies'),
    os.path.expanduser('~/Music'),
]


def scan(options: dict = None) -> dict:
    """Find files above the size threshold."""
    options = options or {}
    threshold_mb = options.get('thresholdMB', DEFAULT_THRESHOLD_MB)
    threshold_bytes = threshold_mb * 1024 * 1024

    found_paths = []
    total = 0

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
                    if not is_safe_to_scan(fp):
                        continue
                    try:
                        size = os.path.getsize(fp)
                        if size >= threshold_bytes:
                            stat = os.stat(fp)
                            found_paths.append({
                                'path': fp,
                                'sizeBytes': size,
                                'name': f,
                                'modifiedAt': stat.st_mtime,
                            })
                            total += size
                    except (PermissionError, OSError):
                        continue
        except PermissionError:
            continue

    # Sort largest first
    found_paths.sort(key=lambda x: x['sizeBytes'], reverse=True)

    return {
        'total': total,
        'paths': found_paths,
        'thresholdMB': threshold_mb,
    }


def delete(paths: list) -> dict:
    """Delete selected large files. User picks which ones."""
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
