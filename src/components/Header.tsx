import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, Animated, Platform, TouchableOpacity } from 'react-native';
import {
  Text,
  useTheme,
  IconButton,
  Button,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { EditorMode } from '../types';

interface HeaderProps {
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onBack?: () => void;
  editorMode?: EditorMode;
  onChangeEditorMode?: (mode: EditorMode) => void;
  isSaving?: boolean;
  onOpenSettings?: () => void;
  onImportNotes?: (notes: { title: string; content: string }[]) => void;
  onExportAllNotes?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isDarkMode,
  onToggleTheme,
  onBack,
  editorMode,
  onChangeEditorMode,
  isSaving = false,
  onOpenSettings,
  onImportNotes,
  onExportAllNotes,
}) => {
  const theme = useTheme();
  const isEditor = !!onBack;

  const [isExtended, setIsExtended] = useState(false);
  const extendAnim = useRef(new Animated.Value(0)).current; // 0 for collapsed, 1 for extended
  const fileInputRef = useRef<any>(null);

  // Easing transition on toggle
  useEffect(() => {
    Animated.spring(extendAnim, {
      toValue: isExtended ? 1 : 0,
      useNativeDriver: false,
      friction: 8,
      tension: 60,
    }).start();
  }, [isExtended]);

  // Height interpolation
  const headerHeight = extendAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [56, 150], // Compact height for topbar actions
  });

  // Opacities transition
  const collapsedOpacity = extendAnim.interpolate({
    inputRange: [0, 0.3],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const expandedOpacity = extendAnim.interpolate({
    inputRange: [0.7, 1],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const editorModes: { value: EditorMode; icon: string; label: string }[] = [
    { value: 'edit', icon: 'pencil', label: 'Edit' },
    { value: 'split', icon: 'view-split-horizontal', label: 'Split' },
    { value: 'preview', icon: 'eye', label: 'Prev' },
  ];

  // Trigger HTML5 multiple file upload
  const handleImportPress = () => {
    if (Platform.OS === 'web') {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e: any) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const importedNotes: { title: string; content: string }[] = [];
    let loadedCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      
      reader.onload = (event: any) => {
        const text = event.target.result;
        const title = file.name.replace(/\.md$/i, '');
        importedNotes.push({ title, content: text });
        loadedCount++;

        if (loadedCount === files.length) {
          if (onImportNotes) {
            onImportNotes(importedNotes);
          }
          e.target.value = ''; // Reset input
        }
      };
      
      reader.readAsText(file);
    }
  };

  return (
    <View style={[styles.headerWrapper, { backgroundColor: theme.colors.background }]}>
      {/* Hidden input file tag for Web import */}
      {Platform.OS === 'web' && (
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          multiple
          accept=".md"
          onChange={handleFileChange}
        />
      )}

      <Animated.View
        style={[
          styles.container,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.outlineVariant,
            height: headerHeight,
          },
        ]}
      >
        {/* TOP ROW (Always visible structure) */}
        <View style={styles.topRow}>
          {/* Left Area: Clickable Logo to toggle extension when in list mode */}
          {isEditor && onBack ? (
            <View style={[styles.circleBtn, { backgroundColor: theme.colors.surfaceVariant }]}>
              <IconButton
                icon="arrow-left"
                iconColor={theme.colors.onSurface}
                size={18}
                onPress={onBack}
                style={styles.circleBtnInner}
              />
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => setIsExtended(!isExtended)}
              activeOpacity={0.7}
              style={styles.logoArea}
            >
              <View style={[styles.logoBadge, { backgroundColor: theme.colors.primaryContainer }]}>
                <MaterialCommunityIcons
                  name="notebook-edit-outline"
                  size={18}
                  color={theme.colors.primary}
                />
              </View>
              <Text variant="titleMedium" style={[styles.appTitle, { color: theme.colors.onSurface }]}>
                Notebook MD
              </Text>
              <MaterialCommunityIcons
                name={isExtended ? "chevron-up" : "chevron-down"}
                size={16}
                color={theme.colors.outline}
                style={{ marginLeft: 2 }}
              />
            </TouchableOpacity>
          )}

          <View style={styles.spacer} />

          {/* Right Area: Main Settings and Theme Toggles */}
          <View style={styles.actionsRow}>
            {isEditor && editorMode && onChangeEditorMode && (
              <View style={[styles.modeContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
                {editorModes.map((m) => {
                  const active = editorMode === m.value;
                  return (
                    <IconButton
                      key={m.value}
                      icon={m.icon}
                      size={16}
                      iconColor={active ? theme.colors.onPrimary : theme.colors.onSurfaceVariant}
                      onPress={() => onChangeEditorMode(m.value)}
                      style={[
                        styles.modeBtn,
                        active && {
                          backgroundColor: theme.colors.primary,
                        },
                      ]}
                    />
                  );
                })}
              </View>
            )}

            {isEditor && isSaving && (
              <Text variant="labelSmall" style={[styles.savingText, { color: theme.colors.outline }]}>
                Saving...
              </Text>
            )}

            {!isEditor && onOpenSettings && (
              <View style={[styles.circleBtn, { backgroundColor: theme.colors.surfaceVariant }]}>
                <IconButton
                  icon="cog-outline"
                  iconColor={theme.colors.onSurfaceVariant}
                  size={18}
                  onPress={onOpenSettings}
                  style={styles.circleBtnInner}
                />
              </View>
            )}

            <View style={[styles.circleBtn, { backgroundColor: theme.colors.surfaceVariant }]}>
              <IconButton
                icon={isDarkMode ? 'weather-sunny' : 'moon-waning-crescent'}
                iconColor={theme.colors.onSurfaceVariant}
                size={18}
                onPress={onToggleTheme}
                style={styles.circleBtnInner}
              />
            </View>
          </View>
        </View>

        {/* BOTTOM AREA (Extended content visible only when toggled) */}
        {isExtended && !isEditor && (
          <Animated.View style={[styles.extendedContent, { opacity: expandedOpacity }]}>
            <View style={styles.actionButtonsContainer}>
              <Button
                mode="contained-tonal"
                icon="upload"
                onPress={handleImportPress}
                style={[styles.actionBtn, { borderColor: theme.colors.outlineVariant }]}
                labelStyle={[styles.actionBtnLabel, { color: theme.colors.primary }]}
              >
                Import MD (.md)
              </Button>
              
              {onExportAllNotes && (
                <Button
                  mode="contained-tonal"
                  icon="download"
                  onPress={onExportAllNotes}
                  style={[styles.actionBtn, { borderColor: theme.colors.outlineVariant }]}
                  labelStyle={[styles.actionBtnLabel, { color: theme.colors.primary }]}
                >
                  Export Semua
                </Button>
              )}
            </View>
          </Animated.View>
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerWrapper: {
    paddingTop: Platform.OS === 'ios' ? 12 : 16,
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  container: {
    borderRadius: 28, // Fully rounded pill shape
    borderWidth: 1,
    paddingHorizontal: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    overflow: 'hidden',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 54,
  },
  logoArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appTitle: {
    fontWeight: '800',
    letterSpacing: -0.3,
    fontSize: 16,
  },
  spacer: {
    flex: 1,
  },
  modeContainer: {
    flexDirection: 'row',
    borderRadius: 20,
    padding: 2,
    alignItems: 'center',
    marginRight: 8,
  },
  modeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    margin: 0,
    padding: 0,
  },
  savingText: {
    fontStyle: 'italic',
    marginRight: 8,
    fontSize: 10,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  circleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  circleBtnInner: {
    margin: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  // Extended Mode Bottom Panel
  extendedContent: {
    paddingHorizontal: 8,
    paddingBottom: 14,
    justifyContent: 'center',
  },
  // Action Buttons inside Extended Panel
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
  },
  actionBtnLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
});
