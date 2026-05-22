import React, { useState } from 'react';
import { StyleSheet, View, TextInput, Pressable } from 'react-native';
import { Checkbox, IconButton, Text, useTheme } from 'react-native-paper';
import { Todo } from '../utils/types';

interface Props {
  todo: Todo;
  onToggle: (id: string) => void;
  onEdit: (id: string, text: string) => void;
  onDelete: (id: string) => void;
  drag?: () => void;
  isActive?: boolean;
}

export function TodoItem({ todo, onToggle, onEdit, onDelete, drag, isActive }: Props) {
  const theme = useTheme();
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);

  function commitEdit() {
    const trimmed = editText.trim();
    if (trimmed && trimmed !== todo.text) {
      onEdit(todo.id, trimmed);
    } else {
      setEditText(todo.text);
    }
    setEditing(false);
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isActive
            ? theme.colors.surfaceVariant
            : theme.colors.surface,
          borderColor: theme.colors.outline,
        },
      ]}
    >
      {/* Drag handle */}
      {drag && (
        <Pressable onLongPress={drag} style={styles.handle}>
          <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 16 }}>⠿</Text>
        </Pressable>
      )}

      {/* Checkbox */}
      <Checkbox.Android
        status={todo.done ? 'checked' : 'unchecked'}
        onPress={() => onToggle(todo.id)}
        color={theme.colors.primary}
        uncheckedColor={theme.colors.outline}
      />

      {/* Text / Edit */}
      <View style={styles.textWrap}>
        {editing ? (
          <TextInput
            value={editText}
            onChangeText={setEditText}
            onBlur={commitEdit}
            onSubmitEditing={commitEdit}
            autoFocus
            style={[
              styles.editInput,
              {
                color: theme.colors.onSurface,
                borderBottomColor: theme.colors.primary,
              },
            ]}
            returnKeyType="done"
          />
        ) : (
          <Pressable onPress={() => setEditing(true)} style={{ flex: 1 }}>
            <Text
              style={[
                styles.todoText,
                todo.done && {
                  textDecorationLine: 'line-through',
                  color: theme.colors.onSurfaceVariant,
                },
                { color: todo.done ? theme.colors.onSurfaceVariant : theme.colors.onSurface },
              ]}
              numberOfLines={3}
            >
              {todo.text}
            </Text>
            {todo.dueDate && (
              <Text style={[styles.dueDate, { color: theme.colors.primary }]}>
                📅 {todo.dueDate}
              </Text>
            )}
          </Pressable>
        )}
      </View>

      {/* Delete */}
      <IconButton
        icon="close"
        size={16}
        iconColor={theme.colors.onSurfaceVariant}
        onPress={() => onDelete(todo.id)}
        style={styles.deleteBtn}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
    paddingRight: 4,
    minHeight: 52,
  },
  handle: {
    paddingHorizontal: 8,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textWrap: {
    flex: 1,
    paddingVertical: 10,
    paddingRight: 4,
  },
  todoText: {
    fontSize: 15,
    lineHeight: 20,
  },
  dueDate: {
    fontSize: 11,
    marginTop: 2,
    opacity: 0.8,
  },
  editInput: {
    fontSize: 15,
    borderBottomWidth: 1,
    paddingVertical: 2,
    paddingHorizontal: 0,
  },
  deleteBtn: {
    margin: 0,
  },
});
