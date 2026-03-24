import { create } from 'zustand';

// ── Types ───────────────────────────────────────────────────

export type ModuleId =
  | 'caches' | 'logs' | 'trash' | 'xcode' | 'browsers'
  | 'large_files' | 'duplicates' | 'brew' | 'startup' | 'dns_memory' | 'privacy';

export type ModuleStatus = 'idle' | 'scanning' | 'found' | 'deleting' | 'done' | 'skipped' | 'error';

export interface FoundPath {
  path: string;
  sizeBytes: number;
  name?: string;
  [key: string]: unknown;
}

export interface ModuleState {
  status: ModuleStatus;
  foundPaths: FoundPath[];
  totalFoundBytes: number;
  freedBytes: number;
  error: string | null;
  warning?: string;
  extra?: Record<string, unknown>;
}

interface SessionStore {
  modules: Record<ModuleId, ModuleState>;
  totalFreed: number;
  scanStartedAt: Date | null;
  scanCompletedAt: Date | null;
  activeModule: ModuleId | null;

  // Actions
  startScan: (moduleId: ModuleId) => void;
  setScanResult: (moduleId: ModuleId, data: { total: number; paths: FoundPath[]; warning?: string; [k: string]: unknown }) => void;
  setScanError: (moduleId: ModuleId, error: string) => void;
  startDelete: (moduleId: ModuleId) => void;
  setDeleteResult: (moduleId: ModuleId, freedBytes: number) => void;
  skipModule: (moduleId: ModuleId) => void;
  setActiveModule: (moduleId: ModuleId | null) => void;
  resetSession: () => void;
}

const createDefaultModuleState = (): ModuleState => ({
  status: 'idle',
  foundPaths: [],
  totalFoundBytes: 0,
  freedBytes: 0,
  error: null,
});

const ALL_MODULES: ModuleId[] = [
  'caches', 'logs', 'trash', 'xcode', 'browsers',
  'large_files', 'duplicates', 'brew', 'startup', 'dns_memory', 'privacy',
];

const createDefaultModules = (): Record<ModuleId, ModuleState> => {
  const modules = {} as Record<ModuleId, ModuleState>;
  for (const id of ALL_MODULES) {
    modules[id] = createDefaultModuleState();
  }
  return modules;
};

export const useSessionStore = create<SessionStore>((set, get) => ({
  modules: createDefaultModules(),
  totalFreed: 0,
  scanStartedAt: null,
  scanCompletedAt: null,
  activeModule: null,

  startScan: (moduleId) =>
    set((state) => ({
      modules: {
        ...state.modules,
        [moduleId]: { ...state.modules[moduleId], status: 'scanning', error: null },
      },
      scanStartedAt: state.scanStartedAt ?? new Date(),
    })),

  setScanResult: (moduleId, data) =>
    set((state) => ({
      modules: {
        ...state.modules,
        [moduleId]: {
          ...state.modules[moduleId],
          status: data.paths.length > 0 ? 'found' : 'done',
          foundPaths: data.paths,
          totalFoundBytes: data.total,
          warning: data.warning,
          extra: data,
        },
      },
    })),

  setScanError: (moduleId, error) =>
    set((state) => ({
      modules: {
        ...state.modules,
        [moduleId]: { ...state.modules[moduleId], status: 'error', error },
      },
    })),

  startDelete: (moduleId) =>
    set((state) => ({
      modules: {
        ...state.modules,
        [moduleId]: { ...state.modules[moduleId], status: 'deleting' },
      },
    })),

  setDeleteResult: (moduleId, freedBytes) =>
    set((state) => ({
      modules: {
        ...state.modules,
        [moduleId]: {
          ...state.modules[moduleId],
          status: 'done',
          freedBytes,
          foundPaths: [],
          totalFoundBytes: 0,
        },
      },
      totalFreed: state.totalFreed + freedBytes,
      scanCompletedAt: new Date(),
    })),

  skipModule: (moduleId) =>
    set((state) => ({
      modules: {
        ...state.modules,
        [moduleId]: { ...state.modules[moduleId], status: 'skipped' },
      },
    })),

  setActiveModule: (moduleId) => set({ activeModule: moduleId }),

  resetSession: () =>
    set({
      modules: createDefaultModules(),
      totalFreed: 0,
      scanStartedAt: null,
      scanCompletedAt: null,
    }),
}));
