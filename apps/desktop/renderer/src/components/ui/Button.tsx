import React from 'react';
import { cn } from '../../lib/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
}

export function Button({ variant = 'primary', className, children, ...props }: ButtonProps) {
  const baseClass = "rounded-lg font-medium transition-all active:scale-[0.98]";
  
  const variants = {
    primary: "h-9 px-5 text-[13px] bg-[--accent] text-[--text-inverse] hover:brightness-110 duration-100",
    secondary: "h-9 px-4 text-[13px] bg-[--bg-elevated] border border-[--border-default] text-[--text-secondary] hover:text-[--text-primary] hover:border-[--border-strong] duration-100",
    danger: "h-9 px-5 text-[13px] bg-[--danger-dim] border border-[--danger] text-[--danger] hover:bg-[--danger] hover:text-white duration-150",
    ghost: "h-8 px-3 text-[12px] rounded-md text-[--text-muted] hover:text-[--text-secondary] hover:bg-[--bg-hover] duration-100"
  };

  return (
    <button className={cn(baseClass, variants[variant], className)} {...props}>
      {children}
    </button>
  );
}
