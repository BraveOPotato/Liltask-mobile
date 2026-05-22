import AsyncStorage from '@react-native-async-storage/async-storage';

export const Storage = {
    async get<T>(key: string, fallback: T): Promise<T> {
        try {
            const raw = await AsyncStorage.getItem(key);
            return raw ? JSON.parse(raw) : fallback;
        } catch { return fallback; }
    },
    async set(key: string, value: unknown) {
        await AsyncStorage.setItem(key, JSON.stringify(value));
    },
    async remove(key: string) {
        await AsyncStorage.removeItem(key);
    }
};
