import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Portal, Dialog, Text, Button, TextInput, Chip, Divider, Switch } from 'react-native-paper';
import { useApp } from '../context/AppContext';
import { RecurringTask } from '../types';

export function RecurringModal({ visible, onDismiss }: { visible: boolean; onDismiss: () => void }) {
    const app = useApp();
    const recs = app.loadRecurring();
    const [step, setStep] = useState<'list' | 'freq' | 'weekly' | 'monthly' | 'early' | 'name'>('list');
    const [type, setType] = useState<RecurringTask['type']>('daily');
    const [days, setDays] = useState<number[]>([]);
    const [dates, setDates] = useState<number[]>([]);
    const [early, setEarly] = useState(false);
    const [text, setText] = useState('');

    const save = () => {
        const rec: RecurringTask = {
            id: Math.random().toString(36).slice(2),
            type, text, created: new Date().toISOString().slice(0, 10),
            earlyCompletion: early,
            ...(type === 'weekly' ? { days } : {}),
            ...(type === 'monthly' ? { dates } : {}),
        };
        app.saveRecurring([...recs, rec]);
        onDismiss();
        setStep('list');
        setText(''); setDays([]); setDates([]); setEarly(false);
    };

    const toggleDay = (d: number) => setDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);
    const toggleDate = (d: number) => setDates(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);

    return (
        <Portal>
        <Dialog visible={visible} onDismiss={onDismiss} style={{ maxHeight: '80%' }}>
        <Dialog.Title>{step === 'list' ? 'Recurring Tasks' : 'New recurring task'}</Dialog.Title>
        <Dialog.ScrollArea>
        <ScrollView>
        {step === 'list' && (
            <View>
            {recs.length === 0 && <Text style={{ padding: 12 }}>No recurring tasks yet.</Text>}
            {recs.map(r => (
                <View key={r.id} style={styles.recRow}>
                <Chip>{r.type}</Chip>
                <Text style={{ flex: 1, marginLeft: 8 }}>{r.text}</Text>
                <Button onPress={() => app.saveRecurring(recs.filter(x => x.id !== r.id))}>✕</Button>
                </View>
            ))}
            <Button onPress={() => setStep('freq')} mode="contained" style={{ marginTop: 12 }}>＋ New recurring task</Button>
            </View>
        )}

        {step === 'freq' && (
            <View style={styles.freqGrid}>
            <Button mode="outlined" onPress={() => { setType('daily'); setStep('name'); }}>🌅 Daily</Button>
            <Button mode="outlined" onPress={() => { setType('weekly'); setStep('weekly'); }}>📆 Weekly</Button>
            <Button mode="outlined" onPress={() => { setType('monthly'); setStep('monthly'); }}>🗓️ Monthly</Button>
            </View>
        )}

        {step === 'weekly' && (
            <View style={styles.dayGrid}>
            {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d, i) => (
                <Chip key={d} selected={days.includes(i)} onPress={() => toggleDay(i)} style={styles.dayChip}>{d}</Chip>
            ))}
            </View>
        )}

        {step === 'monthly' && (
            <View style={styles.dayGrid}>
            {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                <Chip key={d} selected={dates.includes(d)} onPress={() => toggleDate(d)} style={styles.dayChip}>{d}</Chip>
            ))}
            </View>
        )}

        {(step === 'weekly' || step === 'monthly') && (
            <Button onPress={() => setStep('early')} mode="contained" style={{ marginTop: 12 }}>Next</Button>
        )}

        {step === 'early' && (
            <View>
            <Text variant="bodyMedium" style={{ marginBottom: 8 }}>Allow early completion?</Text>
            <Switch value={early} onValueChange={setEarly} />
            <Button onPress={() => setStep('name')} mode="contained" style={{ marginTop: 12 }}>Next</Button>
            </View>
        )}

        {step === 'name' && (
            <View>
            <TextInput label="Task name" value={text} onChangeText={setText} autoFocus />
            <Button onPress={save} mode="contained" disabled={!text.trim()} style={{ marginTop: 12 }}>Create</Button>
            </View>
        )}
        </ScrollView>
        </Dialog.ScrollArea>
        <Dialog.Actions>
        <Button onPress={() => step === 'list' ? onDismiss() : setStep('list')}>{step === 'list' ? 'Close' : 'Back'}</Button>
        </Dialog.Actions>
        </Dialog>
        </Portal>
    );
}

const styles = StyleSheet.create({
    recRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
    freqGrid: { gap: 8 },
    dayGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    dayChip: { margin: 2 },
});
