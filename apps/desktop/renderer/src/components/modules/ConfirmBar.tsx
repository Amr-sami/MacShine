import React from 'react';
import { Button } from '../ui/Button';
import { formatBytes } from '../ui/PathList';

export function ConfirmBar({
  total,
  description,
  warn,
  isPermanent,
  onSkip,
  onConfirm
}: {
  total: number;
  description: string;
  warn?: string;
  isPermanent: boolean;
  onSkip: () => void;
  onConfirm: () => void;
}) {
  const formattedTotal = formatBytes(total);
  
  return (
    <div className="h-16 flex items-center gap-4 px-6 border-t border-[--border-default] bg-[--bg-surface] mt-auto flex-shrink-0">
      <div className="flex-1">
        <p className="text-[13px] text-[--text-secondary]">
          Found{' '}
          <span className="text-[--warning] font-mono font-medium">{formattedTotal}</span>
          {' '}of {description}
        </p>
        {warn && (
          <p className="text-[11px] text-[--warning] mt-0.5">{warn}</p>
        )}
      </div>
      <Button variant="secondary" onClick={onSkip}>Skip</Button>
      <Button variant={isPermanent ? 'danger' : 'primary'} onClick={onConfirm}>
        {isPermanent ? `Delete ${formattedTotal} permanently` : `Move ${formattedTotal} to Trash`}
      </Button>
    </div>
  );
}
