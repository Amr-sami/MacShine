import React, { useEffect, useState } from 'react';

interface LicenseState {
  isPro: boolean;
  expiresAt: Date | null;
  email: string | null;
}

interface Settings {
  largeFileThresholdMB: number;
  launchAtLogin: boolean;
  showInMenuBar: boolean;
  unusedAppThresholdDays: number;
  scanOnLaunch: boolean;
  telemetryOptIn: boolean;
  scheduledFrequency: 'daily' | 'weekly' | 'monthly' | 'disabled';
  scheduledHour: number;
  cloudSyncEnabled: boolean;
}

const DEFAULT_SETTINGS: Settings = {
  largeFileThresholdMB: 200,
  launchAtLogin: false,
  showInMenuBar: true,
  unusedAppThresholdDays: 90,
  scanOnLaunch: false,
  telemetryOptIn: false,
  scheduledFrequency: 'disabled',
  scheduledHour: 10,
  cloudSyncEnabled: false,
};

export function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);
  const [license, setLicense] = useState<LicenseState>({ isPro: false, expiresAt: null, email: null });
  const [keyInput, setKeyInput] = useState('');
  const [keyError, setKeyError] = useState<string | null>(null);

  const loadData = async () => {
    const [s, l] = await Promise.all([
      window.macclean.getSettings(),
      window.macclean.getLicenseStatus(),
    ]);
    setSettings({ ...DEFAULT_SETTINGS, ...s } as any);
    setLicense(l as LicenseState);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveKey = async () => {
    if (!keyInput.trim()) return;
    setKeyError(null);
    const success = await window.macclean.saveLicenseKey(keyInput.trim());
    if (success) {
      setKeyInput('');
      await loadData();
    } else {
      setKeyError('Invalid or corrupted license key.');
    }
  };

  const handleRemoveKey = async () => {
    await window.macclean.removeLicenseKey();
    await loadData();
  };

  const updateSetting = async <K extends keyof Settings>(key: K, value: Settings[K]) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    await window.macclean.setSettings({ [key]: value });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="h-full overflow-y-auto px-6 py-6">
      <h2 className="text-lg font-bold text-mc-text mb-6">Settings</h2>

      <div className="max-w-lg space-y-6 pb-12">
        {/* Subscription */}
        <section>
          <h3 className="text-xs uppercase tracking-wider text-mc-muted mb-3">Subscription</h3>
          <div className="bg-mc-surface px-4 py-4 rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-mc-text">
                  Current Plan: <span className={license.isPro ? 'text-mc-accent font-bold' : 'text-mc-muted'}>
                    {license.isPro ? 'macclean Pro' : 'Free Tier'}
                  </span>
                </p>
                {license.isPro && license.email && (
                  <p className="text-xs text-mc-muted mt-1">Licensed to: {license.email}</p>
                )}
                {license.isPro && license.expiresAt && (
                  <p className="text-[10px] text-mc-muted">Expires: {new Date(license.expiresAt).toLocaleDateString()}</p>
                )}
              </div>
              {license.isPro && (
                <button
                  onClick={handleRemoveKey}
                  className="px-3 py-1.5 text-xs text-mc-destructive border border-mc-destructive/30 rounded hover:bg-mc-destructive/10 transition-colors"
                >
                  Remove Key
                </button>
              )}
            </div>

            {license.isPro && (
              <div className="pt-4 border-t border-mc-border">
                <ToggleSetting
                  label="Cloud Sync (Dashboard)"
                  description="Sync your cleaning stats to the macclean Cloud Dashboard"
                  value={settings.cloudSyncEnabled}
                  onChange={(v) => updateSetting('cloudSyncEnabled', v)}
                />
              </div>
            )}

            {!license.isPro && (
              <div className="pt-2 border-t border-mc-border space-y-2">
                <p className="text-xs text-mc-muted">Enter your License Key to unlock Pro features:</p>
                <div className="flex items-center gap-2">
                  <input
                    type="password"
                    placeholder="ey..."
                    value={keyInput}
                    onChange={(e) => setKeyInput(e.target.value)}
                    className="flex-1 bg-mc-bg border border-mc-border rounded px-3 py-1.5 text-sm text-mc-text font-mono focus:outline-none focus:border-mc-accent transition-colors"
                  />
                  <button
                    onClick={handleSaveKey}
                    disabled={!keyInput.trim()}
                    className="px-3 py-1.5 text-xs bg-mc-accent text-mc-bg font-bold rounded hover:bg-mc-accent/90 transition-colors disabled:opacity-50"
                  >
                    Activate
                  </button>
                </div>
                {keyError && <p className="text-xs text-mc-destructive">{keyError}</p>}
              </div>
            )}
          </div>
        </section>

        {/* Scheduled Cleaning */}
        <section>
          <h3 className="text-xs uppercase tracking-wider text-mc-muted mb-3">Scheduled Cleaning (Pro)</h3>
          <div className="bg-mc-surface px-4 py-4 rounded-lg space-y-4">
            {!license.isPro ? (
              <div className="text-sm text-mc-muted py-2 text-center">
                Upgrade to macclean Pro to enable automatic scheduled scans.
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-mc-text">Frequency</p>
                    <p className="text-xs text-mc-muted">How often to run a background scan</p>
                  </div>
                  <select
                    value={settings.scheduledFrequency}
                    onChange={(e) => {
                      updateSetting('scheduledFrequency', e.target.value as any);
                      window.macclean.updateSchedule(e.target.value, settings.scheduledHour);
                    }}
                    className="bg-mc-bg border border-mc-border rounded px-2 py-1 text-sm text-mc-text focus:outline-none"
                  >
                    <option value="disabled">Disabled</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                {settings.scheduledFrequency !== 'disabled' && (
                  <div className="flex items-center justify-between pt-3 border-t border-mc-border">
                    <div>
                      <p className="text-sm text-mc-text">Time of Day</p>
                    </div>
                    <select
                      value={settings.scheduledHour}
                      onChange={(e) => {
                        const h = parseInt(e.target.value, 10);
                        updateSetting('scheduledHour', h);
                        window.macclean.updateSchedule(settings.scheduledFrequency, h);
                      }}
                      className="bg-mc-bg border border-mc-border rounded px-2 py-1 text-sm text-mc-text focus:outline-none"
                    >
                      {Array.from({ length: 24 }).map((_, i) => (
                        <option key={i} value={i}>{`${i.toString().padStart(2, '0')}:00`}</option>
                      ))}
                    </select>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* General */}
        <section>
          <h3 className="text-xs uppercase tracking-wider text-mc-muted mb-3">General</h3>
          <div className="space-y-3">
            <ToggleSetting
              label="Launch at login"
              description="Start macclean when you log in"
              value={settings.launchAtLogin}
              onChange={(v) => updateSetting('launchAtLogin', v)}
            />
            <ToggleSetting
              label="Show in menu bar"
              description="Keep macclean accessible from the menu bar"
              value={settings.showInMenuBar}
              onChange={(v) => updateSetting('showInMenuBar', v)}
            />
            <ToggleSetting
              label="Scan on launch"
              description="Run a smart scan when the app opens"
              value={settings.scanOnLaunch}
              onChange={(v) => updateSetting('scanOnLaunch', v)}
            />
          </div>
        </section>

        {/* Scanning */}
        <section>
          <h3 className="text-xs uppercase tracking-wider text-mc-muted mb-3">Scanning</h3>
          <div className="space-y-3">
            <NumberSetting
              label="Large file threshold"
              description="Files above this size appear in the Large Files module"
              value={settings.largeFileThresholdMB}
              suffix="MB"
              min={50}
              max={5000}
              onChange={(v) => updateSetting('largeFileThresholdMB', v)}
            />
            <NumberSetting
              label="Unused app threshold"
              description="Days since last use before flagging an app"
              value={settings.unusedAppThresholdDays}
              suffix="days"
              min={30}
              max={365}
              onChange={(v) => updateSetting('unusedAppThresholdDays', v)}
            />
          </div>
        </section>

        {/* Privacy */}
        <section>
          <h3 className="text-xs uppercase tracking-wider text-mc-muted mb-3">Privacy</h3>
          <div className="space-y-3">
            <ToggleSetting
              label="Crash reporting"
              description="Send anonymous crash reports to help improve macclean"
              value={settings.telemetryOptIn}
              onChange={(v) => updateSetting('telemetryOptIn', v)}
            />
          </div>
        </section>

        {saved && (
          <p className="text-xs text-mc-accent">✓ Settings saved</p>
        )}
      </div>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────

function ToggleSetting({ label, description, value, onChange }: {
  label: string; description: string; value: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between bg-mc-surface px-4 py-3 rounded-lg">
      <div>
        <p className="text-sm text-mc-text">{label}</p>
        <p className="text-xs text-mc-muted">{description}</p>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative w-10 h-5 rounded-full transition-colors ${
          value ? 'bg-mc-accent' : 'bg-mc-border'
        }`}
      >
        <span
          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
            value ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  );
}

function NumberSetting({ label, description, value, suffix, min, max, onChange }: {
  label: string; description: string; value: number; suffix: string; min: number; max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between bg-mc-surface px-4 py-3 rounded-lg">
      <div>
        <p className="text-sm text-mc-text">{label}</p>
        <p className="text-xs text-mc-muted">{description}</p>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-16 bg-mc-bg border border-mc-border rounded px-2 py-1 text-sm text-mc-text font-mono text-right"
        />
        <span className="text-xs text-mc-muted">{suffix}</span>
      </div>
    </div>
  );
}
