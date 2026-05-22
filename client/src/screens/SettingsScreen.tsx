import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Switch, Text, TextInput, useTheme } from 'react-native-paper';
import { useApp } from '../store/AppContext';

export function SettingsScreen() {
  const theme = useTheme();
  const { appState, setWorkerUrl, setOfflineMode } = useApp();

  const [urlInput, setUrlInput] = useState(appState.workerUrl || '');

  async function handleSave() {
    await setWorkerUrl(urlInput.trim());
  }

  async function handleReset() {
    setUrlInput('');
    await setWorkerUrl('');
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={styles.content}
    >
      {/* Offline mode */}
      <View
        style={[
          styles.row,
          { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline },
        ]}
      >
        <View style={{ flex: 1 }}>
          <Text style={[styles.rowTitle, { color: theme.colors.onSurface }]}>Offline Mode</Text>
          <Text style={[styles.rowDesc, { color: theme.colors.onSurfaceVariant }]}>
            Disable all sync. Data stays local only.
          </Text>
        </View>
        <Switch
          value={appState.offlineMode}
          onValueChange={setOfflineMode}
          color={theme.colors.primary}
        />
      </View>

      {/* Worker URL */}
      <View style={[styles.section, { opacity: appState.offlineMode ? 0.4 : 1 }]}>
        <Text style={[styles.sectionLabel, { color: theme.colors.onSurfaceVariant }]}>
          CLOUDFLARE WORKER URL
        </Text>
        <Text style={[styles.sectionDesc, { color: theme.colors.onSurfaceVariant }]}>
          Your deployed D1-backed worker for real-time sync.
        </Text>
        {appState.workerUrl ? (
          <View
            style={[
              styles.urlDisplay,
              { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.outline },
            ]}
          >
            <Text
              style={[styles.urlText, { color: theme.colors.onSurfaceVariant }]}
              numberOfLines={2}
            >
              {appState.workerUrl}
            </Text>
          </View>
        ) : null}
        <TextInput
          mode="outlined"
          value={urlInput}
          onChangeText={setUrlInput}
          placeholder="https://your-worker.workers.dev"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          editable={!appState.offlineMode}
          style={{ marginTop: 10 }}
        />
      </View>

      <View style={styles.actions}>
        <Button mode="outlined" onPress={handleReset} style={{ flex: 1 }}>
          Reset
        </Button>
        <Button
          mode="contained"
          onPress={handleSave}
          disabled={appState.offlineMode}
          style={{ flex: 1 }}
        >
          Save
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
    gap: 12,
  },
  rowTitle: { fontSize: 14, fontWeight: '700', marginBottom: 3 },
  rowDesc: { fontSize: 12 },
  section: { marginBottom: 16 },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  sectionDesc: { fontSize: 12, marginBottom: 4, lineHeight: 18 },
  urlDisplay: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 6,
  },
  urlText: { fontSize: 11, fontFamily: 'monospace' },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
});
