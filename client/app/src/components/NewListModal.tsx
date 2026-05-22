import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Portal, Dialog, Text, Button, RadioButton, TextInput } from 'react-native-paper';
import { useApp } from '../context/AppContext';
import { PluginState } from '../types';

const TEMPLATES = [
    { id: 'personal', icon: '✅', name: 'Personal Todos', plugins: { categoryGroup: false, finishRewards: true } as PluginState },
{ id: 'grocery', icon: '🛒', name: 'Grocery List', plugins: { categoryGroup: true, finishRewards: true } as PluginState },
{ id: 'blank', icon: '📋', name: 'Blank List', plugins: { categoryGroup: false, finishRewards: false } as PluginState },
];

export function NewListModal({ visible, onDismiss }: { visible: boolean; onDismiss: () => void }) {
    const app = useApp();
    const [selected, setSelected] = useState('personal');
    const [name, setName] = useState('');

    const create = () => {
        const t = TEMPLATES.find(x => x.id === selected);
        const finalName = name.trim() || t?.name || 'Untitled';
        app.createList(finalName, t?.plugins);
        onDismiss();
        setName('');
    };

    return (
        <Portal>
        <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Title>New list</Dialog.Title>
        <Dialog.Content>
        {TEMPLATES.map(t => (
            <View key={t.id} style={styles.row}>
            <RadioButton value={t.id} status={selected === t.id ? 'checked' : 'unchecked'} onPress={() => setSelected(t.id)} />
            <Text variant="bodyMedium" style={{ flex: 1 }}>{t.icon} {t.name}</Text>
            </View>
        ))}
        <TextInput label="List name" value={name} onChangeText={setName} style={{ marginTop: 12 }} />
        </Dialog.Content>
        <Dialog.Actions>
        <Button onPress={onDismiss}>Cancel</Button>
        <Button onPress={create} mode="contained">Create</Button>
        </Dialog.Actions>
        </Dialog>
        </Portal>
    );
}

const styles = StyleSheet.create({ row: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 } });
