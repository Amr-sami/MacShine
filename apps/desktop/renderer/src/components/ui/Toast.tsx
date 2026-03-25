import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

export function Toast({
  message,
  duration = 5000,
  onUndo,
  onDismiss,
  isVisible
}: {
  message: string;
  duration?: number;
  onUndo?: () => void;
  onDismiss: () => void;
  isVisible: boolean;
}) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!isVisible) return;
    setProgress(100);
    let start = performance.now();
    let frame: number;

    const tick = (now: number) => {
      const elapsed = now - start;
      const p = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(p);

      if (p > 0) {
        frame = requestAnimationFrame(tick);
      } else {
        onDismiss();
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [duration, onDismiss, isVisible]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 24, opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 h-12 px-4 flex items-center gap-3 rounded-xl bg-[--bg-elevated] border border-[--border-strong] shadow-lg shadow-black/40 z-50 overflow-hidden min-w-[320px] max-w-md"
        >
          <CheckCircle2 size={14} color="var(--accent)" />
          <span className="text-[13px] text-[--text-primary] flex-1 truncate">{message}</span>
          {onUndo && (
            <button
              onClick={() => {
                onUndo();
                onDismiss();
              }}
              className="text-[12px] font-medium text-[--accent] hover:underline whitespace-nowrap"
            >
              Undo
            </button>
          )}
          <div
            className="absolute bottom-0 left-0 h-[2px] bg-[--accent]"
            style={{ width: `${progress}%`, transition: 'width 0.1s linear' }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
