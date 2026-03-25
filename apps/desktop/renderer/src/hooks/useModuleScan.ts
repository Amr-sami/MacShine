import { useEffect, useRef } from 'react';
import { useSessionStore } from '../store/session.store';

export function useModuleScan(moduleId: string) {
  const store = useSessionStore();
  const mod = store.modules[moduleId];
  const cleanupRef = useRef<() => void>();

  useEffect(() => {
    const macclean = (window as any).macclean;
    if (!macclean || !macclean.onProgress) return;

    cleanupRef.current = macclean.onProgress((data: any) => {
      // data format defined in macclean-spec.md IPC Bridge section
      if (data.id && data.id !== moduleId) return;
      if (data.module && data.module !== moduleId) return;
      
      if (data.type === 'progress') {
        store.updateProgress(moduleId, data.data.path, data.data.size, data.data.totalChecked);
      } else if (data.type === 'result') {
        const action = data.action || window.localStorage.getItem(`current_action_${moduleId}`);
        if (action === 'scan' || !action) {
          store.setScanResult(moduleId, data.data.total || 0, data.data.paths || []);
        } else if (action === 'delete') {
          store.setDone(moduleId, data.data.freed || 0);
        }
      } else if (data.type === 'error') {
        store.setError(moduleId, data.message || 'Unknown error');
      }
    });

    return () => {
      if (cleanupRef.current) cleanupRef.current();
    };
  }, [moduleId, store]);

  const scan = async (options = {}) => {
    store.startScan(moduleId);
    window.localStorage.setItem(`current_action_${moduleId}`, 'scan');
    const macclean = (window as any).macclean;
    if (macclean?.scan) {
      // IPC structure expects: scan(module, options) -> mapped bridge
      macclean.scan(moduleId).catch((err: any) => store.setError(moduleId, err.message));
    } else {
      setTimeout(() => store.updateProgress(moduleId, '/mock/path/cache.db', 1024, 1), 500);
      setTimeout(() => store.setScanResult(moduleId, 2048, [{path: '/mock/path/cache.db', size: 2048}]), 1500);
    }
  };

  const confirmDelete = async () => {
    store.setDeleting(moduleId);
    window.localStorage.setItem(`current_action_${moduleId}`, 'delete');
    const macclean = (window as any).macclean;
    if (macclean?.delete) {
      macclean.delete(moduleId, mod.foundPaths.map(p => p.path)).catch((err: any) => store.setError(moduleId, err.message));
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
