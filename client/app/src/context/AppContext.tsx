import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import * as Haptics from 'expo-haptics';
import { ListMeta, PluginState, AppThemeId, RecurringTask, TodoRecord } from '../types';
import { createStore, decodeUpdates, Store } from '../crdt';
import { Storage } from '../storage';

const DEFAULT_WORKER = 'https://liltask-sync.abdullahalkafajy.workers.dev/';

interface AppContextType {
    lists: Record<string, ListMeta>;
    activeListId: string | null;
    currentView: 'lists' | 'calendar';
    plugins: PluginState;
    themeId: AppThemeId;
    offlineMode: boolean;
    workerUrl: string;
    recurring: Record<string, RecurringTask[]>;
    stores: React.MutableRefObject<Record<string, Store>>;
    todos: TodoRecord[];
    progress: { done: number; total: number };
    syncStatus: 'offline' | 'synced' | 'syncing' | 'error';
    setActiveListId: (id: string) => void;
    setCurrentView: (v: 'lists' | 'calendar') => void;
    createList: (name: string, templatePlugins?: PluginState, roomId?: string) => string;
    deleteList: (id: string) => void;
    addTodo: (text: string, dueDate?: string) => void;
    toggleTodo: (id: string) => void;
    editTodo: (id: string, text: string) => void;
    deleteTodo: (id: string) => void;
    reorderTodo: (fromIdx: number, toIdx: number) => void;
    setPlugins: (scope: 'global' | string, state: PluginState) => void;
    activePlugins: () => PluginState;
    applyTheme: (id: AppThemeId) => void;
    setOfflineMode: (v: boolean) => void;
    setWorkerUrl: (v: string) => void;
    pushUpdate: (listId: string) => Promise<void>;
    pullUpdate: (listId: string) => Promise<void>;
    loadRecurring: (listId?: string) => RecurringTask[];
    saveRecurring: (arr: RecurringTask[], listId?: string) => Promise<void>;
    loadRecurringCompletions: (listId?: string) => Record<string, boolean | number>;
    saveRecurringCompletions: (obj: Record<string, boolean | number>, listId?: string) => Promise<void>;
    loadRecurringDeletions: (listId?: string) => Record<string, string | boolean>;
    saveRecurringDeletions: (obj: Record<string, string | boolean>, listId?: string) => Promise<void>;
    celebrate: () => void;
    getRoomShareUrl: () => string | null;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
    const [lists, setLists] = useState<Record<string, ListMeta>>({});
    const [activeListId, setActiveListIdState] = useState<string | null>(null);
    const [currentView, setCurrentView] = useState<'lists' | 'calendar'>('lists');
    const [plugins, setPluginsState] = useState<PluginState>({ categoryGroup: false, finishRewards: true });
    const [themeId, setThemeId] = useState<AppThemeId>('dark-violet');
    const [offlineMode, setOfflineModeState] = useState(false);
    const [workerUrl, setWorkerUrlState] = useState(DEFAULT_WORKER);
    const [recurring, setRecurringState] = useState<Record<string, RecurringTask[]>>({});
    const [todos, setTodos] = useState<TodoRecord[]>([]);
    const [syncStatus, setSyncStatus] = useState<'offline' | 'synced' | 'syncing' | 'error'>('offline');

    const stores = useRef<Record<string, Store>>({});
    const syncTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
    const isPulling = useRef(false);
    // Ref so observers always see current activeListId without needing re-subscription
    const activeListIdRef = useRef<string | null>(null);

    useEffect(() => { activeListIdRef.current = activeListId; }, [activeListId]);

    // ─── Persistence load ───
    useEffect(() => {
        (async () => {
            const [l, p, a, t, w, o] = await Promise.all([
                Storage.get<Record<string, ListMeta>>('liltask_lists', {}),
                Storage.get<PluginState>('liltask_plugins', { categoryGroup: false, finishRewards: true }),
                Storage.get<string | null>('liltask_active', null),
                Storage.get<AppThemeId>('liltask_theme', 'dark-violet'),
                Storage.get<string>('liltask_worker_url', DEFAULT_WORKER),
                Storage.get<boolean>('liltask_offline_mode', false),
            ]);
            setLists(l);
            setPluginsState(p);
            setThemeId(t);
            setWorkerUrlState(w);
            setOfflineModeState(o);
            if (a && l[a]) {
                setActiveListIdState(a);
                activeListIdRef.current = a;
            } else if (Object.keys(l).length > 0) {
                const first = Object.keys(l)[0];
                setActiveListIdState(first);
                activeListIdRef.current = first;
            } else {
                // Fresh install — create a default list immediately
                const id = Math.random().toString(36).slice(2, 12);
                const rId = Math.random().toString(36).slice(2, 18);
                const defaultList = { [id]: { name: 'My Tasks', roomId: rId } };
                setLists(defaultList);
                Storage.set('liltask_lists', defaultList);
                Storage.set('liltask_active', id);
                setActiveListIdState(id);
                activeListIdRef.current = id;
            }
        })();
    }, []);

