import React, { useState } from 'react';
import { SidebarSection } from './SidebarSection';
import { SidebarItem } from './SidebarItem';
import {
  Zap,
  Layers,
  FileText,
  Trash2,
  Code2,
  Globe,
  FileSearch,
  Copy,
  Terminal,
  Rocket,
  AppWindow,
  PieChart,
  Shield,
  Clock,
  Settings
} from 'lucide-react';

const MODULES = [
  { id: 'caches', label: 'Caches', icon: Layers },
  { id: 'logs', label: 'Logs', icon: FileText },
  { id: 'trash', label: 'Trash', icon: Trash2 },
  { id: 'xcode', label: 'Xcode', icon: Code2 },
  { id: 'browsers', label: 'Browsers', icon: Globe },
  { id: 'large_files', label: 'Large Files', icon: FileSearch },
  { id: 'duplicates', label: 'Duplicates', icon: Copy },
  { id: 'brew', label: 'Homebrew', icon: Terminal },
  { id: 'startup', label: 'Startup Items', icon: Rocket },
  { id: 'dns_memory', label: 'DNS & Memory', icon: Terminal },
];

import { useSessionStore } from '../../store/session.store';

export function Sidebar({ activeModule, onModuleSelect }: { activeModule: string | null; onModuleSelect: (id: string | null) => void }) {
  const modulesState = useSessionStore(state => state.modules);

  return (
    <aside
      className="w-[220px] flex flex-col border-r border-[--border-subtle]"
      style={{ backgroundColor: 'var(--bg-surface)' }}
    >
      {/* Logo area */}
      <div className="px-5 pt-5 pb-4">
        {/* Placeholder for SVG wordmark */}
        <div className="text-[16px] font-bold text-[--text-primary] tracking-tight">
          Mac<span className="text-[--accent]">Shine</span>
        </div>
      </div>

      {/* Quick action */}
      <div className="px-3 pb-3">
        <button 
          onClick={() => onModuleSelect(null)}
          className="w-full flex justify-center items-center gap-2 h-9 rounded-lg font-medium text-[13px] bg-[--accent] text-[--text-inverse] hover:brightness-110 active:scale-[0.98] transition-all duration-100"
        >
          <Zap size={16} />
          Home
        </button>
      </div>

      <div className="flex-1 text-left overflow-y-auto overflow-x-hidden pb-4">
        {/* Section: Modules */}
        <SidebarSection label="Modules">
          {MODULES.map((m) => (
            <SidebarItem
              key={m.id}
              id={m.id}
              label={m.label}
              icon={m.icon}
              isActive={activeModule === m.id}
              status={modulesState[m.id]?.status || 'idle'}
              onClick={() => onModuleSelect(m.id)}
            />
          ))}
        </SidebarSection>

        {/* Section: Tools */}
        <SidebarSection label="Tools">
          <SidebarItem
            id="app-manager"
            label="App Manager"
            icon={AppWindow}
            isActive={activeModule === 'app-manager'}
            onClick={() => onModuleSelect('app-manager')}
          />
          <SidebarItem
            id="space-lens"
            label="Space Lens"
            icon={PieChart}
            isActive={activeModule === 'space-lens'}
            onClick={() => onModuleSelect('space-lens')}
          />
          <SidebarItem
            id="privacy"
            label="Privacy"
            icon={Shield}
            isActive={activeModule === 'privacy'}
            onClick={() => onModuleSelect('privacy')}
          />
        </SidebarSection>
      </div>

      {/* Bottom: history + settings */}
      <div className="mt-auto border-t border-[--border-subtle] px-3 py-3 flex flex-col gap-1">
        <SidebarItem
          id="history"
          label="History"
          icon={Clock}
          isActive={activeModule === 'history'}
          onClick={() => onModuleSelect('history')}
        />
        <SidebarItem
          id="settings"
          label="Settings"
          icon={Settings}
          isActive={activeModule === 'settings'}
          onClick={() => onModuleSelect('settings')}
        />
      </div>
    </aside>
  );
}
