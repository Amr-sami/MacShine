import React, { useEffect, useState } from 'react';
import { useSessionStore } from '../store/sessionStore';
import { ShieldCheck, Database, Clock } from 'lucide-react';

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

interface TopBarProps {
  lastCleanedAt: string | null;
}

export function TopBar({ lastCleanedAt }: TopBarProps) {
  const totalFreed = useSessionStore((s) => s.totalFreed);
  const [diskUsage, setDiskUsage] = useState<{ totalBytes: number; freeBytes: number } | null>(null);

  useEffect(() => {
    window.macclean?.getDiskUsage()
      .then((usage: any) => setDiskUsage(usage))
      .catch((err: any) => console.error('Failed to get disk info:', err));
  }, [totalFreed]);

  const usedPercent = diskUsage
    ? Math.round(((diskUsage.totalBytes - diskUsage.freeBytes) / diskUsage.totalBytes) * 100)
    : 0;

  const lastCleaned = lastCleanedAt
    ? new Date(lastCleanedAt).toLocaleDateString()
    : 'Never';

  return (
    <div className="h-14 border-b border-mc-border bg-mc-surface/80 backdrop-blur-md flex items-center justify-between px-6 titlebar-drag shrink-0 relative z-10 shadow-sm">
      <div className="flex items-center gap-6 mt-1.5">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-5 h-5 rounded bg-mc-accent/10 border border-mc-accent/20 shadow-[0_0_10px_rgba(0,229,255,0.1)]">
            <ShieldCheck className="w-3 h-3 text-mc-accent drop-shadow-[0_0_8px_rgba(0,229,255,0.8)]" />
          </div>
          <span className="text-[10px] uppercase font-mono tracking-widest text-mc-muted/80 mt-0.5">System Protected</span>
        </div>
      </div>
      
      <div className="titlebar-no-drag flex items-center gap-6 text-xs text-mc-muted mt-1.5">
        
        {diskUsage && (
          <div className="flex items-center gap-3">
            <Database className="w-3.5 h-3.5 text-mc-muted opacity-50" />
            <div className="w-24 h-1.5 bg-mc-bg border border-mc-border rounded-full overflow-hidden shadow-inner">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${
                  usedPercent > 95 ? 'bg-mc-destructive' :
                  usedPercent > 85 ? 'bg-mc-warning' :
                  'bg-mc-accent shadow-[0_0_8px_rgba(0,229,255,0.4)]'
                }`}
                style={{ width: `${usedPercent}%` }}
              />
            </div>
            <span className="font-mono text-[10px] tracking-wider uppercase opacity-80 decoration-mc-border underline underline-offset-4">
              {formatBytes(diskUsage.freeBytes)} Free
            </span>
          </div>
        )}

        <div className="h-4 w-px bg-mc-border opacity-50" />

        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-mc-muted opacity-50" />
          <span className="text-[10px] uppercase font-mono tracking-wider opacity-80">
            {totalFreed > 0 ? (
              <><span className="text-mc-accent">{formatBytes(totalFreed)}</span> FREED</>
            ) : (
              `LAST: ${lastCleaned}`
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