    const generateId = (len = 10) =>
        Math.random().toString(36).slice(2, 2 + len) + Math.random().toString(36).slice(2, 2 + Math.max(0, len - 10));

    const getOrCreateStore = useCallback((listId: string): Store => {
        if (stores.current[listId]) return stores.current[listId];
        const store = createStore();
        stores.current[listId] = store;

        Storage.get<number[]>('liltask_ydoc_' + listId, []).then(arr => {
            if (arr.length) {
                try {
                    const deltas = decodeUpdates(new Uint8Array(arr).buffer);
                    store.applyUpdate(deltas);
                } catch {}
            }
        });

        store.observe((latest) => {
            // Only update UI todos if this store belongs to the active list
            if (activeListIdRef.current === listId) {
                setTodos([...latest]);
            }
            const state = store.encodeFullState();
            Storage.set('liltask_ydoc_' + listId, Array.from(state));
        });

        return store;
    }, []);

    const pushUpdate = useCallback(async (listId: string) => {
        if (offlineMode) return;
        const list = lists[listId];
        const url = workerUrl.replace(/\/+$/, '');
        if (!list?.roomId || url.includes('YOUR_WORKER')) return;
        const store = getOrCreateStore(listId);
        const framed = store.encodeFullState();
        if (!framed || framed.length <= 4) return;
        try {
            setSyncStatus('syncing');
            const r = await fetch(`${url}/${list.roomId}`, {
                method: 'POST', body: framed,
                headers: { 'Content-Type': 'application/octet-stream' }
            });
            setSyncStatus(r.ok ? 'synced' : 'error');
        } catch { setSyncStatus('error'); }
    }, [lists, offlineMode, workerUrl, getOrCreateStore]);

    const pullUpdate = useCallback(async (listId: string) => {
        if (offlineMode) return;
        const list = lists[listId];
        const url = workerUrl.replace(/\/+$/, '');
        if (!list?.roomId || url.includes('YOUR_WORKER')) return;
        try {
            const r = await fetch(`${url}/${list.roomId}`);
            if (r.status === 204) return;
            if (r.ok) {
                const buf = await r.arrayBuffer();
                const store = getOrCreateStore(listId);
                const deltas = decodeUpdates(buf);
                if (deltas.length > 0) {
                    isPulling.current = true;
                    store.applyUpdate(deltas);
                    isPulling.current = false;
                }
                setSyncStatus('synced');
            }
        } catch { setSyncStatus('error'); }
    }, [lists, offlineMode, workerUrl, getOrCreateStore]);

    // ─── List Management ───
    const createList = useCallback((name: string, templatePlugins?: PluginState, roomId?: string) => {
        const id = generateId();
        const rId = roomId || generateId(16);
        const next: Record<string, ListMeta> = { ...lists, [id]: { name: name || 'Untitled', roomId: rId } };
        setLists(next);
        Storage.set('liltask_lists', next);
        if (templatePlugins) Storage.set('liltask_plugins_' + id, templatePlugins);
        // Set active BEFORE creating store so observer check passes
        activeListIdRef.current = id;
        setActiveListIdState(id);
        Storage.set('liltask_active', id);
        getOrCreateStore(id);
        return id;
    }, [lists, getOrCreateStore]);

    const deleteList = useCallback((id: string) => {
        const next = { ...lists };
        delete next[id];
        setLists(next);
        Storage.set('liltask_lists', next);
        Storage.remove('liltask_ydoc_' + id);
        delete stores.current[id];
        if (activeListId === id) {
            const first = Object.keys(next)[0] || null;
            activeListIdRef.current = first;
            setActiveListIdState(first);
            Storage.set('liltask_active', first);
            if (first) setTodos(stores.current[first]?.getState() ?? []);
            else setTodos([]);
        }
    }, [lists, activeListId, getOrCreateStore]);

    const setActiveListId = useCallback((id: string) => {
        activeListIdRef.current = id;
        setActiveListIdState(id);
        Storage.set('liltask_active', id);
        const store = getOrCreateStore(id);
        setTodos(store.getState());
        pullUpdate(id);
    }, [pullUpdate, getOrCreateStore]);

    // ─── Todo Operations ───
    const addTodo = useCallback((text: string, dueDate?: string) => {
        const lid = activeListIdRef.current;
        if (!lid || !text.trim()) return;
        getOrCreateStore(lid).addTodo(text.trim(), dueDate);
    }, [getOrCreateStore]);

    const toggleTodo = useCallback((id: string) => {
        const lid = activeListIdRef.current;
        if (!lid) return;
        getOrCreateStore(lid).toggleTodo(id);
    }, [getOrCreateStore]);

