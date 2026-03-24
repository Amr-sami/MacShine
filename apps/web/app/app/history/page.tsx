"use client";

import { CheckCircle2 } from "lucide-react";

export default function HistoryPage() {
  const dummyHistory = [
    { id: "1", date: "2026-03-24T14:30:00Z", device: "Amr's MacBook Pro", version: "macOS 14.4", totalFreed: "4.2 GB", modules: ["Caches", "Trash", "Logs"] },
    { id: "2", date: "2026-03-22T09:15:00Z", device: "Amr's MacBook Pro", version: "macOS 14.4", totalFreed: "1.1 GB", modules: ["Downloads", "Trash"] },
    { id: "3", date: "2026-03-15T18:45:00Z", device: "Studio Mac", version: "macOS 14.2", totalFreed: "8.5 GB", modules: ["Large Files", "Caches", "Logs"] },
    { id: "4", date: "2026-03-01T10:20:00Z", device: "Amr's MacBook Pro", version: "macOS 14.4", totalFreed: "12.0 GB", modules: ["Duplicates", "Caches"] },
  ];

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-bold">Cloud Sync History</h1>
        <div className="flex items-center gap-2 px-3 py-1 bg-mc-surface border border-mc-border rounded-full text-xs font-medium text-mc-muted">
          <CheckCircle2 size={14} className="text-mc-accent" />
          Sync Active
        </div>
      </div>
      <p className="text-mc-muted mb-10">A master ledger of cleaning sessions synced from all your authorized Macs.</p>

      <div className="bg-mc-surface border border-mc-border rounded-2xl overflow-hidden shadow-lg shadow-black/20">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-mc-border bg-mc-bg/50">
              <th className="px-6 py-4 text-xs font-bold text-mc-muted uppercase tracking-wider">Date & Time</th>
              <th className="px-6 py-4 text-xs font-bold text-mc-muted uppercase tracking-wider">Device Source</th>
              <th className="px-6 py-4 text-xs font-bold text-mc-muted uppercase tracking-wider">Top Modules</th>
              <th className="px-6 py-4 text-xs font-bold text-mc-muted uppercase tracking-wider text-right">Space Freed</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-mc-border/50">
            {dummyHistory.map((session) => (
              <tr key={session.id} className="hover:bg-mc-bg transition-colors group">
                <td className="px-6 py-4 text-sm font-medium text-mc-text">
                  {new Date(session.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                </td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex items-center gap-2 text-mc-text font-medium">
                    <div className="w-2 h-2 rounded-full bg-mc-accent"></div>
                    {session.device}
                  </div>
                  <div className="text-xs text-mc-muted mt-0.5 ml-4">{session.version}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1.5">
                    {session.modules.map(m => (
                      <span key={m} className="px-2 py-0.5 bg-mc-bg border border-mc-border text-[10px] uppercase tracking-wider text-mc-muted rounded group-hover:border-mc-accent/30 transition-colors">
                        {m}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-bold text-mc-accent text-right">
                  {session.totalFreed}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
