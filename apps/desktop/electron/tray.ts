import { app, Tray, Menu, nativeImage, ipcMain } from 'electron';
import { exec } from 'node:child_process';
import * as os from 'node:os';
import * as path from 'node:path';

let tray: Tray | null = null;
let updateInterval: NodeJS.Timeout | null = null;

function getMemoryPressure(): Promise<{ pressure: 'green' | 'yellow' | 'red'; percentage: number }> {
  return new Promise((resolve) => {
    // macOS `memory_pressure` tool outputs strings like "System-wide memory free percentage: 46%"
    exec('memory_pressure', (error, stdout) => {
      if (error || !stdout) {
        // Fallback to basic Node os memory if `memory_pressure` fails
        const total = os.totalmem();
        const free = os.freemem();
        const usedPct = ((total - free) / total) * 100;
        resolve({
          percentage: Math.round(usedPct),
          pressure: usedPct > 85 ? 'red' : usedPct > 65 ? 'yellow' : 'green'
        });
        return;
      }

      // Parse memory_pressure output
      let percentageText = stdout.match(/System-wide memory free percentage: (\d+)/i);
      let freePct = percentageText ? parseInt(percentageText[1], 10) : 50;
      let usedPct = 100 - freePct;

      let pressure: 'green' | 'yellow' | 'red' = 'green';
      if (stdout.includes('Critical')) pressure = 'red';
      else if (stdout.includes('Warn')) pressure = 'yellow';
      else if (usedPct > 85) pressure = 'red';
      else if (usedPct > 70) pressure = 'yellow';

      resolve({ percentage: usedPct, pressure });
    });
  });
}

async function updateTray() {
  if (!tray) return;

  const { pressure, percentage } = await getMemoryPressure();
  
  // Use a generic emoji to indicate status in the title since we don't have a generated icon file handy
  const iconStatus = pressure === 'green' ? '🟢' : pressure === 'yellow' ? '🟡' : '🔴';
  
  tray.setTitle(`${iconStatus} ${percentage}% RAM`);
  tray.setToolTip(`macclean Memory Monitor\nPressure: ${pressure.toUpperCase()}\nUsed: ${percentage}%`);
}

function purgeMemory() {
  // `sudo purge` requires password. 
  // We can try `memory_pressure -S local` which simulates memory pressure locally 
  // to force the system to clear inactive memory (caches) without sudo.
  if (!tray) return;
  tray.setTitle('🔄 Purging...');
  
  exec('memory_pressure -S local -p warn', (error) => {
    setTimeout(updateTray, 2000); // Update after a delay to show result
  });
}

export function initializeTray() {
  if (tray) return;

  // An empty transparent icon so we only see the title
  // In a real production app, we would use a proper Template icon.
  const emptyIcon = nativeImage.createEmpty();
  emptyIcon.resize({ width: 16, height: 16 });

  tray = new Tray(emptyIcon);
  
  const contextMenu = Menu.buildFromTemplate([
    { label: 'macclean Memory Monitor', enabled: false },
    { type: 'separator' },
    { label: 'Purge Memory Caches', click: purgeMemory },
    { type: 'separator' },
    { label: 'Open macclean', click: () => {
      // Focus the main window if possible
      const windows = require('electron').BrowserWindow.getAllWindows();
      if (windows.length > 0) {
        windows[0].show();
        windows[0].focus();
      }
    }},
    { label: 'Quit', role: 'quit' }
  ]);

  tray.setContextMenu(contextMenu);
  
  // Update Immediately
  updateTray();

  // Poll every 10 seconds
  updateInterval = setInterval(updateTray, 10000);
}

export function destroyTray() {
  if (updateInterval) clearInterval(updateInterval);
  if (tray) {
    tray.destroy();
    tray = null;
  }
}
