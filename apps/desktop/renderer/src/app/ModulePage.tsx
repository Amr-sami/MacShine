import React, { useState, useCallback, useEffect } from 'react';
import { useSessionStore, type ModuleId } from '../store/sessionStore';
import { ConfirmDialog } from '../components/ConfirmDialog';

const MODULE_INFO: Record<ModuleId, { label: string; description: string; isPermanent: boolean }> = {
  caches: { label: 'System Caches', description: 'App caches rebuild automatically.', isPermanent: true },
  logs: { label: 'System Logs', description: 'Old log files. Recent logs (< 24h) are kept.', isPermanent: true },
  trash: { label: 'Trash', description: 'Contents of your Trash bin.', isPermanent: true },
  xcode: { label: 'Xcode', description: 'DerivedData, Archives, Simulator images.', isPermanent: true },
  browsers: { label: 'Browser Cache', description: 'Close all browsers before cleaning.', isPermanent: true },
  large_files: { label: 'Large Files', description: 'Files over the size threshold.', isPermanent: true },
  duplicates: { label: 'Duplicates', description: 'Files with identical content.', isPermanent: true },
  brew: { label: 'Homebrew', description: 'Old formula versions and cache.', isPermanent: true },
  startup: { label: 'Startup Items', description: 'Launch agents and daemons (read-only in Phase 1).', isPermanent: false },
  dns_memory: { label: 'DNS & Memory', description: 'Flush DNS cache and purge inactive memory.', isPermanent: false },
  privacy: { label: 'Privacy Cleaner', description: 'Clear Safari history, recent files, and clipboard.', isPermanent: true },
};

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

interface Props {
  moduleId: ModuleId;
}

