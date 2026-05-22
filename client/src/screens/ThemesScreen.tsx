import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useApp } from '../store/AppContext';
import { THEMES } from '../theme/themes';

export function ThemesScreen() {
  const theme = useTheme();
  const { appState, setTheme } = useApp();
  const activeId = appState.themeId;

  const darkThemes = THEMES.filter((t) => t.dark);
  const lightThemes = THEMES.filter((t) => !t.dark);

  function renderThemeCard(t: (typeof THEMES)[0]) {
    const active = t.id === activeId;
    const [bg, a1, a2] = t.swatch;
    return (
      <TouchableOpacity
        key={t.id}
        onPress={() => setTheme(t.id)}
        style={[
          styles.card,
          {
            borderColor: active ? theme.colors.primary : theme.colors.outline,
            backgroundColor: active ? theme.colors.primary + '11' : theme.colors.surfaceVariant,
          },
        ]}
      >
        {/* Preview */}
        <View style={[styles.preview, { backgroundColor: bg, borderColor: theme.colors.outline + '44' }]}>
          <View style={[styles.swatch1, { backgroundColor: a1 }]} />
          <View style={[styles.swatch2, { backgroundColor: a2 }]} />
        </View>
        <Text style={[styles.label, { color: theme.colors.onSurface }]}>{t.label}</Text>
        {active && (
          <Text style={[styles.activeLabel, { color: theme.colors.primary }]}>✓ active</Text>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.sectionHeader, { color: theme.colors.onSurfaceVariant }]}>
        🌙 Dark
      </Text>
      <View style={styles.grid}>{darkThemes.map(renderThemeCard)}</View>

      <Text style={[styles.sectionHeader, { color: theme.colors.onSurfaceVariant }]}>
        ☀️ Light
      </Text>
      <View style={styles.grid}>{lightThemes.map(renderThemeCard)}</View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16 },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 10,
    marginTop: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 8,
  },
  card: {
    width: '47%',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  preview: {
    height: 40,
    borderRadius: 6,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 8,
  },
  swatch1: { width: 14, height: 14, borderRadius: 7 },
  swatch2: { width: 10, height: 10, borderRadius: 5 },
  label: { fontSize: 13, fontWeight: '600' },
  activeLabel: { fontSize: 11, marginTop: 2 },
});
