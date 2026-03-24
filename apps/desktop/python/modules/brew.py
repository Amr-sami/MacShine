"""
Homebrew cleanup module.
Only shown if Homebrew is installed.
Actions: brew autoremove, brew cleanup --prune=all
"""

import os
import subprocess
import shutil


def _homebrew_installed() -> bool:
    """Check if Homebrew is installed."""
    try:
        result = subprocess.run(
            ['which', 'brew'], capture_output=True, text=True, timeout=5
        )
        return result.returncode == 0
    except (subprocess.TimeoutExpired, OSError):
        return False


def _get_brew_path() -> str:
    """Get the brew executable path."""
    try:
        result = subprocess.run(
            ['which', 'brew'], capture_output=True, text=True, timeout=5
        )
        return result.stdout.strip()
    except (subprocess.TimeoutExpired, OSError):
        return 'brew'


def scan(options: dict = None) -> dict:
    """Estimate space that can be freed by Homebrew cleanup."""
    if not _homebrew_installed():
        return {'total': 0, 'paths': [], 'available': False}

    brew = _get_brew_path()
    total = 0
    items = []

    # Check cleanup --dry-run
    try:
        result = subprocess.run(
            [brew, 'cleanup', '--dry-run', '-s'],
            capture_output=True, text=True, timeout=60
        )
        if result.returncode == 0 and result.stdout.strip():
            lines = result.stdout.strip().split('\n')
            for line in lines:
                line = line.strip()
                if line and os.path.exists(line):
                    try:
                        if os.path.isdir(line):
                            from utils.sizes import get_dir_size
                            size = get_dir_size(line)
                        else:
                            size = os.path.getsize(line)
                        items.append({
                            'path': line,
                            'sizeBytes': size,
                            'type': 'cleanup',
                        })
                        total += size
                    except OSError:
                        continue
    except (subprocess.TimeoutExpired, OSError):
        pass

    # Check autoremove --dry-run
    try:
        result = subprocess.run(
            [brew, 'autoremove', '--dry-run'],
            capture_output=True, text=True, timeout=30
        )
        if result.returncode == 0 and result.stdout.strip():
            for line in result.stdout.strip().split('\n'):
                line = line.strip()
                if line.startswith('==>'):
                    continue
                if line:
                    items.append({
                        'path': line,
                        'sizeBytes': 0,
                        'type': 'autoremove',
                        'name': line,
                    })
    except (subprocess.TimeoutExpired, OSError):
        pass

    return {
        'total': total,
        'paths': items,
        'available': True,
    }


def delete(paths: list = None) -> dict:
    """Run brew cleanup and autoremove."""
    if not _homebrew_installed():
        return {'freedBytes': 0}

    brew = _get_brew_path()
    freed = 0

    # Get disk usage before
    usage_before = shutil.disk_usage('/').used

    try:
        subprocess.run(
            [brew, 'autoremove'],
            capture_output=True, text=True, timeout=120
        )
    except (subprocess.TimeoutExpired, OSError):
        pass

    try:
        subprocess.run(
            [brew, 'cleanup', '--prune=all', '-s'],
            capture_output=True, text=True, timeout=120
        )
    except (subprocess.TimeoutExpired, OSError):
        pass

    # Calculate actual freed space
    usage_after = shutil.disk_usage('/').used
    freed = max(0, usage_before - usage_after)

    return {'freedBytes': freed}
