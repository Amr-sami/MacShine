import React, { useState, useCallback, useEffect } from 'react';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { UndoToast } from '../components/UndoToast';
import { Loader2, Box, Ghost } from 'lucide-react';

interface AppInfo {
  path: string;
  name: string;
  version: string;
  bundleId: string;
  sizeBytes: number;
  bundleSizeBytes: number;
  supportSizeBytes: number;
  lastUsed: string | null;
  isUnused: boolean;
  supportFiles: { path: string; sizeBytes: number; type: string }[];
}

interface OrphanInfo {
  name: string;
  path: string;
  type: string;
  sizeBytes: number;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'Never';
  try {
    return new Date(dateStr).toLocaleDateString();
  } catch {
    return dateStr.split(' ')[0] || 'Unknown';
  }
}

export function AppManagerPage() {
  const [apps, setApps] = useState<AppInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [expandedApp, setExpandedApp] = useState<string | null>(null);
  const [confirmApp, setConfirmApp] = useState<AppInfo | null>(null);
  const [confirmOrphan, setConfirmOrphan] = useState<OrphanInfo | null>(null);
  const [undoInfo, setUndoInfo] = useState<{ name: string } | null>(null);
  const [filter, setFilter] = useState<'all' | 'unused' | 'orphaned'>('all');
  const [orphans, setOrphans] = useState<OrphanInfo[]>([]);
  const [orphansScanned, setOrphansScanned] = useState(false);

  const scanApps = useCallback(async () => {
    setLoading(true);
    try {
      const result = await window.macclean.scan('apps') as any;
      setApps(result.paths || []);
      setScanned(true);
    } catch (err) {
      console.error('Failed to scan apps:', err);
    }
    setLoading(false);
  }, []);

  const scanOrphans = useCallback(async () => {
    if (orphansScanned) return;
    setLoading(true);
    try {
      const result = await window.macclean.scan('uninstaller') as any;
      setOrphans(result.paths || []);
      setOrphansScanned(true);
    } catch (err) {
      console.error('Failed to scan orphans:', err);
    }
    setLoading(false);
  }, [orphansScanned]);

  useEffect(() => {
    scanApps();
  }, []);

  const uninstallApp = useCallback(async (app: AppInfo) => {
    setConfirmApp(null);
    try {
      await window.macclean.delete('apps', [app.path]);
      setUndoInfo({ name: app.name });
      // Remove from list
      setApps((prev) => prev.filter((a) => a.path !== app.path));
    } catch (err) {
      console.error('Failed to uninstall:', err);
    }
  }, []);

  const deleteOrphan = useCallback(async (orphan: OrphanInfo) => {
    setConfirmOrphan(null);
    try {
      await window.macclean.delete('uninstaller', [orphan.path]);
      setUndoInfo({ name: orphan.name });
      setOrphans((prev) => prev.filter((o) => o.path !== orphan.path));
    } catch (err) {
      console.error('Failed to delete orphan:', err);
    }
  }, []);

  const filteredApps = filter === 'unused' ? apps.filter((a) => a.isUnused) : apps;
  const unusedCount = apps.filter((a) => a.isUnused).length;

  const handleFilterClick = (newFilter: 'all' | 'unused' | 'orphaned') => {
    setFilter(newFilter);
    if (newFilter === 'orphaned' && !orphansScanned) {
      scanOrphans();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-mc-border flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-mc-text">App Manager</h2>
          <p className="text-sm text-mc-muted mt-0.5">
            {filter === 'orphaned' 
              ? (orphansScanned ? `${orphans.length} leftover containers found` : 'Scanning for orphans...')
              : (scanned ? `${apps.length} apps found · ${unusedCount} unused` : 'Scanning installed apps...')}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleFilterClick('all')}
            className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
              filter === 'all' ? 'bg-mc-surface text-mc-text' : 'text-mc-muted hover:text-mc-text'
            }`}
          >
            All ({apps.length})
          </button>
          <button
            onClick={() => handleFilterClick('unused')}
            className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
              filter === 'unused' ? 'bg-mc-warning/20 text-mc-warning' : 'text-mc-muted hover:text-mc-text'
            }`}
          >
            Unused ({unusedCount})
          </button>
          <button
            onClick={() => handleFilterClick('orphaned')}
            className={`px-3 py-1.5 text-xs rounded-lg transition-colors flex items-center gap-1 ${
              filter === 'orphaned' ? 'bg-mc-accent/20 text-mc-accent' : 'text-mc-muted hover:text-mc-text'
            }`}
          >
            Leftovers
            <span className="text-[9px] font-bold text-mc-accent border border-mc-accent/30 bg-mc-accent/10 px-1 rounded uppercase">Pro</span>
          </button>
        </div>
      </div>

      {/* App list */}
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="flex flex-col items-center justify-center h-full text-mc-accent animate-in fade-in duration-300">
            <Loader2 className="w-8 h-8 animate-spin mb-3 drop-shadow-[0_0_15px_rgba(0,229,255,0.3)]" />
            <span className="text-sm font-mono tracking-widest uppercase">Scanning...</span>
          </div>
        )}

        {!loading && filter !== 'orphaned' && filteredApps.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-mc-muted">
            <p className="text-sm">{filter === 'unused' ? 'No unused apps found!' : 'No apps found.'}</p>
          </div>
        )}

        {!loading && filter === 'orphaned' && orphans.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-mc-muted">
            <p className="text-sm">No orphaned leftover containers found! Your Mac is clean.</p>
          </div>
        )}

        {/* Normal Apps View */}
        {!loading && filter !== 'orphaned' && filteredApps.map((app) => (
          <div key={app.path} className="border-b border-mc-border/50">
            <div className="flex items-center gap-4 px-6 py-3 hover:bg-mc-surface/30 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-mc-surface border border-mc-border flex items-center justify-center text-lg flex-shrink-0 shadow-inner">
                <Box className="w-5 h-5 text-mc-muted hover:text-mc-text transition-colors" />
              </div>

              {/* App info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-mc-text truncate">{app.name}</span>
                  {app.version && (
                    <span className="text-xs text-mc-muted">{app.version}</span>
                  )}
                  {app.isUnused && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-mc-warning/15 text-mc-warning font-medium">
                      Unused 90+ days
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-0.5 text-xs text-mc-muted">
                  <span>{formatBytes(app.sizeBytes)}</span>
                  <span>·</span>
                  <span>Last used: {formatDate(app.lastUsed)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => setExpandedApp(expandedApp === app.path ? null : app.path)}
                  className="px-2.5 py-1.5 text-xs text-mc-muted border border-mc-border rounded-lg hover:bg-mc-surface transition-colors"
                >
                  {expandedApp === app.path ? 'Hide' : 'Leftovers'}
                </button>
                <button
                  onClick={() => {
                    try { 
                      const { shell } = window.require?.('electron') || {};
                      shell?.openPath?.(app.path);
                    } catch {
                      // Can't open from renderer — would need IPC
                    }
                  }}
                  className="px-2.5 py-1.5 text-xs text-mc-muted border border-mc-border rounded-lg hover:bg-mc-surface transition-colors"
                  title="Open app"
                >
                  Open
                </button>
                <button
                  onClick={() => setConfirmApp(app)}
                  className="px-2.5 py-1.5 text-xs text-mc-destructive border border-mc-destructive/30 rounded-lg hover:bg-mc-destructive/10 transition-colors"
                >
                  Uninstall
                </button>
              </div>
            </div>

            {/* Expanded support files */}
            {expandedApp === app.path && app.supportFiles.length > 0 && (
              <div className="px-6 pb-3 ml-14">
                <p className="text-xs text-mc-muted mb-1.5">Support files ({app.supportFiles.length})</p>
                <div className="space-y-1">
                  {app.supportFiles.map((sf, i) => (
                    <div key={i} className="flex items-center justify-between text-xs bg-mc-surface/50 px-3 py-1.5 rounded">
                      <span className="text-mc-muted font-mono truncate flex-1 mr-2">
                        {sf.path.replace(os.path.expanduser?.('~') || '/Users', '~')}
                      </span>
                      <span className="text-mc-text whitespace-nowrap">{formatBytes(sf.sizeBytes)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {expandedApp === app.path && app.supportFiles.length === 0 && (
              <div className="px-6 pb-3 ml-14">
                <p className="text-xs text-mc-muted">No leftover files found.</p>
              </div>
            )}
          </div>
        ))}

        {/* Orphans View */}
        {!loading && filter === 'orphaned' && orphans.map((orphan) => (
          <div key={orphan.path} className="border-b border-mc-border/50 flex items-center gap-4 px-6 py-3 hover:bg-mc-surface/30 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-mc-surface flex items-center justify-center shrink-0 text-mc-accent border border-mc-accent/30 shadow-[0_0_15px_rgba(0,229,255,0.1)]">
              <Ghost className="w-5 h-5" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-mc-text truncate">{orphan.name}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-mc-accent/15 text-mc-accent border border-mc-accent/20">
                  {orphan.type}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1 text-xs text-mc-muted">
                <span className="font-mono text-mc-text">{formatBytes(orphan.sizeBytes)}</span>
                <span className="truncate max-w-[300px] hover:max-w-none transition-all duration-300">
                  {orphan.path.replace(os.path.expanduser?.('~') || '/Users', '~')}
                </span>
              </div>
            </div>

            <div className="flex items-center flex-shrink-0">
              <button
                onClick={() => setConfirmOrphan(orphan)}
                className="px-3 py-1.5 text-xs text-mc-accent border border-mc-accent/50 rounded-lg hover:bg-mc-accent hover:text-mc-bg transition-colors shadow-[0_0_10px_rgba(74,222,128,0.1)]"
              >
                Clean Leftover
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Confirm dialog for normal Apps */}
      {confirmApp && (
        <ConfirmDialog
          isOpen={true}
          title={`Uninstall ${confirmApp.name}?`}
          description={`This will move the app and its support files to Trash.`}
          totalSize={formatBytes(confirmApp.sizeBytes)}
          pathCount={1 + confirmApp.supportFiles.length}
          isPermanent={false}
          warning={confirmApp.supportFiles.length > 0
            ? `${confirmApp.supportFiles.length} support files (${formatBytes(confirmApp.supportSizeBytes)}) will also be removed.`
            : undefined}
          actionLabel="Move to Trash"
          onConfirm={() => uninstallApp(confirmApp)}
          onCancel={() => setConfirmApp(null)}
        />
      )}

      {/* Confirm dialog for Orphans */}
      {confirmOrphan && (
        <ConfirmDialog
          isOpen={true}
          title={`Clean Orphaned Leftover?`}
          description={`This container is not associated with any installed app and is safe to delete.`}
          totalSize={formatBytes(confirmOrphan.sizeBytes)}
          pathCount={1}
          isPermanent={false}
          actionLabel="Move to Trash"
          onConfirm={() => deleteOrphan(confirmOrphan)}
          onCancel={() => setConfirmOrphan(null)}
        />
      )}

      {/* Undo toast */}
      {undoInfo && (
        <UndoToast
          message={`${undoInfo.name} moved to Trash.`}
          onUndo={() => {
            // TODO: Restore from Trash via AppleScript
            setUndoInfo(null);
          }}
        />
      )}
    </div>
  );
}

// Shim for path display
const os = { path: { expanduser: (p: string) => p } };
