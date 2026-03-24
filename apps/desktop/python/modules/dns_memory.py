"""
DNS / Memory module.
Flush DNS cache and run memory purge.
No file deletion — just system commands.
Requires sudo for purge (macOS shows its own auth dialog).
"""

import subprocess


def scan(options: dict = None) -> dict:
    """Report available actions (no files to scan)."""
    return {
        'total': 0,
        'paths': [],
        'actions': [
            {
                'id': 'flush_dns',
                'name': 'Flush DNS Cache',
                'description': 'Clears the DNS resolver cache. Useful if you have DNS issues.',
                'requiresSudo': False,
            },
            {
                'id': 'purge_memory',
                'name': 'Purge Inactive Memory',
                'description': 'Frees up inactive memory. Requires administrator password.',
                'requiresSudo': True,
            },
        ],
    }


def delete(paths: list = None) -> dict:
    """Execute system commands (flush DNS / purge memory)."""
    results = []

    # paths here is actually a list of action IDs
    actions = paths or []

    for action in actions:
        if action == 'flush_dns':
            try:
                result = subprocess.run(
                    ['dscacheutil', '-flushcache'],
                    capture_output=True, text=True, timeout=10
                )
                # Also restart mDNSResponder
                subprocess.run(
                    ['sudo', 'killall', '-HUP', 'mDNSResponder'],
                    capture_output=True, text=True, timeout=10
                )
                results.append({
                    'action': 'flush_dns',
                    'success': result.returncode == 0,
                })
            except (subprocess.TimeoutExpired, OSError) as e:
                results.append({
                    'action': 'flush_dns',
                    'success': False,
                    'error': str(e),
                })

        elif action == 'purge_memory':
            try:
                result = subprocess.run(
                    ['sudo', 'purge'],
                    capture_output=True, text=True, timeout=30
                )
                results.append({
                    'action': 'purge_memory',
                    'success': result.returncode == 0,
                })
            except (subprocess.TimeoutExpired, OSError) as e:
                results.append({
                    'action': 'purge_memory',
                    'success': False,
                    'error': str(e),
                })

    return {'freedBytes': 0, 'results': results}
