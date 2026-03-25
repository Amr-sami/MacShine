import React from 'react';
import { useSessionStore, type ModuleId } from '../store/sessionStore';
import { ModuleStatusDot } from './ModuleStatusDot';
import { Sparkles, LayoutDashboard, History, Settings, FolderSearch, Box, ShieldAlert, RefreshCcw, MailX, ChevronRight, ActivitySquare } from 'lucide-react';

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
    <aside className="w-[220px] bg-mc-surface/60 border-r border-mc-border flex flex-col h-full shrink-0 backdrop-blur-md">
      {/* App Logo Area */}
      <div className="h-14 flex items-center px-4 titlebar-drag">
        <div className="flex items-center gap-2 text-mc-text pt-2">
          <div className="w-6 h-6 rounded flex items-center justify-center bg-mc-text/5 border border-mc-border shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-mc-accent" />
          </div>
          <span className="font-semibold tracking-wide text-sm">MacClean<span className="text-mc-accent font-bold">Pro</span></span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        
        {/* Primary Navigation */}
        <div className="mb-2 px-2 text-[10px] uppercase tracking-widest text-mc-muted/60 font-medium">Core</div>
        <button
          onClick={() => onNavigate('smart-scan')}
          className={`w-full px-3 py-2 rounded-lg text-sm transition-all duration-300 flex items-center gap-3 titlebar-no-drag group ${
            currentPage === 'smart-scan'
              ? 'bg-mc-accent/10 border border-mc-accent/20 text-mc-accent shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]'
              : 'text-mc-muted hover:text-mc-text hover:bg-mc-border/50 border border-transparent'
          }`}
        >
          <Sparkles className={`w-4 h-4 ${currentPage === 'smart-scan' ? 'text-mc-accent' : 'text-mc-muted group-hover:text-mc-text'} transition-colors duration-300`} />
          <span className="font-medium">Smart Scan</span>
        </button>

        {/* Separator */}
        <div className="h-px bg-gradient-to-r from-transparent via-mc-border to-transparent my-4 opacity-30" />

        {/* Advanced Tools */}
        <div className="mb-2 px-2 text-[10px] uppercase tracking-widest text-mc-muted/60 font-medium">Advanced Tools</div>
        <button
          onClick={() => onNavigate('app-manager')}
          className={`w-full px-3 py-2 rounded-lg text-sm transition-all duration-300 flex items-center justify-between titlebar-no-drag group ${
            currentPage === 'app-manager'
              ? 'bg-mc-bg border border-mc-border text-mc-text shadow-sm'
              : 'text-mc-muted hover:text-mc-text hover:bg-mc-border/50 border border-transparent'
          }`}
        >
          <div className="flex items-center gap-3">
            <Box className={`w-4 h-4 ${currentPage === 'app-manager' ? 'text-mc-text' : 'text-mc-muted group-hover:text-mc-text'} transition-colors`} />
            <span>App Manager</span>
          </div>
        </button>
        <button
          onClick={() => onNavigate('space-lens')}
          className={`w-full px-3 py-2 rounded-lg text-sm transition-all duration-300 flex items-center justify-between titlebar-no-drag group ${
            currentPage === 'space-lens'
              ? 'bg-mc-bg border border-mc-border text-mc-text shadow-sm'
              : 'text-mc-muted hover:text-mc-text hover:bg-mc-border/50 border border-transparent'
          }`}
        >
          <div className="flex items-center gap-3">
            <FolderSearch className={`w-4 h-4 ${currentPage === 'space-lens' ? 'text-mc-text' : 'text-mc-muted group-hover:text-mc-text'} transition-colors`} />
            <span>Space Lens</span>
          </div>
          <span className="text-[8px] font-bold text-mc-accent border border-mc-accent/30 bg-mc-accent/10 px-1 rounded uppercase tracking-wider">Pro</span>
        </button>
        <button
          onClick={() => onNavigate('malware')}
          className={`w-full px-3 py-2 rounded-lg text-sm transition-all duration-300 flex items-center justify-between titlebar-no-drag group ${
            currentPage === 'malware'
              ? 'bg-mc-bg border border-mc-border text-mc-destructive shadow-sm'
              : 'text-mc-muted hover:text-mc-text hover:bg-mc-border/50 border border-transparent'
          }`}
        >
          <div className="flex items-center gap-3">
            <ShieldAlert className={`w-4 h-4 ${currentPage === 'malware' ? 'text-mc-destructive' : 'text-mc-muted group-hover:text-mc-destructive'} transition-colors`} />
            <span>Anti-Malware</span>
          </div>
          <span className="text-[8px] font-bold text-mc-destructive border border-mc-destructive/30 bg-mc-destructive/10 px-1 rounded uppercase tracking-wider">Pro</span>
        </button>
        <button
          onClick={() => onNavigate('update-manager')}
          className={`w-full px-3 py-2 rounded-lg text-sm transition-all duration-300 flex items-center justify-between titlebar-no-drag group ${
            currentPage === 'update-manager'
              ? 'bg-mc-bg border border-mc-border text-mc-text shadow-sm'
              : 'text-mc-muted hover:text-mc-text hover:bg-mc-border/50 border border-transparent'
          }`}
        >
          <div className="flex items-center gap-3">
            <RefreshCcw className={`w-4 h-4 ${currentPage === 'update-manager' ? 'text-mc-text' : 'text-mc-muted group-hover:text-mc-text'} transition-colors`} />
            <span>App Updater</span>
          </div>
        </button>
        <button
          onClick={() => onNavigate('email-cleaner')}
          className={`w-full px-3 py-2 rounded-lg text-sm transition-all duration-300 flex items-center justify-between titlebar-no-drag group ${
            currentPage === 'email-cleaner'
              ? 'bg-mc-bg border border-mc-border text-mc-text shadow-sm'
              : 'text-mc-muted hover:text-mc-text hover:bg-mc-border/50 border border-transparent'
          }`}
        >
          <div className="flex items-center gap-3">
            <MailX className={`w-4 h-4 ${currentPage === 'email-cleaner' ? 'text-mc-text' : 'text-mc-muted group-hover:text-mc-text'} transition-colors`} />
            <span>Mail Cleaner</span>
          </div>
          <span className="text-[8px] font-bold text-mc-accent border border-mc-accent/30 bg-mc-accent/10 px-1 rounded uppercase tracking-wider">Pro</span>
        </button>

        {/* Separator */}
        <div className="h-px bg-gradient-to-r from-transparent via-mc-border to-transparent my-4 opacity-30" />

        {/* Module list */}
        <div className="mb-2 px-2 text-[10px] uppercase tracking-widest text-mc-muted/60 font-medium">Modules</div>
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
              className={`titlebar-no-drag w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all duration-300 group ${
                currentPage === `module:${id}`
                  ? 'bg-mc-bg border border-mc-border text-mc-text shadow-sm'
                  : 'text-mc-muted hover:text-mc-text hover:bg-mc-border/50 border border-transparent'
              }`}
            >
              <ModuleStatusDot status={mod.status} />
              <span className="flex-1 text-left truncate">{MODULE_LABELS[id]}</span>
              {PRO_MODULES.includes(id) && (
                <span className="text-[8px] font-bold text-mc-accent border border-mc-accent/30 bg-mc-accent/10 px-0.5 rounded uppercase">Pro</span>
              )}
              {sizeLabel && (
                <span className={`text-[10px] flex-shrink-0 font-mono ml-2 ${
                  mod.status === 'done' ? 'text-mc-accent' : 'text-mc-warning'
                }`}>
                  {sizeLabel}
                </span>
              )}
              {mod.status === 'scanning' && (
                <span className="text-xs text-mc-muted ml-2">...</span>
              )}
              {mod.status === 'skipped' && (
                <span className="text-[10px] text-mc-muted ml-2 uppercase font-mono tracking-wider">Skip</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom utilities */}
      <div className="p-3">
        <div className="bg-mc-bg/50 border border-mc-border rounded-xl p-1 shadow-inner backdrop-blur-sm">
          <button
            onClick={() => onNavigate('history')}
            className={`w-full px-3 py-2 rounded-lg text-sm transition-all duration-300 flex items-center gap-3 titlebar-no-drag group ${
              currentPage === 'history'
                ? 'bg-mc-surface text-mc-text shadow-sm border border-mc-border/50'
                : 'text-mc-muted hover:text-mc-text hover:bg-mc-surface/50 border border-transparent'
            }`}
          >
            <History className={`w-4 h-4 ${currentPage === 'history' ? 'text-mc-text' : 'text-mc-muted group-hover:text-mc-text'} transition-colors`} />
            <span>Audit Log</span>
          </button>
          <button
            onClick={() => onNavigate('settings')}
            className={`w-full mt-1 px-3 py-2 rounded-lg text-sm transition-all duration-300 flex items-center gap-3 titlebar-no-drag group ${
              currentPage === 'settings'
                ? 'bg-mc-surface text-mc-text shadow-sm border border-mc-border/50'
                : 'text-mc-muted hover:text-mc-text hover:bg-mc-surface/50 border border-transparent'
            }`}
          >
            <Settings className={`w-4 h-4 ${currentPage === 'settings' ? 'text-mc-text' : 'text-mc-muted group-hover:text-mc-text'} transition-colors`} />
            <span>Settings</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
