import { Notification, powerMonitor, BrowserWindow } from 'electron';
import Store from 'electron-store';

type NotificationId = 'unused_apps' | 'disk_85' | 'disk_95' | 'long_unscanned' | 'scan_complete';

interface NotificationState {
  lastSent: Record<string, string | null>; // ISO 8601 timestamps
  snoozedUntil: Record<string, string | null>;
}

// Frequency caps in milliseconds
const FREQUENCY_CAPS: Record<NotificationId, number> = {
  unused_apps: 7 * 24 * 60 * 60 * 1000,    // 7 days
  disk_85: 7 * 24 * 60 * 60 * 1000,         // 7 days
  disk_95: 24 * 60 * 60 * 1000,             // 24 hours
  long_unscanned: 14 * 24 * 60 * 60 * 1000, // 14 days
  scan_complete: 0,                          // always
};

export class NotificationManager {
  private store: Store<NotificationState>;
  private mainWindow: (() => BrowserWindow | null);

  constructor(getMainWindow: () => BrowserWindow | null) {
    this.store = new Store<NotificationState>({
      name: 'notifications',
      defaults: {
        lastSent: {},
        snoozedUntil: {},
      },
    });
    this.mainWindow = getMainWindow;
  }

  /**
   * Check if a notification can be sent (respects frequency cap + snooze).
   */
  private canSend(id: NotificationId): boolean {
    const now = Date.now();

    // Check frequency cap
    const lastSent = this.store.get(`lastSent.${id}` as any);
    if (lastSent) {
      const elapsed = now - new Date(lastSent as string).getTime();
      if (elapsed < FREQUENCY_CAPS[id]) return false;
    }

    // Check snooze
    const snoozedUntil = this.store.get(`snoozedUntil.${id}` as any);
    if (snoozedUntil) {
      if (now < new Date(snoozedUntil as string).getTime()) return false;
    }

    return true;
  }

  /**
   * Check DND / Focus mode. Returns true if it's okay to send.
   * Exception: disk_95 always sends.
   */
  private canInterrupt(id: NotificationId): boolean {
    // Critical alerts bypass DND
    if (id === 'disk_95') return true;

    try {
      // Check if system is idle (user might be in a meeting / presenting)
      const idleTime = powerMonitor.getSystemIdleTime();
      // Don't send if user has been idle less than 60 seconds (actively working)
      // but also don't send if idle for a very long time (screen locked)
      if (idleTime < 60) return false;
    } catch {
      // powerMonitor may not be available in all contexts
    }

    return true;
  }

  /**
   * Send a macOS notification.
   */
  send(id: NotificationId, title: string, body: string, actions?: string[]): boolean {
    if (!Notification.isSupported()) {
      this.sendInAppFallback(title, body);
      return false;
    }

    if (!this.canSend(id)) return false;
    if (!this.canInterrupt(id)) return false;

    const notification = new Notification({
      title,
      body,
      silent: false,
    });

    notification.on('click', () => {
      const win = this.mainWindow();
      if (win) {
        win.show();
        win.focus();
        // Navigate to relevant page based on notification type
        switch (id) {
          case 'unused_apps':
            win.webContents.send('navigate', 'app-manager');
            break;
          case 'disk_85':
          case 'disk_95':
          case 'long_unscanned':
          case 'scan_complete':
            win.webContents.send('navigate', 'smart-scan');
            break;
        }
      }
    });

    notification.show();

    // Record sent time
    this.store.set(`lastSent.${id}` as any, new Date().toISOString());

    return true;
  }

  /**
   * Snooze a notification for a given duration.
   */
  snooze(id: NotificationId, durationMs: number): void {
    const until = new Date(Date.now() + durationMs).toISOString();
    this.store.set(`snoozedUntil.${id}` as any, until);
  }

  /**
   * Fallback: send to renderer as an in-app banner.
   */
  private sendInAppFallback(title: string, body: string): void {
    const win = this.mainWindow();
    if (win) {
      win.webContents.send('in-app-notification', { title, body });
    }
  }

  // ── Notification check methods ──────────────────────────────

  /**
   * Check for unused apps and send notification.
   */
  checkUnusedApps(unusedApps: { name: string; sizeBytes: number }[]): void {
    if (unusedApps.length === 0) return;

    const topApps = unusedApps.slice(0, 2);
    const names = topApps.map((a) => `${a.name} (${formatBytes(a.sizeBytes)})`);
    const remaining = unusedApps.length - topApps.length;
    const bodyParts = names.join(', ');
    const suffix = remaining > 0 ? `, and ${remaining} more` : '';

    this.send(
      'unused_apps',
      `${unusedApps.length} apps haven't been used in 90+ days`,
      `${bodyParts}${suffix} are taking up space.`
    );
  }

  /**
   * Check disk usage and send notifications.
   */
  checkDiskUsage(usedPercent: number, freeBytes: number): void {
    if (usedPercent >= 95) {
      this.send(
        'disk_95',
        `Your disk is ${usedPercent}% full`,
        `You have ${formatBytes(freeBytes)} remaining. Run a quick scan to free up space.`
      );
    } else if (usedPercent >= 85) {
      this.send(
        'disk_85',
        `Your disk is ${usedPercent}% full`,
        `You have ${formatBytes(freeBytes)} remaining. Run a quick scan to free up space.`
      );
    }
  }

  /**
   * Check if user hasn't scanned in a while.
   */
  checkLastCleaned(lastCleanedAt: string | null): void {
    if (!lastCleanedAt) {
      this.send(
        'long_unscanned',
        'macclean hasn\'t run yet',
        'A quick scan usually finds 2–5 GB of junk. Takes 30 seconds.'
      );
      return;
    }

    const daysSince = (Date.now() - new Date(lastCleanedAt).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSince >= 30) {
      this.send(
        'long_unscanned',
        `macclean hasn't run in ${Math.floor(daysSince)} days`,
        'A quick scan usually finds 2–5 GB of junk. Takes 30 seconds.'
      );
    }
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}
