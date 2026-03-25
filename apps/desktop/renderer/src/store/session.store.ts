import { create } from 'zustand';
import { StatusType } from '../components/ui/StatusDot';

export interface FoundPath {
  path: string;
  size?: number;
}

export interface ModuleState {
  status: StatusType | 'deleting';
  foundPaths: FoundPath[];
  totalFoundBytes: number;
  freedBytes: number;
  error: string | null;
  currentPath?: string;
  pathsChecked?: number;
}

export interface SessionState {
  modules: Record<string, ModuleState>;
  totalFreed: number;
  scanStartedAt: Date | null;
  scanCompletedAt: Date | null;
  startScan: (moduleId: string) => void;
  updateProgress: (moduleId: string, path: string, size?: number, totalChecked?: number) => void;
  setScanResult: (moduleId: string, total: number, paths: FoundPath[]) => void;
  setDeleting: (moduleId: string) => void;
  setDone: (moduleId: string, freedBytes: number) => void;
  setError: (moduleId: string, error: string) => void;
  skipModule: (moduleId: string) => void;
  resetSession: () => void;
}

const initialModuleState: ModuleState = {
  status: 'idle',
  foundPaths: [],
  totalFoundBytes: 0,
  freedBytes: 0,
  error: null,
};

const ALL_MODULES = [
  'caches', 'logs', 'trash', 'xcode', 'browsers', 
  'large_files', 'duplicates', 'brew', 'startup', 'dns_memory'
];

const initialModules = ALL_MODULES.reduce((acc, m) => {
  acc[m] = { ...initialModuleState };
  return acc;
}, {} as Record<string, ModuleState>);

export const useSessionStore = create<SessionState>((set) => ({
  modules: initialModules,
  totalFreed: 0,
  scanStartedAt: null,
  scanCompletedAt: null,

  startScan: (moduleId) => set((state) => ({
    scanStartedAt: state.scanStartedAt || new Date(),
    modules: {
      ...state.modules,
      [moduleId]: {
        ...initialModuleState,
        status: 'scanning',
        pathsChecked: 0,
      }
    }
  })),

  updateProgress: (moduleId, path, size, totalChecked) => set((state) => {
    const mod = state.modules[moduleId];
    if (!mod || mod.status !== 'scanning') return state;
    return {
      modules: {
        ...state.modules,
        [moduleId]: {
          ...mod,
          currentPath: path,
          pathsChecked: totalChecked || (mod.pathsChecked || 0) + 1,
        }
      }
    };
  }),

  setScanResult: (moduleId, total, paths) => set((state) => {
    const isDone = total === 0 && paths.length === 0;
    return {
      modules: {
        ...state.modules,
        [moduleId]: {
          ...state.modules[moduleId],
          status: isDone ? 'done' : 'found',
          totalFoundBytes: total,
          foundPaths: paths,
          freedBytes: isDone ? 0 : state.modules[moduleId].freedBytes,
        }
      }
    }
  }),

  setDeleting: (moduleId) => set((state) => ({
    modules: {
      ...state.modules,
      [moduleId]: {
        ...state.modules[moduleId],
        status: 'deleting',
      }
    }
  })),

  setDone: (moduleId, freedBytes) => set((state) => ({
    totalFreed: state.totalFreed + freedBytes,
    modules: {
      ...state.modules,
      [moduleId]: {
        ...state.modules[moduleId],
        status: 'done',
        freedBytes,
      }
    }
  })),

  setError: (moduleId, error) => set((state) => ({
    modules: {
      ...state.modules,
      [moduleId]: {
        ...state.modules[moduleId],
        status: 'error',
        error,
      }
    }
  })),

  skipModule: (moduleId) => set((state) => ({
    modules: {
      ...state.modules,
      [moduleId]: {
        ...state.modules[moduleId],
        status: 'skipped',
      }
    }
  })),

  resetSession: () => set({
    modules: initialModules,
    totalFreed: 0,
    scanStartedAt: null,
    scanCompletedAt: null,
  })
}));
