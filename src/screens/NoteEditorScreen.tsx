import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Text, useTheme, Button } from 'react-native-paper';
import { Note, EditorMode, SlashCommand } from '../types';
import { Header } from '../components/Header';
import { MarkdownPreview } from '../components/MarkdownPreview';
import { FloatingSlashMenu } from '../components/FloatingSlashMenu';

interface NoteEditorScreenProps {
  note: Note;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onBack: () => void;
  onSave: (id: string, title: string, content: string) => Promise<void>;
}

export const NoteEditorScreen: React.FC<NoteEditorScreenProps> = ({
  note,
  isDarkMode,
  onToggleTheme,
  onBack,
  onSave,
}) => {
  const theme = useTheme();

  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [editorMode, setEditorMode] = useState<EditorMode>('split');
  const [isSaving, setIsSaving] = useState(false);

  // Slash Command States
  const [slashMenuVisible, setSlashMenuVisible] = useState(false);
  const [slashFilter, setSlashFilter] = useState('');
  const [slashStartIndex, setSlashStartIndex] = useState(-1);
  const [selection, setSelection] = useState<{ start: number; end: number } | undefined>(undefined);

  // Refs for tracking values without causing re-renders
  const contentRef = useRef(content);
  const currentSelectionRef = useRef({ start: 0, end: 0 });
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const contentInputRef = useRef<TextInput>(null);

  // Sync ref with state
  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  // Clean up timer on unmount and perform final save
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const triggerAutoSave = (updatedTitle: string, updatedContent: string) => {
    setIsSaving(true);
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await onSave(note.id, updatedTitle, updatedContent);
      } catch (err) {
        console.error('Auto save error:', err);
      } finally {
        setIsSaving(false);
      }
    }, 1000); // 1-second debounce
  };

  const handleTitleChange = (text: string) => {
    setTitle(text);
    triggerAutoSave(text, content);
  };

  const handleContentChange = (text: string) => {
    setContent(text);
    triggerAutoSave(title, text);
  };

  const handleSelectionChange = (e: any) => {
    const sel = e.nativeEvent.selection;
    currentSelectionRef.current = sel;

    // Release control of the selection state if it was programmatically forced
    if (selection) {
      setSelection(undefined);
    }

    const text = contentRef.current;
    const cursorIndex = sel.start;

    // Check for slash menu trigger
    const textBeforeCursor = text.substring(0, cursorIndex);
    const lastSlashIndex = textBeforeCursor.lastIndexOf('/');

    if (lastSlashIndex !== -1) {
      const segment = textBeforeCursor.substring(lastSlashIndex);
      const hasSpace = /\s/.test(segment);
      const isPrecededByWhitespace =
        lastSlashIndex === 0 || /\s/.test(textBeforeCursor.charAt(lastSlashIndex - 1));

      if (!hasSpace && isPrecededByWhitespace) {
        setSlashMenuVisible(true);
        setSlashFilter(segment.substring(1));
        setSlashStartIndex(lastSlashIndex);
        return;
      }
    }
    setSlashMenuVisible(false);
  };

  const handleSelectCommand = (command: SlashCommand) => {
    const text = content;
    const cursorIndex = currentSelectionRef.current.start;
    const beforeSlash = text.substring(0, slashStartIndex);
    const afterSlash = text.substring(cursorIndex);

    const newContent = beforeSlash + command.insertText + afterSlash;
    setContent(newContent);
    triggerAutoSave(title, newContent);

    // Calculate new cursor offset
    const newCursorPos = slashStartIndex + command.insertText.length - (command.cursorOffset || 0);

    // Enforce selection
    setSelection({ start: newCursorPos, end: newCursorPos });
    setSlashMenuVisible(false);

    // Re-focus text input
    setTimeout(() => {
      contentInputRef.current?.focus();
    }, 50);
  };

  const handleBack = async () => {
    // If saving is pending, save immediately
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      await onSave(note.id, title, content);
    }
    onBack();
  };

  // Helper formatting application
  const applyFormatting = (prefix: string, suffix: string = '') => {
    const text = content;
    const start = currentSelectionRef.current.start;
    const end = currentSelectionRef.current.end;

    const before = text.substring(0, start);
    const selected = text.substring(start, end);
    const after = text.substring(end);

    const newContent = before + prefix + selected + suffix + after;
    setContent(newContent);
    triggerAutoSave(title, newContent);

    const newCursorPos = start + prefix.length + selected.length + suffix.length;
    setSelection({ start: newCursorPos, end: newCursorPos });

    setTimeout(() => {
      contentInputRef.current?.focus();
    }, 50);
  };

  // Web keyboard shortcuts (Hotkeys)
  const handleKeyPress = (e: any) => {
    const nativeEvent = e.nativeEvent;
    const ctrlKey = nativeEvent.ctrlKey || nativeEvent.metaKey;
    const key = nativeEvent.key?.toLowerCase();

    if (ctrlKey) {
      if (key === 'b') {
        e.preventDefault?.();
        applyFormatting('**', '**');
      } else if (key === 'i') {
        e.preventDefault?.();
        applyFormatting('*', '*');
      } else if (key === 'k') {
        e.preventDefault?.();
        applyFormatting('[', '](https://)');
      } else if (key === 's') {
        e.preventDefault?.();
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }
        setIsSaving(true);
        onSave(note.id, title, content).then(() => {
          setIsSaving(false);
        });
      } else if (key === 'd') {
        e.preventDefault?.();
        const dateStr = new Date().toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        applyFormatting(dateStr, '');
      }
    }
  };

  const helperTools = [
    { label: 'Tebal', icon: 'format-bold', prefix: '**', suffix: '**' },
    { label: 'Miring', icon: 'format-italic', prefix: '*', suffix: '*' },
    { label: 'Coret', icon: 'format-strikethrough', prefix: '~~', suffix: '~~' },
    { label: 'H1', icon: 'format-header-1', prefix: '# ', suffix: '' },
    { label: 'H2', icon: 'format-header-2', prefix: '## ', suffix: '' },
    { label: 'Kutipan', icon: 'format-quote-close', prefix: '> ', suffix: '' },
    { label: 'Kode', icon: 'xml', prefix: '\n```\n', suffix: '\n```\n' },
    { label: 'Bulat', icon: 'format-list-bulleted', prefix: '- ', suffix: '' },
    { label: 'Tugas', icon: 'format-list-checks', prefix: '- [ ] ', suffix: '' },
    { label: 'Link', icon: 'link', prefix: '[', suffix: '](https://)' },
    {
      label: 'Waktu',
      icon: 'calendar-clock',
      prefix: new Date().toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
      suffix: ''
    },
  ];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Header
        isDarkMode={isDarkMode}
        onToggleTheme={onToggleTheme}
        onBack={handleBack}
        editorMode={editorMode}
        onChangeEditorMode={setEditorMode}
        isSaving={isSaving}
      />

      <View style={styles.workspace}>
        {editorMode === 'edit' && (
          <View style={[styles.cardWrapper, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]}>
            <ScrollView
              contentContainerStyle={styles.editorOnlyScroll}
              keyboardShouldPersistTaps="handled"
            >
              <TextInput
                value={title}
                onChangeText={handleTitleChange}
                placeholder="Judul Catatan"
                placeholderTextColor={theme.colors.outline}
                style={[styles.titleInput, { color: theme.colors.onSurface, borderBottomColor: theme.colors.outlineVariant }]}
              />
              <TextInput
                ref={contentInputRef}
                value={content}
                onChangeText={handleContentChange}
                onSelectionChange={handleSelectionChange}
                selection={selection}
                onKeyPress={handleKeyPress}
                placeholder="Mulai menulis Markdown... Ketik '/' untuk pintasan."
                placeholderTextColor={theme.colors.outline}
                multiline
                textAlignVertical="top"
                style={[styles.contentInput, { color: theme.colors.onSurface }]}
              />
            </ScrollView>
          </View>
        )}

        {editorMode === 'preview' && (
          <View style={[styles.cardWrapper, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]}>
            <ScrollView contentContainerStyle={styles.previewOnlyScroll}>
              <Text
                variant="headlineMedium"
                style={[styles.previewTitle, { color: theme.colors.onSurface, borderBottomColor: theme.colors.outlineVariant }]}
              >
                {title || 'Tanpa Judul'}
              </Text>
              <MarkdownPreview content={content} />
            </ScrollView>
          </View>
        )}

        {editorMode === 'split' && (
          <View style={styles.splitWrapper}>
            {/* Top Half: Preview Panel */}
            <View style={[styles.splitCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant, marginBottom: 8 }]}>
              <ScrollView contentContainerStyle={styles.splitScrollPadding}>
                <Text
                  variant="titleMedium"
                  style={[styles.previewTitleSmall, { color: theme.colors.onSurface, borderBottomColor: theme.colors.outlineVariant }]}
                >
                  {title || 'Tanpa Judul'}
                </Text>
                <MarkdownPreview content={content} />
              </ScrollView>
            </View>

            {/* Bottom Half: Editor Panel */}
            <View style={[styles.splitCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]}>
              <View style={[styles.splitTitleBar, { borderBottomColor: theme.colors.outlineVariant }]}>
                <TextInput
                  value={title}
                  onChangeText={handleTitleChange}
                  placeholder="Judul Catatan"
                  placeholderTextColor={theme.colors.outline}
                  style={[styles.splitTitleInput, { color: theme.colors.onSurface }]}
                />
              </View>
              <TextInput
                ref={contentInputRef}
                value={content}
                onChangeText={handleContentChange}
                onSelectionChange={handleSelectionChange}
                selection={selection}
                onKeyPress={handleKeyPress}
                placeholder="Tulis kode Markdown..."
                placeholderTextColor={theme.colors.outline}
                multiline
                textAlignVertical="top"
                style={[styles.splitContentInput, { color: theme.colors.onSurface }]}
              />
            </View>
          </View>
        )}

        {/* Floating Slash Autocomplete Menu */}
        <FloatingSlashMenu
          filterText={slashFilter}
          onSelect={handleSelectCommand}
          visible={slashMenuVisible}
        />
      </View>

      {/* Helper Bar (Formatting Toolbar above keyboard) */}
      {(editorMode === 'edit' || editorMode === 'split') && (
        <View
          style={[
            styles.helperBar,
            {
              backgroundColor: theme.colors.surface,
              borderTopColor: theme.colors.outlineVariant,
            },
          ]}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.helperScrollContent}
          >
            {helperTools.map((tool, idx) => (
              <Button
                key={idx}
                mode="text"
                compact
                icon={tool.icon}
                onPress={() => applyFormatting(tool.prefix, tool.suffix)}
                style={styles.helperBtn}
                labelStyle={{ fontSize: 12, fontWeight: '700', color: theme.colors.primary }}
              >
                {tool.label}
              </Button>
            ))}
          </ScrollView>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  workspace: {
    flex: 1,
    position: 'relative', // Necessary for absolute positioning of FloatingSlashMenu
  },
  cardWrapper: {
    flex: 1,
    margin: 16,
    borderRadius: 24, // OneUI 7 & M3 Expressive deep rounded corners
    borderWidth: 1,
    overflow: 'hidden',
    elevation: 2,
  },
  splitCard: {
    flex: 1,
    borderRadius: 24, // OneUI 7 & M3 Expressive deep rounded corners
    borderWidth: 1,
    overflow: 'hidden',
    elevation: 2,
  },
  // Edit Mode Styles
  editorOnlyScroll: {
    padding: 20,
    flexGrow: 1,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: '800',
    paddingVertical: 12,
    borderBottomWidth: 1,
    marginBottom: 20,
  },
  contentInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    lineHeight: 22,
    paddingBottom: 40,
    minHeight: 300,
  },
  // Preview Mode Styles
  previewOnlyScroll: {
    paddingVertical: 20,
    flexGrow: 1,
  },
  previewTitle: {
    fontWeight: '800',
    marginHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    marginBottom: 16,
    fontSize: 26,
    letterSpacing: -0.5,
  },
  // Split Mode Styles
  splitWrapper: {
    flex: 1,
    padding: 12,
    gap: 4,
  },
  splitScrollPadding: {
    paddingVertical: 12,
  },
  previewTitleSmall: {
    fontWeight: '800',
    marginHorizontal: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    marginBottom: 8,
    fontSize: 18,
    letterSpacing: -0.3,
  },
  splitTitleBar: {
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  splitTitleInput: {
    fontSize: 15,
    fontWeight: '800',
    paddingVertical: 2,
    letterSpacing: -0.2,
  },
  splitContentInput: {
    flex: 1,
    fontSize: 13.5,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    lineHeight: 18,
    padding: 16,
  },
  // Helper Bar formatting toolbar styles
  helperBar: {
    height: 48,
    borderTopWidth: 1,
    elevation: 4,
  },
  helperScrollContent: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  helperBtn: {
    marginHorizontal: 4,
  },
});
