import React, { useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Portal, Dialog, Text, Button, TextInput, IconButton } from 'react-native-paper';
import { useApp } from '../context/AppContext';

export function CalendarDayModal({ visible, dateKey, onDismiss }: { visible: boolean; dateKey: string; onDismiss: () => void }) {
    const app = useApp();
    const [text, setText] = useState('');

    const items = app.todos.filter(t => t.dueDate === dateKey);

    const add = () => {
        if (!text.trim()) return;
        app.addTodo(text.trim(), dateKey);
        setText('');
    };

    return (
        <Portal>
        <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Title>📅 {dateKey}</Dialog.Title>
        <Dialog.Content>
        <FlatList
        data={items}
        keyExtractor={t => t.id}
        renderItem={({ item }) => (
            <View style={styles.row}>
            <IconButton
            icon={item.done ? 'check-box' : 'check-box-outline-blank'}
            size={20}
            onPress={() => app.toggleTodo(item.id)}
            />
            <Text style={[styles.todoText, item.done && styles.done]}>{item.text}</Text>
            <IconButton icon="delete" size={16} onPress={() => app.deleteTodo(item.id)} />
            </View>
        )}
        ListEmptyComponent={<Text style={{ paddingVertical: 12 }}>No tasks for this day.</Text>}
        />
        <TextInput label="Add task" value={text} onChangeText={setText} onSubmitEditing={add} style={{ marginTop: 8 }} />
        </Dialog.Content>
        <Dialog.Actions>
        <Button onPress={onDismiss}>Done</Button>
        <Button onPress={add} mode="contained" disabled={!text.trim()}>Add</Button>
        </Dialog.Actions>
        </Dialog>
        </Portal>
    );
}

const styles = StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
    todoText: { flex: 1, fontSize: 14 },
    done: { textDecorationLine: 'line-through', opacity: 0.55 },
});
