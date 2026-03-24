import React, { useEffect, useState } from 'react';

interface BannerProps {
  title: string;
  body: string;
  onDismiss: () => void;
}

export function InAppBanner({ title, body, onDismiss }: BannerProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onDismiss();
    }, 10000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  if (!visible) return null;

  return (
    <div className="fixed top-14 right-4 z-50 max-w-sm animate-in slide-in-from-right">
      <div className="bg-mc-surface border border-mc-border rounded-xl p-4 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-mc-text">{title}</p>
            <p className="text-xs text-mc-muted mt-1">{body}</p>
          </div>
          <button
            onClick={() => { setVisible(false); onDismiss(); }}
            className="text-mc-muted hover:text-mc-text text-sm flex-shrink-0"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
