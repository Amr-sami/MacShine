import React, { useState, useCallback } from 'react';
import { useSessionStore, type ModuleId } from '../store/sessionStore';
import { ConfirmDialog } from '../components/ConfirmDialog';

const SMART_SCAN_MODULES: ModuleId[] = ['caches', 'logs', 'trash', 'browsers', 'brew'];

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

export function SmartScanPage() {
  const { modules, startScan, setScanResult, setScanError, startDelete, setDeleteResult } = useSessionStore();
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const totalFound = SMART_SCAN_MODULES.reduce(
    (sum, id) => sum + modules[id].totalFoundBytes, 0
  );

  const runSmartScan = useCallback(async () => {
    setIsScanning(true);
    setScanComplete(false);

    const promises = SMART_SCAN_MODULES.map(async (moduleId) => {
      startScan(moduleId);
      try {
        const result = await window.macclean.scan(moduleId);
        setScanResult(moduleId, result as any);
      } catch (err) {
        setScanError(moduleId, (err as Error).message);
      }
    });

    await Promise.allSettled(promises);
    setIsScanning(false);
    setScanComplete(true);
  }, [startScan, setScanResult, setScanError]);

  const cleanAll = useCallback(async () => {
    setShowConfirm(false);

    for (const moduleId of SMART_SCAN_MODULES) {
      const mod = modules[moduleId];
      if (mod.status !== 'found' || mod.foundPaths.length === 0) continue;

      startDelete(moduleId);
      try {
        const paths = mod.foundPaths.map((p) => p.path);
        const result = await window.macclean.delete(moduleId, paths) as any;
        setDeleteResult(moduleId, result?.freedBytes ?? 0);
      } catch (err) {
        // Keep going with other modules
        console.error(`Failed to clean ${moduleId}:`, err);
      }
    }
  }, [modules, startDelete, setDeleteResult]);

  return (
    <div className="flex flex-col items-center justify-center h-full px-8">
      {!scanComplete && !isScanning && (
        <>
          <div className="text-6xl mb-6">🔍</div>
          <h2 className="text-2xl font-bold text-mc-text mb-2">Smart Scan</h2>
          <p className="text-mc-muted text-sm mb-8 text-center max-w-sm">
            Quickly scan caches, logs, trash, browser data, and Homebrew for reclaimable space.
          </p>
          <button
            onClick={runSmartScan}
            className="px-8 py-3 bg-mc-accent text-mc-bg font-semibold rounded-xl hover:bg-mc-accent-dim transition-colors text-sm"
          >
            Start Smart Scan
          </button>
        </>
      )}

      {isScanning && (
        <>
          <div className="text-4xl mb-6 animate-bounce">⚡</div>
          <h2 className="text-xl font-bold text-mc-text mb-4">Scanning...</h2>
          <div className="w-full max-w-sm space-y-2">
            {SMART_SCAN_MODULES.map((id) => {
              const mod = modules[id];
              return (
                <div key={id} className="flex items-center justify-between text-sm">
                  <span className="text-mc-muted capitalize">{id.replace('_', ' ')}</span>
                  <span className={
                    mod.status === 'scanning' ? 'text-mc-accent animate-pulse' :
                    mod.status === 'found' ? 'text-mc-warning' :
                    mod.status === 'error' ? 'text-mc-destructive' :
                    'text-mc-muted'
                  }>
                    {mod.status === 'scanning' ? '...' :
                     mod.status === 'found' ? formatBytes(mod.totalFoundBytes) :
                     mod.status === 'error' ? 'error' :
                     mod.status === 'done' ? '✓' : '—'}
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}

      {scanComplete && (
        <>
          <div className="text-4xl mb-4">
            {totalFound > 0 ? '📦' : '✨'}
          </div>
          <h2 className="text-xl font-bold text-mc-text mb-2">
            {totalFound > 0 ? 'Scan Complete' : 'All Clean!'}
          </h2>
          {totalFound > 0 ? (
            <>
              <p className="text-3xl font-mono font-bold text-mc-warning mb-2">
                {formatBytes(totalFound)}
              </p>
              <p className="text-mc-muted text-sm mb-6">found across {
                SMART_SCAN_MODULES.filter(id => modules[id].totalFoundBytes > 0).length
              } modules</p>

              <div className="w-full max-w-sm space-y-2 mb-6">
                {SMART_SCAN_MODULES.map((id) => {
                  const mod = modules[id];
                  if (mod.totalFoundBytes === 0 && mod.status !== 'done') return null;
                  return (
                    <div key={id} className="flex items-center justify-between text-sm bg-mc-surface px-3 py-2 rounded-lg">
                      <span className="text-mc-text capitalize">{id.replace('_', ' ')}</span>
                      <span className={mod.status === 'done' ? 'text-mc-accent font-mono' : 'text-mc-warning font-mono'}>
                        {mod.status === 'done' ? `✓ ${formatBytes(mod.freedBytes)}` : formatBytes(mod.totalFoundBytes)}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={runSmartScan}
                  className="px-5 py-2.5 text-sm text-mc-muted border border-mc-border rounded-xl hover:bg-mc-surface transition-colors"
                >
                  Scan Again
                </button>
                <button
                  onClick={() => setShowConfirm(true)}
                  className="px-5 py-2.5 text-sm font-medium text-mc-accent bg-mc-accent/15 border border-mc-accent/30 rounded-xl hover:bg-mc-accent/25 transition-colors"
                >
                  Review & Clean
                </button>
              </div>
            </>
          ) : (
            <p className="text-mc-muted text-sm">No junk found. Your system is clean!</p>
          )}
        </>
      )}

      <ConfirmDialog
        isOpen={showConfirm}
        title="Clean All Found Items"
        description="This will permanently delete caches, logs, and browser cache. Trash contents will also be permanently removed."
        totalSize={formatBytes(totalFound)}
        pathCount={SMART_SCAN_MODULES.reduce((sum, id) => sum + modules[id].foundPaths.length, 0)}
        isPermanent={true}
        actionLabel="Delete Permanently"
        onConfirm={cleanAll}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
}
