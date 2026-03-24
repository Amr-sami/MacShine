import fs from 'node:fs';
import path from 'node:path';
import { app } from 'electron';

interface AuditEntry {
  action: 'DELETE' | 'SKIP';
  module: string;
  pathsCount: number;
  bytes: number;
  permanent: boolean;
}

/**
 * Append-only audit log.
 * Format: ISO_TIMESTAMP  ACTION  module=X  paths=N  bytes=N  permanent=bool
 * No file paths are ever written — only aggregates.
 */
export class AuditLog {
  private logPath: string;

  constructor() {
    const appDataDir = app.getPath('userData');
    this.logPath = path.join(appDataDir, 'audit.log');
  }

  log(entry: AuditEntry): void {
    const timestamp = new Date().toISOString();
    const line = [
      timestamp,
      entry.action.padEnd(6),
      `module=${entry.module}`,
      `paths=${entry.pathsCount}`,
      `bytes=${entry.bytes}`,
      `permanent=${entry.permanent}`,
    ].join('  ');

    try {
      fs.appendFileSync(this.logPath, line + '\n', 'utf-8');
    } catch (err) {
      console.error(`[AuditLog] Failed to write: ${err}`);
    }
  }
}
