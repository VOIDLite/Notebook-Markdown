import React from 'react';
import { StyleSheet, FlatList, View } from 'react-native';
import { Surface, Text, TouchableRipple, useTheme } from 'react-native-paper';
import { SlashCommand } from '../types';
import { SLASH_COMMANDS } from '../utils/constants';

interface FloatingSlashMenuProps {
  filterText: string;
  onSelect: (command: SlashCommand) => void;
  visible: boolean;
}

export const FloatingSlashMenu: React.FC<FloatingSlashMenuProps> = ({
  filterText,
  onSelect,
  visible,
}) => {
  const theme = useTheme();

  if (!visible) return null;

  const filteredCommands = SLASH_COMMANDS.filter(
    (cmd) =>
      cmd.key.toLowerCase().includes(filterText.toLowerCase()) ||
      cmd.label.toLowerCase().includes(filterText.toLowerCase())
  );

  if (filteredCommands.length === 0) return null;

  return (
    <Surface
      style={[
        styles.container,
        { borderColor: theme.colors.outlineVariant },
      ]}
      elevation={4}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.colors.outlineVariant }]}>
        <Text
          variant="labelSmall"
          style={[styles.headerText, { color: theme.colors.onSurfaceVariant }]}
        >
          Pintasan Markdown (Ketik untuk memfilter)
        </Text>
      </View>

      {/* Command list */}
      <FlatList
        data={filteredCommands}
        keyExtractor={(item) => item.key}
        keyboardShouldPersistTaps="handled"
        style={styles.list}
        renderItem={({ item }) => (
          <TouchableRipple
            onPress={() => onSelect(item)}
            rippleColor={theme.colors.primaryContainer + '66'}
          >
            <View style={[styles.item, { borderBottomColor: theme.colors.outlineVariant }]}>
              <View style={styles.commandRow}>
                <Text
                  variant="labelMedium"
                  style={[
                    styles.commandKey,
                    {
                      color: theme.colors.primary,
                      backgroundColor: theme.colors.primaryContainer,
                    },
                  ]}
                >
                  /{item.key}
                </Text>
                <Text
                  variant="bodyMedium"
                  style={[styles.commandLabel, { color: theme.colors.onSurface }]}
                >
                  {item.label}
                </Text>
              </View>
              <Text
                variant="bodySmall"
                style={[styles.commandDesc, { color: theme.colors.onSurfaceVariant }]}
              >
                {item.description}
              </Text>
            </View>
          </TouchableRipple>
        )}
      />
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 12, // slightly floating from bottom
    left: 12,
    right: 12,
    maxHeight: 220,
    borderRadius: 24, // OneUI 7 & M3 Expressive deep rounded corners
    borderWidth: 1,
    zIndex: 1000,
    overflow: 'hidden',
  },
  header: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  headerText: {
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  list: {
    maxHeight: 180,
  },
  item: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  commandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  commandKey: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8, // Rounded badge
    marginRight: 12,
    overflow: 'hidden',
  },
  commandLabel: {
    fontWeight: '700',
  },
  commandDesc: {
    fontStyle: 'italic',
    fontSize: 12,
  },
});
