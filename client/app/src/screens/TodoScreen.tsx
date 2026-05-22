import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import {
    Appbar, TextInput, IconButton, Text, ProgressBar,
    Portal, Dialog, Button, useTheme, Surface
} from 'react-native-paper';
import DraggableFlatList, {
    RenderItemParams,
    ScaleDecorator,
} from 'react-native-draggable-flatlist';
import { useApp } from '../context/AppContext';
import { BottomNav } from '../components/BottomNav';
import { NewListModal } from '../components/NewListModal';
import { ShareModal } from '../components/ShareModal';
import { RecurringModal } from '../components/RecurringModal';
import { PluginsModal } from '../components/PluginsModal';
import { ThemesModal } from '../components/ThemesModal';
import { Celebration } from '../components/Celebration';
import { TodoRecord } from '../types';

export function TodoScreen({ navigation }: any) {
    const app = useApp();
    const theme = useTheme();
    const c = theme.colors;

    const [input, setInput] = useState('');
    const [editId, setEditId] = useState<string | null>(null);
    const [editText, setEditText] = useState('');
    const [showNewList, setShowNewList] = useState(false);
    const [showShare, setShowShare] = useState(false);
    const [showRecurring, setShowRecurring] = useState(false);
    const [showPlugins, setShowPlugins] = useState(false);
    const [showThemes, setShowThemes] = useState(false);
    const [showCelebration, setShowCelebration] = useState(false);

    const activeList = app.activeListId ? app.lists[app.activeListId] : null;

    const doneTodos = app.todos.filter(t => t.done).length;
    const totalTodos = app.todos.length;
    const progressValue = totalTodos > 0 ? doneTodos / totalTodos : 0;

    const onAdd = useCallback(() => {
        const trimmed = input.trim();
        if (!trimmed) return;
        app.addTodo(trimmed);
        setInput('');
    }, [input, app]);

    const onToggle = useCallback((id: string) => {
        app.toggleTodo(id);
        const willAllDone =
            app.todos.length > 0 &&
            app.todos.every(t => t.done || t.id === id);
        if (willAllDone && app.activePlugins().finishRewards) {
            setShowCelebration(true);
            app.celebrate();
            setTimeout(() => setShowCelebration(false), 2800);
        }
    }, [app]);

    const onDragEnd = useCallback(({ data }: { data: TodoRecord[] }) => {
        const store = app.stores.current[app.activeListId ?? ''];
        if (!store) return;
        data.forEach(item => store.editTodo(item.id, item.text));
    }, [app]);

    const renderItem = useCallback(({ item, drag, isActive }: RenderItemParams<TodoRecord>) => (
        <ScaleDecorator>
            <Surface
                style={[
                    styles.todoItem,
                    {
                        backgroundColor: isActive ? c.surfaceVariant : c.surface,
                        borderColor: isActive ? c.primary : 'transparent',
                        borderWidth: isActive ? 1 : 0,
                    },
                ]}
                elevation={isActive ? 4 : 1}
            >
                <IconButton
                    icon="drag"
                    size={20}
                    iconColor={c.onSurfaceVariant}
                    onLongPress={drag}
                    style={styles.dragHandle}
                />
                <IconButton
                    icon={item.done ? 'check-circle' : 'circle-outline'}
                    size={24}
                    onPress={() => onToggle(item.id)}
                    iconColor={item.done ? c.primary : c.onSurfaceVariant}
                />
                <Text
                    style={[
                        styles.todoText,
                        { color: item.done ? c.onSurfaceVariant : c.onSurface },
                        item.done && styles.todoDoneText,
                    ]}
                    onPress={() => { setEditId(item.id); setEditText(item.text); }}
                    numberOfLines={3}
                >
                    {item.text}
                </Text>
                {item.dueDate && (
                    <Text
                        variant="labelSmall"
                        style={[styles.dueBadge, { color: c.primary, borderColor: c.primary }]}
                    >
                        {item.dueDate}
                    </Text>
                )}
                <IconButton
                    icon="close"
                    size={18}
                    iconColor={c.onSurfaceVariant}
                    onPress={() => app.deleteTodo(item.id)}
                    style={styles.deleteBtn}
                />
            </Surface>
        </ScaleDecorator>
    ), [c, onToggle, app]);

    return (
    <>
        <View style={[styles.root, { backgroundColor: c.background }]}>
            {/* ─── Header ─── */}
            <Appbar.Header style={{ backgroundColor: c.surface }} elevated>
                <Appbar.Action
                    icon="menu"
                    onPress={() => navigation.openDrawer()}
                    iconColor={c.onSurface}
                />
                <Appbar.Content
                    title={activeList?.name || 'LilTask'}
                    titleStyle={{ color: c.onSurface }}
                />
                <Appbar.Action
                    icon="sync"
                    onPress={() => app.activeListId && app.pullUpdate(app.activeListId)}
                    iconColor={c.onSurfaceVariant}
                />
                <Appbar.Action
                    icon="share-variant-outline"
                    onPress={() => setShowShare(true)}
                    iconColor={c.onSurfaceVariant}
                />
            </Appbar.Header>

            {/* ─── Todo list (takes remaining space) ─── */}
            <DraggableFlatList
                data={app.todos}
                keyExtractor={t => t.id}
                renderItem={renderItem}
                onDragEnd={onDragEnd}
                contentContainerStyle={[
                    styles.list,
                    app.todos.length === 0 && styles.listEmpty,
                ]}
                keyboardShouldPersistTaps="handled"
                style={{ flex: 1 }}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Text variant="titleMedium" style={{ color: c.onSurfaceVariant }}>
                            No tasks yet
                        </Text>
                        <Text
                            variant="bodySmall"
                            style={{ color: c.onSurfaceVariant, opacity: 0.6, marginTop: 4 }}
                        >
                            Type below to add your first task
                        </Text>
                    </View>
                }
            />

            {/* ─── Bottom dock: progress + input + nav ─── */}
            <View
                style={[styles.dock, { backgroundColor: c.surface, borderTopColor: c.outline }]}
            >
                {/* Progress bar sits above the text input */}
                {totalTodos > 0 && (
                    <View style={styles.progressRow}>
                        <ProgressBar
                            progress={progressValue}
                            style={styles.progressBar}
                            color={c.primary}
                        />
                        <Text
                            variant="labelSmall"
                            style={[styles.progressLabel, { color: c.onSurfaceVariant }]}
                        >
                            {doneTodos}/{totalTodos}
                        </Text>
                    </View>
                )}

                {/* Input row */}
                <View style={styles.inputRow}>
                    <TextInput
                        mode="outlined"
                        placeholder="Add a task…"
                        placeholderTextColor={c.onSurfaceVariant}
                        value={input}
                        onChangeText={setInput}
                        onSubmitEditing={onAdd}
                        returnKeyType="done"
                        blurOnSubmit={false}
                        style={[styles.input, { backgroundColor: c.background }]}
                        outlineStyle={{ borderRadius: 24, borderColor: c.outline }}
                        contentStyle={{ paddingHorizontal: 12 }}
                        dense
                        right={
                            input.trim() ? (
                                <TextInput.Icon icon="send" color={c.primary} onPress={onAdd} />
                            ) : undefined
                        }
                    />
                </View>

            </View>

            {/* ─── Edit dialog ─── */}
            <Portal>
                <Dialog
                    visible={!!editId}
                    onDismiss={() => setEditId(null)}
                    style={{ backgroundColor: c.surface }}
                >
                    <Dialog.Title style={{ color: c.onSurface }}>Edit task</Dialog.Title>
                    <Dialog.Content>
                        <TextInput
                            mode="outlined"
                            value={editText}
                            onChangeText={setEditText}
                            autoFocus
                            style={{ backgroundColor: c.surface }}
                            outlineColor={c.outline}
                            activeOutlineColor={c.primary}
                            textColor={c.onSurface}
                            placeholderTextColor={c.onSurfaceVariant}
                        />
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => setEditId(null)} textColor={c.onSurfaceVariant}>
                            Cancel
                        </Button>
                        <Button
                            mode="contained"
                            buttonColor={c.primary}
                            textColor={c.onPrimary}
                            onPress={() => {
                                if (editId) app.editTodo(editId, editText);
                                setEditId(null);
                            }}
                        >
                            Save
                        </Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>

            <NewListModal visible={showNewList} onDismiss={() => setShowNewList(false)} />
            <ShareModal visible={showShare} onDismiss={() => setShowShare(false)} />
            <RecurringModal visible={showRecurring} onDismiss={() => setShowRecurring(false)} />
            <PluginsModal visible={showPlugins} onDismiss={() => setShowPlugins(false)} />
            <ThemesModal visible={showThemes} onDismiss={() => setShowThemes(false)} />
            <Celebration visible={showCelebration} />
        </View>
        {/* Bottom nav (handles its own safe-area insets) */}
        <BottomNav active="lists" navigation={navigation} />
    </>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1 },
    list: { padding: 12, gap: 6 },
    listEmpty: { flexGrow: 1 },
    todoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        paddingRight: 2,
        marginBottom: 6,
    },
    dragHandle: { margin: 0, padding: 0 },
    deleteBtn: { margin: 0 },
    todoText: { flex: 1, fontSize: 15, lineHeight: 22 },
    todoDoneText: { textDecorationLine: 'line-through', opacity: 0.5 },
    dueBadge: {
        fontSize: 10,
        borderWidth: 1,
        borderRadius: 4,
        paddingHorizontal: 4,
        paddingVertical: 1,
        marginRight: 4,
    },
    empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4 },
    // Bottom dock groups progress + input + nav together
    dock: {
        borderTopWidth: StyleSheet.hairlineWidth,
    },
    progressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 4,
        gap: 10,
    },
    progressBar: { flex: 1, height: 4, borderRadius: 2 },
    progressLabel: { minWidth: 36, textAlign: 'right' },
    inputRow: {
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    input: { flex: 1 },
});
