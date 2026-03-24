// ── Module IDs ──────────────────────────────────────────────

export type ModuleId =
  | 'caches'
  | 'logs'
  | 'trash'
  | 'xcode'
  | 'browsers'
  | 'large_files'
  | 'duplicates'
  | 'brew'
  | 'startup'
  | 'dns_memory'
  | 'apps'
  | 'privacy';

// ── Scan / Delete ───────────────────────────────────────────

export interface ScanOptions {
  thresholdMB?: number;
}

export interface FoundPath {
  path: string;
  sizeBytes: number;
  modifiedAt?: string;
}

// ── Python bridge protocol ──────────────────────────────────

export interface BridgeRequest {
  id: string;
  action: string;
  module?: ModuleId;
  options?: Record<string, unknown>;
}

export interface BridgeProgressResponse {
  id: string;
  type: 'progress';
  data: { path: string; size: number };
}

export interface BridgeResultResponse {
  id: string;
  type: 'result';
  data: { total: number; paths: FoundPath[] };
}

export interface BridgeErrorResponse {
  id: string;
  type: 'error';
  message: string;
  code?: string;
}

export type BridgeResponse =
  | BridgeProgressResponse
  | BridgeResultResponse
  | BridgeErrorResponse;

// ── IPC progress events ─────────────────────────────────────

export interface ProgressEvent {
  module: ModuleId;
  path: string;
  size: number;
}

// ── Session state (Zustand) ─────────────────────────────────

export type ModuleStatus =
  | 'idle'
  | 'scanning'
  | 'found'
  | 'deleting'
  | 'done'
  | 'skipped'
  | 'error';

export interface ModuleState {
  status: ModuleStatus;
  foundPaths: FoundPath[];
  totalFoundBytes: number;
  freedBytes: number;
  error: string | null;
}

export interface SessionState {
  modules: Record<ModuleId, ModuleState>;
  totalFreed: number;
  scanStartedAt: Date | null;
  scanCompletedAt: Date | null;
}

// ── App settings (electron-store) ───────────────────────────

export interface AppSettings {
  largeFileThresholdMB: number;
  launchAtLogin: boolean;
  showInMenuBar: boolean;
  unusedAppThresholdDays: number;
  scanOnLaunch: boolean;
  telemetryOptIn: boolean;
  lastCleanedAt: string | null;
  installId: string;
}

// ── Disk usage ──────────────────────────────────────────────

export interface DiskUsage {
  totalBytes: number;
  freeBytes: number;
  usedBytes: number;
}

// ── Preload API exposed to renderer ─────────────────────────

export interface MacCleanAPI {
  scan: (module: ModuleId, options?: ScanOptions) => Promise<BridgeResultResponse['data']>;
  delete: (module: ModuleId, paths: string[]) => Promise<{ freedBytes: number }>;
  skipModule: (module: ModuleId) => Promise<void>;
  getSettings: () => Promise<AppSettings>;
  setSettings: (partial: Record<string, unknown>) => Promise<{ ok: boolean }>;
  getDiskUsage: () => Promise<any>;
  getDirectorySizes: (path: string) => Promise<Array<{ name: string; path: string; sizeBytes: number }>>;
  getHistory: (limit?: number) => Promise<any[]>;
  onProgress: (callback: (data: ProgressEvent) => void) => () => void;
}
