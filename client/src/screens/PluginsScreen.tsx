import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { List, Switch, Text, useTheme } from 'react-native-paper';
import { useApp } from '../store/AppContext';
import { PluginState } from '../utils/types';

const PLUGIN_DEFS = [
  {
    id: 'categoryGroup' as keyof PluginState,
    icon: '🏷️',
    title: 'Category Grouper',
    desc: 'Groups similar items together (great for grocery lists). Detects produce, dairy, meat, household items, and more.',
  },
  {
    id: 'finishRewards' as keyof PluginState,
    icon: '🎉',
    title: 'Finish Rewards',
    desc: 'Celebratory emoji burst when you complete every task on a list!',
  },
];

export function PluginsScreen() {
  const theme = useTheme();
  const { appState, getActivePlugins, setPlugins } = useApp();

  const plugins = getActivePlugins();
  const activeId = appState.activeListId;
  const listName = activeId ? appState.lists[activeId]?.name : null;

  async function toggle(id: keyof PluginState) {
    const next: PluginState = { ...plugins, [id]: !plugins[id] };
    if (activeId) {
      await setPlugins(activeId, next);
    } else {
      await setPlugins('global', next);
    }
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={styles.content}
    >
      {listName && (
        <Text style={[styles.scope, { color: theme.colors.onSurfaceVariant }]}>
          Settings for: <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>{listName}</Text>
        </Text>
      )}

      {PLUGIN_DEFS.map((p) => (
        <View
          key={p.id}
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.surface,
              borderColor: plugins[p.id] ? theme.colors.primary + '55' : theme.colors.outline,
            },
          ]}
        >
          <View style={styles.cardInner}>
            <Text style={styles.pluginIcon}>{p.icon}</Text>
            <View style={styles.pluginInfo}>
              <Text style={[styles.pluginTitle, { color: theme.colors.onSurface }]}>{p.title}</Text>
              <Text style={[styles.pluginDesc, { color: theme.colors.onSurfaceVariant }]}>{p.desc}</Text>
            </View>
            <Switch
              value={plugins[p.id]}
              onValueChange={() => toggle(p.id)}
              color={theme.colors.primary}
            />
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16 },
  scope: { fontSize: 13, marginBottom: 16 },
  card: {
    borderRadius: 12,
    borderWidth: 1.5,
    marginBottom: 12,
    overflow: 'hidden',
  },
  cardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  pluginIcon: { fontSize: 28 },
  pluginInfo: { flex: 1 },
  pluginTitle: { fontSize: 14, fontWeight: '700', marginBottom: 3 },
  pluginDesc: { fontSize: 12, lineHeight: 17 },
});
