"""
Email Attachment Cleaner module — finds large downloaded email attachments
in the user's macOS Mail folder.
"""

import os
from utils.sizes import get_dir_size

HOME = os.path.expanduser('~')
MAIL_DIR = os.path.join(HOME, 'Library/Mail')

def scan(options: dict = None) -> dict:
    options = options or {}
    
    attachments = []
    total_freed = 0
    total_count = 0
    
    if not os.path.isdir(MAIL_DIR):
        return {'total': 0, 'paths': [], 'count': 0}

    # Walk through the Mail directory looking for "Attachments" folders
    for root, dirs, files in os.walk(MAIL_DIR):
        # We only care about files INSIDE a folder named "Attachments" somewhere in the path
        if 'Attachments' in root.split(os.sep):
            for file in files:
                # Ignore hidden files or small plists
                if file.startswith('.') or file.endswith('.plist'):
                    continue
                    
                path = os.path.join(root, file)
                
                try:
                    size = os.path.getsize(path)
                    
                    # Only show attachments > 1MB to keep it relevant
                    if size > 1024 * 1024:
                        attachments.append({
                            'name': file,
                            'path': path,
                            'type': os.path.splitext(file)[1].upper() or 'Attachment',
                            'sizeBytes': size
                        })
                        total_count += 1
                        total_freed += size
                except OSError:
                    pass
                    
    # Sort largest first
    attachments.sort(key=lambda x: -x['sizeBytes'])
    
    return {
        'total': total_freed,
        'paths': attachments,
        'count': total_count
    }

def delete(paths: list) -> dict:
    from utils.trash import move_to_trash
    return move_to_trash(paths)
