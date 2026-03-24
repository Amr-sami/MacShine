import React from 'react';
import { useSessionStore, type ModuleId } from '../store/sessionStore';
import { ModuleStatusDot } from './ModuleStatusDot';

const MODULE_LABELS: Record<ModuleId, string> = {
  caches: 'System Caches',
  logs: 'System Logs',
  trash: 'Trash',
  xcode: 'Xcode',
  browsers: 'Browser Cache',
  large_files: 'Large Files',
  duplicates: 'Duplicates',
  brew: 'Homebrew',
  startup: 'Startup Items',
  dns_memory: 'DNS & Memory',
  privacy: 'Privacy Cleaner',
};

const PRO_MODULES: ModuleId[] = ['privacy'];

function formatBytes(bytes: number): string {
  if (bytes === 0) return '';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i > 1 ? 1 : 0)} ${units[i]}`;
}

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const modules = useSessionStore((s) => s.modules);

  return (
    <aside className="w-[220px] h-screen bg-mc-bg border-r border-mc-border flex flex-col flex-shrink-0">
      {/* Titlebar drag area */}
      <div className="titlebar-drag h-12 flex items-end px-4 pb-2">
        <h1 className="titlebar-no-drag font-mono text-mc-accent font-bold text-lg tracking-tight">
          macclean
        </h1>
      </div>

      {/* Smart Scan button */}
      <div className="px-3 py-3 space-y-1">
        <button
          onClick={() => onNavigate('smart-scan')}
          className={`w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors titlebar-no-drag ${
            currentPage === 'smart-scan'
              ? 'bg-mc-accent/15 text-mc-accent'
              : 'text-mc-text hover:bg-mc-surface'
          }`}
        >
          ⚡ Smart Scan
        </button>
        <button
          onClick={() => onNavigate('app-manager')}
          className={`w-full px-3 py-2 rounded-lg text-sm transition-colors titlebar-no-drag ${
            currentPage === 'app-manager'
              ? 'bg-mc-surface text-mc-text'
              : 'text-mc-muted hover:text-mc-text hover:bg-mc-surface/50'
          }`}
        >
          📦 App Manager
        </button>
        <button
          onClick={() => onNavigate('space-lens')}
          className={`w-full px-3 py-2 rounded-lg text-sm transition-colors titlebar-no-drag ${
            currentPage === 'space-lens'
              ? 'bg-mc-surface text-mc-text'
              : 'text-mc-muted hover:text-mc-text hover:bg-mc-surface/50'
          }`}
        >
          🔍 Space Lens <span className="text-[9px] font-bold text-mc-accent border border-mc-accent/30 bg-mc-accent/10 px-1 rounded ml-1 uppercase">Pro</span>
        </button>
        <button
          onClick={() => onNavigate('malware')}
          className={`w-full px-3 py-2 rounded-lg text-sm transition-colors titlebar-no-drag ${
            currentPage === 'malware'
              ? 'bg-mc-surface text-mc-text'
              : 'text-mc-muted hover:text-mc-text hover:bg-mc-surface/50'
          }`}
        >
          🛡️ Anti-Malware <span className="text-[9px] font-bold text-mc-destructive border border-mc-destructive/30 bg-mc-destructive/10 px-1 rounded ml-1 uppercase">Pro</span>
        </button>
        <button
          onClick={() => onNavigate('update-manager')}
          className={`w-full px-3 py-2 rounded-lg text-sm transition-colors titlebar-no-drag ${
            currentPage === 'update-manager'
              ? 'bg-mc-surface text-mc-text'
              : 'text-mc-muted hover:text-mc-text hover:bg-mc-surface/50'
          }`}
        >
          🔄 App Updater <span className="text-[9px] font-bold text-mc-accent border border-mc-accent/30 bg-mc-accent/10 px-1 rounded ml-1 uppercase">Pro</span>
        </button>
        <button
          onClick={() => onNavigate('email-cleaner')}
          className={`w-full px-3 py-2 rounded-lg text-sm transition-colors titlebar-no-drag ${
            currentPage === 'email-cleaner'
              ? 'bg-mc-surface text-mc-text'
              : 'text-mc-muted hover:text-mc-text hover:bg-mc-surface/50'
          }`}
        >
          📫 Mail Attachments <span className="text-[9px] font-bold text-mc-accent border border-mc-accent/30 bg-mc-accent/10 px-1 rounded ml-1 uppercase">Pro</span>
        </button>
      </div>

      {/* Separator */}
      <div className="px-4">
        <div className="border-t border-mc-border" />
      </div>

      {/* Module list */}
      <div className="flex-1 overflow-y-auto px-3 py-2">
        <p className="text-[10px] uppercase tracking-wider text-mc-muted mb-2 px-3">
          Modules
        </p>
        {(Object.keys(MODULE_LABELS) as ModuleId[]).map((id) => {
          const mod = modules[id];
          const sizeLabel =
            mod.status === 'found' ? formatBytes(mod.totalFoundBytes) :
            mod.status === 'done' && mod.freedBytes > 0 ? formatBytes(mod.freedBytes) :
            '';

          return (
            <button
              key={id}
              onClick={() => onNavigate(`module:${id}`)}
              className={`titlebar-no-drag w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
                currentPage === `module:${id}`
                  ? 'bg-mc-surface text-mc-text'
                  : 'text-mc-muted hover:text-mc-text hover:bg-mc-surface/50'
              }`}
            >
              <ModuleStatusDot status={mod.status} />
              <span className="flex-1 text-left truncate">{MODULE_LABELS[id]}</span>
              {PRO_MODULES.includes(id) && (
                <span className="text-[9px] font-bold text-mc-accent border border-mc-accent/30 bg-mc-accent/10 px-1 rounded ml-1 uppercase">Pro</span>
              )}
              {sizeLabel && (
                <span className={`text-xs flex-shrink-0 font-mono ml-2 ${
                  mod.status === 'done' ? 'text-mc-accent' : 'text-mc-warning'
                }`}>
                  {sizeLabel}
                </span>
              )}
              {mod.status === 'scanning' && (
                <span className="text-xs text-mc-muted ml-2">...</span>
              )}
              {mod.status === 'skipped' && (
                <span className="text-xs text-mc-muted ml-2">skip</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Separator */}
      <div className="px-4">
        <div className="border-t border-mc-border" />
      </div>

      {/* Bottom navigation */}
      <div className="px-3 py-3 space-y-0.5">
        {[
          { id: 'history', label: '📋 History' },
          { id: 'settings', label: '⚙️ Settings' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`titlebar-no-drag w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors ${
              currentPage === item.id
                ? 'bg-mc-surface text-mc-text'
                : 'text-mc-muted hover:text-mc-text hover:bg-mc-surface/50'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </aside>
  );
}
