import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Portal, Dialog, Text, Button, IconButton } from 'react-native-paper';
import { useApp } from '../context/AppContext';
import * as Clipboard from 'expo-clipboard';

export function ShareModal({ visible, onDismiss }: { visible: boolean; onDismiss: () => void }) {
    const app = useApp();
    const url = app.getRoomShareUrl();

    const copy = async () => {
        if (url) await Clipboard.setStringAsync(url);
    };

        return (
            <Portal>
            <Dialog visible={visible} onDismiss={onDismiss}>
            <Dialog.Title>Share list</Dialog.Title>
            <Dialog.Content>
            <Text variant="bodySmall" style={{ marginBottom: 12 }}>Anyone with this link can collaborate in real time.</Text>
            <View style={styles.box}>
            <Text variant="bodySmall" style={{ flex: 1 }} numberOfLines={2}>{url || '—'}</Text>
            <IconButton icon="content-copy" size={18} onPress={copy} />
            </View>
            </Dialog.Content>
            <Dialog.Actions>
            <Button onPress={onDismiss}>Done</Button>
            </Dialog.Actions>
            </Dialog>
            </Portal>
        );
}

const styles = StyleSheet.create({
    box: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 10, backgroundColor: '#1e1e24', borderWidth: 1, borderColor: '#2e2e38' }
});
