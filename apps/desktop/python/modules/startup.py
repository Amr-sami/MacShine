"""
Startup items module.
Lists LaunchAgents and LaunchDaemons.
Phase 2: adds disable/enable functionality via launchctl.
"""

import os
import plistlib
import subprocess

LAUNCH_DIRS = [
    ('User Agent', os.path.expanduser('~/Library/LaunchAgents')),
    ('Global Agent', '/Library/LaunchAgents'),
    ('Global Daemon', '/Library/LaunchDaemons'),
]


def _parse_plist(path: str) -> dict:
    """Parse a launchd plist file and extract useful info."""
    try:
        with open(path, 'rb') as f:
            data = plistlib.load(f)
        return {
            'label': data.get('Label', os.path.basename(path)),
            'program': data.get('Program', ''),
            'programArguments': data.get('ProgramArguments', []),
            'runAtLoad': data.get('RunAtLoad', False),
            'keepAlive': data.get('KeepAlive', False),
            'disabled': data.get('Disabled', False),
        }
    except Exception:
        return {
            'label': os.path.basename(path).replace('.plist', ''),
            'program': '',
            'programArguments': [],
            'runAtLoad': False,
            'keepAlive': False,
            'disabled': False,
        }


def _is_loaded(label: str) -> bool:
    """Check if a launchd service is currently loaded."""
    try:
        result = subprocess.run(
            ['launchctl', 'list', label],
            capture_output=True, text=True, timeout=5
        )
        return result.returncode == 0
    except (subprocess.TimeoutExpired, OSError):
        return False


def scan(options: dict = None) -> dict:
    """List all startup items with enable/disable status."""
    found_paths = []
    total = 0

    for category, launch_dir in LAUNCH_DIRS:
        if not os.path.isdir(launch_dir):
            continue

        try:
            for entry in os.scandir(launch_dir):
                if not entry.name.endswith('.plist'):
                    continue

                try:
                    plist_info = _parse_plist(entry.path)
                    is_loaded = _is_loaded(plist_info['label'])
                    # Only user agents can be disabled
                    can_disable = category == 'User Agent'

                    found_paths.append({
                        'path': entry.path,
                        'sizeBytes': entry.stat().st_size,
                        'category': category,
                        'name': entry.name.replace('.plist', ''),
                        'isLoaded': is_loaded,
                        'canDisable': can_disable,
                        **plist_info,
                    })
                except (PermissionError, OSError):
                    continue
        except PermissionError:
            continue

    return {
        'total': total,
        'paths': found_paths,
        'itemCount': len(found_paths),
    }


def delete(paths: list) -> dict:
    """Disable/enable startup items. paths = list of {action, path} dicts or plist paths."""
    results = []

    for item in paths:
        if isinstance(item, dict):
            action = item.get('action', 'disable')
            plist_path = item.get('path', '')
        else:
            action = 'disable'
            plist_path = item

        if not plist_path or not os.path.exists(plist_path):
            continue

        # Only allow modifying user agents
        user_agents_dir = os.path.expanduser('~/Library/LaunchAgents')
        if not os.path.abspath(plist_path).startswith(os.path.abspath(user_agents_dir)):
            results.append({'path': plist_path, 'success': False, 'error': 'Can only modify user agents'})
            continue

        plist_info = _parse_plist(plist_path)
        label = plist_info['label']

        try:
            if action == 'disable':
                # Unload the service
                subprocess.run(
                    ['launchctl', 'unload', '-w', plist_path],
                    capture_output=True, text=True, timeout=10
                )
                results.append({'path': plist_path, 'action': 'disabled', 'success': True})
            elif action == 'enable':
                # Load the service
                subprocess.run(
                    ['launchctl', 'load', '-w', plist_path],
                    capture_output=True, text=True, timeout=10
                )
                results.append({'path': plist_path, 'action': 'enabled', 'success': True})
        except (subprocess.TimeoutExpired, OSError) as e:
            results.append({'path': plist_path, 'success': False, 'error': str(e)})

    return {'freedBytes': 0, 'results': results}
