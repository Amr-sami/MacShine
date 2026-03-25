import React from 'react';
import { Titlebar } from './Titlebar';
import { Sidebar } from './Sidebar';

export function Layout({ children, activeModule, onModuleSelect }: { children: React.ReactNode; activeModule: string; onModuleSelect: (id: string) => void; }) {
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[--bg-base]">
      <Titlebar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeModule={activeModule} onModuleSelect={onModuleSelect} />
        <main className="flex-1 overflow-auto bg-[--bg-elevated] relative">
          {children}
        </main>
      </div>
    </div>
  );
}
