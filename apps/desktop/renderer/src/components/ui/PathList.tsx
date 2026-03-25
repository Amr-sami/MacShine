import React from 'react';
import { cn } from '../../lib/cn';

export interface PathItem {
  path: string;
  size?: number; // bytes
}

export function formatBytes(bytes: number, decimals = 1) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

const HOME = '/Users/user'; // Placeholder, replace with actual home

export function PathList({ paths }: { paths: PathItem[] }) {
  return (
    <div className="rounded-lg border border-[--border-subtle] overflow-hidden">
      {paths.map((p, i) => (
        <div
          key={p.path}
          className={cn(
            'flex items-center gap-3 px-4 h-9',
            i % 2 === 1 && 'bg-[--bg-hover]/40'
          )}
        >
          <span className="flex-1 font-mono text-[11px] text-[--text-secondary] truncate">
            {p.path.replace(HOME, '~')}
          </span>
          {p.size !== undefined && (
            <span className="font-mono text-[11px] text-[--text-muted] flex-shrink-0">
              {formatBytes(p.size)}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
