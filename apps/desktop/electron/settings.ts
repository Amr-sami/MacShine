import Store from 'electron-store';
import { randomUUID } from 'node:crypto';

interface AppSettings {
  largeFileThresholdMB: number;
  launchAtLogin: boolean;
  showInMenuBar: boolean;
  unusedAppThresholdDays: number;
  scanOnLaunch: boolean;
  telemetryOptIn: boolean;
  lastCleanedAt: string | null;
  installId: string;
  onboardingComplete: boolean;
  scheduledFrequency: 'daily' | 'weekly' | 'monthly' | 'disabled';
  scheduledHour: number;
  cloudSyncEnabled: boolean;
}

const DEFAULTS: AppSettings = {
  largeFileThresholdMB: 200,
  launchAtLogin: false,
  showInMenuBar: true,
  unusedAppThresholdDays: 90,
  scanOnLaunch: false,
  telemetryOptIn: false,
  lastCleanedAt: null,
  installId: randomUUID(),
  onboardingComplete: false,
  scheduledFrequency: 'disabled',
  scheduledHour: 10,
  cloudSyncEnabled: false,
};

export class SettingsManager {
  private store: Store<AppSettings>;

  constructor() {
    this.store = new Store<AppSettings>({
      name: 'config',
      defaults: DEFAULTS,
      encryptionKey: 'macclean-v1', // Basic encryption via electron-store
    });
  }

  get<K extends keyof AppSettings>(key: K): AppSettings[K] {
    return this.store.get(key);
  }

  set<K extends keyof AppSettings>(key: K, value: AppSettings[K]): void {
    this.store.set(key, value);
  }

  getAll(): AppSettings {
    return this.store.store;
  }

  reset(): void {
    this.store.clear();
  }
}
