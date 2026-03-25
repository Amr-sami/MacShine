"""
Caches cleaning module.
Scans ~/Library/Caches and /Library/Caches.
Safe to delete — apps rebuild caches automatically.
"""

import os
import shutil
from utils.safety import is_safe_to_scan, filter_paths
from utils.sizes import get_dir_size, get_file_size


CACHE_DIRS = [
    os.path.expanduser('~/Library/Caches'),
    '/Library/Caches',
]


def scan(options: dict = None, progress_cb=None) -> dict:
    """Scan cache directories and return found paths + total size."""
    found_paths = []
    total = 0
    checked = 0

    for cache_dir in CACHE_DIRS:
        if not os.path.isdir(cache_dir):
            continue

        try:
            for entry in os.scandir(cache_dir):
                path = entry.path
                checked += 1

                if progress_cb:
                    progress_cb(path, 0, checked)

                if not is_safe_to_scan(path):
                    continue

                try:
                    if entry.is_dir(follow_symlinks=False):
                        size = get_dir_size(path)
                    else:
                        size = get_file_size(path)

                    if size > 0:
                        found_paths.append({
                            'path': path,
                            'sizeBytes': size,
                        })
                        total += size
                except (PermissionError, OSError):
                    continue
        except PermissionError:
            continue

    # Sort by size descending
    found_paths.sort(key=lambda x: x['sizeBytes'], reverse=True)

    return {'total': total, 'paths': found_paths}


def delete(paths: list) -> dict:
    """Delete given cache paths and return actual bytes freed."""
    freed = 0
    safe_paths, _ = filter_paths(paths)

    for path in safe_paths:
        try:
            if os.path.isdir(path):
                size = get_dir_size(path)
                shutil.rmtree(path)
                freed += size
            elif os.path.isfile(path):
                size = get_file_size(path)
                os.remove(path)
                freed += size
        except (PermissionError, OSError):
            continue

    # Recreate ~/Library/Caches so apps don't crash
    user_cache = os.path.expanduser('~/Library/Caches')
    if not os.path.exists(user_cache):
        os.makedirs(user_cache, exist_ok=True)

    return {'freedBytes': freed}
