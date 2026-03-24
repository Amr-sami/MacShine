import React, { useEffect, useState } from 'react';

interface Props {
  message: string;
  onUndo: () => void;
}

export function UndoToast({ message, onUndo }: Props) {
  const [remaining, setRemaining] = useState(5);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          setVisible(false);
          return 0;
        }
        return r - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom">
      <div className="bg-mc-surface border border-mc-border rounded-xl px-5 py-3 shadow-2xl flex items-center gap-4">
        <span className="text-sm text-mc-text">{message}</span>
        <button
          onClick={() => {
            onUndo();
            setVisible(false);
          }}
          className="text-sm font-medium text-mc-accent hover:text-mc-accent-dim transition-colors"
        >
          Undo ({remaining}s)
        </button>
        <div className="w-12 h-1 bg-mc-border rounded-full overflow-hidden">
          <div
            className="h-full bg-mc-accent rounded-full transition-all duration-1000 ease-linear"
            style={{ width: `${(remaining / 5) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
