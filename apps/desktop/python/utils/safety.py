"""
Safety engine — sensitive path filtering.

Every scan and delete operation runs through this module before executing.
See spec sections 2 (Core Principles) and 6.6 (Safety Engine).
"""

import os
import re
from pathlib import Path

# ── Sensitive paths (never scanned or shown to user) ──────────

SENSITIVE_PATHS = [
    os.path.expanduser('~/.ssh'),
    os.path.expanduser('~/.gnupg'),
    os.path.expanduser('~/Library/Keychains'),
    os.path.expanduser('~/Documents'),
    os.path.expanduser('~/Pictures'),
]

# Paths shown but never auto-selected
PROTECTED_PATHS = [
    os.path.expanduser('~/Downloads'),
    os.path.expanduser('~/Desktop'),
    os.path.expanduser('~/Movies'),
]

# ── Sensitive filename patterns ──────────────────────────────

SENSITIVE_PATTERNS = [
    re.compile(r'.*password.*', re.IGNORECASE),
    re.compile(r'.*secret.*', re.IGNORECASE),
    re.compile(r'.*credentials.*', re.IGNORECASE),
    re.compile(r'.*token.*', re.IGNORECASE),
    re.compile(r'.*\.pem$', re.IGNORECASE),
    re.compile(r'.*\.key$', re.IGNORECASE),
    re.compile(r'.*\.env.*', re.IGNORECASE),
]

# ── iCloud and Time Machine detection ────────────────────────

def _is_icloud_path(path: str) -> bool:
    """Check if path is within iCloud Drive."""
    icloud_dir = os.path.expanduser('~/Library/Mobile Documents')
    return os.path.abspath(path).startswith(os.path.abspath(icloud_dir))


def _is_time_machine_volume(path: str) -> bool:
    """Check if path is on a Time Machine backup volume."""
    abs_path = os.path.abspath(path)
    return (
        abs_path.startswith('/Volumes/') and
        os.path.exists(os.path.join(abs_path.split('/Volumes/')[0], '/Volumes/',
                                     abs_path.split('/Volumes/')[1].split('/')[0],
                                     '.timemachine'))
    ) if '/Volumes/' in abs_path else False


# ── Core filter functions ────────────────────────────────────

def is_safe_to_scan(path: str) -> bool:
    """Returns False if path matches any sensitive rule."""
    abs_path = os.path.abspath(os.path.expanduser(path))

    # Check sensitive directories
    for sensitive in SENSITIVE_PATHS:
        if abs_path.startswith(os.path.abspath(sensitive)):
            return False

    # Check filename patterns
    basename = os.path.basename(abs_path)
    for pattern in SENSITIVE_PATTERNS:
        if pattern.match(basename):
            return False

    # Check iCloud Drive
    if _is_icloud_path(abs_path):
        return False

    return True


def is_safe_to_delete(path: str) -> bool:
    """Stricter than is_safe_to_scan. Also blocks ~/Documents, ~/Pictures."""
    if not is_safe_to_scan(path):
        return False

    abs_path = os.path.abspath(os.path.expanduser(path))

    # Additional blocks for deletion
    blocked_for_delete = [
        os.path.expanduser('~/Documents'),
        os.path.expanduser('~/Pictures'),
    ]

    for blocked in blocked_for_delete:
        if abs_path.startswith(os.path.abspath(blocked)):
            return False

    # Block Time Machine volumes
    if _is_time_machine_volume(abs_path):
        return False

    return True


def filter_paths(paths: list[str]) -> tuple[list[str], list[str]]:
    """Returns (safe_paths, blocked_paths). Blocked paths are silently dropped."""
    safe = []
    blocked = []
    for p in paths:
        if is_safe_to_scan(p):
            safe.append(p)
        else:
            blocked.append(p)
    return safe, blocked


def filter_delete_paths(paths: list[str]) -> tuple[list[str], list[str]]:
    """Stricter filter for deletion. Returns (safe_paths, blocked_paths)."""
    safe = []
    blocked = []
    for p in paths:
        if is_safe_to_delete(p):
            safe.append(p)
        else:
            blocked.append(p)
    return safe, blocked
