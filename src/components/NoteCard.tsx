import React, { useRef, useEffect } from 'react';
import { StyleSheet, View, Alert, Animated, PanResponder, Dimensions } from 'react-native';
import { Card, Text, IconButton, useTheme } from 'react-native-paper';
import { Note } from '../types';
import { AppSettings } from '../utils/storage';

interface NoteCardProps {
  note: Note;
  settings: AppSettings;
  onPress: () => void;
  onDelete: () => void;
  onLongPress?: () => void;
  isSelectMode?: boolean;
  isSelected?: boolean;
}

export const NoteCard: React.FC<NoteCardProps> = ({
  note,
  settings,
  onPress,
  onDelete,
  onLongPress,
  isSelectMode = false,
  isSelected = false,
}) => {
  const theme = useTheme();
  const pan = useRef(new Animated.ValueXY()).current;

  // Reset pan position if selection mode starts/ends
  useEffect(() => {
    Animated.spring(pan, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: false,
    }).start();
  }, [isSelectMode]);

  const formatDate = (timestamp: number) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return '';
    }
  };

  const getSnippet = (text: string) => {
    if (!text) return 'Catatan kosong';

    let cleanText = text
      .replace(/^#+\s+/gm, '')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      .replace(/!\[(.*?)\]\(.*?\)/g, '$1')
      .replace(/[\*_`~]/g, '')
      .replace(/\n+/g, ' ')
      .trim();

    if (cleanText.length > 70) {
      return cleanText.substring(0, 70) + '...';
    }
    return cleanText || 'Catatan kosong';
  };

  const handleDeletePress = () => {
    Alert.alert(
      'Hapus Catatan',
      `Apakah Anda yakin ingin menghapus catatan "${note.title || 'Tanpa Judul'}"?`,
      [
        {
          text: 'Batal',
          style: 'cancel',
          onPress: () => {
            Animated.spring(pan, {
              toValue: { x: 0, y: 0 },
              useNativeDriver: false,
            }).start();
          }
        },
        { text: 'Hapus', style: 'destructive', onPress: onDelete },
      ]
    );
  };

  // PanResponder to handle Swipe to Delete (Disabled during selection mode)
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        if (!settings.swipeToDelete || isSelectMode) return false;
        return Math.abs(gestureState.dx) > 15 && Math.abs(gestureState.dy) < 8;
      },
      onPanResponderMove: (evt, gestureState) => {
        if (gestureState.dx < 0) {
          pan.setValue({ x: gestureState.dx, y: 0 });
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx < -120) {
          Animated.timing(pan, {
            toValue: { x: -Dimensions.get('window').width, y: 0 },
            duration: 180,
            useNativeDriver: false,
          }).start(() => {
            handleDeletePress();
          });
        } else {
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }).start();
        }
      },
      onPanResponderTerminate: () => {
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
        }).start();
      }
    })
  ).current;

  return (
    <View style={styles.cardContainer}>
      {/* Background delete indicator behind the sliding card */}
      {settings.swipeToDelete && !isSelectMode && (
        <View style={[styles.deleteBackground, { backgroundColor: theme.colors.errorContainer }]}>
          <IconButton
            icon="trash-can-outline"
            iconColor={theme.colors.error}
            size={24}
            style={styles.bgDeleteIcon}
          />
        </View>
      )}

      <Animated.View
        style={{
          transform: [{ translateX: pan.x }],
        }}
        {...panResponder.panHandlers}
      >
        <Card
          style={[
            styles.card, 
            { backgroundColor: theme.colors.surface },
            isSelected && { borderColor: theme.colors.primary, borderWidth: 2 }
          ]}
          mode="outlined"
          onPress={onPress}
          onLongPress={isSelectMode ? undefined : (onLongPress || (settings.holdToDelete ? handleDeletePress : undefined))}
          delayLongPress={600}
        >
          <Card.Content style={styles.cardContent}>
            {/* Title row */}
            <View style={styles.titleRow}>
              <Text
                variant="titleMedium"
                numberOfLines={1}
                style={[styles.title, { color: theme.colors.onSurface }]}
              >
                {note.title || 'Tanpa Judul'}
              </Text>

              {isSelectMode ? (
                /* One UI 7 style Checkbox Indicator */
                <IconButton
                  icon={isSelected ? "check-circle" : "circle-outline"}
                  iconColor={isSelected ? theme.colors.primary : theme.colors.outline}
                  size={20}
                  style={styles.selectCheckbox}
                />
              ) : (
                <IconButton
                  icon="trash-can-outline"
                  iconColor={theme.colors.error}
                  containerColor={theme.colors.errorContainer + '44'}
                  size={18}
                  onPress={handleDeletePress}
                  style={styles.deleteButton}
                />
              )}
            </View>

            {/* Snippet */}
            <Text
              variant="bodyMedium"
              numberOfLines={2}
              style={[styles.snippet, { color: theme.colors.onSurfaceVariant }]}
            >
              {getSnippet(note.content)}
            </Text>

            {/* Footer date */}
            <View style={styles.footer}>
              <IconButton
                icon="calendar-edit"
                size={14}
                iconColor={theme.colors.outline}
                style={styles.footerIcon}
              />
              <Text variant="labelSmall" style={{ color: theme.colors.outline, fontWeight: '600' }}>
                {formatDate(note.updatedAt)}
              </Text>
            </View>
          </Card.Content>
        </Card>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    position: 'relative',
    marginBottom: 12,
    borderRadius: 24,
    overflow: 'hidden',
  },
  deleteBackground: {
    ...StyleSheet.absoluteFill,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 20,
    borderRadius: 24,
  },
  bgDeleteIcon: {
    margin: 0,
  },
  card: {
    borderRadius: 24, // OneUI 7 & M3 Expressive deep rounded corners
    borderWidth: 1,
    elevation: 1,
  },
  cardContent: {
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    flex: 1,
    fontWeight: '800',
    fontSize: 18,
    letterSpacing: -0.3,
  },
  deleteButton: {
    margin: 0,
    borderRadius: 12,
  },
  selectCheckbox: {
    margin: 0,
  },
  snippet: {
    lineHeight: 20,
    marginBottom: 12,
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  footerIcon: {
    margin: 0,
    marginRight: 4,
    padding: 0,
    width: 16,
    height: 16,
  },
});
