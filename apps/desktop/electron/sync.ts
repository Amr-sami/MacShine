import os from 'node:os';

interface SyncPayload {
  deviceId: string;
  deviceName: string;
  macOSVersion: string;
  sessionId: string;
  completedAt: string;
  totalFreedBytes: number;
  moduleSummaries: {
    module: string;
    freedBytes: number;
    pathsCount: number;
  }[];
  diskUsageBefore: number;
  diskUsageAfter: number;
}

export class SyncManager {
  private deviceId: string;

  constructor(deviceId: string) {
    this.deviceId = deviceId;
  }

  public async syncSession(sessionData: any): Promise<void> {
    try {
      const payload: SyncPayload = {
        deviceId: this.deviceId,
        deviceName: os.hostname(),
        macOSVersion: os.release(),
        sessionId: sessionData.sessionId || crypto.randomUUID(),
        completedAt: new Date().toISOString(),
        totalFreedBytes: sessionData.totalFreed || 0,
        moduleSummaries: Object.entries(sessionData.modules || {}).map(([modName, mod]: [string, any]) => ({
          module: modName,
          freedBytes: mod.freedBytes || 0,
          pathsCount: mod.foundPaths?.length || 0,
        })),
        diskUsageBefore: sessionData.diskUsageBefore || 0,
        diskUsageAfter: sessionData.diskUsageAfter || 0,
      };

      console.log('[SyncManager] Dispatching payload to cloud...', JSON.stringify(payload, null, 2));

      // POST to our Next.js backend API
      const res = await fetch('http://localhost:3000/api/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        console.error('[SyncManager] Failed to sync session:', await res.text());
      } else {
        console.log('[SyncManager] Successfully synced session to cloud.');
      }
    } catch (err) {
      console.error('[SyncManager] Error syncing session:', err);
    }
  }
}
