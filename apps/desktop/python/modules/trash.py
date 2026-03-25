"""
Trash module — ~/.Trash
Shows item count + total size. Warns deletion is permanent.
"""

import os
import shutil
from utils.sizes import get_dir_size, get_file_size


TRASH_DIR = os.path.expanduser('~/.Trash')


def scan(options: dict = None, progress_cb=None) -> dict:
    """Scan Trash and return contents with sizes."""
    found_paths = []
    total = 0
    checked = 0

    if not os.path.isdir(TRASH_DIR):
        return {'total': 0, 'paths': [], 'itemCount': 0, 'warning': 'permanent'}

    try:
        for entry in os.scandir(TRASH_DIR):
            checked += 1

            if progress_cb:
                progress_cb(entry.path, 0, checked)

            try:
                if entry.is_dir(follow_symlinks=False):
                    size = get_dir_size(entry.path)
                else:
                    size = get_file_size(entry.path)

                found_paths.append({
                    'path': entry.path,
                    'sizeBytes': size,
                    'name': entry.name,
                })
                total += size
            except (PermissionError, OSError):
                continue
    except PermissionError:
        pass

    found_paths.sort(key=lambda x: x['sizeBytes'], reverse=True)

    return {
        'total': total,
        'paths': found_paths,
        'itemCount': len(found_paths),
        'warning': 'permanent',
    }


def delete(paths: list) -> dict:
    """Permanently delete given Trash items."""
    freed = 0

    for path in paths:
        # Only allow deletion within ~/.Trash
        if not os.path.abspath(path).startswith(os.path.abspath(TRASH_DIR)):
            continue
        try:
            if os.path.isdir(path):
                size = get_dir_size(path)
                shutil.rmtree(path)
                freed += size
            elif os.path.isfile(path) or os.path.islink(path):
                freed += get_file_size(path)
                os.remove(path)
        except (PermissionError, OSError):
            continue

    return {'freedBytes': freed}
