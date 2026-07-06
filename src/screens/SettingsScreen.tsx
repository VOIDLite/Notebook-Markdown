import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Text, Switch, Card, useTheme, Appbar, List } from 'react-native-paper';
import { AppSettings, saveSettings } from '../utils/storage';

interface SettingsScreenProps {
  settings: AppSettings;
  onBack: () => void;
  onUpdateSettings: (newSettings: AppSettings) => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  settings,
  onBack,
  onUpdateSettings,
}) => {
  const theme = useTheme();

  const handleToggleHold = async (value: boolean) => {
    const updated = { ...settings, holdToDelete: value };
    onUpdateSettings(updated);
    await saveSettings(updated);
  };

  const handleToggleSwipe = async (value: boolean) => {
    const updated = { ...settings, swipeToDelete: value };
    onUpdateSettings(updated);
    await saveSettings(updated);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header
        style={[styles.appbar, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.outlineVariant }]}
        statusBarHeight={0}
      >
        <Appbar.BackAction onPress={onBack} iconColor={theme.colors.onSurface} />
        <Appbar.Content
          title="Pengaturan"
          titleStyle={[styles.headerTitle, { color: theme.colors.onSurface }]}
        />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* One UI Large Section Header */}
        <View style={styles.sectionHeader}>
          <Text variant="headlineLarge" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
            Interaksi Catatan
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.outline }}>
            Kustomisasi cara Anda menghapus catatan.
          </Text>
        </View>

        {/* Floating Card for Settings (One UI Panel Style) */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]} mode="outlined">
          <Card.Content style={styles.cardContent}>
            {/* Setting Item 1: Swipe to Delete */}
            <List.Item
              title="Geser untuk Menghapus"
              description="Geser catatan ke kiri untuk menghapus secara instan."
              titleStyle={[styles.settingTitle, { color: theme.colors.onSurface }]}
              descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
              left={(props) => (
                <List.Icon {...props} icon="gesture-swipe-left" color={theme.colors.primary} />
              )}
              right={() => (
                <Switch
                  value={settings.swipeToDelete}
                  onValueChange={handleToggleSwipe}
                  color={theme.colors.primary}
                />
              )}
              style={styles.listItem}
            />

            <View style={[styles.divider, { backgroundColor: theme.colors.outlineVariant }]} />

            {/* Setting Item 2: Hold to Delete */}
            <List.Item
              title="Tekan Lama untuk Menghapus"
              description="Tahan catatan beberapa detik untuk menghapus."
              titleStyle={[styles.settingTitle, { color: theme.colors.onSurface }]}
              descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
              left={(props) => (
                <List.Icon {...props} icon="gesture-tap-hold" color={theme.colors.primary} />
              )}
              right={() => (
                <Switch
                  value={settings.holdToDelete}
                  onValueChange={handleToggleHold}
                  color={theme.colors.primary}
                />
              )}
              style={styles.listItem}
            />
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  appbar: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    elevation: 0,
  },
  headerTitle: {
    fontWeight: '800',
    fontSize: 20,
    letterSpacing: -0.3,
  },
  scrollContent: {
    padding: 16,
  },
  sectionHeader: {
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontWeight: '800',
    letterSpacing: -0.8,
  },
  card: {
    borderRadius: 24, // OneUI 7 & M3 Expressive deep rounded corners
    borderWidth: 1,
    overflow: 'hidden',
    elevation: 1,
  },
  cardContent: {
    padding: 8,
  },
  listItem: {
    paddingVertical: 12,
  },
  settingTitle: {
    fontWeight: '700',
    fontSize: 16,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 16,
  },
});
