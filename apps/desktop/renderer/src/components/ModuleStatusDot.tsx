import React from 'react';
import type { ModuleStatus } from '../store/sessionStore';

const STATUS_COLORS: Record<ModuleStatus, string> = {
  idle: 'bg-mc-muted',
  scanning: 'bg-mc-accent animate-pulse',
  found: 'bg-mc-warning',
  deleting: 'bg-mc-accent animate-pulse',
  done: 'bg-mc-accent',
  skipped: 'bg-mc-muted',
  error: 'bg-mc-destructive',
};

const STATUS_LABELS: Record<ModuleStatus, string> = {
  idle: '',
  scanning: 'scanning...',
  found: '',
  deleting: 'cleaning...',
  done: '',
  skipped: 'skipped',
  error: 'error',
};

interface Props {
  status: ModuleStatus;
}

export function ModuleStatusDot({ status }: Props) {
  return (
    <span
      className={`inline-block w-2 h-2 rounded-full ${STATUS_COLORS[status]}`}
      title={STATUS_LABELS[status] || status}
    />
  );
}
