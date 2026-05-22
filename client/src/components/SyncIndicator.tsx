import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { SyncStatus } from '../utils/types';

interface Props {
  status: SyncStatus;
}

const STATUS_LABELS: Record<SyncStatus, string> = {
  synced: 'synced',
  syncing: 'syncing…',
  error: 'error',
  offline: 'offline',
};

export function SyncIndicator({ status }: Props) {
  const theme = useTheme();

  const dotColor =
    status === 'synced'
      ? '#22c55e'
      : status === 'syncing'
      ? theme.colors.primary
      : status === 'error'
      ? theme.colors.error
      : theme.colors.onSurfaceVariant;

  return (
    <View style={styles.container}>
      <View style={[styles.dot, { backgroundColor: dotColor }]} />
      <Text style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>
        {STATUS_LABELS[status]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  label: {
    fontSize: 11,
    letterSpacing: 0.3,
  },
});
