"""
Browser cache cleaning module.
Scans Safari, Chrome, Firefox, Edge, Brave cache paths.
Only scans browsers that are actually installed.
"""

import os
import shutil
from utils.safety import is_safe_to_scan, filter_paths
from utils.sizes import get_dir_size

HOME = os.path.expanduser('~')

# Map browser name → (app path to check, list of cache dirs)
BROWSERS = {
    'Safari': {
        'app': '/Applications/Safari.app',
        'caches': [
            os.path.join(HOME, 'Library/Caches/com.apple.Safari'),
            os.path.join(HOME, 'Library/Caches/com.apple.Safari.SearchHelper'),
        ],
    },
    'Chrome': {
        'app': '/Applications/Google Chrome.app',
        'caches': [
            os.path.join(HOME, 'Library/Caches/Google/Chrome'),
            os.path.join(HOME, 'Library/Application Support/Google/Chrome/Default/Cache'),
            os.path.join(HOME, 'Library/Application Support/Google/Chrome/Default/Code Cache'),
        ],
    },
    'Firefox': {
        'app': '/Applications/Firefox.app',
        'caches': [
            os.path.join(HOME, 'Library/Caches/Firefox'),
        ],
    },
    'Edge': {
        'app': '/Applications/Microsoft Edge.app',
        'caches': [
            os.path.join(HOME, 'Library/Caches/Microsoft Edge'),
            os.path.join(HOME, 'Library/Application Support/Microsoft Edge/Default/Cache'),
            os.path.join(HOME, 'Library/Application Support/Microsoft Edge/Default/Code Cache'),
        ],
    },
    'Brave': {
        'app': '/Applications/Brave Browser.app',
        'caches': [
            os.path.join(HOME, 'Library/Caches/BraveSoftware/Brave-Browser'),
            os.path.join(HOME, 'Library/Application Support/BraveSoftware/Brave-Browser/Default/Cache'),
        ],
    },
}

WARNING = 'Close all browsers before cleaning.'


def scan(options: dict = None, progress_cb=None) -> dict:
    """Scan installed browser caches."""
    found_paths = []
    total = 0
    installed_browsers = []
    checked = 0

    for name, info in BROWSERS.items():
        if not os.path.isdir(info['app']):
            continue

        installed_browsers.append(name)

        for cache_dir in info['caches']:
            checked += 1

            if progress_cb:
                progress_cb(cache_dir, 0, checked)

            if not os.path.isdir(cache_dir):
                continue
            if not is_safe_to_scan(cache_dir):
                continue

            size = get_dir_size(cache_dir)
            if size > 0:
                found_paths.append({
                    'path': cache_dir,
                    'sizeBytes': size,
                    'browser': name,
                })
                total += size

    found_paths.sort(key=lambda x: x['sizeBytes'], reverse=True)

    return {
        'total': total,
        'paths': found_paths,
        'installedBrowsers': installed_browsers,
        'warning': WARNING,
    }


def delete(paths: list) -> dict:
    """Delete given browser cache paths."""
    freed = 0
    safe_paths, _ = filter_paths(paths)

    for path in safe_paths:
        try:
            if os.path.isdir(path):
                size = get_dir_size(path)
                shutil.rmtree(path)
                freed += size
        except (PermissionError, OSError):
            continue

    return {'freedBytes': freed}
