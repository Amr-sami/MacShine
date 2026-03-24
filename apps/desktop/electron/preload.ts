import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('macclean', {
  scan: (module: string, options?: Record<string, unknown>) =>
    ipcRenderer.invoke('scan', module, options),

  delete: (module: string, paths: string[]) =>
    ipcRenderer.invoke('delete', module, paths),

  skipModule: (module: string) =>
    ipcRenderer.invoke('skip', module),

  getSettings: () =>
    ipcRenderer.invoke('get-settings'),

  setSettings: (settings: Record<string, unknown>) =>
    ipcRenderer.invoke('set-settings', settings),

  getDiskUsage: () => ipcRenderer.invoke('get-disk-usage'),
  getDirectorySizes: (path: string) => ipcRenderer.invoke('get-directory-sizes', path),
  getHistory: (limit?: number) =>
    ipcRenderer.invoke('get-history', limit),

  saveSession: (session: Record<string, unknown>) =>
    ipcRenderer.invoke('save-session', session),

  getOnboardingComplete: () =>
    ipcRenderer.invoke('get-onboarding-complete'),

  setOnboardingComplete: () =>
    ipcRenderer.invoke('set-onboarding-complete'),

  openPrivacySettings: () =>
    ipcRenderer.invoke('open-privacy-settings'),

  getLicenseStatus: () =>
    ipcRenderer.invoke('get-license-status'),

  saveLicenseKey: (key: string) =>
    ipcRenderer.invoke('save-license-key', key),

  removeLicenseKey: () =>
    ipcRenderer.invoke('remove-license-key'),

  updateSchedule: (frequency: string, hour: number) =>
    ipcRenderer.invoke('update-schedule', frequency, hour),

  onProgress: (callback: (data: unknown) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, data: unknown) => callback(data);
    ipcRenderer.on('scan-progress', handler);
    return () => {
      ipcRenderer.removeListener('scan-progress', handler);
    };
  },

  onQuickScan: (callback: () => void) => {
    ipcRenderer.on('quick-scan', () => callback());
    return () => {
      ipcRenderer.removeAllListeners('quick-scan');
    };
  },

  onNavigate: (callback: (page: string) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, page: string) => callback(page);
    ipcRenderer.on('navigate', handler);
    return () => {
      ipcRenderer.removeListener('navigate', handler);
    };
  },

  onInAppNotification: (callback: (data: { title: string; body: string }) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, data: { title: string; body: string }) => callback(data);
    ipcRenderer.on('in-app-notification', handler);
    return () => {
      ipcRenderer.removeListener('in-app-notification', handler);
    };
  },
});
