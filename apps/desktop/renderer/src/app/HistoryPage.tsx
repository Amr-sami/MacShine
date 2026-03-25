import React from 'react';
import { ClipboardList } from 'lucide-react';

export function HistoryPage() {
  // TODO: Connect to SQLite history via IPC
  return (
    <div className="h-full overflow-y-auto px-6 py-6">
      <h2 className="text-lg font-bold text-mc-text mb-6">Cleaning History</h2>

      <div className="flex flex-col items-center justify-center h-64 text-mc-muted animate-in fade-in">
        <ClipboardList className="w-12 h-12 mb-4 text-mc-accent/50" />
        <p className="text-sm font-light tracking-wide text-mc-text">No cleaning sessions yet.</p>
        <p className="text-xs mt-2 opacity-70">Run a Smart Scan to get started!</p>
      </div>
    </div>
  );
}
