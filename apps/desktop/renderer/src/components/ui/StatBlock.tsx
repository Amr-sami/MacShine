import React from 'react';
import { cn } from '../../lib/cn';

export interface StatBlockProps {
  label: string;
  value: string;
  sub?: string;
  variant?: 'default' | 'accent' | 'warning' | 'danger';
}

export function StatBlock({ label, value, sub, variant = 'default' }: StatBlockProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-[--text-muted]">
        {label}
      </span>
      <span
        className={cn(
          'text-[40px] font-semibold font-mono leading-none',
          variant === 'accent' && 'text-[--accent]',
          variant === 'warning' && 'text-[--warning]',
          variant === 'danger' && 'text-[--danger]',
          variant === 'default' && 'text-[--text-primary]'
        )}
      >
        {value}
      </span>
      {sub && <span className="text-[12px] text-[--text-secondary]">{sub}</span>}
    </div>
  );
}
