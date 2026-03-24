"""
Xcode cleanup module.
DerivedData, Archives, Simulator Devices.
Only shown if Xcode is installed.
"""

import os
import shutil
from utils.sizes import get_dir_size

XCODE_APP = '/Applications/Xcode.app'

XCODE_PATHS = {
    'DerivedData': os.path.expanduser('~/Library/Developer/Xcode/DerivedData'),
    'Archives': os.path.expanduser('~/Library/Developer/Xcode/Archives'),
    'Simulators': os.path.expanduser('~/Library/Developer/CoreSimulator/Devices'),
}

WARNING = (
    'Xcode will rebuild DerivedData on next compile. '
    'Simulator images will re-download when needed.'
)


def scan(options: dict = None) -> dict:
    """Scan Xcode directories. Returns empty if Xcode not installed."""
    if not os.path.isdir(XCODE_APP):
        return {'total': 0, 'paths': [], 'available': False}

    found_paths = []
    total = 0

    for label, xcode_dir in XCODE_PATHS.items():
        if not os.path.isdir(xcode_dir):
            continue

        try:
            for entry in os.scandir(xcode_dir):
                try:
                    size = get_dir_size(entry.path) if entry.is_dir() else entry.stat().st_size
                    if size > 0:
                        found_paths.append({
                            'path': entry.path,
                            'sizeBytes': size,
                            'category': label,
                        })
                        total += size
                except (PermissionError, OSError):
                    continue
        except PermissionError:
            continue

    found_paths.sort(key=lambda x: x['sizeBytes'], reverse=True)

    return {
        'total': total,
        'paths': found_paths,
        'available': True,
        'warning': WARNING,
    }


def delete(paths: list) -> dict:
    """Delete given Xcode artifacts."""
    freed = 0

    for path in paths:
        # Verify path is under an Xcode data dir
        abs_path = os.path.abspath(path)
        valid = any(abs_path.startswith(os.path.abspath(d)) for d in XCODE_PATHS.values())
        if not valid:
            continue

        try:
            if os.path.isdir(path):
                size = get_dir_size(path)
                shutil.rmtree(path)
                freed += size
            elif os.path.isfile(path):
                freed += os.path.getsize(path)
                os.remove(path)
        except (PermissionError, OSError):
            continue

    return {'freedBytes': freed}
