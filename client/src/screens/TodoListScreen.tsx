import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Keyboard,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {
  Button,
  Divider,
  FAB,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';
import { useApp } from '../store/AppContext';
import { TodoItem } from '../components/TodoItem';
import { ProgressBar } from '../components/ProgressBar';
import { CelebrationOverlay } from '../components/CelebrationOverlay';
import { groupByCategory } from '../utils/categories';
import { Todo } from '../utils/types';

export function TodoListScreen() {
  const theme = useTheme();
  const {
    todos,
    addTodo,
    toggleTodo,
    editTodo,
    deleteTodo,
    reorderTodos,
    getActivePlugins,
    appState,
  } = useApp();

  const [inputText, setInputText] = useState('');
  const [celebrating, setCelebrating] = useState(false);
  const prevAllDone = useRef(false);
  const inputRef = useRef<any>(null);

  const plugins = getActivePlugins();
  const activeTodos = todos.filter((t) => !t.dueDate);
  const done = activeTodos.filter((t) => t.done).length;
  const total = activeTodos.length;

  // Check for finish reward
  useEffect(() => {
    if (!plugins.finishRewards) return;
    const allDone = total > 0 && done === total;
    if (allDone && !prevAllDone.current) {
      setCelebrating(true);
      setTimeout(() => setCelebrating(false), 3000);
    }
    prevAllDone.current = allDone;
  }, [done, total, plugins.finishRewards]);

  function handleAdd() {
    const text = inputText.trim();
    if (!text) return;
    addTodo(text);
    setInputText('');
  }

  const renderTodo = useCallback(
    (item: Todo, index: number) => (
      <TodoItem
        key={item.id}
        todo={item}
        onToggle={toggleTodo}
        onEdit={editTodo}
        onDelete={deleteTodo}
      />
    ),
    [toggleTodo, editTodo, deleteTodo],
  );

  // Grouped view for grocery mode
  function renderGrouped() {
    const groups = groupByCategory(activeTodos);
    return groups.map((group) => (
      <View key={group.category}>
        <Text
          style={[
            styles.categoryHeader,
            {
              color: theme.colors.onSurfaceVariant,
              borderBottomColor: theme.colors.outline,
            },
          ]}
        >
          {group.category}
        </Text>
        {group.items.map((item) =>
          renderTodo(item, activeTodos.indexOf(item)),
        )}
      </View>
    ));
  }

  const listName = appState.activeListId
    ? appState.lists[appState.activeListId]?.name
    : '';

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <CelebrationOverlay visible={celebrating} />

      {/* Progress */}
      {total > 0 && <ProgressBar done={done} total={total} />}

      {/* Todo list */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
      >
        {activeTodos.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyIcon]}>📝</Text>
            <Text
              style={[styles.emptyTitle, { color: theme.colors.onSurface }]}
            >
              No tasks yet
            </Text>
            <Text
              style={[
                styles.emptyDesc,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              Add your first task below
            </Text>
          </View>
        ) : plugins.categoryGroup ? (
          renderGrouped()
        ) : (
          activeTodos.map((item, idx) => renderTodo(item, idx))
        )}
      </ScrollView>

      {/* Input bar */}
      <View
        style={[
          styles.inputBar,
          {
            backgroundColor: theme.colors.surface,
            borderTopColor: theme.colors.outline,
          },
        ]}
      >
        <TextInput
          ref={inputRef}
          mode="outlined"
          value={inputText}
          onChangeText={setInputText}
          placeholder="Add a task…"
          onSubmitEditing={handleAdd}
          returnKeyType="done"
          style={styles.input}
          outlineStyle={{ borderRadius: 10 }}
          dense
          right={
            inputText.trim() ? (
              <TextInput.Icon
                icon="plus"
                onPress={handleAdd}
                color={theme.colors.primary}
              />
            ) : undefined
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  categoryHeader: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    paddingVertical: 8,
    marginTop: 8,
    borderBottomWidth: 1,
    marginBottom: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 8,
  },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { fontSize: 18, fontWeight: '600' },
  emptyDesc: { fontSize: 14 },
  inputBar: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  input: {
    fontSize: 15,
  },
});
