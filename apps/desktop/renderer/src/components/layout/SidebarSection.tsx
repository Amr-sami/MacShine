import React from 'react';

interface SidebarSectionProps {
  label: string;
  children: React.ReactNode;
}

export function SidebarSection({ label, children }: SidebarSectionProps) {
  return (
    <div className="flex flex-col mb-4">
      <h3 className="px-5 mb-2 text-[11px] font-medium text-[--text-muted] uppercase tracking-[0.08em]">
        {label}
      </h3>
      <div className="flex flex-col px-2 gap-0.5">
        {children}
      </div>
    </div>
  );
}
