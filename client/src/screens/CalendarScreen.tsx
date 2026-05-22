import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Button,
  Checkbox,
  Divider,
  IconButton,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';
import { useApp } from '../store/AppContext';
import {
  DAY_NAMES,
  formatDateLabel,
  MONTH_NAMES,
  dateKey,
} from '../utils/dateUtils';
import { Todo } from '../utils/types';

export function CalendarScreen() {
  const theme = useTheme();
  const { todos, addTodo, toggleTodo, deleteTodo, appState } = useApp();

  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [calInput, setCalInput] = useState('');

  function navigate(dir: 1 | -1) {
    let m = month + dir;
    let y = year;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    setMonth(m);
    setYear(y);
  }

  function todosForDate(dk: string): Todo[] {
    return todos.filter((t) => t.dueDate === dk);
  }

  function buildCalendarDays() {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrev = new Date(year, month, 0).getDate();
    const days: { day: number; month: number; year: number; key: string; other: boolean }[] = [];

    for (let i = firstDay - 1; i >= 0; i--) {
      const d = daysInPrev - i;
      const m = month === 0 ? 11 : month - 1;
      const y = month === 0 ? year - 1 : year;
      days.push({ day: d, month: m, year: y, key: `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`, other: true });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      days.push({ day: d, month, year, key: `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`, other: false });
    }
    const total = firstDay + daysInMonth;
    const tail = total % 7 === 0 ? 0 : 7 - (total % 7);
    for (let d = 1; d <= tail; d++) {
      const m = month === 11 ? 0 : month + 1;
      const y = month === 11 ? year + 1 : year;
      days.push({ day: d, month: m, year: y, key: `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`, other: true });
    }
    return days;
  }

  const days = buildCalendarDays();
  const todayKey = dateKey(today);

  const selectedTodos = selectedDate ? todosForDate(selectedDate) : [];

  function handleAddCalTodo() {
    const text = calInput.trim();
    if (!text || !selectedDate) return;
    addTodo(text, selectedDate);
    setCalInput('');
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Month nav */}
      <View style={styles.nav}>
        <IconButton icon="chevron-left" onPress={() => navigate(-1)} iconColor={theme.colors.onSurface} />
        <Text style={[styles.monthTitle, { color: theme.colors.onSurface }]}>
          {MONTH_NAMES[month]} {year}
        </Text>
        <IconButton icon="chevron-right" onPress={() => navigate(1)} iconColor={theme.colors.onSurface} />
      </View>

      {/* Day headers */}
      <View style={styles.dayHeaders}>
        {DAY_NAMES.map((d) => (
          <View key={d} style={styles.dayHeaderCell}>
            <Text style={[styles.dayHeaderText, { color: theme.colors.onSurfaceVariant }]}>{d}</Text>
          </View>
        ))}
      </View>

      {/* Grid */}
      <ScrollView style={{ flex: 1 }}>
        <View style={styles.grid}>
          {days.map((cell) => {
            const cellTodos = todosForDate(cell.key);
            const isToday = cell.key === todayKey;
            const isSelected = cell.key === selectedDate;
            return (
              <TouchableOpacity
                key={cell.key + cell.other}
                style={[
                  styles.cell,
                  {
                    backgroundColor: isSelected
                      ? theme.colors.primary + '22'
                      : isToday
                      ? theme.colors.surfaceVariant
                      : 'transparent',
                    borderColor: isSelected
                      ? theme.colors.primary
                      : isToday
                      ? theme.colors.primary + '55'
                      : theme.colors.outline + '44',
                  },
                ]}
                onPress={() => setSelectedDate(cell.key === selectedDate ? null : cell.key)}
              >
                <Text
                  style={[
                    styles.cellDay,
                    {
                      color: cell.other
                        ? theme.colors.onSurfaceVariant + '55'
                        : isToday
                        ? theme.colors.primary
                        : theme.colors.onSurface,
                      fontWeight: isToday ? '700' : '400',
                    },
                  ]}
                >
                  {cell.day}
                </Text>
                {cellTodos.slice(0, 3).map((t) => (
                  <View
                    key={t.id}
                    style={[styles.dot, { backgroundColor: t.done ? theme.colors.onSurfaceVariant : theme.colors.primary }]}
                  />
                ))}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Date detail panel */}
      {selectedDate && (
        <View
          style={[
            styles.detailPanel,
            {
              backgroundColor: theme.colors.surface,
              borderTopColor: theme.colors.outline,
            },
          ]}
        >
          <Text style={[styles.detailTitle, { color: theme.colors.onSurface }]}>
            📅 {formatDateLabel(selectedDate)}
          </Text>
          <ScrollView style={{ maxHeight: 180 }}>
            {selectedTodos.length === 0 ? (
              <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
                No tasks for this day yet.
              </Text>
            ) : (
              selectedTodos.map((t) => (
                <View key={t.id} style={styles.detailTodo}>
                  <Checkbox.Android
                    status={t.done ? 'checked' : 'unchecked'}
                    onPress={() => toggleTodo(t.id)}
                    color={theme.colors.primary}
                  />
                  <Text
                    style={[
                      { flex: 1, fontSize: 14, color: theme.colors.onSurface },
                      t.done && { textDecorationLine: 'line-through', color: theme.colors.onSurfaceVariant },
                    ]}
                  >
                    {t.text}
                  </Text>
                  <IconButton icon="close" size={14} onPress={() => deleteTodo(t.id)} iconColor={theme.colors.onSurfaceVariant} />
                </View>
              ))
            )}
          </ScrollView>
          <View style={styles.detailInput}>
            <TextInput
              mode="outlined"
              value={calInput}
              onChangeText={setCalInput}
              placeholder="Add task for this day…"
              onSubmitEditing={handleAddCalTodo}
              returnKeyType="done"
              dense
              style={{ flex: 1 }}
              outlineStyle={{ borderRadius: 8 }}
            />
            <Button mode="contained" onPress={handleAddCalTodo} style={{ marginLeft: 8 }} compact>
              Add
            </Button>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthTitle: {
    fontSize: 17,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  dayHeaders: {
    flexDirection: 'row',
    paddingHorizontal: 8,
  },
  dayHeaderCell: { flex: 1, alignItems: 'center', paddingVertical: 4 },
  dayHeaderText: { fontSize: 11, fontWeight: '600' },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  cell: {
    width: '14.28%',
    aspectRatio: 0.85,
    padding: 4,
    borderWidth: 1,
    borderRadius: 6,
    alignItems: 'center',
  },
  cellDay: { fontSize: 13 },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginTop: 2,
  },
  detailPanel: {
    padding: 16,
    borderTopWidth: 1,
    maxHeight: 320,
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  detailTodo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  emptyText: { fontSize: 13, paddingVertical: 8 },
  detailInput: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
});
