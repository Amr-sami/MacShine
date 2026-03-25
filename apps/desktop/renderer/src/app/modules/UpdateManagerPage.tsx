import React, { useState, useCallback, useEffect } from 'react';
import { RefreshCcw, Loader2, Box } from 'lucide-react';

interface UpdateInfo {
  name: string;
  path: string;
  currentVersion: string;
  status: 'Update Available' | 'Mac App Store' | 'Abandoned (No updates > 2yrs)' | 'Up to Date' | 'Unknown Source';
  isAppStore: boolean;
  isAbandoned: boolean;
  updateAvailable: string | null;
  releaseNotes: string | null;
}

export function UpdateManagerPage() {
  const [updates, setUpdates] = useState<UpdateInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [scanned, setScanned] = useState(false);

  const scanUpdates = useCallback(async () => {
    setLoading(true);
    try {
      const result = await window.macclean.scan('updates') as any;
      setUpdates(result.paths || []);
      setScanned(true);
    } catch (err) {
      console.error('Failed to scan updates:', err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    scanUpdates();
  }, [scanUpdates]);

  const openApp = (path: string) => {
    try {
      const { shell } = window.require?.('electron') || {};
      shell?.openPath?.(path);
    } catch {
      // ignore
    }
  };

  const appsWithUpdates = updates.filter(a => a.updateAvailable);
  const abandonedApps = updates.filter(a => a.isAbandoned);

  return (
    <div className="flex flex-col h-full bg-[#0d0f0e]">
      {/* Header */}
      <div className="px-6 py-5 border-b border-mc-border flex items-center justify-between">
        <div>
          <h2 className="text-xl font-light tracking-wide text-mc-text flex items-center gap-3">
            <RefreshCcw className="w-5 h-5 text-mc-text" /> Update Manager
            <span className="text-[10px] font-bold text-mc-accent border border-mc-accent/30 bg-mc-accent/10 px-1.5 py-0.5 rounded uppercase ml-2 tracking-widest">Pro</span>
          </h2>
          <p className="text-sm text-mc-muted mt-1">
            {scanned 
              ? `${appsWithUpdates.length} updates available · ${abandonedApps.length} abandoned apps`
              : 'Scanning installed applications for updates...'}
          </p>
        </div>
        <button
          onClick={scanUpdates}
          disabled={loading}
          className={`px-4 py-2 text-sm rounded-lg transition-colors border ${
            loading 
              ? 'bg-mc-surface text-mc-muted border-mc-border cursor-not-allowed'
              : 'bg-mc-surface text-mc-text border-mc-border hover:bg-mc-surface/80'
          }`}
        >
          {loading ? 'Scanning...' : 'Rescan'}
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-6">
        {loading && !scanned && (
          <div className="flex flex-col items-center justify-center h-full text-mc-muted animate-in fade-in">
            <Loader2 className="w-10 h-10 animate-spin text-mc-accent mb-4 drop-shadow-[0_0_15px_rgba(0,229,255,0.3)]" />
            <span className="text-sm">Fetching appcast feeds...</span>
          </div>
        )}

        {scanned && updates.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-mc-muted">
            <p className="text-sm">No applications found in standard directories.</p>
          </div>
        )}

        {updates.length > 0 && (
          <div className="space-y-3">
            {updates.map((app) => (
              <div 
                key={app.path} 
                className={`border rounded-xl p-4 flex flex-col gap-2 ${
                  app.updateAvailable 
                    ? 'border-mc-accent/40 bg-mc-accent/5' 
                    : app.isAbandoned
                    ? 'border-mc-warning/40 bg-mc-warning/5'
                    : 'border-mc-border bg-mc-surface'
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border shadow-inner ${
                       app.updateAvailable ? 'bg-mc-bg border-mc-accent/40 text-mc-accent' : 'bg-mc-surface border-mc-border text-mc-muted'
                    }`}>
                      {app.isAppStore ? <span className="text-xl"></span> : <Box className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-medium text-mc-text truncate">{app.name}</h4>
                        {app.isAppStore && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 font-medium">App Store</span>
                        )}
                        {app.isAbandoned && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-mc-warning/10 text-mc-warning font-medium">Abandoned</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-mc-muted">
                        <span>Current: {app.currentVersion}</span>
                        {app.updateAvailable && (
                          <>
                            <span>→</span>
                            <span className="text-mc-accent font-medium">New: {app.updateAvailable}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="shrink-0 flex items-center gap-2">
                    {app.updateAvailable ? (
                      <button
                        onClick={() => openApp(app.path)}
                        className="px-3 py-1.5 text-xs font-medium bg-mc-accent/20 text-mc-accent border border-mc-accent/30 rounded-lg hover:bg-mc-accent hover:text-mc-bg transition-colors"
                      >
                        Launch Updater
                      </button>
                    ) : app.isAppStore ? (
                      <span className="text-xs text-mc-muted px-2 py-1 bg-mc-bg rounded border border-mc-border">Update via App Store</span>
                    ) : (
                      <span className="text-xs text-mc-muted px-2 py-1 bg-mc-bg rounded border border-mc-border">{app.status}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
