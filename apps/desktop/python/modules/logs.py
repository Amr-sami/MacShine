"""
Logs cleaning module.
Scans ~/Library/Logs, ~/Library/Logs/DiagnosticReports, /private/var/log.
Skips log files modified in the last 24 hours (might be active).
"""

import os
import time
import shutil
from utils.safety import is_safe_to_scan, filter_paths
from utils.sizes import get_file_size

LOG_DIRS = [
    os.path.expanduser('~/Library/Logs'),
    os.path.expanduser('~/Library/Logs/DiagnosticReports'),
    '/private/var/log',
]

TWENTY_FOUR_HOURS = 24 * 60 * 60


def scan(options: dict = None) -> dict:
    """Scan log directories, skip files modified < 24h ago."""
    found_paths = []
    total = 0
    now = time.time()

    for log_dir in LOG_DIRS:
        if not os.path.isdir(log_dir):
            continue

        try:
            for root, dirs, files in os.walk(log_dir):
                if not is_safe_to_scan(root):
                    dirs.clear()
                    continue

                for f in files:
                    fp = os.path.join(root, f)
                    if not is_safe_to_scan(fp):
                        continue
                    try:
                        stat = os.stat(fp)
                        # Skip recently modified files
                        if now - stat.st_mtime < TWENTY_FOUR_HOURS:
                            continue
                        size = stat.st_size
                        if size > 0:
                            found_paths.append({
                                'path': fp,
                                'sizeBytes': size,
                            })
                            total += size
                    except (PermissionError, OSError):
                        continue
        except PermissionError:
            continue

    found_paths.sort(key=lambda x: x['sizeBytes'], reverse=True)
    return {'total': total, 'paths': found_paths}


def delete(paths: list) -> dict:
    """Delete given log files."""
    freed = 0
    safe_paths, _ = filter_paths(paths)

    for path in safe_paths:
        try:
            if os.path.isdir(path):
                size = sum(
                    os.path.getsize(os.path.join(r, f))
                    for r, _, files in os.walk(path)
                    for f in files
                )
                shutil.rmtree(path)
                freed += size
            elif os.path.isfile(path):
                freed += os.path.getsize(path)
                os.remove(path)
        except (PermissionError, OSError):
            continue

    return {'freedBytes': freed}
