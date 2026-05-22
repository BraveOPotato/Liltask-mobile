import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
    Appbar, List, Switch, TextInput, Button, Divider,
    Text, useTheme, Surface, SegmentedButtons,
} from 'react-native-paper';
import { useApp } from '../context/AppContext';
import { THEMES } from '../theme';
import { AppThemeId } from '../types';
import { BottomNav } from '../components/BottomNav';

const DEFAULT_WORKER = 'https://liltask-sync.abdullahalkafajy.workers.dev/';

export function SettingsScreen({ navigation }: any) {
    const app = useApp();
    const theme = useTheme();
    const c = theme.colors;
    const [url, setUrl] = React.useState(app.workerUrl);

    const themeGroups = [
        { label: 'Dark', ids: ['dark-violet', 'dark-slate', 'dark-rose', 'dark-forest'] as AppThemeId[] },
        { label: 'Light', ids: ['light-clean', 'light-warm', 'light-sky'] as AppThemeId[] },
    ];

    return (
        <View style={[styles.container, { backgroundColor: c.background }]}>
            <Appbar.Header style={{ backgroundColor: c.surface }}>
                <Appbar.Action
                    icon="menu"
                    onPress={() => navigation.openDrawer()}
                    iconColor={c.onSurface}
                />
                <Appbar.Content
                    title="Settings"
                    titleStyle={{ color: c.onSurface }}
                />
            </Appbar.Header>

            <ScrollView contentContainerStyle={styles.scroll}>

                {/* ─── Sync ─── */}
                <Text variant="labelLarge" style={[styles.sectionLabel, { color: c.primary }]}>
                    Sync
                </Text>
                <Surface style={[styles.card, { backgroundColor: c.surface }]} elevation={1}>
                    <List.Item
                        title="Offline Mode"
                        titleStyle={{ color: c.onSurface }}
                        description="Disable all sync. Data stays local only."
                        descriptionStyle={{ color: c.onSurfaceVariant }}
                        right={() => (
                            <Switch
                                value={app.offlineMode}
                                onValueChange={app.setOfflineMode}
                                color={c.primary}
                            />
                        )}
                    />
                    <Divider style={{ backgroundColor: c.outline }} />
                    <View style={styles.section}>
                        <Text
                            variant="labelMedium"
                            style={{ color: c.onSurfaceVariant, marginBottom: 8 }}
                        >
                            Cloudflare Worker URL
                        </Text>
                        <TextInput
                            mode="outlined"
                            value={url}
                            onChangeText={setUrl}
                            disabled={app.offlineMode}
                            style={{ backgroundColor: c.surface }}
                            outlineColor={c.outline}
                            activeOutlineColor={c.primary}
                            textColor={c.onSurface}
                            placeholderTextColor={c.onSurfaceVariant}
                            autoCapitalize="none"
                            keyboardType="url"
                            dense
                        />
                        <View style={styles.row}>
                            <Button
                                mode="outlined"
                                textColor={c.onSurfaceVariant}
                                style={{ borderColor: c.outline }}
                                onPress={() => { app.setWorkerUrl(DEFAULT_WORKER); setUrl(DEFAULT_WORKER); }}
                            >
                                Reset
                            </Button>
                            <Button
                                mode="contained"
                                buttonColor={c.primary}
                                textColor={c.onPrimary}
                                onPress={() => app.setWorkerUrl(url)}
                                disabled={app.offlineMode}
                            >
                                Save
                            </Button>
                        </View>
                    </View>
                </Surface>

                {/* ─── Theme ─── */}
                <Text variant="labelLarge" style={[styles.sectionLabel, { color: c.primary }]}>
                    Theme
                </Text>
                {themeGroups.map(group => (
                    <View key={group.label} style={styles.themeGroup}>
                        <Text
                            variant="labelSmall"
                            style={{ color: c.onSurfaceVariant, marginBottom: 8 }}
                        >
                            {group.label}
                        </Text>
                        <View style={styles.themeRow}>
                            {group.ids.map(id => {
                                const t = THEMES[id];
                                const isActive = app.themeId === id;
                                return (
                                    <View key={id} style={styles.themeChip}>
                                        <Button
                                            mode={isActive ? 'contained' : 'outlined'}
                                            buttonColor={isActive ? t.colors.accent : t.colors.bg2}
                                            textColor={isActive ? '#fff' : t.colors.text}
                                            style={[
                                                styles.themeBtn,
                                                {
                                                    borderColor: isActive
                                                        ? t.colors.accent
                                                        : t.colors.border,
                                                    backgroundColor: t.colors.bg2,
                                                },
                                            ]}
                                            contentStyle={styles.themeBtnContent}
                                            labelStyle={{ fontSize: 11 }}
                                            onPress={() => app.applyTheme(id)}
                                            compact
                                        >
                                            {t.label}
                                        </Button>
                                    </View>
                                );
                            })}
                        </View>
                    </View>
                ))}

                {/* ─── Plugins ─── */}
                <Text variant="labelLarge" style={[styles.sectionLabel, { color: c.primary }]}>
                    Features
                </Text>
                <Surface style={[styles.card, { backgroundColor: c.surface }]} elevation={1}>
                    <List.Item
                        title="Finish Rewards"
                        titleStyle={{ color: c.onSurface }}
                        description="Celebrate when all tasks are done."
                        descriptionStyle={{ color: c.onSurfaceVariant }}
                        right={() => (
                            <Switch
                                value={app.activePlugins().finishRewards}
                                onValueChange={v =>
                                    app.setPlugins('global', {
                                        ...app.activePlugins(),
                                        finishRewards: v,
                                    })
                                }
                                color={c.primary}
                            />
                        )}
                    />
                    <Divider style={{ backgroundColor: c.outline }} />
                    <List.Item
                        title="Category Groups"
                        titleStyle={{ color: c.onSurface }}
                        description="Group tasks by category prefix."
                        descriptionStyle={{ color: c.onSurfaceVariant }}
                        right={() => (
                            <Switch
                                value={app.activePlugins().categoryGroup}
                                onValueChange={v =>
                                    app.setPlugins('global', {
                                        ...app.activePlugins(),
                                        categoryGroup: v,
                                    })
                                }
                                color={c.primary}
                            />
                        )}
                    />
                </Surface>

            </ScrollView>

            <BottomNav active="settings" navigation={navigation} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scroll: { padding: 16, gap: 8, paddingBottom: 16 },
    sectionLabel: {
        marginTop: 16,
        marginBottom: 8,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        fontSize: 11,
    },
    card: { borderRadius: 12, overflow: 'hidden' },
    section: { padding: 16, gap: 12 },
    row: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
    themeGroup: { marginBottom: 12 },
    themeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    themeChip: {},
    themeBtn: { borderRadius: 20, borderWidth: 1.5 },
    themeBtnContent: { height: 32 },
});
