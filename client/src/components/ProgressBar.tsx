import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

interface Props {
  done: number;
  total: number;
}

export function ProgressBar({ done, total }: Props) {
  const theme = useTheme();
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);

  return (
    <View style={styles.container}>
      <View style={[styles.track, { backgroundColor: theme.colors.surfaceVariant }]}>
        <View
          style={[
            styles.fill,
            { width: `${pct}%`, backgroundColor: theme.colors.primary },
          ]}
        />
      </View>
      <Text style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>
        {done} / {total}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  track: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 2,
  },
  label: {
    fontSize: 12,
    fontVariant: ['tabular-nums'],
    minWidth: 40,
    textAlign: 'right',
  },
});
