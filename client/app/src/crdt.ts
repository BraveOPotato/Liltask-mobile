import { Delta, TodoRecord } from './types';

let _lastMs = 0, _seq = 0;

function hlcNow(): string {
    const ms = Date.now();
    if (ms > _lastMs) { _lastMs = ms; _seq = 0; } else { _seq++; }
    return `${_lastMs}.${String(_seq).padStart(6, '0')}`;
}

function generateUUID(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0;
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}

const te = new TextEncoder(), td = new TextDecoder();

export function encodeUpdate(delta: Delta): Uint8Array {
    const json = te.encode(JSON.stringify(delta));
    const out = new Uint8Array(4 + json.byteLength);
    new DataView(out.buffer).setUint32(0, json.byteLength, false);
    out.set(json, 4);
    return out;
}

export function decodeUpdates(buf: ArrayBuffer): Delta[] {
    const data = new Uint8Array(buf), dv = new DataView(buf), deltas: Delta[] = [];
    let o = 0;
    while (o + 4 <= data.byteLength) {
        const len = dv.getUint32(o, false); o += 4;
        if (o + len > data.byteLength) break;
        if (len > 0) try { deltas.push(JSON.parse(td.decode(data.slice(o, o + len)))); } catch {}
        o += len;
    }
    return deltas;
}

export interface Store {
    addTodo: (text: string, dueDate?: string) => { delta: Delta; encoded: Uint8Array };
    toggleTodo: (id: string) => { delta: Delta; encoded: Uint8Array } | null;
    editTodo: (id: string, text: string) => { delta: Delta; encoded: Uint8Array } | null;
    deleteTodo: (id: string) => { delta: Delta; encoded: Uint8Array } | null;
    applyUpdate: (deltaOrArray: Delta | Delta[]) => void;
    getState: () => TodoRecord[];
    observe: (fn: (todos: TodoRecord[], delta: Delta | null) => void) => () => void;
    encodeFullState: () => Uint8Array;
}

export function createStore(): Store {
    const state = new Map<string, TodoRecord>();
    const observers = new Set<(todos: TodoRecord[], delta: Delta | null) => void>();

    function notify(delta: Delta | null) {
        const todos = [...state.values()]
        .filter(t => !t.deleted)
        .sort((a, b) => (a.hlc < b.hlc ? -1 : 1));
        for (const fn of observers) fn(todos, delta);
    }

    function mergeOne(rec: TodoRecord): boolean {
        const e = state.get(rec.id);
        if (!e || rec.hlc > e.hlc) { state.set(rec.id, rec); return true; }
        return false;
    }

    function mutate(rec: TodoRecord) {
        state.set(rec.id, rec);
        const delta: Delta = { op: 'set', record: rec };
        notify(delta);
        return { delta, encoded: encodeUpdate(delta) };
    }

    return {
        addTodo(text: string, dueDate?: string) {
            const rec: TodoRecord = {
                id: generateUUID(), text, done: false, deleted: false,
                dueDate, hlc: hlcNow()
            };
            return mutate(rec);
        },
        toggleTodo(id: string) {
            const e = state.get(id);
            if (!e || e.deleted) return null;
            return mutate({ ...e, done: !e.done, hlc: hlcNow() });
        },
        editTodo(id: string, text: string) {
            const e = state.get(id);
            if (!e || e.deleted) return null;
            return mutate({ ...e, text, hlc: hlcNow() });
        },
        deleteTodo(id: string) {
            const e = state.get(id);
            if (!e) return null;
            return mutate({ ...e, deleted: true, hlc: hlcNow() });
        },
        applyUpdate(deltaOrArray) {
            const deltas = Array.isArray(deltaOrArray) ? deltaOrArray : [deltaOrArray];
            let changed = false;
            for (const d of deltas) {
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
        },
        getState() {
            return [...state.values()].filter(t => !t.deleted).sort((a, b) => a.hlc < b.hlc ? -1 : 1);
        },
        observe(fn) {
            observers.add(fn);
            return () => observers.delete(fn);
        },
        encodeFullState() {
            return encodeUpdate({ op: 'snapshot', records: [...state.values()] });
        }
    };
}
