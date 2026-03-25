import React from 'react';
import { cn } from '../../lib/cn';

const DOT_COLORS = {
  idle:     'var(--dot-idle)',
  scanning: 'var(--dot-found)',    // amber, animated
  found:    'var(--dot-found)',
  deleting: 'var(--dot-found)',
  done:     'var(--dot-done)',
  skipped:  'var(--dot-skipped)',
  error:    'var(--dot-error)',
};

export type StatusType = 'idle' | 'scanning' | 'found' | 'deleting' | 'done' | 'skipped' | 'error';

export function StatusDot({ status = 'idle' }: { status?: StatusType }) {
  return (
    <span
      className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0',
        (status === 'scanning' || status === 'deleting') && 'animate-pulse')}
      style={{ backgroundColor: DOT_COLORS[status] }}
    />
  );
}
