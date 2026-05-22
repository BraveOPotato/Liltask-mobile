import { decodeUpdates } from './crdt';
import { CRDTStore, SyncStatus } from './types';

type StatusCallback = (status: SyncStatus) => void;

export class SyncService {
  private workerUrl: string;
  private offlineMode: boolean;
  private syncTimers: Record<string, ReturnType<typeof setTimeout>> = {};
  private isPulling = false;
  private onStatus: StatusCallback;

  constructor(workerUrl: string, offlineMode: boolean, onStatus: StatusCallback) {
    this.workerUrl = workerUrl.replace(/\/+$/, '');
    this.offlineMode = offlineMode;
    this.onStatus = onStatus;
  }

  setWorkerUrl(url: string): void {
    this.workerUrl = url.replace(/\/+$/, '');
  }

  setOfflineMode(val: boolean): void {
    this.offlineMode = val;
  }

  private get isConfigured(): boolean {
    return (
      !this.offlineMode &&
      !!this.workerUrl &&
      !this.workerUrl.includes('YOUR_WORKER')
    );
  }

  scheduleSync(listId: string, roomId: string, store: CRDTStore): void {
    if (this.isPulling) return;
    clearTimeout(this.syncTimers[listId]);
    this.syncTimers[listId] = setTimeout(() => this.push(listId, roomId, store), 800);
  }

  async push(listId: string, roomId: string, store: CRDTStore): Promise<void> {
    if (!this.isConfigured) return;
    const framed = store.encodeFullState();
    if (!framed || framed.length <= 4) return;
    try {
      this.onStatus('syncing');
      const r = await fetch(`${this.workerUrl}/${roomId}`, {
        method: 'POST',
        body: framed,
        headers: { 'Content-Type': 'application/octet-stream' },
      });
      this.onStatus(r.ok ? 'synced' : 'error');
    } catch {
      this.onStatus('error');
    }
  }

  async pull(listId: string, roomId: string, store: CRDTStore): Promise<void> {
    if (!this.isConfigured) return;
    try {
      const r = await fetch(`${this.workerUrl}/${roomId}`);
      if (r.status === 204) return;
      if (r.ok) {
        const buf = await r.arrayBuffer();
        const deltas = decodeUpdates(buf);
        if (deltas.length > 0) {
          this.isPulling = true;
          store.applyUpdate(deltas);
          this.isPulling = false;
        }
        this.onStatus('synced');
      }
    } catch {
      this.onStatus('error');
    }
  }

  startPolling(
    getActiveInfo: () => { listId: string; roomId: string; store: CRDTStore } | null,
    interval = 10000,
  ): () => void {
    const id = setInterval(() => {
      const info = getActiveInfo();
      if (info) this.pull(info.listId, info.roomId, info.store);
    }, interval);
    return () => clearInterval(id);
  }
}
