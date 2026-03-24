import React from 'react';

export function HistoryPage() {
  // TODO: Connect to SQLite history via IPC
  return (
    <div className="h-full overflow-y-auto px-6 py-6">
      <h2 className="text-lg font-bold text-mc-text mb-6">Cleaning History</h2>

      <div className="flex flex-col items-center justify-center h-64 text-mc-muted">
        <div className="text-4xl mb-4">📋</div>
        <p className="text-sm">No cleaning sessions yet.</p>
        <p className="text-xs mt-1">Run a Smart Scan to get started!</p>
      </div>
    </div>
  );
}
