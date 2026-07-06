import React, { useState } from 'react';
import { StyleSheet, FlatList, View, Alert } from 'react-native';
import { Searchbar, FAB, Text, useTheme, Card, IconButton, TouchableRipple } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Note } from '../types';
import { NoteCard } from '../components/NoteCard';
import { AppSettings } from '../utils/storage';

interface NoteListScreenProps {
  notes: Note[];
  settings: AppSettings;
  onSelectNote: (id: string) => void;
  onCreateNote: () => void;
  onDeleteNote: (id: string) => void;
  onDeleteMultipleNotes?: (ids: string[]) => Promise<void>;
}

export const NoteListScreen: React.FC<NoteListScreenProps> = ({
  notes,
  settings,
  onSelectNote,
  onCreateNote,
  onDeleteNote,
  onDeleteMultipleNotes,
}) => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSelectMode, setIsSelectMode] = useState(false);

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        const next = prev.filter((item) => item !== id);
        if (next.length === 0) setIsSelectMode(false);
        return next;
      } else {
        return [...prev, id];
      }
    });
  };

  const handleLongPressCard = (id: string) => {
    if (!isSelectMode) {
      setIsSelectMode(true);
      setSelectedIds([id]);
    }
  };

  const handleCardPress = (id: string) => {
    if (isSelectMode) {
      handleToggleSelect(id);
    } else {
      onSelectNote(id);
    }
  };

  const handleCancelSelection = () => {
    setIsSelectMode(false);
    setSelectedIds([]);
  };

  // Bulk Export selected notes
  const handleBulkExport = () => {
    if (selectedIds.length === 0) return;

    selectedIds.forEach((id) => {
      const note = notes.find((n) => n.id === id);
      if (note) {
        const filename = `${note.title || 'Tanpa Judul'}.md`;
        const content = note.content || '';
        
        // HTML5 download trigger
        const element = document.createElement('a');
        element.setAttribute('href', 'data:text/markdown;charset=utf-8,' + encodeURIComponent(content));
        element.setAttribute('download', filename);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
      }
    });

    Alert.alert('Sukses', `${selectedIds.length} catatan berhasil di-export ke Markdown.`);
    handleCancelSelection();
  };

  // Bulk Delete selected notes
  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;

    Alert.alert(
      'Hapus Catatan Terpilih',
      `Apakah Anda yakin ingin menghapus ${selectedIds.length} catatan sekaligus?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            if (onDeleteMultipleNotes) {
              await onDeleteMultipleNotes(selectedIds);
              handleCancelSelection();
            }
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* One UI Large Header Title */}
      <View style={styles.oneUIHeader}>
        <View style={styles.titleRow}>
          <Text
            variant="headlineLarge"
            style={[styles.oneUITitle, { color: theme.colors.onBackground }]}
          >
            {isSelectMode ? 'Pilih Item' : 'Catatan'}
          </Text>
          {isSelectMode && (
            <IconButton
              icon="close-circle-outline"
              iconColor={theme.colors.outline}
              size={24}
              onPress={handleCancelSelection}
            />
          )}
        </View>
        <Text variant="bodyMedium" style={[styles.oneUISubtitle, { color: theme.colors.outline }]}>
          {isSelectMode 
            ? `${selectedIds.length} terpilih`
            : `${filteredNotes.length} item ${searchQuery ? 'ditemukan' : ''}`
          }
        </Text>
      </View>

      {/* Search Bar */}
      {!isSelectMode && (
        <Searchbar
          placeholder="Cari catatan..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={[styles.searchbar, { backgroundColor: theme.colors.surfaceVariant }]}
          inputStyle={{ color: theme.colors.onSurface }}
          iconColor={theme.colors.onSurfaceVariant}
          placeholderTextColor={theme.colors.outline}
          elevation={0}
        />
      )}

      {/* Note List */}
      <FlatList
        data={filteredNotes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.listContent, isSelectMode && styles.listContentSelectMode]}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <NoteCard
            note={item}
            settings={settings}
            onPress={() => handleCardPress(item.id)}
            onDelete={() => onDeleteNote(item.id)}
            onLongPress={() => handleLongPressCard(item.id)}
            isSelectMode={isSelectMode}
            isSelected={selectedIds.includes(item.id)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="notebook-remove-outline"
              size={64}
              color={theme.colors.outline}
              style={styles.emptyIcon}
            />
            <Text
              variant="bodyMedium"
              style={[styles.emptyText, { color: theme.colors.onSurface }]}
            >
              {searchQuery.length > 0
                ? 'Tidak ada catatan yang cocok dengan pencarian Anda.'
                : 'Belum ada catatan. Buatlah catatan baru!'}
            </Text>
          </View>
        }
      />

      {/* FAB - Expressive squircle design (Only visible when not in selection mode) */}
      {!isSelectMode && (
        <FAB
          icon="plus"
          style={[
            styles.fab,
            { backgroundColor: theme.colors.primaryContainer },
          ]}
          color={theme.colors.onPrimaryContainer}
          onPress={onCreateNote}
        />
      )}

      {/* Floating Bulk Action Bar (One UI 7 styled bottom floating card) */}
      {isSelectMode && (
        <Card
          style={[
            styles.bulkActionBar,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.outlineVariant,
            },
          ]}
          mode="outlined"
        >
          <View style={styles.bulkActionContent}>
            <View style={styles.bulkActionTextGroup}>
              <Text variant="titleMedium" style={{ fontWeight: '800', color: theme.colors.onSurface }}>
                Tindakan Massal
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                {selectedIds.length} item dipilih
              </Text>
            </View>

            <View style={styles.bulkActionButtons}>
              {/* Bulk Export Button */}
              <IconButton
                icon="download-outline"
                iconColor={theme.colors.primary}
                containerColor={theme.colors.primaryContainer + '55'}
                size={22}
                onPress={handleBulkExport}
                style={styles.actionBtn}
              />

              {/* Bulk Delete Button */}
              <IconButton
                icon="trash-can-outline"
                iconColor={theme.colors.error}
                containerColor={theme.colors.errorContainer + '55'}
                size={22}
                onPress={handleBulkDelete}
                style={styles.actionBtn}
              />
            </View>
          </View>
        </Card>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  oneUIHeader: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginRight: -12,
  },
  oneUITitle: {
    fontWeight: '800',
    letterSpacing: -1,
  },
  oneUISubtitle: {
    fontWeight: '600',
    marginTop: 2,
  },
  searchbar: {
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 28, // Pill shape
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 96,
  },
  listContentSelectMode: {
    paddingBottom: 110, // More bottom padding when bulk action bar is visible
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    marginBottom: 16,
    opacity: 0.8,
  },
  emptyText: {
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    borderRadius: 20, // Expressive squircle
    elevation: 3,
  },
  // Floating Bulk Action Bar styles
  bulkActionBar: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
    borderRadius: 24,
    borderWidth: 1,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  bulkActionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  bulkActionTextGroup: {
    flexDirection: 'column',
  },
  bulkActionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    margin: 0,
    borderRadius: 16,
  },
});
