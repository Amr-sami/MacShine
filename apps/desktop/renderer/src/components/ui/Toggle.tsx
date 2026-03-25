import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/cn';

export function Toggle({
  checked,
  onChange,
  disabled
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative w-9 h-5 rounded-full transition-colors duration-200 focus-visible outline-none',
        checked ? 'bg-[--accent]' : 'bg-[--bg-active]',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <motion.div
        className="absolute top-[2px] w-4 h-4 bg-white rounded-full shadow-sm"
        animate={{ left: checked ? '18px' : '2px' }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </button>
  );
}
