import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';

const EMOJIS = ['🎉', '🥳', '✨', '🎊', '🏆', '💫', '🌟', '🎆'];

interface Props {
  visible: boolean;
}

export function CelebrationOverlay({ visible }: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.3)).current;
  const emoji = useRef(EMOJIS[Math.floor(Math.random() * EMOJIS.length)]);

  useEffect(() => {
    if (visible) {
      emoji.current = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 60 }),
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start(() => {
        setTimeout(() => {
          Animated.parallel([
            Animated.timing(opacity, { toValue: 0, duration: 400, useNativeDriver: true }),
            Animated.timing(scale, { toValue: 0.3, duration: 400, useNativeDriver: true }),
          ]).start();
        }, 1800);
      });
    }
  }, [visible]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.overlay, { opacity }]}
    >
      <Animated.Text style={[styles.emoji, { transform: [{ scale }] }]}>
        {emoji.current}
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
    backgroundColor: 'transparent',
  },
  emoji: {
    fontSize: 100,
  },
});
