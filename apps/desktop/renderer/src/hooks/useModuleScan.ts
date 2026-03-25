import { useEffect, useRef } from 'react';
import { useSessionStore } from '../store/session.store';

export function useModuleScan(moduleId: string) {
  const store = useSessionStore();
  const mod = store.modules[moduleId];
  const cleanupRef = useRef<() => void>();

  // Subscribe to progress events from the Python bridge
  useEffect(() => {
    const macclean = (window as any).macclean;
    if (!macclean || !macclean.onProgress) return;

    cleanupRef.current = macclean.onProgress((data: any) => {
      // Only process events for this module
      if (data.module && data.module !== moduleId) return;
      
      if (data.type === 'progress' && data.data) {
        store.updateProgress(moduleId, data.data.path, data.data.size, data.data.totalChecked);
      }
    });

    return () => {
      if (cleanupRef.current) cleanupRef.current();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleId]);

  const scan = async () => {
    store.startScan(moduleId);
    const macclean = (window as any).macclean;
    if (macclean?.scan) {
      try {
        // The promise resolves with the scan result when Python finishes
        const result = await macclean.scan(moduleId);
        // Transition from 'scanning' to 'found' (or 'done' if nothing found)
        store.setScanResult(moduleId, result?.total || 0, result?.paths || []);
      } catch (err: any) {
        store.setError(moduleId, err.message || 'Scan failed');
      }
    } else {
      // Fallback mock for development without Python bridge
      setTimeout(() => store.updateProgress(moduleId, '/mock/path/cache.db', 1024, 1), 500);
      setTimeout(() => store.setScanResult(moduleId, 2048, [{path: '/mock/path/cache.db', size: 2048}]), 1500);
    }
  };

  const confirmDelete = async () => {
    store.setDeleting(moduleId);
    const macclean = (window as any).macclean;
    if (macclean?.delete) {
      try {
        const result = await macclean.delete(moduleId, mod.foundPaths.map(p => p.path));
        store.setDone(moduleId, result?.freedBytes || 0);
      } catch (err: any) {
        store.setError(moduleId, err.message || 'Delete failed');
      }
    } else {
      setTimeout(() => store.setDone(moduleId, mod.totalFoundBytes), 1000);
    }
  };

  const skip = () => {
    store.skipModule(moduleId);
    const macclean = (window as any).macclean;
    if (macclean?.skipModule) {
      macclean.skipModule(moduleId);
    }
  };

  const cancelScan = () => {
    store.resetSession();
  };

  return {
    state: mod,
    scan,
    confirmDelete,
    skip,
    cancelScan
  };
}
