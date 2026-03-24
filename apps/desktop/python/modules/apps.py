"""
Apps module — lists installed applications, detects unused apps.
Phase 2: adds uninstall (move to Trash) functionality.
"""

import os
import shutil
import subprocess
from datetime import datetime, timedelta
from utils.apps_utils import get_app_info, get_last_used_date, get_support_files, get_total_size
from utils.sizes import get_dir_size

APP_DIRS = [
    '/Applications',
    os.path.expanduser('~/Applications'),
]

DEFAULT_THRESHOLD_DAYS = 90


def scan(options: dict = None) -> dict:
    """List all installed apps with usage info."""
    options = options or {}
    threshold_days = options.get('unusedAppThresholdDays', DEFAULT_THRESHOLD_DAYS)
    cutoff = datetime.now() - timedelta(days=threshold_days)
    cutoff_str = cutoff.strftime('%Y-%m-%d')

    apps = []
    unused_count = 0
    unused_total_size = 0

    for app_dir in APP_DIRS:
        if not os.path.isdir(app_dir):
            continue

        try:
            for entry in os.scandir(app_dir):
                if not entry.name.endswith('.app'):
                    continue
                if not entry.is_dir(follow_symlinks=False):
                    continue

                try:
                    info = get_app_info(entry.path)
                    last_used = get_last_used_date(entry.path)
                    bundle_size = get_dir_size(entry.path)
                    support_files = get_support_files(entry.path, info['bundleId'])
                    support_size = sum(sf['sizeBytes'] for sf in support_files)
                    total_size = bundle_size + support_size

                    is_unused = False
                    if last_used:
                        # mdls returns dates like "2024-01-15 00:00:00 +0000"
                        try:
                            last_used_date = last_used.split(' ')[0]
                            is_unused = last_used_date < cutoff_str
                        except Exception:
                            pass
                    else:
                        # No last used date — likely never opened
                        is_unused = True

                    app_entry = {
                        'path': entry.path,
                        'name': info['name'],
                        'version': info['version'],
                        'bundleId': info['bundleId'],
                        'sizeBytes': total_size,
                        'bundleSizeBytes': bundle_size,
                        'supportSizeBytes': support_size,
                        'lastUsed': last_used,
                        'isUnused': is_unused,
                        'supportFiles': support_files,
                    }

                    if is_unused:
                        unused_count += 1
                        unused_total_size += total_size

                    apps.append(app_entry)

                except (PermissionError, OSError):
                    continue
        except PermissionError:
            continue

    # Sort: unused first, then by size descending
    apps.sort(key=lambda a: (not a['isUnused'], -a['sizeBytes']))

    return {
        'total': unused_total_size,
        'paths': apps,
        'appCount': len(apps),
        'unusedCount': unused_count,
        'thresholdDays': threshold_days,
    }


def delete(paths: list) -> dict:
    """Move apps and their support files to Trash."""
    freed = 0

    for app_path in paths:
        # Verify it's actually an .app bundle
        if not app_path.endswith('.app') or not os.path.isdir(app_path):
            continue

        # Get support files before deleting
        info = get_app_info(app_path)
        support_files = get_support_files(app_path, info['bundleId'])

        # Move app bundle to Trash via AppleScript (proper Trash behavior)
        try:
            app_size = get_dir_size(app_path)
            result = subprocess.run(
                ['osascript', '-e',
                 f'tell application "Finder" to delete POSIX file "{app_path}"'],
                capture_output=True, text=True, timeout=15
            )
            if result.returncode == 0:
                freed += app_size
        except (subprocess.TimeoutExpired, OSError):
            continue

        # Move support files to Trash
        for sf in support_files:
            try:
                sf_size = sf['sizeBytes']
                result = subprocess.run(
                    ['osascript', '-e',
                     f'tell application "Finder" to delete POSIX file "{sf["path"]}"'],
                    capture_output=True, text=True, timeout=10
                )
                if result.returncode == 0:
                    freed += sf_size
            except (subprocess.TimeoutExpired, OSError):
                continue

    return {'freedBytes': freed, 'movedToTrash': True}
