import { MD3DarkTheme, MD3LightTheme, MD3Theme } from 'react-native-paper';

export interface AppThemeDef {
  id: string;
  label: string;
  dark: boolean;
  swatch: [string, string, string];
  paperTheme: MD3Theme;
}

// Violet Night (default dark)
const violetDark: MD3Theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#7c6aff',
    secondary: '#a855f7',
    background: '#0f0f11',
    surface: '#18181b',
    surfaceVariant: '#1e1e24',
    onSurface: '#e8e8f0',
    onSurfaceVariant: '#888899',
    outline: '#2e2e3a',
    error: '#f87171',
  },
};

// GitHub Dark
const slateDark: MD3Theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#58a6ff',
    secondary: '#79c0ff',
    background: '#0d1117',
    surface: '#161b22',
    surfaceVariant: '#21262d',
    onSurface: '#e6edf3',
    onSurfaceVariant: '#8b949e',
    outline: '#30363d',
    error: '#f85149',
  },
};

// Rose Dark
const roseDark: MD3Theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#e05c9a',
    secondary: '#f07ac0',
    background: '#100c10',
    surface: '#1a121a',
    surfaceVariant: '#241824',
    onSurface: '#f0e8f0',
    onSurfaceVariant: '#9a889a',
    outline: '#3a283a',
    error: '#f87171',
  },
};

// Ember Dark
const emberDark: MD3Theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#f97316',
    secondary: '#fb923c',
    background: '#0f0b08',
    surface: '#1a1208',
    surfaceVariant: '#241a0e',
    onSurface: '#f5ede0',
    onSurfaceVariant: '#aa9980',
    outline: '#3a2e20',
    error: '#f87171',
  },
};

// Clean Light
const cleanLight: MD3Theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#6655ee',
    secondary: '#9933ff',
    background: '#f8f8fc',
    surface: '#ffffff',
    surfaceVariant: '#f0f0f8',
    onSurface: '#1a1a2e',
    onSurfaceVariant: '#5a5a7a',
    outline: '#d8d8e8',
    error: '#dc2626',
  },
};

// Warm Parchment
const warmLight: MD3Theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#c05a10',
    secondary: '#e07030',
    background: '#fdf8f0',
    surface: '#fffbf4',
    surfaceVariant: '#f5f0e8',
    onSurface: '#2a1a08',
    onSurfaceVariant: '#7a6050',
    outline: '#e0d0b8',
    error: '#dc2626',
  },
};

// Sky Blue
const skyLight: MD3Theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#1a72e8',
    secondary: '#4090ff',
    background: '#f0f6ff',
    surface: '#ffffff',
    surfaceVariant: '#e8f0fe',
    onSurface: '#0a1428',
    onSurfaceVariant: '#4a5a78',
    outline: '#c8d8f0',
    error: '#dc2626',
  },
};

export const THEMES: AppThemeDef[] = [
  {
    id: 'dark-violet',
    label: 'Violet Night',
    dark: true,
    swatch: ['#0f0f11', '#7c6aff', '#a855f7'],
    paperTheme: violetDark,
  },
  {
    id: 'dark-slate',
    label: 'GitHub Dark',
    dark: true,
    swatch: ['#0d1117', '#58a6ff', '#79c0ff'],
    paperTheme: slateDark,
  },
  {
    id: 'dark-rose',
    label: 'Rose Dark',
    dark: true,
    swatch: ['#100c10', '#e05c9a', '#f07ac0'],
    paperTheme: roseDark,
  },
  {
    id: 'dark-forest',
    label: 'Ember Dark',
    dark: true,
    swatch: ['#0f0b08', '#f97316', '#fb923c'],
    paperTheme: emberDark,
  },
  {
    id: 'light-clean',
    label: 'Clean Light',
    dark: false,
    swatch: ['#f8f8fc', '#6655ee', '#9933ff'],
    paperTheme: cleanLight,
  },
  {
    id: 'light-warm',
    label: 'Warm Parchment',
    dark: false,
    swatch: ['#fdf8f0', '#c05a10', '#e07030'],
    paperTheme: warmLight,
  },
  {
    id: 'light-sky',
    label: 'Sky Blue',
    dark: false,
    swatch: ['#f0f6ff', '#1a72e8', '#4090ff'],
    paperTheme: skyLight,
  },
];

export const DEFAULT_THEME_ID = 'dark-violet';

export function getTheme(id: string): AppThemeDef {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}