    const editTodo = useCallback((id: string, text: string) => {
        const lid = activeListIdRef.current;
        if (!lid) return;
        getOrCreateStore(lid).editTodo(id, text);
    }, [getOrCreateStore]);

    const deleteTodo = useCallback((id: string) => {
        const lid = activeListIdRef.current;
        if (!lid) return;
        getOrCreateStore(lid).deleteTodo(id);
    }, [getOrCreateStore]);

    const reorderTodo = useCallback((fromIdx: number, toIdx: number) => {
        const lid = activeListIdRef.current;
        if (!lid) return;
        const store = getOrCreateStore(lid);
        const arr = store.getState();
        if (fromIdx < 0 || toIdx < 0 || fromIdx >= arr.length || toIdx >= arr.length || fromIdx === toIdx) return;
        const reordered = [...arr];
        const [moved] = reordered.splice(fromIdx, 1);
        reordered.splice(toIdx, 0, moved);
        reordered.forEach(item => store.editTodo(item.id, item.text));
    }, [getOrCreateStore]);

    // ─── Plugins ───
    const activePlugins = useCallback((): PluginState => plugins, [plugins]);

    const setPlugins = useCallback((scope: 'global' | string, state: PluginState) => {
        if (scope === 'global') { setPluginsState(state); Storage.set('liltask_plugins', state); }
        else Storage.set('liltask_plugins_' + scope, state);
    }, []);

    // ─── Theme ───
    const applyTheme = useCallback((id: AppThemeId) => { setThemeId(id); Storage.set('liltask_theme', id); }, []);

    // ─── Offline / Worker ───
    const setOfflineMode = useCallback((v: boolean) => {
        setOfflineModeState(v);
        Storage.set('liltask_offline_mode', v);
        setSyncStatus(v ? 'offline' : 'synced');
    }, []);

    const setWorkerUrl = useCallback((v: string) => { setWorkerUrlState(v); Storage.set('liltask_worker_url', v); }, []);

    // ─── Recurring ───
    const recKey = (listId?: string) => listId || activeListIdRef.current || '_';
    const loadRecurring = useCallback((listId?: string): RecurringTask[] => recurring[recKey(listId)] || [], [recurring]);
    const saveRecurring = useCallback(async (arr: RecurringTask[], listId?: string) => {
        const key = recKey(listId);
        setRecurringState(prev => ({ ...prev, [key]: arr }));
        await Storage.set('liltask_recurring_' + key, arr);
    }, []);
    const loadRecurringCompletions = useCallback(() => ({} as Record<string, boolean | number>), []);
    const saveRecurringCompletions = useCallback(async (obj: Record<string, boolean | number>, listId?: string) => {
        await Storage.set('liltask_rec_completions_' + recKey(listId), obj);
    }, []);
    const loadRecurringDeletions = useCallback(() => ({} as Record<string, string | boolean>), []);
    const saveRecurringDeletions = useCallback(async (obj: Record<string, string | boolean>, listId?: string) => {
        await Storage.set('liltask_rec_deletions_' + recKey(listId), obj);
    }, []);

    // ─── Progress & Celebration ───
    const progress = { done: todos.filter(t => t.done).length, total: todos.length };
    const celebrate = useCallback(() => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); }, []);

    // ─── Share URL ───
    const getRoomShareUrl = useCallback((): string | null => {
        const lid = activeListIdRef.current;
        const list = lid ? lists[lid] : null;
        if (!list) return null;
        return `https://liltask.app/#room:${list.roomId}:${encodeURIComponent(list.name)}:${btoa(JSON.stringify(plugins))}`;
    }, [lists, plugins]);

    // ─── Init active list on change ───
    useEffect(() => {
        if (activeListId) {
            const store = getOrCreateStore(activeListId);
            setTodos(store.getState());
        }
    }, [activeListId]);

    // ─── Periodic pull ───
    useEffect(() => {
        const id = setInterval(() => {
            const lid = activeListIdRef.current;
            if (lid && lists[lid]?.roomId) pullUpdate(lid);
        }, 10000);
        return () => clearInterval(id);
    }, [lists, pullUpdate]);

    const value: AppContextType = {
        lists, activeListId, currentView, plugins, themeId, offlineMode, workerUrl,
        recurring, stores, todos, progress, syncStatus,
        setActiveListId, setCurrentView, createList, deleteList,
        addTodo, toggleTodo, editTodo, deleteTodo, reorderTodo,
        setPlugins, activePlugins, applyTheme, setOfflineMode, setWorkerUrl,
        pushUpdate, pullUpdate,
        loadRecurring, saveRecurring,
        loadRecurringCompletions, saveRecurringCompletions,
        loadRecurringDeletions, saveRecurringDeletions,
        celebrate, getRoomShareUrl,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
    const ctx = useContext(AppContext);
    if (!ctx) throw new Error('useApp must be inside AppProvider');
    return ctx;
}
