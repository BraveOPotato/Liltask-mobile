import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface Props {
    active: 'lists' | 'calendar';
    navigation: any;
}

export function BottomNav({ active, navigation }: Props) {
    const theme = useTheme();
    const insets = useSafeAreaInsets();

    const tabs = [
        { key: 'lists',    label: 'Lists',    icon: 'format-list-bulleted', screen: 'Lists' },
        { key: 'calendar', label: 'Calendar', icon: 'calendar-month',       screen: 'Calendar' },
    ] as const;

    return (
        <View style={[
            styles.container,
            {
                backgroundColor: theme.colors.surface,
                borderTopColor: theme.colors.outline,
                paddingBottom: insets.bottom > 0 ? insets.bottom : 16,
            }
        ]}>
            {tabs.map(tab => {
                const isActive = active === tab.key;
                const color = isActive ? theme.colors.primary : theme.colors.onSurfaceVariant;
                return (
                    <TouchableOpacity
                        key={tab.key}
                        style={styles.tab}
                        onPress={() => navigation.navigate(tab.screen)}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.pill, isActive && { backgroundColor: theme.colors.primaryContainer }]}>
                            <MaterialCommunityIcons name={tab.icon as any} size={22} color={color} />
                        </View>
                        <Text variant="labelSmall" style={{ color, marginTop: 3 }}>{tab.label}</Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        borderTopWidth: StyleSheet.hairlineWidth,
        paddingTop: 8,
    },
    tab: {
        flex: 1,
        alignItems: 'center',
    },
    pill: {
        paddingHorizontal: 20,
        paddingVertical: 4,
        borderRadius: 16,
    },
});
