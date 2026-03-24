"""
Update Manager module — checks for available app updates via Sparkle feeds
and flags abandoned applications (inactive > 2 years).
"""
import os
import plistlib
import urllib.request
import urllib.error
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta

HOME = os.path.expanduser('~')
TARGET_DIRS = [
    '/Applications',
    os.path.join(HOME, 'Applications'),
]

# Time horizon for "Abandoned" (2 years)
TWO_YEARS_DAYS = 365 * 2

def get_sparkle_update(feed_url: str, current_version: str) -> dict:
    """Fetches a Sparkle appcast XML and finds the newest version."""
    try:
        # Use a generic user agent to prevent 403s
        req = urllib.request.Request(feed_url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=5) as response:
            xml_data = response.read()
            
        root = ET.fromstring(xml_data)
        
        # Find the first <item> in the <channel>
        channel = root.find('channel')
        if channel is None:
            return None
            
        item = channel.find('item')
        if item is None:
            return None
            
        enclosure = item.find('enclosure')
        if enclosure is None:
            return None
            
        # Sparkle attributes are namespaced, but ElementTree handles namespaces awkwardly.
        # We'll just look through the raw attributes.
        latest_version = enclosure.attrib.get('{http://www.andymatuschak.org/xml-namespaces/sparkle}shortVersionString')
        if not latest_version:
            latest_version = enclosure.attrib.get('{http://www.andymatuschak.org/xml-namespaces/sparkle}version')
            
        # Optional: release notes
        release_notes_node = item.find('{http://www.andymatuschak.org/xml-namespaces/sparkle}releaseNotesLink')
        release_notes = release_notes_node.text if release_notes_node is not None else None
            
        if latest_version and latest_version != current_version:
            return {
                'available': latest_version,
                'releaseNotes': release_notes
            }
            
    except Exception:
        pass
    return None

def scan(options: dict = None) -> dict:
    results = []
    
    cutoff_date = datetime.now() - timedelta(days=TWO_YEARS_DAYS)
    
    for app_dir in TARGET_DIRS:
        if not os.path.isdir(app_dir):
            continue
            
        for entry in os.scandir(app_dir):
            if not entry.name.endswith('.app') or not entry.is_dir(follow_symlinks=False):
                continue
                
            info_plist = os.path.join(entry.path, 'Contents', 'Info.plist')
            if not os.path.isfile(info_plist):
                continue
                
            try:
                with open(info_plist, 'rb') as f:
                    plist = plistlib.load(f)
                    
                name = plist.get('CFBundleName', entry.name.replace('.app', ''))
                version = plist.get('CFBundleShortVersionString', plist.get('CFBundleVersion', 'Unknown'))
                feed_url = plist.get('SUFeedURL')
                
                # Check source / app store
                is_app_store = os.path.isdir(os.path.join(entry.path, 'Contents', '_MASReceipt'))
                
                update_info = None
                status = 'Up to Date'
                
                if feed_url:
                    update_info = get_sparkle_update(feed_url, version)
                    if update_info:
                        status = 'Update Available'
                        
                elif is_app_store:
                    status = 'Mac App Store'
                else:
                    status = 'Unknown Source'
                    
                # Check if abandoned (modification date of the bundle)
                # Instead of mdls which is slow, we check the stat st_mtime of Info.plist
                mtime = os.stat(info_plist).st_mtime
                mod_date = datetime.fromtimestamp(mtime)
                
                is_abandoned = False
                if mod_date < cutoff_date:
                    is_abandoned = True
                    if status not in ['Update Available', 'Mac App Store']:
                        status = 'Abandoned (No updates > 2yrs)'
                        
                results.append({
                    'name': name,
                    'path': entry.path,
                    'currentVersion': version,
                    'status': status,
                    'isAppStore': is_app_store,
                    'isAbandoned': is_abandoned,
                    'updateAvailable': update_info['available'] if update_info else None,
                    'releaseNotes': update_info['releaseNotes'] if update_info else None
                })
                
            except Exception:
                pass
                
    # Sort: Updates Available first, then App Store, then Abandoned, etc.
    def sort_key(x):
        if x['updateAvailable']: return 0
        if x['isAbandoned']: return 1
        if x['isAppStore']: return 2
        return 3
        
    results.sort(key=lambda x: (sort_key(x), x['name']))
    
    return {
        'total': 0,
        'paths': results,
        'count': len(results)
    }

def delete(paths: list) -> dict:
    # Not used for updates.
    return {'freedBytes': 0, 'movedToTrash': False}
