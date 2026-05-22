import React from 'react';
import { Modal, View, StyleSheet, Animated } from 'react-native';
import { Text } from 'react-native-paper';

const EMOJIS = ['🎉','🥳','✨','🎊','🏆','💫','🌟','🎆'];

export function Celebration({ visible }: { visible: boolean }) {
    const scale = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        if (visible) {
            Animated.sequence([
                Animated.timing(scale, { toValue: 1, duration: 400, useNativeDriver: true }),
                              Animated.delay(2000),
                              Animated.timing(scale, { toValue: 0, duration: 300, useNativeDriver: true }),
            ]).start();
        }
    }, [visible]);

    return (
        <Modal visible={visible} transparent animationType="fade">
        <View style={styles.overlay}>
        <Animated.View style={{ transform: [{ scale }] }}>
        <Text style={styles.emoji}>{EMOJIS[Math.floor(Math.random() * EMOJIS.length)]}</Text>
        </Animated.View>
        </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },
                                 emoji: { fontSize: 80 },
});
