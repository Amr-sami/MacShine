import { app, BrowserWindow, ipcMain, Tray } from 'electron';
import path from 'node:path';
import { PythonBridge } from './bridge/python';
import { SettingsManager } from './settings';
import { AuditLog } from './audit';
import { NotificationManager } from './notifications';
import { installBackgroundAgent, installSchedulerAgent, uninstallSchedulerAgent } from './background';
import { LicenseManager } from './license';
import { SyncManager } from './sync';
import { initializeTray } from './tray';

let mainWindow: BrowserWindow | null = null;
export function getMainWindow() {
  return mainWindow;
}

// The built directory structure
//
// ├─ dist-electron
// │  └─ main.js         <- Electron main process
// │  └─ preload.js      <- Preload script
// ├─ dist
// │  └─ index.html      <- Vite build output (renderer)

process.env.DIST_ELECTRON = path.join(__dirname);
process.env.DIST = path.join(__dirname, '../dist');
process.env.VITE_PUBLIC = process.env.VITE_DEV_SERVER_URL
  ? path.join(__dirname, '../renderer/public')
  : process.env.DIST;

let pythonBridge: PythonBridge | null = null;
let tray: Tray | null = null;
let settings: SettingsManager;
let auditLog: AuditLog;
let notifications: NotificationManager;
let licenseManager: LicenseManager;
let syncManager: SyncManager;

const isDev = !!process.env.VITE_DEV_SERVER_URL;
const isCheck = process.argv.includes('--check');
const isSchedule = process.argv.includes('--schedule');
const isHeadless = isCheck || isSchedule || process.argv.includes('--headless');

// ── Window ──────────────────────────────────────────────────

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 740,
    minWidth: 900,
    minHeight: 600,
    backgroundColor: '#0d0f0e',
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 16, y: 16 },
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    },
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show();
  });

  // Hide to tray instead of closing (macOS standard behavior)
  mainWindow.on('close', (event) => {
    if (!(app as any).__isQuitting && settings?.get('showInMenuBar')) {
      event.preventDefault();
      mainWindow?.hide();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Load renderer
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL + 'renderer/index.html');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(process.env.DIST!, 'renderer/index.html'));
  }
}

// ── Python Bridge ───────────────────────────────────────────

function initPythonBridge(): void {
  const pythonScriptPath = isDev
    ? path.join(__dirname, '../python/main.py')
    : path.join(process.resourcesPath, 'python', 'main');

  pythonBridge = new PythonBridge(pythonScriptPath, isDev);

  pythonBridge.on('progress', (data) => {
    getMainWindow()?.webContents.send('scan-progress', data);
  });

  pythonBridge.start();
}

// ── IPC Handlers ────────────────────────────────────────────

function registerIpcHandlers(): void {
  ipcMain.handle('scan', async (_event, module: string, options?: Record<string, unknown>) => {
    if (!pythonBridge) throw new Error('Python bridge not initialized');
    return pythonBridge.request({ action: 'scan', module, options });
  });

  ipcMain.handle('delete', async (_event, module: string, paths: string[]) => {
    if (!pythonBridge) throw new Error('Python bridge not initialized');
    const result = await pythonBridge.request({ action: 'delete', module, options: { paths } });

    // Log to audit
    const data = result as any;
    auditLog?.log({
      action: 'DELETE',
      module,
      pathsCount: paths.length,
      bytes: data?.freedBytes ?? 0,
      permanent: !['trash'].includes(module), // trash empties are permanent
    });

    return result;
  });

  ipcMain.handle('skip', async (_event, module: string) => {
    auditLog?.log({ action: 'SKIP', module, pathsCount: 0, bytes: 0, permanent: false });
    return { ok: true };
  });

  ipcMain.handle('get-settings', async () => {
    return settings.getAll();
  });

  ipcMain.handle('set-settings', async (_event, partial: Record<string, unknown>) => {
    for (const [key, value] of Object.entries(partial)) {
      settings.set(key as any, value);
    }

    // Handle login item setting
    if ('launchAtLogin' in partial) {
      app.setLoginItemSettings({ openAtLogin: !!partial.launchAtLogin });
    }

    return { ok: true };
  });

  ipcMain.handle('get-disk-usage', async () => {
    if (!pythonBridge) throw new Error('Python bridge not initialized');
    return pythonBridge.request({ action: 'get_disk_usage' });
  });

  ipcMain.handle('get-directory-sizes', async (_event, targetPath: string) => {
    return new Promise((resolve, reject) => {
      // Use 'du -sk *' inside the target directory.
      // -s = summarize, -k = 1024-byte blocks. Defaulting to 1-depth
      const { exec } = require('node:child_process');
      const safePath = `"${targetPath.replace(/"/g, '\\"')}"`;

      // We run `du -d 1 -k` which is compatible with macOS to get 1st level depths.
      exec(`du -d 1 -k ${safePath}`, (error: any, stdout: string) => {
        if (error) {
          // If permission denied warnings occur, we still process what we get.
          console.warn('[SpaceLens] du warnings:', error.message);
        }

        if (!stdout) return resolve([]);

        const lines = stdout.split('\n').filter(Boolean);
        const results = [];

        for (const line of lines) {
          const match = line.trim().match(/^(\d+)\s+(.+)$/);
          if (match) {
            const sizeKB = parseInt(match[1], 10);
            const fullPath = match[2];
            // Skip the total summary line which matches the safePath exactly
            if (fullPath === targetPath) continue;

            const name = require('path').basename(fullPath);
            results.push({
              name,
              path: fullPath,
              sizeBytes: sizeKB * 1024,
            });
          }
        }

        // Sort largest first
        results.sort((a, b) => b.sizeBytes - a.sizeBytes);
        resolve(results);
      });
    });
  });

  ipcMain.handle('get-history', async (_event, limit?: number) => {
    // TODO: implement with SQLite in history.ts
    const maxItems = limit ?? (licenseManager.getPlanDetails().isPro ? 1000 : 5);
    // return historyItems.slice(0, maxItems);
    return [];
  });

  ipcMain.handle('save-session', async (_event, session: Record<string, unknown>) => {
    // Update last cleaned
    settings.set('lastCleanedAt', new Date().toISOString());

    // Trigger cloud sync if enabled and Pro
    if (settings.get('cloudSyncEnabled') && licenseManager.getPlanDetails().isPro) {
      syncManager.syncSession(session);
    }

    return { ok: true };
  });

  ipcMain.handle('get-onboarding-complete', async () => {
    return settings.get('onboardingComplete' as any) ?? false;
  });

  ipcMain.handle('set-onboarding-complete', async () => {
    settings.set('onboardingComplete' as any, true);
    return { ok: true };
  });

  ipcMain.handle('open-privacy-settings', async () => {
    const { shell } = await import('electron');
    shell.openExternal('x-apple.systempreferences:com.apple.preference.security?Privacy_AllFiles');
    return { ok: true };
  });

  // License Handlers
  ipcMain.handle('get-license-status', async () => {
    return licenseManager.getPlanDetails();
  });

  ipcMain.handle('save-license-key', async (_event, key: string) => {
    return licenseManager.saveLicenseKey(key);
  });

  ipcMain.handle('remove-license-key', async () => {
    licenseManager.removeLicenseKey();
    return true;
  });

  // Schedule Handler
  ipcMain.handle('update-schedule', async (_event, frequency: string, hour: number) => {
    settings.set('scheduledFrequency' as any, frequency);
    settings.set('scheduledHour' as any, hour);
    if (frequency === 'disabled') {
      return uninstallSchedulerAgent();
    } else {
      return installSchedulerAgent(frequency, hour);
    }
  });
}

