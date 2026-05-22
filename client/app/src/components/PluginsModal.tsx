import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Portal, Dialog, Text, Button, Switch, List } from 'react-native-paper';
import { useApp } from '../context/AppContext';

const PLUGINS = [
    { id: 'categoryGroup', name: 'Category Grouper', desc: 'Groups similar items (great for groceries).' },
    { id: 'finishRewards', name: 'Finish Rewards', desc: 'Celebratory burst when you complete all tasks.' },
] as const;

export function PluginsModal({ visible, onDismiss }: { visible: boolean; onDismiss: () => void }) {
    const app = useApp();
    const state = app.activePlugins();

    return (
        <Portal>
        <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Title>Plugins</Dialog.Title>
        <Dialog.Content>
        {PLUGINS.map(p => (
            <List.Item
            key={p.id}
            title={p.name}
            description={p.desc}
            right={() => (
                <Switch
                value={!!state[p.id as keyof typeof state]}
                onValueChange={() => app.setPlugins('global', { ...state, [p.id]: !state[p.id as keyof typeof state] })}
                />
            )}
            />
        ))}
        </Dialog.Content>
        <Dialog.Actions><Button onPress={onDismiss}>Done</Button></Dialog.Actions>
        </Dialog>
        </Portal>
    );
}
