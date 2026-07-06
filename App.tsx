import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, SafeAreaView, StatusBar, useColorScheme, Animated, Easing, Dimensions, Alert } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { lightPaperTheme, darkPaperTheme } from './src/theme/paperTheme';
import { Note } from './src/types';
import { getNotes, saveNote, deleteNote, getSettings, AppSettings } from './src/utils/storage';
import { Header } from './src/components/Header';
import { NoteListScreen } from './src/screens/NoteListScreen';
import { NoteEditorScreen } from './src/screens/NoteEditorScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';

export default function App() {
  const systemScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(systemScheme === 'dark');
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<AppSettings>({ holdToDelete: true, swipeToDelete: true });
  const [showSettings, setShowSettings] = useState(false);

  // States for Telegram-style circular reveal theme transition
  const [revealingTheme, setRevealingTheme] = useState(false);
  const [revealColor, setRevealColor] = useState('');
  const revealProgress = useRef(new Animated.Value(0)).current;

  const paperTheme = isDarkMode ? darkPaperTheme : lightPaperTheme;

  // Load notes and settings on mount
  useEffect(() => {
    loadNotes();
    loadSettings();
  }, []);

  const loadNotes = async () => {
    setLoading(true);
    const data = await getNotes();
    setNotes(data);
    setLoading(false);
  };

  const loadSettings = async () => {
    const data = await getSettings();
    setSettings(data);
  };

  // Telegram-style circular reveal animation handler
  const handleToggleTheme = () => {
    const nextMode = !isDarkMode;
    const nextTheme = nextMode ? darkPaperTheme : lightPaperTheme;
    setRevealColor(nextTheme.colors.background);
    setRevealingTheme(true);

    Animated.timing(revealProgress, {
      toValue: 1,
      duration: 500,
      easing: Easing.bezier(0.4, 0, 0.2, 1), // smooth cubic bezier transition
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) {
        setIsDarkMode(nextMode);
        setRevealingTheme(false);
        revealProgress.setValue(0);
      }
    });
  };

  const handleSelectNote = (id: string) => {
    setActiveNoteId(id);
  };

  const handleCreateNote = async () => {
    try {
      const newNote = await saveNote({
        title: '',
        content: '',
      });
      // Refresh list
      const updatedNotes = await getNotes();
      setNotes(updatedNotes);
      // Open the new note in editor
      setActiveNoteId(newNote.id);
    } catch (error) {
      console.error('Failed to create new note:', error);
    }
  };

  const handleSaveNote = async (id: string, title: string, content: string) => {
    try {
      const noteToSave = notes.find(n => n.id === id);
      const originalCreatedAt = noteToSave ? noteToSave.createdAt : Date.now();

      const saved = await saveNote({
        id,
        title,
        content,
        createdAt: originalCreatedAt,
      });

      // Update state in-place without full reload for maximum performance and responsiveness
      setNotes(prevNotes => {
        const index = prevNotes.findIndex(n => n.id === id);
        if (index > -1) {
          const updated = [...prevNotes];
          updated[index] = saved;
          // Sort by updatedAt descending
          return updated.sort((a, b) => b.updatedAt - a.updatedAt);
        } else {
          return [saved, ...prevNotes];
        }
      });
    } catch (error) {
      console.error('Failed to save note:', error);
    }
  };

  const handleDeleteNote = async (id: string) => {
    const updatedNotes = await deleteNote(id);
    setNotes(updatedNotes);
    if (activeNoteId === id) {
      setActiveNoteId(null);
    }
  };

  // Bulk delete selected notes
  const handleDeleteMultipleNotes = async (ids: string[]) => {
    let currentNotes = [...notes];
    for (const id of ids) {
      currentNotes = await deleteNote(id);
    }
    setNotes(currentNotes);
    if (activeNoteId && ids.includes(activeNoteId)) {
      setActiveNoteId(null);
    }
  };

  // Import notes handler
  const handleImportNotes = async (imported: { title: string; content: string }[]) => {
    try {
      for (const item of imported) {
        await saveNote({
          title: item.title,
          content: item.content,
        });
      }
      // Reload notes list
      await loadNotes();
      Alert.alert('Sukses', `${imported.length} catatan berhasil di-import.`);
    } catch (error) {
      console.error('Failed to import notes:', error);
      Alert.alert('Gagal', 'Terjadi kesalahan saat meng-import catatan.');
    }
  };

  // Export all notes handler
  const handleExportAllNotes = () => {
    if (notes.length === 0) {
      Alert.alert('Info', 'Tidak ada catatan untuk diexport.');
      return;
    }
    
    notes.forEach((note) => {
      const filename = `${note.title || 'Tanpa Judul'}.md`;
      const content = note.content || '';
      
      const element = document.createElement('a');
      element.setAttribute('href', 'data:text/markdown;charset=utf-8,' + encodeURIComponent(content));
      element.setAttribute('download', filename);
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    });

    Alert.alert('Sukses', `${notes.length} catatan berhasil di-export ke Markdown.`);
  };

  const handleBackToList = async () => {
    // Reload notes list when returning to ensure synchronization
    await loadNotes();
    setActiveNoteId(null);
  };

  const activeNote = notes.find(n => n.id === activeNoteId);

  // Calculate circle size to fully cover screen diagonally
  const { width, height } = Dimensions.get('window');
  const screenDiagonal = Math.sqrt(width * width + height * height);
  const circleSize = screenDiagonal * 2.2;

  return (
    <PaperProvider theme={paperTheme}>
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor: paperTheme.colors.surface }]}
      >
        <StatusBar
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          backgroundColor={paperTheme.colors.surface}
        />

        <View
          style={[styles.rootContainer, { backgroundColor: paperTheme.colors.background }]}
        >
          {showSettings ? (
            <SettingsScreen
              settings={settings}
              onBack={() => setShowSettings(false)}
              onUpdateSettings={setSettings}
            />
          ) : activeNoteId && activeNote ? (
            <NoteEditorScreen
              note={activeNote}
              isDarkMode={isDarkMode}
              onToggleTheme={handleToggleTheme}
              onBack={handleBackToList}
              onSave={handleSaveNote}
            />
          ) : (
            <>
              <Header
                isDarkMode={isDarkMode}
                onToggleTheme={handleToggleTheme}
                onOpenSettings={() => setShowSettings(true)}
                onImportNotes={handleImportNotes}
                onExportAllNotes={handleExportAllNotes}
              />
              <NoteListScreen
                notes={notes}
                settings={settings}
                onSelectNote={handleSelectNote}
                onCreateNote={handleCreateNote}
                onDeleteNote={handleDeleteNote}
                onDeleteMultipleNotes={handleDeleteMultipleNotes}
              />
            </>
          )}
        </View>

        {/* Telegram-style circular reveal overlay */}
        {revealingTheme && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.revealCircle,
              {
                backgroundColor: revealColor,
                width: circleSize,
                height: circleSize,
                borderRadius: circleSize / 2,
                top: -circleSize / 2 + 40, // Centered on top-right button area
                right: -circleSize / 2 + 40,
                transform: [
                  {
                    scale: revealProgress,
                  },
                ],
              },
            ]}
          />
        )}
      </SafeAreaView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    position: 'relative',
  },
  rootContainer: {
    flex: 1,
  },
  revealCircle: {
    position: 'absolute',
    zIndex: 99999, // Float on top of everything
  },
});
