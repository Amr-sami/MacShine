"""Permission checking utilities."""

import os


def has_read_permission(path: str) -> bool:
    """Check if current user has read access to the path."""
    return os.access(path, os.R_OK)


def has_write_permission(path: str) -> bool:
    """Check if current user has write access to the path."""
    return os.access(path, os.W_OK)


def check_full_disk_access() -> bool:
    """
    Check if the app has Full Disk Access.
    Tests by reading a path that requires FDA.
    """
    test_paths = [
        os.path.expanduser('~/Library/Mail'),
        os.path.expanduser('~/Library/Safari'),
    ]
    for p in test_paths:
        if os.path.exists(p) and os.access(p, os.R_OK):
            return True
    return False
