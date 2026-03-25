import { useState, useEffect } from 'react';

interface DiskUsage {
  free: number;
  total: number;
  used: number;
  usedPercent: number;
}

export function useDiskUsage() {
  const [usage, setUsage] = useState<DiskUsage | null>(null);

  useEffect(() => {
    const fetchUsage = async () => {
      const macclean = (window as any).macclean;
      if (macclean?.getDiskUsage) {
        try {
          const res = await macclean.getDiskUsage();
          if (res) {
            const used = res.total - res.free;
            const usedPercent = (used / res.total) * 100;
            setUsage({ free: res.free, total: res.total, used, usedPercent });
          }
        } catch (e) {
          console.error('Failed to fetch disk usage:', e);
        }
      }
    };

    fetchUsage();
    const timer = setInterval(fetchUsage, 30000);
    return () => clearInterval(timer);
  }, []);

  return usage;
}
