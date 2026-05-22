import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { Text, IconButton, Divider, Surface, Badge, List, useTheme } from 'react-native-paper';
import { useApp } from '../context/AppContext';
import { ThemesModal } from '../components/ThemesModal';
import { PluginsModal } from '../components/PluginsModal';
import { NewListModal } from '../components/NewListModal';

export function DrawerContent(props: any) {
    const app = useApp();
    const theme = useTheme();
    const [showNewList, setShowNewList] = useState(false);
    const [showThemes, setShowThemes] = useState(false);
    const [showPlugins, setShowPlugins] = useState(false);

    return (
        <DrawerContentScrollView {...props} style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
        <Text variant="titleLarge" style={styles.logo}>✦ <Text style={{ color: theme.colors.primary }}>LilTask</Text></Text>
        </View>

        <Text variant="labelSmall" style={styles.section}>Lists</Text>
        {Object.entries(app.lists).map(([id, list]) => (
            <Surface key={id} style={[styles.listItem, app.activeListId === id && { backgroundColor: theme.colors.primaryContainer }]} elevation={app.activeListId === id ? 2 : 0}>
            <DrawerItem
            label={list.name}
            labelStyle={{ color: theme.colors.onSurface }}
            icon={() => <View style={[styles.dot, { backgroundColor: app.activeListId === id ? theme.colors.primary : theme.colors.onSurfaceVariant }]} />}
            onPress={() => { app.setActiveListId(id); props.navigation.closeDrawer(); }}
            style={{ marginVertical: 0 }}
            right={() => (
                <View style={styles.right}>
                <Badge style={[styles.badge, { backgroundColor: theme.colors.surfaceVariant }]}>{app.todos.length}</Badge>
                <IconButton icon="close" size={16} onPress={() => app.deleteList(id)} style={{ margin: 0 }} />
                </View>
            )}
            />
            </Surface>
        ))}

        <IconButton icon="plus" mode="outlined" style={styles.newBtn} onPress={() => setShowNewList(true)} />

        <Divider style={styles.divider} />

        <DrawerItem label="Themes" labelStyle={{ color: theme.colors.onSurface }} icon={({ color }) => <List.Icon color={color} icon="palette" />} onPress={() => setShowThemes(true)} />
        <DrawerItem label="Plugins" labelStyle={{ color: theme.colors.onSurface }} icon={({ color }) => <List.Icon color={color} icon="puzzle" />} onPress={() => setShowPlugins(true)} />

        <Divider style={styles.divider} />
        <DrawerItem label="Settings" labelStyle={{ color: theme.colors.onSurface }} icon={({ color }) => <List.Icon color={color} icon="cog" />} onPress={() => { props.navigation.navigate('Settings'); props.navigation.closeDrawer(); }} />

        <ThemesModal visible={showThemes} onDismiss={() => setShowThemes(false)} />
        <PluginsModal visible={showPlugins} onDismiss={() => setShowPlugins(false)} />
        <NewListModal visible={showNewList} onDismiss={() => setShowNewList(false)} />
        </DrawerContentScrollView>
    );
}

const styles = StyleSheet.create({
    container: { paddingHorizontal: 8 },
    header: { padding: 16, marginBottom: 8 },
    logo: { fontWeight: '800', letterSpacing: -0.5 },
    section: { paddingHorizontal: 16, marginTop: 8, marginBottom: 4, letterSpacing: 1, textTransform: 'uppercase', opacity: 0.6 },
    listItem: { marginHorizontal: 8, marginVertical: 2, borderRadius: 10 },
    dot: { width: 8, height: 8, borderRadius: 4 },
    right: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    badge: { fontSize: 10 },
    newBtn: { margin: 8, borderStyle: 'dashed' },
    divider: { marginVertical: 12 },
});
