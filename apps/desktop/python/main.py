#!/usr/bin/env python3
"""
macclean Python backend — entry point.

Reads newline-delimited JSON requests from stdin,
dispatches to module functions, writes JSON responses to stdout.

Protocol:
  Request:  { "id": "req_xxx", "action": "scan", "module": "caches", "options": {} }
  Progress: { "id": "req_xxx", "type": "progress", "data": { "path": "...", "size": 123 } }
  Result:   { "id": "req_xxx", "type": "result", "data": { "total": 456, "paths": [...] } }
  Error:    { "id": "req_xxx", "type": "error", "message": "..." }
"""

import json
import sys
import traceback

from modules import caches, logs, trash, xcode, browsers
from modules import large_files, duplicates, brew, startup, apps, privacy, dns_memory
from modules import uninstaller, malware, updates, email_cleaner


# ── Module dispatch table ────────────────────────────────────

ACTIONS = {
    'scan_caches': lambda opts: caches.scan(opts),
    'delete_caches': lambda paths: caches.delete(paths),
    'scan_logs': lambda opts: logs.scan(opts),
    'delete_logs': lambda paths: logs.delete(paths),
    'scan_trash': lambda opts: trash.scan(opts),
    'delete_trash': lambda paths: trash.delete(paths),
    'scan_xcode': lambda opts: xcode.scan(opts),
    'delete_xcode': lambda paths: xcode.delete(paths),
    'scan_browsers': lambda opts: browsers.scan(opts),
    'delete_browsers': lambda paths: browsers.delete(paths),
    'scan_large_files': lambda opts: large_files.scan(opts),
    'delete_large_files': lambda paths: large_files.delete(paths),
    'scan_duplicates': lambda opts: duplicates.scan(opts),
    'delete_duplicates': lambda paths: duplicates.delete(paths),
    'scan_brew': lambda opts: brew.scan(opts),
    'delete_brew': lambda paths: brew.delete(paths),
    'scan_startup': lambda opts: startup.scan(opts),
    'delete_startup': lambda paths: startup.delete(paths),
    'scan_apps': lambda opts: apps.scan(opts),
    'delete_apps': lambda paths: apps.delete(paths),
    'scan_privacy': lambda opts: privacy.scan(opts),
    'delete_privacy': lambda paths: privacy.delete(paths),
    'scan_dns_memory': lambda opts: dns_memory.scan(opts),
    'delete_dns_memory': lambda paths: dns_memory.delete(paths),
    'scan_uninstaller': lambda opts: uninstaller.scan(opts),
    'delete_uninstaller': lambda paths: uninstaller.delete(paths),
    'scan_malware': lambda opts: malware.scan(opts),
    'delete_malware': lambda paths: malware.delete(paths),
    'scan_updates': lambda opts: updates.scan(opts),
    'delete_updates': lambda paths: updates.delete(paths),
    'scan_emails': lambda opts: email_cleaner.scan(opts),
    'delete_emails': lambda paths: email_cleaner.delete(paths),
    'get_disk_usage': lambda opts: {
        'totalBytes': shutil.disk_usage('/').total,
        'freeBytes': shutil.disk_usage('/').free,
        'usedBytes': shutil.disk_usage('/').used,
    },
}


def send_response(response: dict) -> None:
    """Write a JSON response to stdout, followed by a newline."""
    sys.stdout.write(json.dumps(response) + '\n')
    sys.stdout.flush()


def handle_request(request: dict) -> None:
    """Dispatch a single request to the appropriate handler."""
    req_id = request.get('id', 'unknown')
    action = request.get('action', '')
    module_name = request.get('module', '')
    options = request.get('options', {})

    try:
        # Special actions
        if action == 'ping':
            send_response({
                'id': req_id,
                'type': 'result',
                'data': {'status': 'ok', 'version': '0.1.0'}
            })
            return

        if action == 'get_disk_usage':
            import shutil
            usage = shutil.disk_usage('/')
            send_response({
                'id': req_id,
                'type': 'result',
                'data': {
                    'totalBytes': usage.total,
                    'freeBytes': usage.free,
                    'usedBytes': usage.used,
                }
            })
            return

        # Module-based actions
        module = MODULE_MAP.get(module_name)
        if not module:
            send_response({
                'id': req_id,
                'type': 'error',
                'message': f'Unknown module: {module_name}'
            })
            return

        if action == 'scan':
            result = module.scan(options)
            send_response({
                'id': req_id,
                'type': 'result',
                'data': result
            })
        elif action == 'delete':
            result = module.delete(options.get('paths', []))
            send_response({
                'id': req_id,
                'type': 'result',
                'data': result
            })
        else:
            send_response({
                'id': req_id,
                'type': 'error',
                'message': f'Unknown action: {action}'
            })

    except PermissionError as e:
        send_response({
            'id': req_id,
            'type': 'error',
            'message': str(e),
            'code': 'permission_denied'
        })
    except Exception as e:
        send_response({
            'id': req_id,
            'type': 'error',
            'message': str(e)
        })
        traceback.print_exc(file=sys.stderr)


def main() -> None:
    """Main loop — read JSON lines from stdin and dispatch."""
    send_response({
        'id': 'init',
        'type': 'result',
        'data': {'status': 'ready', 'version': '0.1.0'}
    })

    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue

        try:
            request = json.loads(line)
            handle_request(request)
        except json.JSONDecodeError as e:
            send_response({
                'id': 'parse_error',
                'type': 'error',
                'message': f'Invalid JSON: {e}'
            })


if __name__ == '__main__':
    main()
