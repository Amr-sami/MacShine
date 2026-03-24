"""
App utilities — gather info about installed macOS applications.
Used by the apps module and the notification system.
"""
from __future__ import annotations

import os
import subprocess
import plistlib
from typing import Optional
from utils.sizes import get_dir_size


HOME = os.path.expanduser('~')

# Known support file locations for a given app
SUPPORT_DIRS = [
    os.path.join(HOME, 'Library/Application Support'),
    os.path.join(HOME, 'Library/Containers'),
    os.path.join(HOME, 'Library/Caches'),
    os.path.join(HOME, 'Library/Preferences'),
    os.path.join(HOME, 'Library/Logs'),
    os.path.join(HOME, 'Library/Saved Application State'),
    os.path.join(HOME, 'Library/WebKit'),
    os.path.join(HOME, 'Library/HTTPStorages'),
    os.path.join(HOME, 'Library/Group Containers'),
]


def get_app_info(app_path: str) -> dict:
    """Read app Info.plist and return name, version, bundleId."""
    info_plist = os.path.join(app_path, 'Contents', 'Info.plist')
    result = {
        'name': os.path.basename(app_path).replace('.app', ''),
        'path': app_path,
        'version': '',
        'bundleId': '',
    }

    try:
        with open(info_plist, 'rb') as f:
            plist = plistlib.load(f)
        result['name'] = plist.get('CFBundleName', result['name'])
        result['version'] = plist.get('CFBundleShortVersionString', plist.get('CFBundleVersion', ''))
        result['bundleId'] = plist.get('CFBundleIdentifier', '')
    except Exception:
        pass

    return result


def get_last_used_date(app_path: str) -> str | None:
    """Use mdls to get the last used date of an app."""
    try:
        result = subprocess.run(
            ['mdls', '-name', 'kMDItemLastUsedDate', '-raw', app_path],
            capture_output=True, text=True, timeout=5
        )
        value = result.stdout.strip()
        if value and value != '(null)':
            return value
    except (subprocess.TimeoutExpired, OSError):
        pass
    return None


def get_support_files(app_path: str, bundle_id: str) -> list[dict]:
    """Find all support files for a given app (by bundle ID and app name)."""
    app_name = os.path.basename(app_path).replace('.app', '')
    found = []

    # Search patterns: bundleId, app name, and common variations
    search_names = set()
    if bundle_id:
        search_names.add(bundle_id)
        # e.g., "com.bohemiancoding.sketch3" -> search for variations
        parts = bundle_id.split('.')
        if len(parts) >= 2:
            search_names.add(parts[-1])  # last segment
    search_names.add(app_name)

    for support_dir in SUPPORT_DIRS:
        if not os.path.isdir(support_dir):
            continue

        try:
            for entry in os.scandir(support_dir):
                entry_name = entry.name
                matched = False

                for pattern in search_names:
                    if pattern.lower() in entry_name.lower():
                        matched = True
                        break

                if matched:
                    try:
                        if entry.is_dir(follow_symlinks=False):
                            size = get_dir_size(entry.path)
                        else:
                            size = entry.stat().st_size
                        found.append({
                            'path': entry.path,
                            'sizeBytes': size,
                            'type': os.path.basename(support_dir),
                        })
                    except (PermissionError, OSError):
                        continue
        except PermissionError:
            continue

    return found


def get_total_size(app_path: str, bundle_id: str) -> int:
    """Compute total disk usage: app bundle + all support files."""
    total = get_dir_size(app_path)
    for sf in get_support_files(app_path, bundle_id):
        total += sf['sizeBytes']
    return total
