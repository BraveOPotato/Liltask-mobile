import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PaperProvider, Portal } from 'react-native-paper';
import { Stack } from 'expo-router';
import { StyleSheet } from 'react-native';
import { AppProvider, useApp } from '../src/store/AppContext';
import { getTheme } from '../src/theme/themes';

function ThemedStack() {
  const { appState } = useApp();
  const themeDef = getTheme(appState.themeId);
  const paperTheme = themeDef.paperTheme;

  return (
    <PaperProvider theme={paperTheme}>
      <Portal.Host>
        <StatusBar style={themeDef.dark ? 'light' : 'dark'} />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(drawer)" />
          <Stack.Screen name="+not-found" />
        </Stack>
      </Portal.Host>
    </PaperProvider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <AppProvider>
        <ThemedStack />
      </AppProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
