import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  AppState,
  CRDTStore,
  DEFAULT_PLUGINS,
  PluginState,
  RecurringTask,
  SyncStatus,
  TaskList,
  Todo,
} from '../utils/types';
import { createStore, decodeUpdates } from '../utils/crdt';
import {
  deleteDocState,
  loadAppState,
  loadDocState,
  loadPlugins,
  loadRecurring,
  loadRecurringCompletions,
  loadRecurringDeletions,
  saveAppState,
  saveDocState,
  savePlugins,
  saveRecurring,
  saveRecurringCompletions,
  saveRecurringDeletions,
} from '../utils/storage';
import { SyncService } from '../utils/syncService';
import { generateId, todayKey } from '../utils/dateUtils';

// ─── Context types ────────────────────────────────────────
interface AppContextValue {
  // State
  appState: AppState;
  todos: Todo[];
  syncStatus: SyncStatus;
  isLoading: boolean;

  // List ops
  createList: (name: string, plugins?: PluginState, roomId?: string) => Promise<string>;
  deleteList: (id: string) => Promise<void>;
  switchList: (id: string) => Promise<void>;
  renameList: (id: string, name: string) => Promise<void>;

  // Todo ops
  addTodo: (text: string, dueDate?: string) => void;
  toggleTodo: (id: string) => void;
  editTodo: (id: string, text: string) => void;
  deleteTodo: (id: string) => void;
  reorderTodos: (fromIdx: number, toIdx: number) => void;

  // Plugins
  getActivePlugins: () => PluginState;
  setPlugins: (scope: 'global' | string, state: PluginState) => Promise<void>;
  listPlugins: Record<string, PluginState>;

  // Recurring
  recurring: RecurringTask[];
  addRecurring: (task: Omit<RecurringTask, 'id' | 'created'>) => Promise<void>;
  deleteRecurring: (id: string) => Promise<void>;
  recurringCompletions: Record<string, boolean | number>;
  toggleRecurringCompletion: (recId: string, periodKey: string) => Promise<void>;
  recurringDeletions: Record<string, string | boolean>;
  deleteRecurringOnce: (recId: string, dateKey: string) => Promise<void>;
  deleteRecurringAllFuture: (recId: string, fromDateKey: string) => Promise<void>;

  // Sync
  manualSync: () => Promise<void>;
  setWorkerUrl: (url: string) => Promise<void>;
  setOfflineMode: (val: boolean) => Promise<void>;

  // Theme
  setTheme: (id: string) => Promise<void>;

  // Share
  buildShareUrl: (baseUrl: string) => string;
}

