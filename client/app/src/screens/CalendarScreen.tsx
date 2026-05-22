import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Appbar, Text, Surface, IconButton, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { BottomNav } from '../components/BottomNav';
import { CalendarDayModal } from '../components/CalendarDayModal';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

export function CalendarScreen({ navigation }: any) {
    const app = useApp();
    const theme = useTheme();
    const insets = useSafeAreaInsets();
    const c = theme.colors;

    const now = new Date();
    const [year, setYear] = useState(now.getFullYear());
    const [month, setMonth] = useState(now.getMonth());
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrev = new Date(year, month, 0).getDate();

    const cells: { d: number; other: boolean; key: string }[] = [];
    for (let i = firstDay - 1; i >= 0; i--)
        cells.push({ d: daysInPrev - i, other: true, key: `p-${i}` });
    for (let d = 1; d <= daysInMonth; d++)
        cells.push({ d, other: false, key: `c-${d}` });
    const total = firstDay + daysInMonth;
    const nextCells = total % 7 === 0 ? 0 : 7 - (total % 7);
    for (let d = 1; d <= nextCells; d++)
        cells.push({ d, other: true, key: `n-${d}` });

    const isToday = (d: number, other: boolean) => {
        if (other) return false;
        const t = new Date();
        return t.getFullYear() === year && t.getMonth() === month && t.getDate() === d;
    };

    const dateKey = (d: number, other: boolean) => {
        const realMonth = other ? month + (d > 20 ? -1 : 1) : month;
        const realYear = year + Math.floor(realMonth / 12);
        const rm = ((realMonth % 12) + 12) % 12;
        return `${realYear}-${String(rm + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    };

    const prevMonth = () => {
        if (month === 0) { setMonth(11); setYear(y => y - 1); }
        else setMonth(m => m - 1);
    };

    const nextMonth = () => {
        if (month === 11) { setMonth(0); setYear(y => y + 1); }
        else setMonth(m => m + 1);
    };

    return (
        <View style={[styles.container, { backgroundColor: c.background }]}>
            {/* ─── Header ─── */}
            <Appbar.Header style={{ backgroundColor: c.surface }}>
                <Appbar.Action
                    icon="menu"
                    onPress={() => navigation.openDrawer()}
                    iconColor={c.onSurface}
                />
                <Appbar.Content title="Calendar" titleStyle={{ color: c.onSurface }} />
            </Appbar.Header>

            {/* ─── Month nav ─── */}
            <View style={[styles.nav, { backgroundColor: c.surface }]}>
                <IconButton
                    icon="chevron-left"
                    onPress={prevMonth}
                    iconColor={c.onSurface}
                />
                <Text
                    variant="titleMedium"
                    style={[styles.monthTitle, { color: c.onSurface }]}
                >
                    {MONTH_NAMES[month]} {year}
                </Text>
                <IconButton
                    icon="chevron-right"
                    onPress={nextMonth}
                    iconColor={c.onSurface}
                />
            </View>

            {/* ─── Day name header ─── */}
            <View style={[styles.headerRow, { backgroundColor: c.surface }]}>
                {DAY_NAMES.map(d => (
                    <Text
                        key={d}
                        variant="labelSmall"
                        style={[styles.dayName, { color: c.onSurfaceVariant }]}
                    >
                        {d}
                    </Text>
                ))}
            </View>

            {/* ─── Grid ─── */}
            <ScrollView
                contentContainerStyle={[
                    styles.grid,
                    // Pad bottom so content isn't hidden under BottomNav
                    { paddingBottom: 8 },
                ]}
                style={{ flex: 1, backgroundColor: c.background }}
            >
                {cells.map(cell => {
                    const dk = dateKey(cell.d, cell.other);
                    const todos = app.todos.filter(t => t.dueDate === dk);
                    const doneTodos = todos.filter(t => t.done);
                    const today = isToday(cell.d, cell.other);

                    return (
                        <TouchableOpacity
                            key={cell.key}
                            onPress={() => setSelectedDate(dk)}
                            style={styles.cell}
                            activeOpacity={0.7}
                        >
                            <Surface
                                style={[
                                    styles.cellInner,
                                    { backgroundColor: c.surface },
                                    today && {
                                        borderWidth: 1.5,
                                        borderColor: c.primary,
                                    },
                                    todos.length > 0 && {
                                        backgroundColor: c.surfaceVariant,
                                    },
                                ]}
                                elevation={today ? 2 : 1}
                            >
                                <Text
                                    style={[
                                        styles.cellDate,
                                        { color: c.onSurface },
                                        cell.other && { opacity: 0.3 },
                                        today && {
                                            color: c.primary,
                                            fontWeight: '700',
                                        },
                                    ]}
                                >
                                    {cell.d}
                                </Text>
                                <View style={styles.dots}>
                                    {todos.slice(0, 5).map((t, i) => (
                                        <View
                                            key={i}
                                            style={[
                                                styles.dot,
                                                {
                                                    backgroundColor: t.done
                                                        ? c.onSurfaceVariant
                                                        : c.primary,
                                                },
                                            ]}
                                        />
                                    ))}
                                </View>
                            </Surface>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            {/* ─── Bottom nav — always at bottom, handles its own safe area ─── */}
            <BottomNav active="calendar" navigation={navigation} />

            <CalendarDayModal
                visible={!!selectedDate}
                dateKey={selectedDate || ''}
                onDismiss={() => setSelectedDate(null)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    nav: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 4,
    },
    monthTitle: {
        fontWeight: '700',
        minWidth: 170,
        textAlign: 'center',
    },
    headerRow: {
        flexDirection: 'row',
        paddingHorizontal: 8,
        paddingVertical: 6,
    },
    dayName: {
        flex: 1,
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        fontSize: 10,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 8,
        paddingTop: 4,
    },
    cell: { width: `${100 / 7}%`, padding: 2 },
    cellInner: {
        aspectRatio: 1,
        padding: 6,
        borderRadius: 8,
        justifyContent: 'space-between',
    },
    cellDate: { fontSize: 13, fontWeight: '500' },
    dots: { flexDirection: 'row', gap: 3, flexWrap: 'wrap' },
    dot: { width: 5, height: 5, borderRadius: 2.5 },
});
