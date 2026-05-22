import { CRDTStore, Todo } from './types';

// ─── HLC clock ───────────────────────────────────────────
let _lastMs = 0;
let _seq = 0;

function hlcNow(): string {
  const ms = Date.now();
  if (ms > _lastMs) {
    _lastMs = ms;
    _seq = 0;
  } else {
    _seq++;
  }
  return `${_lastMs}.${String(_seq).padStart(6, '0')}`;
}

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

// ─── Wire format (matches worker protocol) ───────────────
export function encodeUpdate(delta: object): Uint8Array {
  const json = new TextEncoder().encode(JSON.stringify(delta));
  const out = new Uint8Array(4 + json.byteLength);
  new DataView(out.buffer).setUint32(0, json.byteLength, false);
  out.set(json, 4);
  return out;
}

export function decodeUpdates(buf: ArrayBuffer): object[] {
  const data = new Uint8Array(buf);
  const dv = new DataView(buf);
  const deltas: object[] = [];
  let o = 0;
  while (o + 4 <= data.byteLength) {
    const len = dv.getUint32(o, false);
    o += 4;
    if (o + len > data.byteLength) break;
    if (len > 0) {
      try {
        deltas.push(JSON.parse(new TextDecoder().decode(data.slice(o, o + len))));
      } catch {
        // malformed frame — skip
      }
    }
    o += len;
  }
  return deltas;
}

// ─── Store factory ────────────────────────────────────────
export function createStore(): CRDTStore {
  const state = new Map<string, Todo>();
  const observers = new Set<(todos: Todo[], delta: object | null) => void>();

  function sorted(): Todo[] {
    return [...state.values()]
      .filter((t) => !t.deleted)
      .sort((a, b) => (a.hlc < b.hlc ? -1 : 1));
  }

  function notify(delta: object | null): void {
    const todos = sorted();
    for (const fn of observers) fn(todos, delta);
  }

  function mergeOne(rec: Todo): boolean {
    const existing = state.get(rec.id);
    if (!existing || rec.hlc > existing.hlc) {
      state.set(rec.id, rec);
      return true;
    }
    return false;
  }

  function mutate(rec: Todo) {
    state.set(rec.id, rec);
    const delta = { op: 'set', record: rec };
    notify(delta);
    return { delta, encoded: encodeUpdate(delta) };
  }

  function addTodo(text: string) {
    return mutate({ id: generateUUID(), text, done: false, deleted: false, hlc: hlcNow() });
  }

  function toggleTodo(id: string) {
    const e = state.get(id);
    if (!e || e.deleted) return null;
    return mutate({ ...e, done: !e.done, hlc: hlcNow() });
  }

  function editTodo(id: string, text: string) {
    const e = state.get(id);
    if (!e || e.deleted) return null;
    return mutate({ ...e, text, hlc: hlcNow() });
  }

  function deleteTodo(id: string) {
    const e = state.get(id);
    if (!e) return null;
    return mutate({ ...e, deleted: true, hlc: hlcNow() });
  }

  function reorder(ids: string[]): void {
    // Re-stamp HLCs in order so sorted() reflects desired sequence
    ids.forEach((id) => {
      const e = state.get(id);
      if (e) state.set(id, { ...e, hlc: hlcNow() });
    });
    notify(null);
  }

  function applyUpdate(deltaOrArray: object | object[]): void {
    const deltas = Array.isArray(deltaOrArray) ? deltaOrArray : [deltaOrArray];
    let changed = false;
    for (const d of deltas as any[]) {
      if (d?.op === 'set' && d.record?.id) {
        _lastMs = Math.max(_lastMs, parseInt(d.record.hlc, 10) || 0);
        if (mergeOne(d.record)) changed = true;
      } else if (d?.op === 'snapshot' && Array.isArray(d.records)) {
        for (const r of d.records) {
          _lastMs = Math.max(_lastMs, parseInt(r.hlc, 10) || 0);
          if (mergeOne(r)) changed = true;
        }
      }
    }
    if (changed) notify(null);
  }

  function getState(): Todo[] {
    return sorted();
  }

  function observe(fn: (todos: Todo[], delta: object | null) => void): () => void {
    observers.add(fn);
    return () => observers.delete(fn);
  }

  function encodeFullState(): Uint8Array {
    return encodeUpdate({ op: 'snapshot', records: [...state.values()] });
  }

  return { addTodo, toggleTodo, editTodo, deleteTodo, reorder, applyUpdate, getState, observe, encodeFullState };
}
