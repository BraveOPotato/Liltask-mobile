import { Drawer } from 'expo-router/drawer';
import { useTheme } from 'react-native-paper';
import { DrawerContent } from '../../src/components/DrawerContent';
import { useApp } from '../../src/store/AppContext';
import { SyncIndicator } from '../../src/components/SyncIndicator';
import { View } from 'react-native';

export default function DrawerLayout() {
  const theme = useTheme();
  const { appState, syncStatus } = useApp();
  const activeList = appState.activeListId ? appState.lists[appState.activeListId] : null;

  return (
    <Drawer
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.onSurface,
        headerShadowVisible: false,
        drawerStyle: { backgroundColor: theme.colors.background, width: 280 },
        headerRight: () => (
          <View style={{ marginRight: 16 }}>
            <SyncIndicator status={syncStatus} />
          </View>
        ),
      }}
    >
      <Drawer.Screen
        name="index"
        options={{
          title: activeList?.name || 'LilTask',
          drawerLabel: 'Lists',
        }}
      />
      <Drawer.Screen
        name="calendar"
        options={{ title: 'Calendar', drawerLabel: 'Calendar' }}
      />
      <Drawer.Screen
        name="themes"
        options={{ title: 'Themes', drawerLabel: 'Themes' }}
      />
      <Drawer.Screen
        name="plugins"
        options={{ title: 'Plugins', drawerLabel: 'Plugins' }}
      />
      <Drawer.Screen
        name="settings"
        options={{ title: 'Settings', drawerLabel: 'Settings' }}
      />
      <Drawer.Screen
        name="share"
        options={{ title: 'Share List', drawerLabel: 'Share' }}
      />
    </Drawer>
  );
}
