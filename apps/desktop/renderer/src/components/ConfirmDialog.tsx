import React from 'react';

interface Props {
  isOpen: boolean;
  title: string;
  description: string;
  totalSize: string;
  pathCount: number;
  isPermanent: boolean;
  warning?: string;
  actionLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen, title, description, totalSize, pathCount,
  isPermanent, warning, actionLabel, onConfirm, onCancel,
}: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-mc-surface border border-mc-border rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
        <h2 className="text-lg font-semibold text-mc-text mb-2">{title}</h2>
        <p className="text-sm text-mc-muted mb-4">{description}</p>

        <div className="bg-mc-bg rounded-lg p-3 mb-4 font-mono text-xs">
          <div className="flex justify-between text-mc-muted">
            <span>Items: {pathCount}</span>
            <span>Total: {totalSize}</span>
          </div>
        </div>

        {warning && (
          <div className="flex items-start gap-2 mb-4 text-mc-warning text-sm bg-mc-warning/10 rounded-lg p-3">
            <span>⚠️</span>
            <span>{warning}</span>
          </div>
        )}

        {isPermanent && (
          <p className="text-sm text-mc-destructive mb-4">
            ⚠ This cannot be undone. Files will be permanently deleted.
          </p>
        )}

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm text-mc-muted bg-mc-bg border border-mc-border rounded-lg hover:bg-mc-border transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              isPermanent
                ? 'bg-mc-destructive/20 text-mc-destructive hover:bg-mc-destructive/30 border border-mc-destructive/30'
                : 'bg-mc-accent/20 text-mc-accent hover:bg-mc-accent/30 border border-mc-accent/30'
            }`}
          >
            {actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
