import { app } from 'electron';
import fs from 'node:fs';
import path from 'node:path';

const PLIST_NAME = 'io.macclean.agent.plist';
const SCHEDULER_PLIST_NAME = 'io.macclean.scheduler.plist';
const LAUNCH_AGENTS_DIR = path.join(app.getPath('home'), 'Library/LaunchAgents');

/**
 * Generate the launchd plist XML for the background agent.
 * Runs macclean --check every 6 hours.
 */
function generatePlist(execPath: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>io.macclean.agent</string>
    <key>ProgramArguments</key>
    <array>
        <string>${execPath}</string>
        <string>--check</string>
    </array>
    <key>StartInterval</key>
    <integer>21600</integer>
    <key>RunAtLoad</key>
    <false/>
    <key>StandardOutPath</key>
    <string>${path.join(app.getPath('userData'), 'agent.log')}</string>
    <key>StandardErrorPath</key>
    <string>${path.join(app.getPath('userData'), 'agent-error.log')}</string>
</dict>
</plist>`;
}

/**
 * Install the macclean background agent as a launchd user agent.
 */
export function installBackgroundAgent(): boolean {
  try {
    const execPath = app.getPath('exe');
    const plistPath = path.join(LAUNCH_AGENTS_DIR, PLIST_NAME);

    // Ensure LaunchAgents directory exists
    if (!fs.existsSync(LAUNCH_AGENTS_DIR)) {
      fs.mkdirSync(LAUNCH_AGENTS_DIR, { recursive: true });
    }

    // Write plist
    const content = generatePlist(execPath);
    fs.writeFileSync(plistPath, content, 'utf-8');

    console.log(`[BackgroundAgent] Installed at ${plistPath}`);
    return true;
  } catch (err) {
    console.error(`[BackgroundAgent] Failed to install: ${err}`);
    return false;
  }
}

/**
 * Uninstall the macclean background agent.
 */
export function uninstallBackgroundAgent(): boolean {
  try {
    const plistPath = path.join(LAUNCH_AGENTS_DIR, PLIST_NAME);
    if (fs.existsSync(plistPath)) {
      fs.unlinkSync(plistPath);
      console.log(`[BackgroundAgent] Uninstalled from ${plistPath}`);
    }
    return true;
  } catch (err) {
    console.error(`[BackgroundAgent] Failed to uninstall: ${err}`);
    return false;
  }
}

/**
 * Check if the background agent is installed.
 */
export function isBackgroundAgentInstalled(): boolean {
  const plistPath = path.join(LAUNCH_AGENTS_DIR, PLIST_NAME);
  return fs.existsSync(plistPath);
}

/**
 * Generate the launchd plist XML for the scheduled scan agent.
 */
function generateSchedulerPlist(execPath: string, frequency: string, hour: number): string {
  let calendarDict = '';
  if (frequency === 'weekly') {
    calendarDict = `<dict><key>Weekday</key><integer>1</integer><key>Hour</key><integer>${hour}</integer></dict>`;
  } else if (frequency === 'monthly') {
    calendarDict = `<dict><key>Day</key><integer>1</integer><key>Hour</key><integer>${hour}</integer></dict>`;
  } else {
    // Default Daily
    calendarDict = `<dict><key>Hour</key><integer>${hour}</integer></dict>`;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>io.macclean.scheduler</string>
    <key>ProgramArguments</key>
    <array>
        <string>${execPath}</string>
        <string>--headless</string>
        <string>--schedule</string>
    </array>
    <key>StartCalendarInterval</key>
    ${calendarDict}
    <key>RunAtLoad</key>
    <false/>
</dict>
</plist>`;
}

export function installSchedulerAgent(frequency: string, hour: number): boolean {
  try {
    const execPath = app.getPath('exe');
    const plistPath = path.join(LAUNCH_AGENTS_DIR, SCHEDULER_PLIST_NAME);
    if (!fs.existsSync(LAUNCH_AGENTS_DIR)) fs.mkdirSync(LAUNCH_AGENTS_DIR, { recursive: true });
    
    fs.writeFileSync(plistPath, generateSchedulerPlist(execPath, frequency, hour), 'utf-8');
    // Load it via launchctl so it picks up immediately
    import('child_process').then((cp) => {
      cp.exec(`launchctl load -w ${plistPath}`);
    });
    console.log(`[SchedulerAgent] Installed at ${plistPath}`);
    return true;
  } catch (err) {
    console.error(`[SchedulerAgent] Failed to install: ${err}`);
    return false;
  }
}

export function uninstallSchedulerAgent(): boolean {
  try {
    const plistPath = path.join(LAUNCH_AGENTS_DIR, SCHEDULER_PLIST_NAME);
    if (fs.existsSync(plistPath)) {
      import('child_process').then((cp) => {
        cp.exec(`launchctl unload -w ${plistPath}`, () => {
          fs.unlinkSync(plistPath);
        });
      });
    }
    return true;
  } catch (err) {
    return false;
  }
}
