// ─── Todo ─────────────────────────────────────────────────
export interface Todo {
  id: string;
  text: string;
  done: boolean;
  deleted: boolean;
  hlc: string;
  dueDate?: string;    // "YYYY-MM-DD"
  calEntry?: boolean;
}

// ─── List ─────────────────────────────────────────────────
export interface TaskList {
  id: string;
  name: string;
  roomId: string;
}

// ─── Plugins ──────────────────────────────────────────────
export interface PluginState {
  categoryGroup: boolean;
  finishRewards: boolean;
}

export const DEFAULT_PLUGINS: PluginState = {
  categoryGroup: false,
  finishRewards: true,
};

// ─── List Templates ───────────────────────────────────────
export interface ListTemplate {
  id: string;
  icon: string;
  name: string;
  desc: string;
  plugins: PluginState;
  defaultName: string;
}

export const LIST_TEMPLATES: ListTemplate[] = [
  {
    id: 'personal',
    icon: '✅',
    name: 'Personal Todos',
    desc: 'Track personal tasks with celebratory finish.',
    plugins: { categoryGroup: false, finishRewards: true },
    defaultName: 'Personal Todos',
  },
  {
    id: 'grocery',
    icon: '🛒',
    name: 'Grocery List',
    desc: 'Smart category grouping for shopping trips.',
    plugins: { categoryGroup: true, finishRewards: true },
    defaultName: 'Grocery List',
  },
  {
    id: 'blank',
    icon: '📋',
    name: 'Blank List',
    desc: 'Start fresh with no plugins enabled.',
    plugins: { categoryGroup: false, finishRewards: false },
    defaultName: '',
  },
];

// ─── Recurring ────────────────────────────────────────────
export type RecurringType = 'daily' | 'weekly' | 'monthly';

export interface RecurringTask {
  id: string;
  text: string;
  type: RecurringType;
  days?: number[];    // 0=Sun..6=Sat for weekly
  dates?: number[];   // 1-31 for monthly
  earlyCompletion?: boolean;
  created: string;    // "YYYY-MM-DD"
}

// ─── Sync ─────────────────────────────────────────────────
export type SyncStatus = 'synced' | 'syncing' | 'error' | 'offline';

// ─── App State ────────────────────────────────────────────
export interface AppState {
  lists: Record<string, TaskList>;
  activeListId: string | null;
  themeId: string;
  workerUrl: string;
  offlineMode: boolean;
  globalPlugins: PluginState;
}

// ─── CRDT Store interface (mirrors crdt.mjs) ──────────────
export interface CRDTStore {
  addTodo: (text: string) => { delta: object; encoded: Uint8Array };
  toggleTodo: (id: string) => { delta: object; encoded: Uint8Array } | null;
  editTodo: (id: string, text: string) => { delta: object; encoded: Uint8Array } | null;
  deleteTodo: (id: string) => { delta: object; encoded: Uint8Array } | null;
  reorder?: (ids: string[]) => void;
  applyUpdate: (deltaOrArray: object | object[]) => void;
  getState: () => Todo[];
  observe: (fn: (todos: Todo[], delta: object | null) => void) => () => void;
  encodeFullState: () => Uint8Array;
}
