import { MD3LightTheme, MD3DarkTheme, MD3Theme } from 'react-native-paper';
import { AppTheme, AppThemeId } from './types';

export const THEMES: Record<AppThemeId, AppTheme> = {
    'dark-violet': {
        id: 'dark-violet', label: 'Violet Night', dark: true,
        colors: { bg:'#0f0f11', bg2:'#16161a', bg3:'#1e1e24', bg4:'#26262e', border:'#2e2e38', text:'#e8e8f0', text2:'#9090a8', text3:'#5a5a72', accent:'#7c6aff', accent2:'#a855f7', accentGlow:'rgba(124,106,255,0.18)', green:'#22d3a0', red:'#ff5c7c', yellow:'#fbbf24' }
    },
    'dark-slate': {
        id: 'dark-slate', label: 'GitHub Dark', dark: true,
        colors: { bg:'#0d1117', bg2:'#161b22', bg3:'#21262d', bg4:'#30363d', border:'#3a3f47', text:'#e6edf3', text2:'#8b949e', text3:'#484f58', accent:'#58a6ff', accent2:'#79c0ff', accentGlow:'rgba(88,166,255,0.15)', green:'#3fb950', red:'#f85149', yellow:'#d29922' }
    },
    'dark-rose': {
        id: 'dark-rose', label: 'Rose Dark', dark: true,
        colors: { bg:'#100c10', bg2:'#1a141a', bg3:'#221c22', bg4:'#2c242c', border:'#3a2c3a', text:'#f0e0f0', text2:'#b090b0', text3:'#705870', accent:'#e05c9a', accent2:'#f07ac0', accentGlow:'rgba(224,92,154,0.18)', green:'#4ade80', red:'#fb7185', yellow:'#fbbf24' }
    },
    'dark-forest': {
        id: 'dark-forest', label: 'Ember Dark', dark: true,
        colors: { bg:'#0f0b08', bg2:'#1a1108', bg3:'#221808', bg4:'#2d2010', border:'#3d2e18', text:'#e8dcc8', text2:'#a88a60', text3:'#6a5838', accent:'#f97316', accent2:'#fb923c', accentGlow:'rgba(249,115,22,0.18)', green:'#34d399', red:'#f87171', yellow:'#fbbf24' }
    },
    'light-clean': {
        id: 'light-clean', label: 'Clean Light', dark: false,
        colors: { bg:'#f8f8fc', bg2:'#ffffff', bg3:'#f0f0f8', bg4:'#e4e4ee', border:'#dddde8', text:'#18182a', text2:'#5a5a7a', text3:'#9090b0', accent:'#6655ee', accent2:'#9933ff', accentGlow:'rgba(102,85,238,0.12)', green:'#0ea86a', red:'#e53060', yellow:'#d97706' }
    },
    'light-warm': {
        id: 'light-warm', label: 'Warm Parchment', dark: false,
        colors: { bg:'#fdf8f0', bg2:'#ffffff', bg3:'#f5ede0', bg4:'#ecddc8', border:'#e0d0b8', text:'#2a1a08', text2:'#7a5a38', text3:'#b09070', accent:'#c05a10', accent2:'#e07030', accentGlow:'rgba(192,90,16,0.13)', green:'#2a9d5c', red:'#d94040', yellow:'#c57a00' }
    },
    'light-sky': {
        id: 'light-sky', label: 'Sky Blue', dark: false,
        colors: { bg:'#f0f6ff', bg2:'#ffffff', bg3:'#e4eeff', bg4:'#d0e0f8', border:'#c0d4f0', text:'#0c1a2e', text2:'#3a6090', text3:'#7aa0c0', accent:'#1a72e8', accent2:'#4090ff', accentGlow:'rgba(26,114,232,0.13)', green:'#0ea86a', red:'#e53060', yellow:'#d97706' }
    },
};

export function makePaperTheme(appTheme: AppTheme): MD3Theme {
    const c = appTheme.colors;
    const base = appTheme.dark ? MD3DarkTheme : MD3LightTheme;
    return {
        ...base,
        dark: appTheme.dark,
        colors: {
            ...base.colors,
            primary: c.accent,
            onPrimary: '#ffffff',
            primaryContainer: c.accentGlow,
            onPrimaryContainer: c.accent,
            secondary: c.accent2,
            surface: c.bg2,
            onSurface: c.text,
            onSurfaceVariant: c.text2,
            outline: c.border,
            background: c.bg,
            error: c.red,
            surfaceVariant: c.bg3,
        },
        roundness: 2,
    };
}
