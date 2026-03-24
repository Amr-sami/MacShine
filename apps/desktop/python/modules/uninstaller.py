"""
Uninstaller module — detects orphaned leftovers from previously deleted apps.
Finds containers, application support files, and preferences that have no
matching installed .app bundle.
"""

import os
import plistlib
from utils.sizes import get_dir_size

HOME = os.path.expanduser('~')

SUPPORT_DIRS = [
    os.path.join(HOME, 'Library/Application Support'),
    os.path.join(HOME, 'Library/Containers'),
    os.path.join(HOME, 'Library/Group Containers'),
    os.path.join(HOME, 'Library/Caches'),
    os.path.join(HOME, 'Library/Preferences'),
]

APP_DIRS = [
    '/Applications',
    os.path.join(HOME, 'Applications'),
]

def get_installed_identifiers() -> set:
    """Returns a set of all installed bundle IDs and app names (lowercase)."""
    installed = set()
    for app_dir in APP_DIRS:
        if not os.path.isdir(app_dir):
            continue
            
        for entry in os.scandir(app_dir):
            if not entry.name.endswith('.app'):
                continue
            
            app_name_lower = entry.name.replace('.app', '').lower()
            installed.add(app_name_lower)
            
            info_plist = os.path.join(entry.path, 'Contents', 'Info.plist')
            if os.path.isfile(info_plist):
                try:
                    with open(info_plist, 'rb') as f:
                        plist = plistlib.load(f)
                        bundle_id = plist.get('CFBundleIdentifier', '')
                        if bundle_id:
                            installed.add(bundle_id.lower())
                            # Add variations
                            parts = bundle_id.split('.')
                            if len(parts) >= 2:
                                installed.add(parts[-1].lower())
                except Exception:
                    pass
    return installed

def scan(options: dict = None) -> dict:
    options = options or {}
    installed_ids = get_installed_identifiers()
    
    orphans = []
    total_freed = 0
    total_count = 0
    
    # Common system domains to ignore even if no direct .app exists
    SYSTEM_WHITELIST = {
        'com.apple',
        'knowledge',
        'crashes',
        'preferences',
        'syspolicyd',
        'coreservices',
        'logs'
    }
    
    for support_dir in SUPPORT_DIRS:
        if not os.path.isdir(support_dir):
            continue
            
        try:
            for entry in os.scandir(support_dir):
                name_lower = entry.name.lower()
                
                # Skip system folders and very common shared files that aren't specific to one app
                if any(name_lower.startswith(w) for w in SYSTEM_WHITELIST):
                    continue
                    
                # Clean up filename for matching (e.g. remove .plist)
                base_name = name_lower.replace('.plist', '').replace('.app', '')
                
                # If the folder/file name matches a known installed app or bundle ID, it's not orphaned
                is_orphaned = True
                for inst_id in installed_ids:
                    if inst_id in base_name or base_name in inst_id:
                        is_orphaned = False
                        break
                
                if is_orphaned:
                    try:
                        # It's an orphan! Calculate its size.
                        size = get_dir_size(entry.path) if entry.is_dir(follow_symlinks=False) else entry.stat().st_size
                        
                        # Only report things that actually take up space to keep the UI clean
                        if size > 1024 * 1024:  # > 1MB
                            orphans.append({
                                'name': entry.name,
                                'path': entry.path,
                                'type': os.path.basename(support_dir),
                                'sizeBytes': size
                            })
                            total_freed += size
                            total_count += 1
                    except (PermissionError, OSError):
                        pass
        except PermissionError:
            pass
            
    # Sort by size largest first
    orphans.sort(key=lambda x: -x['sizeBytes'])
    
    return {
        'total': total_freed,
        'paths': orphans,
        'count': total_count
    }

def delete(paths: list) -> dict:
    from utils.trash import move_to_trash
    return move_to_trash(paths)