export function ModulePage({ moduleId }: Props) {
  const { modules, startScan, setScanResult, setScanError, startDelete, setDeleteResult, skipModule } = useSessionStore();
  const mod = modules[moduleId];
  const info = MODULE_INFO[moduleId];

  const [selectedPaths, setSelectedPaths] = useState<Set<string>>(new Set());
  const [showConfirm, setShowConfirm] = useState(false);
  const [isPro, setIsPro] = useState(true);

  useEffect(() => {
    window.macclean?.getLicenseStatus().then(status => {
      if (status) setIsPro(status.isPro);
    });
  }, []);

  const runScan = useCallback(async () => {
    startScan(moduleId);
    try {
      const result = await window.macclean.scan(moduleId);
      const data = result as any;
      setScanResult(moduleId, data);
      // Auto-select all found paths
      if (data.paths) {
        setSelectedPaths(new Set(data.paths.map((p: any) => p.path)));
      }
    } catch (err) {
      setScanError(moduleId, (err as Error).message);
    }
  }, [moduleId]);

  const cleanSelected = useCallback(async () => {
    setShowConfirm(false);
    startDelete(moduleId);
    try {
      const paths = Array.from(selectedPaths);
      const result = await window.macclean.delete(moduleId, paths) as any;
      setDeleteResult(moduleId, result?.freedBytes ?? 0);
      setSelectedPaths(new Set());
    } catch (err) {
      setScanError(moduleId, (err as Error).message);
    }
  }, [moduleId, selectedPaths]);

  const togglePath = (path: string) => {
    setSelectedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedPaths.size === mod.foundPaths.length) {
      setSelectedPaths(new Set());
    } else {
      setSelectedPaths(new Set(mod.foundPaths.map((p) => p.path)));
    }
  };

  let displayedPaths = mod.foundPaths;
  let hasTruncatedPro = false;

  if (!isPro) {
    if (moduleId === 'large_files' && displayedPaths.length > 20) {
      displayedPaths = displayedPaths.slice(0, 20);
      hasTruncatedPro = true;
    }
    if (moduleId === 'duplicates' && displayedPaths.length > 50) {
      displayedPaths = displayedPaths.slice(0, 50);
      hasTruncatedPro = true;
    }
  }

  const selectedSize = displayedPaths
    .filter((p) => selectedPaths.has(p.path))
    .reduce((sum, p) => sum + p.sizeBytes, 0);

  const isReadOnly = moduleId === 'startup';
  const isDnsMemory = moduleId === 'dns_memory';

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-mc-border">
        <h2 className="text-lg font-bold text-mc-text">{info.label}</h2>
        <p className="text-sm text-mc-muted mt-0.5">{info.description}</p>
        
        {!isPro && moduleId === 'privacy' && (
          <div className="mt-3 text-sm text-mc-accent bg-mc-accent/10 border border-mc-accent/30 px-3 py-2 rounded-lg inline-flex items-center gap-2">
            🔒 <span><strong>Pro Feature:</strong> Upgrade to use the Privacy Cleaner.</span>
          </div>
        )}

        {!isPro && hasTruncatedPro && (
          <div className="mt-3 text-sm text-mc-accent bg-mc-accent/10 border border-mc-accent/30 px-3 py-2 rounded-lg inline-flex items-center gap-2">
            🔒 <span><strong>Free Tier Limit Reached:</strong> Upgrade to clean unlimited items.</span>
          </div>
        )}

        {mod.warning && (
          <div className="mt-3 text-sm text-mc-warning bg-mc-warning/10 px-3 py-1.5 rounded-lg inline-block">
            ⚠️ {mod.warning}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {!isPro && moduleId === 'privacy' ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <span className="text-4xl mb-4">🔒</span>
            <p className="text-mc-text font-medium text-lg">Privacy Cleaner is Locked</p>
            <p className="text-mc-muted text-sm mt-1 max-w-sm">
              Upgrade to macclean Pro to securely erase your browsing history, quarantine databases, and recent files list.
            </p>
            <button
              onClick={() => { window.location.hash = '#/settings'; }}
              className="mt-6 px-6 py-2 bg-mc-surface text-mc-text font-medium rounded-lg hover:bg-mc-border transition-colors text-sm"
            >
              Enter License Key
            </button>
          </div>
        ) : mod.status === 'idle' && (
          <div className="flex flex-col items-center justify-center h-full">
            <button
              onClick={runScan}
              className="px-6 py-2.5 bg-mc-accent text-mc-bg font-semibold rounded-xl hover:bg-mc-accent-dim transition-colors text-sm"
            >
              Scan {info.label}
            </button>
          </div>
        )}

        {mod.status === 'scanning' && (
          <div className="flex flex-col items-center justify-center h-full text-mc-accent">
            <div className="animate-spin text-2xl mb-4">⏳</div>
            <p className="text-sm">Scanning...</p>
          </div>
        )}

        {mod.status === 'error' && (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-mc-destructive text-sm mb-4">❌ {mod.error}</p>
            <button onClick={runScan} className="px-4 py-2 text-sm text-mc-muted border border-mc-border rounded-lg hover:bg-mc-surface">
              Retry
            </button>
          </div>
        )}

        {(mod.status === 'found' || mod.status === 'deleting') && mod.foundPaths.length > 0 && (
          <div className="space-y-1">
            {!isReadOnly && !isDnsMemory && (
              <div className="flex items-center gap-2 mb-3 text-sm text-mc-muted">
                <input
                  type="checkbox"
                  checked={selectedPaths.size === displayedPaths.length}
                  onChange={toggleAll}
                  className="accent-mc-accent"
                />
                <span>Select all ({displayedPaths.length} items)</span>
              </div>
            )}

            {displayedPaths.map((item, i) => (
              <div
                key={item.path || i}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-mc-surface/50 text-sm"
              >
                {!isReadOnly && !isDnsMemory && (
                  <input
                    type="checkbox"
                    checked={selectedPaths.has(item.path)}
                    onChange={() => togglePath(item.path)}
                    disabled={mod.status === 'deleting'}
                    className="accent-mc-accent flex-shrink-0"
                  />
                )}
                <span className="flex-1 font-mono text-xs text-mc-muted truncate">
                  {item.name || item.path.split('/').pop()}
                </span>
                {item.sizeBytes > 0 && (
                  <span className="text-xs font-mono text-mc-text whitespace-nowrap">
                    {formatBytes(item.sizeBytes)}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {mod.status === 'done' && (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-4xl mb-3">✅</div>
            <p className="text-mc-accent font-mono font-bold text-lg">
              {mod.freedBytes > 0 ? formatBytes(mod.freedBytes) + ' freed' : 'Done'}
            </p>
            <button onClick={runScan} className="mt-4 px-4 py-2 text-sm text-mc-muted border border-mc-border rounded-lg hover:bg-mc-surface">
              Scan Again
            </button>
          </div>
        )}

        {mod.status === 'found' && mod.foundPaths.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-mc-muted text-sm">✨ Nothing found. Module is clean.</p>
          </div>
        )}
      </div>

      {/* Bottom action bar */}
      {mod.status === 'found' && selectedPaths.size > 0 && !isReadOnly && (
        <div className="px-6 py-3 border-t border-mc-border flex items-center justify-between bg-mc-surface/30">
          <span className="text-sm text-mc-muted">
            {selectedPaths.size} items · {formatBytes(selectedSize)}
          </span>
          <div className="flex gap-3">
            <button
              onClick={() => { skipModule(moduleId); window.macclean.skipModule(moduleId); }}
              className="px-4 py-2 text-sm text-mc-muted border border-mc-border rounded-lg hover:bg-mc-surface"
            >
              Skip
            </button>
            <button
              onClick={() => setShowConfirm(true)}
              className="px-4 py-2 text-sm font-medium text-mc-accent bg-mc-accent/15 border border-mc-accent/30 rounded-lg hover:bg-mc-accent/25"
            >
              Clean Selected
            </button>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={showConfirm}
        title={`Clean ${info.label}`}
        description={`This will delete the selected ${info.label.toLowerCase()} items.`}
        totalSize={formatBytes(selectedSize)}
        pathCount={selectedPaths.size}
        isPermanent={info.isPermanent}
        warning={mod.warning}
        actionLabel="Delete Permanently"
        onConfirm={cleanSelected}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
}
