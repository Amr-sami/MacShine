import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button, StatBlock, Card } from '../components/ui';
import { useDiskUsage } from '../hooks/useDiskUsage';
import { useSessionStore } from '../store/session.store';

export function HomeScreen({ onModuleSelect }: { onModuleSelect: (id: string) => void }) {
  const diskUsage = useDiskUsage();
  const store = useSessionStore();
  const [isSmartScanning, setIsSmartScanning] = useState(false);

  const runSmartScan = async () => {
    setIsSmartScanning(true);
    const targetModules = ['caches', 'logs', 'trash', 'browsers', 'brew'];
    
    const macclean = (window as any).macclean;
    if (macclean?.scan) {
      targetModules.forEach(m => {
        store.startScan(m);
        macclean.scan(m).catch(() => {});
      });
    } else {
      // Mock for dev
      targetModules.forEach(m => {
        store.startScan(m);
        setTimeout(() => store.setScanResult(m, Math.random() * 1024 * 1024 * 500, []), 2000 + Math.random() * 2000);
      });
    }

    // Wait until all target modules are no longer scanning
    const checkDone = setInterval(() => {
      const allState = useSessionStore.getState().modules;
      const allDone = targetModules.every(m => allState[m].status !== 'scanning' && allState[m].status !== 'idle');
      
      if (allDone) {
        clearInterval(checkDone);
        setIsSmartScanning(false);
        // Find module with most found bytes
        let largest = targetModules[0];
        let max = 0;
        targetModules.forEach(m => {
          if (allState[m].totalFoundBytes > max) {
            max = allState[m].totalFoundBytes;
            largest = m;
          }
        });
        onModuleSelect(largest);
      }
    }, 500);
  };

  const usedPercent = diskUsage ? diskUsage.usedPercent.toFixed(1) : 0;
  const numUsedPercent = parseFloat(usedPercent as string);
  const ringColor = numUsedPercent > 85 ? 'var(--danger)' : numUsedPercent > 70 ? 'var(--warning)' : 'var(--accent)';
  const circumference = 2 * Math.PI * 94; // radius 94 (200/2 - 6 stroke padding)
  const strokeDashOffset = diskUsage ? circumference - (numUsedPercent / 100) * circumference : circumference;

  return (
    <div className="p-12 flex flex-col items-center max-w-2xl mx-auto h-full justify-center">
      <div className="relative mb-8">
        <svg width="200" height="200" viewBox="0 0 200 200" className="rotate-[-90deg]">
          <circle cx="100" cy="100" r="94" fill="none" stroke="var(--border-subtle)" strokeWidth="12" />
          <circle 
            cx="100" cy="100" r="94" fill="none" 
            stroke={ringColor} strokeWidth="12" 
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashOffset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[28px] font-mono font-semibold text-[--text-primary]">
            {diskUsage ? usedPercent : '--'}%
          </span>
          <span className="text-[11px] text-[--text-muted] uppercase tracking-wider mt-1">used</span>
        </div>
      </div>

      <div className="text-center mb-10">
        <p className="font-mono text-[13px] text-[--text-secondary] mb-2">
          {diskUsage ? `${(diskUsage.free / 1073741824).toFixed(1)} GB free of ${(diskUsage.total / 1073741824).toFixed(1)} GB` : 'Calculating...'}
        </p>
        <p className="text-[12px] text-[--text-muted]">Last cleaned: Never</p>
      </div>

      <Button 
        className="w-full max-w-[240px] mb-12 flex items-center justify-center gap-2" 
        onClick={runSmartScan}
        disabled={isSmartScanning}
      >
        {isSmartScanning && <span className="w-3 h-3 rounded-full bg-white animate-pulse" />}
        {isSmartScanning ? 'Scanning...' : 'Run Smart Scan'}
      </Button>

      <div className="w-full h-[1px] bg-[--border-subtle] mb-8" />

      <div className="grid grid-cols-3 gap-4 w-full">
        {['caches', 'logs', 'duplicates'].map((mId, i) => {
          const mod = store.modules[mId];
          const val = mod ? (mod.totalFoundBytes > 0 ? (mod.totalFoundBytes / 1024 / 1024).toFixed(0) + ' MB' : '~ MB') : '~ MB';
          
          return (
            <motion.div
              key={mId}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.3 }}
            >
              <Card 
                className="p-4 cursor-pointer hover:border-[--border-strong] transition-colors rounded-xl"
                onClick={() => onModuleSelect(mId)}
              >
                <StatBlock label={mId} value={val} />
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
