import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Portal, Dialog, Text, Button } from 'react-native-paper';
import { useApp } from '../context/AppContext';
import { THEMES } from '../theme';

export function ThemesModal({ visible, onDismiss }: { visible: boolean; onDismiss: () => void }) {
    const app = useApp();

    return (
        <Portal>
        <Dialog visible={visible} onDismiss={onDismiss} style={{ maxHeight: '80%' }}>
        <Dialog.Title>Themes</Dialog.Title>
        <Dialog.ScrollArea>
        <ScrollView>
        <Text variant="labelSmall" style={styles.section}>🌙 Dark</Text>
        <View style={styles.grid}>
        {Object.values(THEMES).filter(t => t.dark).map(t => (
            <TouchableOpacity key={t.id} onPress={() => app.applyTheme(t.id)} style={[styles.card, app.themeId === t.id && styles.active]}>
            <View style={[styles.swatch, { backgroundColor: t.colors.bg, borderColor: app.themeId === t.id ? t.colors.accent : t.colors.border }]}>
            <View style={[styles.circle, { backgroundColor: t.colors.accent }]} />
            <View style={[styles.circle, { backgroundColor: t.colors.accent2, width: 10, height: 10 }]} />
            </View>
            <Text variant="labelMedium" style={{ marginTop: 6 }}>{t.label}</Text>
            {app.themeId === t.id && <Text style={styles.check}>✓</Text>}
            </TouchableOpacity>
        ))}
        </View>

        <Text variant="labelSmall" style={styles.section}>☀️ Light</Text>
        <View style={styles.grid}>
        {Object.values(THEMES).filter(t => !t.dark).map(t => (
            <TouchableOpacity key={t.id} onPress={() => app.applyTheme(t.id)} style={[styles.card, app.themeId === t.id && styles.active]}>
            <View style={[styles.swatch, { backgroundColor: t.colors.bg, borderColor: app.themeId === t.id ? t.colors.accent : t.colors.border }]}>
            <View style={[styles.circle, { backgroundColor: t.colors.accent }]} />
            <View style={[styles.circle, { backgroundColor: t.colors.accent2, width: 10, height: 10 }]} />
            </View>
            <Text variant="labelMedium" style={{ marginTop: 6 }}>{t.label}</Text>
            {app.themeId === t.id && <Text style={styles.check}>✓</Text>}
            </TouchableOpacity>
        ))}
        </View>
        </ScrollView>
        </Dialog.ScrollArea>
        <Dialog.Actions><Button onPress={onDismiss}>Done</Button></Dialog.Actions>
        </Dialog>
        </Portal>
    );
}

const styles = StyleSheet.create({
    section: { marginTop: 12, marginBottom: 6, letterSpacing: 1, textTransform: 'uppercase' },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    card: { width: '47%', padding: 10, borderRadius: 10, borderWidth: 1.5, borderColor: 'transparent' },
    active: { backgroundColor: 'rgba(124,106,255,0.12)', borderColor: '#7c6aff' },
                                 swatch: { height: 40, borderRadius: 8, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 },
                                 circle: { width: 12, height: 12, borderRadius: 6 },
                                 check: { color: '#7c6aff', fontSize: 12, marginTop: 2 },
});
