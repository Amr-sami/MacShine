import React, { useState, useCallback } from 'react';
import { useSessionStore, type ModuleId } from '../store/sessionStore';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { ScanSearch, Zap, Archive, CheckCircle2, ChevronRight, XCircle } from 'lucide-react';

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
        console.error(`Failed to clean ${moduleId}:`, err);
      }
    }
  }, [modules, startDelete, setDeleteResult]);

  return (
    <div className="flex flex-col items-center justify-center h-full px-8 bg-mc-bg relative overflow-hidden">
      
      {/* Dark-Glass Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-mc-accent/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-lg flex flex-col items-center">
        {!scanComplete && !isScanning && (
          <div className="flex flex-col items-center text-center animate-in fade-in zoom-in duration-500">
            <div className="w-24 h-24 rounded-2xl bg-mc-bg border border-mc-border flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(0,229,255,0.05)] relative group cursor-pointer" onClick={runSmartScan}>
              <div className="absolute inset-0 bg-mc-accent/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <ScanSearch className="w-10 h-10 text-mc-accent group-hover:scale-110 transition-transform duration-500" />
            </div>
            
            <h2 className="text-3xl font-light tracking-wide text-mc-text mb-3">System Analysis</h2>
            <p className="text-mc-muted text-sm mb-10 max-w-sm leading-relaxed">
              Initiate a deep surface scan across caches, temporary files, isolated logs, and unused browser data.
            </p>
            
            <button
              onClick={runSmartScan}
              className="group relative px-8 py-3 bg-mc-text text-mc-bg font-medium rounded-lg overflow-hidden flex items-center gap-2 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all duration-300"
            >
              <Zap className="w-4 h-4 text-mc-bg" />
              <span>Execute Scan</span>
              <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}

        {isScanning && (
          <div className="w-full flex justify-center animate-in fade-in duration-300">
            <div className="w-full bg-mc-surface/80 backdrop-blur-xl border border-mc-border rounded-2xl p-8 shadow-2xl">
              <div className="flex items-center gap-4 mb-8">
                <div className="relative">
                  <div className="w-10 h-10 border-2 border-mc-border border-t-mc-accent rounded-full animate-spin" />
                  <Zap className="w-4 h-4 text-mc-accent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                </div>
                <div>
                  <h2 className="text-xl font-medium tracking-wide text-mc-text">Scanning Architecture...</h2>
                  <p className="text-xs text-mc-muted font-mono uppercase tracking-widest mt-1">Analyzing Nodes</p>
                </div>
              </div>
              
              <div className="space-y-1">
                {SMART_SCAN_MODULES.map((id) => {
                  const mod = modules[id];
                  return (
                    <div key={id} className="flex items-center justify-between text-xs font-mono py-2 border-b border-mc-border/50 last:border-0 group hover:bg-mc-text/5 px-2 rounded transition-colors">
                      <span className="text-mc-muted uppercase tracking-wider">{id.replace('_', ' ')}</span>
                      <span className={`text-right ${
                        mod.status === 'scanning' ? 'text-mc-accent animate-pulse' :
                        mod.status === 'found' ? 'text-mc-warning' :
                        mod.status === 'error' ? 'text-mc-destructive' :
                        'text-mc-muted'
                      }`}>
                        {mod.status === 'scanning' ? 'ANALYZING...' :
                         mod.status === 'found' ? formatBytes(mod.totalFoundBytes) :
                         mod.status === 'error' ? 'ERR_ACCESS' :
                         mod.status === 'done' ? 'CLEAN' : 'PENDING'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {scanComplete && (
          <div className="w-full flex flex-col items-center animate-in slide-in-from-bottom-8 fade-in duration-500">
            <div className="w-16 h-16 rounded-xl bg-mc-surface border border-mc-border flex items-center justify-center mb-6 shadow-lg">
              {totalFound > 0 ? (
                <Archive className="w-7 h-7 text-mc-warning" />
              ) : (
                <CheckCircle2 className="w-7 h-7 text-mc-accent" />
              )}
            </div>
            
            <h2 className="text-2xl font-light tracking-wide text-mc-text mb-2">
              {totalFound > 0 ? 'Analysis Complete' : 'System Optimized'}
            </h2>
            
            {totalFound > 0 ? (
              <>
                <div className="flex flex-col items-center mb-8">
                  <p className="text-5xl font-mono font-light tracking-tighter text-mc-warning mt-2 mb-2 drop-shadow-[0_0_15px_rgba(255,176,0,0.3)]">
                    {formatBytes(totalFound)}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-mc-warning/50 animate-pulse" />
                    <p className="text-mc-muted text-xs uppercase tracking-widest font-mono">
                      Recoverable Space Identified
                    </p>
                  </div>
                </div>

                <div className="w-full bg-mc-surface/60 backdrop-blur border border-mc-border rounded-xl mb-8 overflow-hidden flex flex-col">
                  {SMART_SCAN_MODULES.map((id) => {
                    const mod = modules[id];
                    if (mod.totalFoundBytes === 0 && mod.status !== 'done') return null;
                    return (
                      <div key={id} className="flex items-center justify-between text-xs px-4 py-3 border-b border-mc-border/50 last:border-0">
                        <span className="text-mc-text/80 uppercase tracking-wider font-mono">{id.replace('_', ' ')}</span>
                        <div className="flex items-center gap-2">
                          <span className={`font-mono ${mod.status === 'done' ? 'text-mc-accent' : 'text-mc-warning'}`}>
                            {mod.status === 'done' ? `CLEARED ${formatBytes(mod.freedBytes)}` : formatBytes(mod.totalFoundBytes)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center gap-4 w-full">
                  <button
                    onClick={runSmartScan}
                    className="flex-1 py-3 text-xs font-semibold uppercase tracking-wider text-mc-muted bg-mc-surface/50 border border-mc-border rounded-lg hover:bg-mc-surface hover:text-mc-text transition-all"
                  >
                    Rescan
                  </button>
                  <button
                    onClick={() => setShowConfirm(true)}
                    className="flex-[2] py-3 text-xs font-bold uppercase tracking-widest text-[#000] bg-mc-accent border border-mc-accent rounded-lg hover:bg-mc-text hover:shadow-[0_0_20px_rgba(0,229,255,0.4)] transition-all flex items-center justify-center gap-2"
                  >
                    <Archive className="w-4 h-4" /> Purge System
                  </button>
                </div>
              </>
            ) : (
              <p className="text-mc-muted text-sm text-center max-w-xs leading-relaxed">
                No redundant files detected across primary sectors.
              </p>
            )}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={showConfirm}
        title="Execute System Purge"
        description="This action irrevocably destroys isolated caches, unlinked logs, trash, and stale browser data."
        totalSize={formatBytes(totalFound)}
        pathCount={SMART_SCAN_MODULES.reduce((sum, id) => sum + modules[id].foundPaths.length, 0)}
        isPermanent={true}
        actionLabel="Execute Purge"
        onConfirm={cleanAll}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
}
