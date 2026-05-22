import React, { useState } from 'react';
import { Share, StyleSheet, View } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
import * as Clipboard from 'expo-clipboard';
import { useApp } from '../store/AppContext';

export function ShareScreen() {
  const theme = useTheme();
  const { appState, buildShareUrl, getActivePlugins } = useApp();
  const [copied, setCopied] = useState(false);

  const list = appState.activeListId ? appState.lists[appState.activeListId] : null;
  const plugins = getActivePlugins();
  const shareUrl = buildShareUrl('https://liltask.app');

  async function handleCopy() {
    await Clipboard.setStringAsync(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleShare() {
    await Share.share({ message: shareUrl, url: shareUrl });
  }

  if (!list) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: theme.colors.onSurfaceVariant }}>No list selected.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.onSurface }]}>Share list</Text>
      <Text style={[styles.desc, { color: theme.colors.onSurfaceVariant }]}>
        Anyone with this link can collaborate in real time — no sign up needed.
      </Text>

      <View
        style={[
          styles.urlBox,
          { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.outline },
        ]}
      >
        <Text
          style={[styles.urlText, { color: theme.colors.onSurface }]}
          selectable
          numberOfLines={3}
        >
          {shareUrl}
        </Text>
      </View>

      <View style={[styles.pluginBadge, { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.outline }]}>
        <Text style={[styles.pluginLabel, { color: theme.colors.onSurfaceVariant }]}>
          Plugins included:{' '}
          <Text style={{ color: theme.colors.primary }}>
            {[
              plugins.categoryGroup && '🏷️ Category Grouper',
              plugins.finishRewards && '🎉 Finish Rewards',
            ]
              .filter(Boolean)
              .join(' · ') || 'None'}
          </Text>
        </Text>
      </View>

      <View style={styles.actions}>
        <Button
          mode="outlined"
          onPress={handleCopy}
          icon={copied ? 'check' : 'content-copy'}
          style={{ flex: 1 }}
        >
          {copied ? 'Copied!' : 'Copy link'}
        </Button>
        <Button mode="contained" onPress={handleShare} icon="share-variant" style={{ flex: 1 }}>
          Share
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  desc: { fontSize: 14, lineHeight: 20, marginBottom: 16 },
  urlBox: {
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 12,
  },
  urlText: { fontSize: 13, lineHeight: 18 },
  pluginBadge: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 24,
  },
  pluginLabel: { fontSize: 12 },
  actions: { flexDirection: 'row', gap: 10 },
});
