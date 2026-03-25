import React from 'react';
import { cn } from '../../lib/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  highlighted?: boolean;
}

export function Card({ highlighted, className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border p-6",
        highlighted
          ? "border-[--accent-dim] bg-[--accent-muted] ring-1 ring-[--accent-glow]"
          : "border-[--border-default] bg-[--bg-elevated]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
