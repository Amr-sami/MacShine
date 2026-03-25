import Link from 'next/link';
import { ChevronLeft, Info } from 'lucide-react';

export default function Changelog() {
  const updates = [
    {
      version: "v1.0.0",
      date: "March 25, 2026",
      title: "The Initial Launch",
      changes: [
        "First public release of MacShine.",
        "Core modules: Caches, Logs, Trash, Xcode, Browsers.",
        "Advanced tools: App Manager, Space Lens.",
        "Privacy-first, offline-always architecture.",
        "Two-step deletion confirmation for total safety."
      ]
    }
  ];

  return (
    <div className="max-w-3xl mx-auto px-6 py-24 w-full">
      <Link href="/" className="inline-flex items-center gap-2 text-mc-muted hover:text-mc-accent transition-colors mb-8 text-sm group">
        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Back to Home
      </Link>

      <div className="flex items-center gap-3 mb-12">
        <div className="w-10 h-10 rounded-xl bg-mc-accent/10 border border-mc-accent/30 flex items-center justify-center text-mc-accent">
          <Info size={20} />
        </div>
        <h1 className="text-4xl font-bold tracking-tight">Changelog</h1>
      </div>

      <div className="space-y-16">
        {updates.map((update, idx) => (
          <div key={idx} className="relative pl-8 border-l border-mc-border">
            <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-mc-accent border-4 border-mc-bg ring-4 ring-mc-accent/10" />
            
            <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-2 mb-6">
              <h2 className="text-2xl font-bold text-mc-text">{update.title}</h2>
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 rounded bg-mc-surface border border-mc-border text-xs font-mono text-mc-accent">
                  {update.version}
                </span>
                <span className="text-sm text-mc-muted">{update.date}</span>
              </div>
            </div>

            <ul className="space-y-4">
              {update.changes.map((change, i) => (
                <li key={i} className="text-mc-muted leading-relaxed flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-mc-accent/40 mt-2 shrink-0" />
                  {change}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-24 p-8 rounded-2xl bg-mc-surface border border-mc-border text-center">
        <p className="text-mc-muted mb-6">Want to be the first to know about new updates?</p>
        <Link href="/signup" className="inline-flex px-6 py-3 bg-mc-accent text-mc-bg rounded-lg font-bold hover:scale-105 transition-transform">
          Get MacShine Pro
        </Link>
      </div>
    </div>
  );
}
