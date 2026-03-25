import React from 'react';

export function Titlebar() {
  return (
    <div
      className="h-9 flex items-center px-4"
      style={{ WebkitAppRegion: 'drag', backgroundColor: 'var(--bg-surface)' } as any}
    >
      {/* Left: 68px empty space for traffic lights */}
      <div className="w-[68px]" style={{ WebkitAppRegion: 'no-drag' } as any} />

      {/* Center: app name */}
      <div className="flex-1 flex justify-center">
        <span className="text-[11px] font-medium text-[--text-muted] tracking-wide uppercase">
          MacShine
        </span>
      </div>

      {/* Right: optional actions (no-drag) */}
      <div className="w-[68px] flex justify-end" style={{ WebkitAppRegion: 'no-drag' } as any} />
    </div>
  );
}
