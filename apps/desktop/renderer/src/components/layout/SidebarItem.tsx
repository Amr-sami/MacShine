import React from 'react';
import { cn } from '../../lib/cn';
import { StatusDot, StatusType } from '../ui/StatusDot';
import { LucideIcon } from 'lucide-react';

interface SidebarItemProps {
  id: string;
  label: string;
  icon: LucideIcon;
  status?: StatusType;
  size?: string;
  isActive?: boolean;
  onClick?: () => void;
}

export function SidebarItem({
  label,
  icon: Icon,
  status = 'idle',
  size,
  isActive,
  onClick
}: SidebarItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-2.5 px-3 h-8 rounded-md',
        'transition-colors duration-100',
        isActive
          ? 'bg-[--bg-active] border-l-2 border-[--accent] pl-[10px]'
          : 'border-l-2 border-transparent hover:bg-[--bg-hover]'
      )}
    >
      <Icon size={14} color={isActive ? 'var(--accent)' : 'var(--text-muted)'} />
      <span className={cn(
        'flex-1 text-left text-[13px] font-medium',
        isActive ? 'text-[--text-primary]' : 'text-[--text-secondary]'
      )}>
        {label}
      </span>
      {size && (
        <span className="text-[11px] font-mono text-[--text-muted]">{size}</span>
      )}
      <StatusDot status={status} />
    </button>
  );
}
