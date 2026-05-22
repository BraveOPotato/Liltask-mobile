import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { useTheme } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TodoScreen } from '../screens/TodoScreen';
import { CalendarScreen } from '../screens/CalendarScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { DrawerContent } from '../components/DrawerContent';

const Drawer = createDrawerNavigator();

export function RootNavigator() {
    const theme = useTheme();
    return (
        <SafeAreaProvider>
            <Drawer.Navigator
                drawerContent={(props) => <DrawerContent {...props} />}
                screenOptions={{
                    headerShown: false,
                    drawerStyle: {
                        backgroundColor: theme.colors.background,
                        width: 280,
                    },
                    drawerActiveTintColor: theme.colors.primary,
                    drawerInactiveTintColor: theme.colors.onSurfaceVariant,
                    drawerActiveBackgroundColor: theme.colors.primaryContainer,
                    sceneContainerStyle: {
                        backgroundColor: theme.colors.background,
                    },
                }}
            >
                <Drawer.Screen name="Lists" component={TodoScreen} />
                <Drawer.Screen name="Calendar" component={CalendarScreen} />
                <Drawer.Screen name="Settings" component={SettingsScreen} />
            </Drawer.Navigator>
        </SafeAreaProvider>
    );
}
