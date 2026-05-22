import { useNavigation } from 'expo-router';
import { useLayoutEffect } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { TodoListScreen } from '../../src/screens/TodoListScreen';
import { useApp } from '../../src/store/AppContext';
import { router } from 'expo-router';

export default function Index() {
  const theme = useTheme();
  const { appState } = useApp();
  const navigation = useNavigation();
  const activeList = appState.activeListId ? appState.lists[appState.activeListId] : null;

  useLayoutEffect(() => {
    navigation.setOptions({
      title: activeList?.name || 'LilTask',
      headerRight: () => (
        <TouchableOpacity
          onPress={() => router.push('/(drawer)/share')}
          style={{ marginRight: 16, flexDirection: 'row', alignItems: 'center', gap: 6 }}
        >
          <Text style={{ color: theme.colors.primary, fontSize: 14, fontWeight: '600' }}>
            Share
          </Text>
        </TouchableOpacity>
      ),
    });
  }, [activeList?.name, theme.colors.primary]);

  return <TodoListScreen />;
}
