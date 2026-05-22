import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import {
  Button,
  Dialog,
  Divider,
  IconButton,
  List,
  Portal,
  Text,
  TextInput,
  TouchableRipple,
  useTheme,
} from 'react-native-paper';
import { DrawerContentScrollView, DrawerContentComponentProps } from '@react-navigation/drawer';
import { useApp } from '../store/AppContext';
import { LIST_TEMPLATES, ListTemplate } from '../utils/types';

export function DrawerContent(props: DrawerContentComponentProps) {
  const theme = useTheme();
  const { appState, createList, deleteList, switchList } = useApp();

  const [newListVisible, setNewListVisible] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<ListTemplate | null>(null);

  const lists = Object.entries(appState.lists).filter(([, l]) => l.name !== '__placeholder__');
  const activeId = appState.activeListId;

  async function handleCreate() {
    const name = newListName.trim() || selectedTemplate?.defaultName || 'Untitled';
    if (!name) return;
    const id = await createList(name, selectedTemplate?.plugins);
    await switchList(id);
    setNewListVisible(false);
    setNewListName('');
    setSelectedTemplate(null);
  }

  function handleDeleteList(id: string, name: string) {
    if (lists.length <= 1) {
      Alert.alert("Can't delete", 'You need at least one list.');
      return;
    }
    Alert.alert(
      'Delete list?',
      `Delete "${name}"? This removes it from your device only.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteList(id),
        },
      ],
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Logo */}
      <View style={[styles.logo, { borderBottomColor: theme.colors.outline }]}>
        <Text style={[styles.logoText, { color: theme.colors.primary }]}>✦ LilTask</Text>
      </View>

      <DrawerContentScrollView {...props} scrollEnabled={false}>
        {/* Lists section */}
        <Text style={[styles.section, { color: theme.colors.onSurfaceVariant }]}>
          LISTS
        </Text>

        {lists.map(([id, list]) => {
          const active = id === activeId;
          return (
            <TouchableRipple
              key={id}
              onPress={() => {
                switchList(id);
                props.navigation.closeDrawer();
              }}
              style={[
                styles.listItem,
                active && { backgroundColor: theme.colors.primary + '22' },
              ]}
            >
              <View style={styles.listItemInner}>
                <View
                  style={[
                    styles.dot,
                    { backgroundColor: active ? theme.colors.primary : theme.colors.outline },
                  ]}
                />
                <Text
                  style={[
                    styles.listName,
                    {
                      color: active ? theme.colors.primary : theme.colors.onSurface,
                      fontWeight: active ? '600' : '400',
                    },
                  ]}
                  numberOfLines={1}
                >
                  {list.name}
                </Text>
                <IconButton
                  icon="close"
                  size={14}
                  iconColor={theme.colors.onSurfaceVariant}
                  onPress={() => handleDeleteList(id, list.name)}
                  style={{ margin: 0 }}
                />
              </View>
            </TouchableRipple>
          );
        })}

        <Button
          mode="outlined"
          onPress={() => setNewListVisible(true)}
          style={styles.newListBtn}
          icon="plus"
          compact
        >
          New list
        </Button>

        <Divider style={{ marginVertical: 12 }} />

        {/* Views */}
        <Text style={[styles.section, { color: theme.colors.onSurfaceVariant }]}>
          VIEWS
        </Text>
        <List.Item
          title="Lists"
          left={(p) => <List.Icon {...p} icon="format-list-bulleted" />}
          onPress={() => { props.navigation.navigate('index'); props.navigation.closeDrawer(); }}
          titleStyle={{ color: theme.colors.onSurface, fontSize: 14 }}
        />
        <List.Item
          title="Calendar"
          left={(p) => <List.Icon {...p} icon="calendar" />}
          onPress={() => { props.navigation.navigate('calendar'); props.navigation.closeDrawer(); }}
          titleStyle={{ color: theme.colors.onSurface, fontSize: 14 }}
        />

        <Divider style={{ marginVertical: 8 }} />

        {/* App */}
        <Text style={[styles.section, { color: theme.colors.onSurfaceVariant }]}>
          APP
        </Text>
        <List.Item
          title="Themes"
          left={(p) => <List.Icon {...p} icon="palette" />}
          onPress={() => { props.navigation.navigate('themes'); props.navigation.closeDrawer(); }}
          titleStyle={{ color: theme.colors.onSurface, fontSize: 14 }}
        />
        <List.Item
          title="Plugins"
          left={(p) => <List.Icon {...p} icon="puzzle" />}
          onPress={() => { props.navigation.navigate('plugins'); props.navigation.closeDrawer(); }}
          titleStyle={{ color: theme.colors.onSurface, fontSize: 14 }}
        />
        <List.Item
          title="Settings"
          left={(p) => <List.Icon {...p} icon="cog" />}
          onPress={() => { props.navigation.navigate('settings'); props.navigation.closeDrawer(); }}
          titleStyle={{ color: theme.colors.onSurface, fontSize: 14 }}
        />
      </DrawerContentScrollView>

      {/* New List Dialog */}
      <Portal>
        <Dialog visible={newListVisible} onDismiss={() => setNewListVisible(false)}>
          <Dialog.Title>New list</Dialog.Title>
          <Dialog.Content>
            <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 13, marginBottom: 14 }}>
              Choose a template to get started.
            </Text>
            {LIST_TEMPLATES.map((tmpl) => {
              const active = selectedTemplate?.id === tmpl.id;
              return (
                <TouchableRipple
                  key={tmpl.id}
                  onPress={() => {
                    setSelectedTemplate(tmpl);
                    if (!newListName.trim()) setNewListName(tmpl.defaultName);
                  }}
                  style={[
                    styles.templateCard,
                    {
                      borderColor: active ? theme.colors.primary : theme.colors.outline,
                      backgroundColor: active ? theme.colors.primary + '11' : theme.colors.surfaceVariant,
                    },
                  ]}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <Text style={{ fontSize: 22 }}>{tmpl.icon}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: '700', color: theme.colors.onSurface, fontSize: 13 }}>
                        {tmpl.name}
                      </Text>
                      <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 11 }}>
                        {tmpl.desc}
                      </Text>
                    </View>
                    {active && (
                      <Text style={{ color: theme.colors.primary }}>✓</Text>
                    )}
                  </View>
                </TouchableRipple>
              );
            })}
            <TextInput
              mode="outlined"
              value={newListName}
              onChangeText={setNewListName}
              placeholder="List name…"
              onSubmitEditing={handleCreate}
              returnKeyType="done"
              style={{ marginTop: 10 }}
              dense
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setNewListVisible(false)}>Cancel</Button>
            <Button mode="contained" onPress={handleCreate}>Create</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  logo: {
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  section: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  listItem: {
    paddingHorizontal: 16,
    paddingVertical: 0,
  },
  listItemInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  listName: { flex: 1, fontSize: 14 },
  newListBtn: {
    margin: 16,
    marginTop: 8,
  },
  templateCard: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    marginBottom: 8,
  },
});
