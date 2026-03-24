import React, { useEffect, useState } from 'react';
import { useSessionStore } from '../store/sessionStore';

declare global {
  interface Window {
    macclean: {
      scan: (module: string, options?: Record<string, unknown>) => Promise<unknown>;
      delete: (module: string, paths: string[]) => Promise<unknown>;
      skipModule: (module: string) => Promise<void>;
      getSettings: () => Promise<Record<string, unknown>>;
      setSettings: (settings: Record<string, unknown>) => Promise<void>;
      getDiskUsage: () => Promise<{ totalBytes: number; freeBytes: number; usedBytes: number }>;
      getHistory: (limit?: number) => Promise<unknown[]>;
      saveSession: (session: Record<string, unknown>) => Promise<{ ok: boolean }>;
      getOnboardingComplete: () => Promise<boolean>;
      setOnboardingComplete: () => Promise<{ ok: boolean }>;
      openPrivacySettings: () => Promise<{ ok: boolean }>;
      getLicenseStatus: () => Promise<{ isPro: boolean; expiresAt: Date | null; email: string | null }>;
      saveLicenseKey: (key: string) => Promise<boolean>;
      removeLicenseKey: () => Promise<boolean>;
      updateSchedule: (frequency: string, hour: number) => Promise<boolean>;
      onProgress: (callback: (data: unknown) => void) => () => void;
      onQuickScan: (callback: () => void) => () => void;
      onNavigate: (callback: (page: string) => void) => () => void;
      onInAppNotification: (callback: (data: { title: string; body: string }) => void) => () => void;
    };
  }
}

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
      .then((usage) => setDiskUsage(usage))
      .catch(() => {});
  }, [totalFreed]);

  const usedPercent = diskUsage
    ? Math.round(((diskUsage.totalBytes - diskUsage.freeBytes) / diskUsage.totalBytes) * 100)
    : 0;

  const lastCleaned = lastCleanedAt
    ? new Date(lastCleanedAt).toLocaleDateString()
    : 'Never';

  return (
    <div className="titlebar-drag h-12 border-b border-mc-border flex items-center justify-between px-6 bg-mc-bg/80 backdrop-blur">
      <div className="titlebar-no-drag flex items-center gap-4 text-sm">
        {diskUsage && (
          <div className="flex items-center gap-2">
            <div className="w-24 h-1.5 bg-mc-border rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  usedPercent > 95 ? 'bg-mc-destructive' :
                  usedPercent > 85 ? 'bg-mc-warning' :
                  'bg-mc-accent'
                }`}
                style={{ width: `${usedPercent}%` }}
              />
            </div>
            <span className="text-mc-muted font-mono text-xs">
              {formatBytes(diskUsage.freeBytes)} free
            </span>
          </div>
        )}
      </div>
      <div className="titlebar-no-drag flex items-center gap-4 text-xs text-mc-muted">
        {totalFreed > 0 && (
          <span className="text-mc-accent font-mono">
            {formatBytes(totalFreed)} freed
          </span>
        )}
        <span>Last cleaned: {lastCleaned}</span>
      </div>
    </div>
  );
}
