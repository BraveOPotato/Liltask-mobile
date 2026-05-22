export interface TodoRecord {
    id: string;
    text: string;
    done: boolean;
    deleted: boolean;
    dueDate?: string;
    hlc: string;
}

export interface Delta {
    op: 'set' | 'snapshot';
    record?: TodoRecord;
    records?: TodoRecord[];
}

export interface ListMeta {
    name: string;
    roomId: string;
}

export interface RecurringTask {
    id: string;
    type: 'daily' | 'weekly' | 'monthly';
    text: string;
    created: string;
    earlyCompletion?: boolean;
    days?: number[];      // 0-6 for weekly
    dates?: number[];     // 1-31 for monthly
}

export interface PluginState {
    categoryGroup: boolean;
    finishRewards: boolean;
}

export type AppThemeId =
| 'dark-violet' | 'dark-slate' | 'dark-rose' | 'dark-forest'
| 'light-clean' | 'light-warm' | 'light-sky';

export interface AppTheme {
    id: AppThemeId;
    label: string;
    dark: boolean;
    colors: {
        bg: string;
        bg2: string;
        bg3: string;
        bg4: string;
        border: string;
        text: string;
        text2: string;
        text3: string;
        accent: string;
        accent2: string;
        accentGlow: string;
        green: string;
        red: string;
        yellow: string;
    };
}