// ── App Lifecycle ───────────────────────────────────────────

app.whenReady().then(async () => {
  settings = new SettingsManager();
  auditLog = new AuditLog();
  notifications = new NotificationManager(() => getMainWindow());
  licenseManager = new LicenseManager();
  syncManager = new SyncManager(settings.get('installId'));

  // Disable login item by default
  app.setLoginItemSettings({ openAtLogin: settings.get('launchAtLogin') });

  registerIpcHandlers();
  initPythonBridge();

  if (isHeadless) {
    // Headless execution (from launchd agents)
    pythonBridge?.on('ready', async () => {
      try {
        if (isCheck) {
          await runNotificationChecks();
        } else if (isSchedule) {
          await runScheduledClean();
        }
      } catch (err) {
        console.error('[Headless] Error:', err);
      } finally {
        setTimeout(() => app.quit(), 2000); // Give IPC/notifications a moment
      }
    });

    // We don't create a window or a tray for headless mode
    return;
  }

  // Normal interactive execution
  createWindow();

  // Install background agent
  if (installBackgroundAgent()) {
    console.log('Background agent initialized.');
  }

  // Initialize Memory Monitor Tray
  initializeTray();

  // Run notification checks after bridge is ready
  pythonBridge?.on('ready', async () => {
    await runNotificationChecks();
  });

  // Periodic notification checks (every 6 hours)
  setInterval(runNotificationChecks, 6 * 60 * 60 * 1000);

  app.on('activate', () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    } else if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

async function runScheduledClean(): Promise<void> {
  if (!pythonBridge?.isReady) return;
  console.log('[Scheduler] Starting scheduled clean...');
  
  // Basic Smart Scan (Caches, Logs, Trash)
  const modules = ['caches', 'logs', 'trash'];
  let totalFreed = 0;

  for (const mod of modules) {
    try {
      const scanRes = await pythonBridge.request({ action: 'scan', module: mod }) as any;
      if (scanRes?.paths?.length > 0) {
        const delRes = await pythonBridge.request({ action: 'delete', module: mod, options: { paths: scanRes.paths } }) as any;
        if (delRes?.freedBytes) totalFreed += delRes.freedBytes;
      }
    } catch {}
  }

  if (totalFreed > 0) {
    const mb = Math.round(totalFreed / 1024 / 1024);
    notifications.send(
      'scan_complete',
      'Scheduled Clean Complete',
      `macclean silently freed ${mb} MB of junk just now.`
    );
    settings.set('lastCleanedAt', new Date().toISOString());
  }
}

async function runNotificationChecks(): Promise<void> {
  if (!pythonBridge?.isReady) return;

  try {
    // Check disk usage
    const diskUsage = await pythonBridge.request({ action: 'get_disk_usage' }) as any;
    if (diskUsage) {
      const usedPercent = Math.round((diskUsage.usedBytes / diskUsage.totalBytes) * 100);
      notifications.checkDiskUsage(usedPercent, diskUsage.freeBytes);
    }

    // Check last cleaned
    notifications.checkLastCleaned(settings.get('lastCleanedAt'));

    // Check unused apps
    const appsResult = await pythonBridge.request({ action: 'scan', module: 'apps' }) as any;
    if (appsResult?.paths) {
      const unused = appsResult.paths.filter((a: any) => a.isUnused);
      if (unused.length > 0) {
        notifications.checkUnusedApps(unused);
      }
    }
  } catch (err) {
    console.error('[NotificationChecks] Error:', err);
  }
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  (app as any).__isQuitting = true;
  pythonBridge?.stop();
});
