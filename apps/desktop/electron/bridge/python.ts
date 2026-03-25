import { ChildProcess, spawn } from 'node:child_process';
import { EventEmitter } from 'node:events';
import { randomUUID } from 'node:crypto';

interface PendingRequest {
  resolve: (data: unknown) => void;
  reject: (error: Error) => void;
  timer: NodeJS.Timeout;
}

const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 3000, 10000]; // Exponential backoff
const REQUEST_TIMEOUT = 300000; // 5 minutes — scans run sequentially in Python

/**
 * PythonBridge — spawns a Python subprocess and communicates
 * via newline-delimited JSON over stdin/stdout.
 *
 * Features:
 * - Auto-restart on crash (max 3 retries, exponential backoff)
 * - Request timeout (30s default)
 * - Ready state tracking
 */
export class PythonBridge extends EventEmitter {
  private process: ChildProcess | null = null;
  private pending = new Map<string, PendingRequest>();
  private buffer = '';
  private scriptPath: string;
  private isDev: boolean;
  private retryCount = 0;
  private _isReady = false;
  private _isStopping = false;

  get isReady(): boolean {
    return this._isReady;
  }

  constructor(scriptPath: string, isDev: boolean) {
    super();
    this.scriptPath = scriptPath;
    this.isDev = isDev;
  }

  start(): void {
    if (this._isStopping) return;

    const command = this.isDev ? 'python3' : this.scriptPath;
    const args = this.isDev ? [this.scriptPath] : [];

    console.log(`[PythonBridge] Starting: ${command} ${args.join(' ')}`);

    this.process = spawn(command, args, {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, PYTHONUNBUFFERED: '1' },
    });

    this.process.stdout?.on('data', (chunk: Buffer) => {
      this.buffer += chunk.toString();
      this.processBuffer();
    });

    this.process.stderr?.on('data', (chunk: Buffer) => {
      console.error(`[PythonBridge] stderr: ${chunk.toString().trim()}`);
    });

    this.process.on('close', (code) => {
      console.log(`[PythonBridge] Process exited with code ${code}`);
      this._isReady = false;

      // Reject all pending requests
      for (const [id, req] of this.pending) {
        clearTimeout(req.timer);
        req.reject(new Error(`Python bridge exited with code ${code}`));
      }
      this.pending.clear();
      this.process = null;

      // Auto-restart if not intentionally stopping
      if (!this._isStopping && this.retryCount < MAX_RETRIES) {
        const delay = RETRY_DELAYS[this.retryCount] || 10000;
        console.log(`[PythonBridge] Restarting in ${delay}ms (attempt ${this.retryCount + 1}/${MAX_RETRIES})`);
        this.retryCount++;
        setTimeout(() => this.start(), delay);
      } else if (this.retryCount >= MAX_RETRIES) {
        console.error('[PythonBridge] Max retries reached. Bridge is down.');
        this.emit('crashed');
      }
    });

    this.process.on('error', (err) => {
      console.error(`[PythonBridge] Failed to start: ${err.message}`);
    });
  }

  stop(): void {
    this._isStopping = true;
    if (this.process) {
      this.process.kill();
      this.process = null;
    }
    // Clear all pending
    for (const [id, req] of this.pending) {
      clearTimeout(req.timer);
      req.reject(new Error('Python bridge stopped'));
    }
    this.pending.clear();
  }

  async request(params: {
    action: string;
    module?: string;
    options?: Record<string, unknown>;
  }): Promise<unknown> {
    if (!this.process?.stdin) {
      throw new Error('Python bridge is not running');
    }

    const id = `req_${randomUUID().slice(0, 8)}`;
    const request = {
      id,
      action: params.action,
      module: params.module,
      options: params.options ?? {},
    };

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`Python bridge request timed out after ${REQUEST_TIMEOUT}ms`));
      }, REQUEST_TIMEOUT);

      this.pending.set(id, { resolve, reject, timer });
      const payload = JSON.stringify(request) + '\n';
      this.process!.stdin!.write(payload);
    });
  }

  private processBuffer(): void {
    const lines = this.buffer.split('\n');
    this.buffer = lines.pop() ?? '';

    for (const line of lines) {
      if (!line.trim()) continue;

      try {
        const response = JSON.parse(line);
        this.handleResponse(response);
      } catch (err) {
        console.error(`[PythonBridge] Failed to parse JSON: ${line}`);
      }
    }
  }

  private handleResponse(response: {
    id: string;
    type: 'progress' | 'result' | 'error';
    data?: unknown;
    message?: string;
  }): void {
    const { id, type } = response;

    // Handle init response (bridge ready)
    if (id === 'init' && type === 'result') {
      this._isReady = true;
      this.retryCount = 0; // Reset retry count on successful start
      this.emit('ready');
      console.log('[PythonBridge] Ready');
      return;
    }

    if (type === 'progress') {
      // Forward the COMPLETE response so renderer gets type, module, and data
      this.emit('progress', response);
      return;
    }

    const pending = this.pending.get(id);
    if (!pending) {
      console.warn(`[PythonBridge] No pending request for id: ${id}`);
      return;
    }

    clearTimeout(pending.timer);
    this.pending.delete(id);

    if (type === 'error') {
      pending.reject(new Error(response.message ?? 'Unknown Python error'));
    } else if (type === 'result') {
      pending.resolve(response.data);
    }
  }
}
