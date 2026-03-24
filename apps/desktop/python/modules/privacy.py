"""
Privacy Cleaner module (Pro feature — Phase 3).
Cleans macOS Quarantine DB, QuickLook Cache, Recent Documents, Clipboard, and optionally Safari History.
"""
from __future__ import annotations

import os
import shutil
import subprocess
from utils.sizes import get_dir_size

HOME = os.path.expanduser('~')

DEF_QUICKLOOK = os.path.join(HOME, 'Library/Caches/com.apple.QuickLook.thumbnailcache')
DEF_QUARANTINE = os.path.join(HOME, 'Library/Preferences/com.apple.LaunchServices.QuarantineEventsV2')
DEF_RECENT_DOCS = os.path.join(HOME, 'Library/Application Support/com.apple.sharedfilelist/com.apple.LSSharedFileList.RecentDocuments.sfl3')
DEF_SAFARI_HISTORY = os.path.join(HOME, 'Library/Safari/History.db')


def scan(options: dict = None) -> dict:
    """Scan privacy-related files."""
    options = options or {}
    include_safari = options.get('includeSafariHistory', False)
    
    found_paths = []
    total_bytes = 0

    # 1. QuickLook cache
    if os.path.exists(DEF_QUICKLOOK):
        size = get_dir_size(DEF_QUICKLOOK)
        if size > 0:
            found_paths.append({
                'path': DEF_QUICKLOOK,
                'name': 'QuickLook Thumbnail Cache',
                'sizeBytes': size,
                'type': 'cache'
            })
            total_bytes += size

    # 2. Quarantine DB
    if os.path.exists(DEF_QUARANTINE):
        try:
            size = os.path.getsize(DEF_QUARANTINE)
            if size > 0:
                found_paths.append({
                    'path': DEF_QUARANTINE,
                    'name': 'macOS Quarantine Database',
                    'sizeBytes': size,
                    'type': 'database'
                })
                total_bytes += size
        except OSError:
            pass

    # 3. Recent Documents (SFL3)
    # We can also search for other .sfl* files if needed, but LSSharedFileList is the main one.
    shared_file_list_dir = os.path.dirname(DEF_RECENT_DOCS)
    if os.path.isdir(shared_file_list_dir):
        try:
            for entry in os.scandir(shared_file_list_dir):
                if entry.name.endswith('.sfl3') or entry.name.endswith('.sfl2'):
                    size = entry.stat().st_size
                    if size > 0:
                        found_paths.append({
                            'path': entry.path,
                            'name': f'Recent Items ({entry.name})',
                            'sizeBytes': size,
                            'type': 'preferences'
                        })
                        total_bytes += size
        except OSError:
            pass

    # 4. Safari History (Optional)
    if include_safari and os.path.exists(DEF_SAFARI_HISTORY):
        # Find History.db, History.db-wal, History.db-shm
        safari_dir = os.path.dirname(DEF_SAFARI_HISTORY)
        try:
            for entry in os.scandir(safari_dir):
                if entry.name.startswith('History.db'):
                    size = entry.stat().st_size
                    if size > 0:
                        found_paths.append({
                            'path': entry.path,
                            'name': f'Safari Browsing History ({entry.name})',
                            'sizeBytes': size,
                            'type': 'history'
                        })
                        total_bytes += size
        except OSError:
            pass

    # 5. Clipboard (Virtual size, we don't know exactly without querying, but we can set it to 0 or estimate)
    # We will just represent clipboard as an action without a file path.
    found_paths.append({
        'path': ':clipboard:',
        'name': 'Clear Clipboard',
        'sizeBytes': 0,
        'type': 'system'
    })

    return {
        'total': total_bytes,
        'paths': found_paths,
        'itemCount': len(found_paths)
    }


def delete(paths: list) -> dict:
    """Delete the privacy files and clear clipboard."""
    freed = 0

    for item in paths:
        # Handle dict or string
        path_str = item.get('path') if isinstance(item, dict) else item

        if not path_str:
            continue

        if path_str == ':clipboard:':
            try:
                # Clear macOS clipboard
                subprocess.run('pbcopy < /dev/null', shell=True, check=True)
            except subprocess.CalledProcessError:
                pass
            continue

        if not os.path.exists(path_str):
            continue

        try:
            if os.path.isdir(path_str):
                size = get_dir_size(path_str)
                shutil.rmtree(path_str)
                os.makedirs(path_str, exist_ok=True)  # Recreate empty dir
            else:
                size = os.path.getsize(path_str)
                os.remove(path_str)
            freed += size
        except (PermissionError, OSError):
            continue

    return {'freedBytes': freed}