const AppContext = createContext<AppContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [appState, setAppStateRaw] = useState<AppState>({
    lists: {},
    activeListId: null,
    themeId: 'dark-violet',
    workerUrl: '',
    offlineMode: false,
    globalPlugins: { ...DEFAULT_PLUGINS },
  });
  const [todos, setTodos] = useState<Todo[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('offline');
  const [isLoading, setIsLoading] = useState(true);
  const [listPlugins, setListPlugins] = useState<Record<string, PluginState>>({});
  const [recurring, setRecurring] = useState<RecurringTask[]>([]);
  const [recurringCompletions, setRecurringCompletions] = useState<Record<string, boolean | number>>({});
  const [recurringDeletions, setRecurringDeletions] = useState<Record<string, string | boolean>>({});

  const stores = useRef<Record<string, CRDTStore>>({});
  const syncRef = useRef<SyncService | null>(null);
  const appStateRef = useRef(appState);
  appStateRef.current = appState;

  // Commit state + persist
  async function setAppState(updater: (prev: AppState) => AppState) {
    setAppStateRaw((prev) => {
      const next = updater(prev);
      saveAppState(next);
      return next;
    });
  }

  // ─── Store factory ──────────────────────────────────────
  const getOrCreateStore = useCallback(async (listId: string): Promise<CRDTStore> => {
    if (stores.current[listId]) return stores.current[listId];

    const store = createStore();
    stores.current[listId] = store;

    // Load persisted bytes
    const stored = await loadDocState(listId);
    if (stored) {
      try {
        const arr = new Uint8Array(stored);
        const deltas = decodeUpdates(arr.buffer);
        store.applyUpdate(deltas);
      } catch {}
    }

    // Observe changes
    store.observe(async (newTodos) => {
      const cur = appStateRef.current;
      if (cur.activeListId === listId) {
        setTodos([...newTodos]);
      }
      // Persist
      const bytes = store.encodeFullState();
      await saveDocState(listId, bytes);
      // Schedule sync
      const list = cur.lists[listId];
      if (list && syncRef.current) {
        syncRef.current.scheduleSync(listId, list.roomId, store);
      }
    });

    return store;
  }, []);

  // ─── Init ───────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      const state = await loadAppState();
      setAppStateRaw(state);
      appStateRef.current = state;

      // Init sync service
      syncRef.current = new SyncService(
        state.workerUrl,
        state.offlineMode,
        setSyncStatus,
      );

      // Load list plugins
      const pluginMap: Record<string, PluginState> = {};
      for (const listId of Object.keys(state.lists)) {
        const p = await loadPlugins(listId);
        if (p) pluginMap[listId] = p;
      }
      setListPlugins(pluginMap);

      // Activate list
      if (state.activeListId && state.lists[state.activeListId]) {
        const store = await getOrCreateStore(state.activeListId);
        setTodos(store.getState());

        // Load recurring
        const [rec, comps, dels] = await Promise.all([
          loadRecurring(state.activeListId),
          loadRecurringCompletions(state.activeListId),
          loadRecurringDeletions(state.activeListId),
        ]);
        setRecurring(rec);
        setRecurringCompletions(comps);
        setRecurringDeletions(dels);

        // Pull sync
        const list = state.lists[state.activeListId];
        if (list && syncRef.current) {
          syncRef.current.pull(state.activeListId, list.roomId, store);
        }
      }

      setSyncStatus(
        state.offlineMode || !state.workerUrl ? 'offline' : 'synced',
      );
      setIsLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Polling
  useEffect(() => {
    if (!syncRef.current) return;
    const stop = syncRef.current.startPolling(() => {
      const cur = appStateRef.current;
      if (!cur.activeListId) return null;
      const list = cur.lists[cur.activeListId];
      const store = stores.current[cur.activeListId];
      if (!list || !store) return null;
      return { listId: cur.activeListId, roomId: list.roomId, store };
    });
    return stop;
  }, [isLoading]);

  // ─── List ops ───────────────────────────────────────────
  const createList = useCallback(
    async (name: string, plugins?: PluginState, roomId?: string): Promise<string> => {
      const id = generateId();
      const room = roomId ?? generateId(16);
      const newList: TaskList = { id, name: name || 'Untitled', roomId: room };

      await setAppState((prev) => ({
        ...prev,
        lists: { ...prev.lists, [id]: newList },
      }));

      await getOrCreateStore(id);

      if (plugins) {
        await savePlugins(id, plugins);
        setListPlugins((prev) => ({ ...prev, [id]: plugins }));
      }

      return id;
    },
    [getOrCreateStore],
  );

  const deleteList = useCallback(async (id: string) => {
    delete stores.current[id];
    await deleteDocState(id);
    await setAppState((prev) => {
      const lists = { ...prev.lists };
      delete lists[id];
      const activeListId =
        prev.activeListId === id
          ? (Object.keys(lists)[0] ?? null)
          : prev.activeListId;
      return { ...prev, lists, activeListId };
    });
    setListPlugins((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const switchList = useCallback(
    async (id: string) => {
      await setAppState((prev) => ({ ...prev, activeListId: id }));
      const store = await getOrCreateStore(id);
      setTodos(store.getState());

      const [rec, comps, dels] = await Promise.all([
        loadRecurring(id),
        loadRecurringCompletions(id),
        loadRecurringDeletions(id),
      ]);
      setRecurring(rec);
      setRecurringCompletions(comps);
      setRecurringDeletions(dels);

      const list = appStateRef.current.lists[id];
      if (list && syncRef.current) {
        syncRef.current.pull(id, list.roomId, store);
      }
    },
    [getOrCreateStore],
  );

  const renameList = useCallback(async (id: string, name: string) => {
    await setAppState((prev) => ({
      ...prev,
      lists: { ...prev.lists, [id]: { ...prev.lists[id], name } },
    }));
  }, []);

  // ─── Todo ops ───────────────────────────────────────────
  const addTodo = useCallback(
    (text: string, dueDate?: string) => {
      const cur = appStateRef.current;
      if (!cur.activeListId) return;
      const store = stores.current[cur.activeListId];
      if (!store) return;

      if (dueDate) {
        // Inject with dueDate via applyUpdate
        const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        const rec = {
          id,
          text,
          done: false,
          deleted: false,
          dueDate,
          calEntry: true,
          hlc: `${Date.now()}.${String(Math.random()).slice(2, 8)}`,
        };
        store.applyUpdate([{ op: 'set', record: rec }]);
      } else {
        store.addTodo(text);
      }
    },
    [],
  );

  const toggleTodo = useCallback((id: string) => {
    const cur = appStateRef.current;
    if (!cur.activeListId) return;
    stores.current[cur.activeListId]?.toggleTodo(id);
  }, []);

  const editTodo = useCallback((id: string, text: string) => {
    const cur = appStateRef.current;
    if (!cur.activeListId) return;
    stores.current[cur.activeListId]?.editTodo(id, text);
  }, []);

  const deleteTodo = useCallback((id: string) => {
    const cur = appStateRef.current;
    if (!cur.activeListId) return;
    stores.current[cur.activeListId]?.deleteTodo(id);
  }, []);

  const reorderTodos = useCallback((fromIdx: number, toIdx: number) => {
    const cur = appStateRef.current;
    if (!cur.activeListId) return;
    const store = stores.current[cur.activeListId];
    if (!store) return;
    const arr = store.getState();
    if (fromIdx === toIdx || fromIdx < 0 || toIdx < 0) return;
    const reordered = [...arr];
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);
    if (store.reorder) {
      store.reorder(reordered.map((t) => t.id));
    }
  }, []);

  // ─── Plugins ────────────────────────────────────────────
  const getActivePlugins = useCallback((): PluginState => {
    const cur = appStateRef.current;
    if (!cur.activeListId) return cur.globalPlugins;
    return listPlugins[cur.activeListId] ?? cur.globalPlugins;
  }, [listPlugins]);

  const setPlugins = useCallback(async (scope: 'global' | string, state: PluginState) => {
    if (scope === 'global') {
      await setAppState((prev) => ({ ...prev, globalPlugins: state }));
    } else {
      await savePlugins(scope, state);
      setListPlugins((prev) => ({ ...prev, [scope]: state }));
    }
  }, []);

  // ─── Recurring ──────────────────────────────────────────
  const addRecurring = useCallback(async (task: Omit<RecurringTask, 'id' | 'created'>) => {
    const cur = appStateRef.current;
    if (!cur.activeListId) return;
    const newTask: RecurringTask = {
      ...task,
      id: generateId(),
      created: todayKey(),
    };
    const next = [...recurring, newTask];
    setRecurring(next);
    await saveRecurring(cur.activeListId, next);
  }, [recurring]);

  const deleteRecurring = useCallback(async (id: string) => {
    const cur = appStateRef.current;
    if (!cur.activeListId) return;
    const next = recurring.filter((r) => r.id !== id);
    setRecurring(next);
    await saveRecurring(cur.activeListId, next);
  }, [recurring]);

  const toggleRecurringCompletion = useCallback(async (recId: string, periodKey: string) => {
    const cur = appStateRef.current;
    if (!cur.activeListId) return;
    const key = `${recId}:${periodKey}`;
    const next = { ...recurringCompletions };
    if (next[key]) delete next[key];
    else next[key] = true;
    setRecurringCompletions(next);
    await saveRecurringCompletions(cur.activeListId, next);
  }, [recurringCompletions]);

  const deleteRecurringOnce = useCallback(async (recId: string, dk: string) => {
    const cur = appStateRef.current;
    if (!cur.activeListId) return;
    const next = { ...recurringDeletions, [`${recId}:${dk}`]: true };
    setRecurringDeletions(next);
    await saveRecurringDeletions(cur.activeListId, next);
  }, [recurringDeletions]);

  const deleteRecurringAllFuture = useCallback(async (recId: string, fromKey: string) => {
    const cur = appStateRef.current;
    if (!cur.activeListId) return;
    const next = { ...recurringDeletions, [`${recId}:all`]: fromKey };
    setRecurringDeletions(next);
    await saveRecurringDeletions(cur.activeListId, next);
  }, [recurringDeletions]);

  // ─── Sync ────────────────────────────────────────────────
  const manualSync = useCallback(async () => {
    const cur = appStateRef.current;
    if (!cur.activeListId) return;
    const list = cur.lists[cur.activeListId];
    const store = stores.current[cur.activeListId];
    if (!list || !store || !syncRef.current) return;
    await syncRef.current.pull(cur.activeListId, list.roomId, store);
  }, []);

  const setWorkerUrl = useCallback(async (url: string) => {
    await setAppState((prev) => ({ ...prev, workerUrl: url }));
    syncRef.current?.setWorkerUrl(url);
    setSyncStatus(url && !url.includes('YOUR_WORKER') ? 'synced' : 'offline');
  }, []);

  const setOfflineMode = useCallback(async (val: boolean) => {
    await setAppState((prev) => ({ ...prev, offlineMode: val }));
    syncRef.current?.setOfflineMode(val);
    setSyncStatus(val ? 'offline' : 'synced');
  }, []);

  // ─── Theme ───────────────────────────────────────────────
  const setTheme = useCallback(async (id: string) => {
    await setAppState((prev) => ({ ...prev, themeId: id }));
  }, []);

  // ─── Share URL ───────────────────────────────────────────
  const buildShareUrl = useCallback((baseUrl: string): string => {
    const cur = appStateRef.current;
    if (!cur.activeListId) return baseUrl;
    const list = cur.lists[cur.activeListId];
    if (!list) return baseUrl;
    const plugins = listPlugins[cur.activeListId] ?? cur.globalPlugins;
    const pluginsB64 = btoa(JSON.stringify(plugins));
    return `${baseUrl}#room:${list.roomId}:${encodeURIComponent(list.name)}:${pluginsB64}`;
  }, [listPlugins]);

  const value: AppContextValue = {
    appState,
    todos,
    syncStatus,
    isLoading,
    createList,
    deleteList,
    switchList,
    renameList,
    addTodo,
    toggleTodo,
    editTodo,
    deleteTodo,
    reorderTodos,
    getActivePlugins,
    setPlugins,
    listPlugins,
    recurring,
    addRecurring,
    deleteRecurring,
    recurringCompletions,
    toggleRecurringCompletion,
    recurringDeletions,
    deleteRecurringOnce,
    deleteRecurringAllFuture,
    manualSync,
    setWorkerUrl,
    setOfflineMode,
    setTheme,
    buildShareUrl,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
}
