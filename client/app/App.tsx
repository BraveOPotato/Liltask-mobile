import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppProvider, useApp } from './src/context/AppContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { makePaperTheme, THEMES } from './src/theme';
import { View } from 'react-native';

function ThemedApp() {
  const app = useApp();
  const appTheme = THEMES[app.themeId] ?? THEMES['dark-violet'];
  const paperTheme = makePaperTheme(appTheme);
  return (
    <PaperProvider theme={paperTheme}>
      <StatusBar style={paperTheme.dark ? 'light' : 'dark'} />
      <View style={{ flex: 1, backgroundColor: paperTheme.colors.background }}>
        <RootNavigator />
      </View>
    </PaperProvider>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppProvider>
        <ThemedApp />
      </AppProvider>
    </GestureHandlerRootView>
  );
}
