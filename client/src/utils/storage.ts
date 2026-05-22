import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, PluginState, RecurringTask, DEFAULT_PLUGINS } from './types';
import { DEFAULT_THEME_ID } from '../theme/themes';

const KEYS = {
  APP: 'liltask_app',
  YDOC: (id: string) => `liltask_ydoc_${id}`,
  PLUGINS: (scope: string) => `liltask_plugins_${scope}`,
  RECURRING: (id: string) => `liltask_recurring_${id}`,
  REC_COMPLETIONS: (id: string) => `liltask_rec_completions_${id}`,
  REC_DELETIONS: (id: string) => `liltask_rec_deletions_${id}`,
};

// ─── App State ────────────────────────────────────────────
export async function loadAppState(): Promise<AppState> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.APP);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    lists: {},
    activeListId: null,
    themeId: DEFAULT_THEME_ID,
    workerUrl: '',
    offlineMode: false,
    globalPlugins: { ...DEFAULT_PLUGINS },
  };
}

export async function saveAppState(state: AppState): Promise<void> {
  await AsyncStorage.setItem(KEYS.APP, JSON.stringify(state));
}

// ─── CRDT doc state ───────────────────────────────────────
export async function loadDocState(listId: string): Promise<number[] | null> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.YDOC(listId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function saveDocState(listId: string, bytes: Uint8Array): Promise<void> {
  await AsyncStorage.setItem(KEYS.YDOC(listId), JSON.stringify(Array.from(bytes)));
}

export async function deleteDocState(listId: string): Promise<void> {
  await AsyncStorage.removeItem(KEYS.YDOC(listId));
}

// ─── Plugins ──────────────────────────────────────────────
export async function loadPlugins(scope: string): Promise<PluginState | null> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.PLUGINS(scope));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function savePlugins(scope: string, state: PluginState): Promise<void> {
  await AsyncStorage.setItem(KEYS.PLUGINS(scope), JSON.stringify(state));
}

// ─── Recurring ────────────────────────────────────────────
export async function loadRecurring(listId: string): Promise<RecurringTask[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.RECURRING(listId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveRecurring(listId: string, arr: RecurringTask[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.RECURRING(listId), JSON.stringify(arr));
}

export async function loadRecurringCompletions(listId: string): Promise<Record<string, boolean | number>> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.REC_COMPLETIONS(listId));
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export async function saveRecurringCompletions(
  listId: string,
  data: Record<string, boolean | number>,
): Promise<void> {
  await AsyncStorage.setItem(KEYS.REC_COMPLETIONS(listId), JSON.stringify(data));
}

export async function loadRecurringDeletions(listId: string): Promise<Record<string, string | boolean>> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.REC_DELETIONS(listId));
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export async function saveRecurringDeletions(
  listId: string,
  data: Record<string, string | boolean>,
): Promise<void> {
  await AsyncStorage.setItem(KEYS.REC_DELETIONS(listId), JSON.stringify(data));
}
