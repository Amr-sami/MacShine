"""Disk size helper utilities."""

import os


def get_file_size(path: str) -> int:
    """Get file size in bytes, returns 0 if file doesn't exist."""
    try:
        return os.path.getsize(path)
    except OSError:
        return 0


def get_dir_size(path: str) -> int:
    """Get total size of directory in bytes."""
    total = 0
    try:
        for dirpath, dirnames, filenames in os.walk(path):
            for f in filenames:
                fp = os.path.join(dirpath, f)
                try:
                    total += os.path.getsize(fp)
                except OSError:
                    pass
    except OSError:
        pass
    return total


def format_bytes(size: int) -> str:
    """Human-readable file size."""
    for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
        if size < 1024:
            return f'{size:.1f} {unit}'
        size /= 1024
    return f'{size:.1f} PB'
