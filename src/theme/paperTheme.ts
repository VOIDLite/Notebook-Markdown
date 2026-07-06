import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import type { MD3Theme } from 'react-native-paper';

// One UI 7 × M3 Expressive Color Palette
// Lebih vibrant, expressive, dan dynamic
export const lightPaperTheme: MD3Theme = {
  ...MD3LightTheme,
  roundness: 6, // M3 Expressive uses higher roundness tokens
  colors: {
    ...MD3LightTheme.colors,
    // Primary — Teal yang lebih vibrant (One UI teal accent)
    primary: '#007A70',
    primaryContainer: '#9CF0E1',
    onPrimary: '#FFFFFF',
    onPrimaryContainer: '#00201C',
    // Secondary
    secondary: '#3D6B67',
    secondaryContainer: '#BFE9E4',
    onSecondary: '#FFFFFF',
    onSecondaryContainer: '#00201C',
    // Tertiary — Indigo accent (M3 Expressive vibrancy)
    tertiary: '#5458A0',
    tertiaryContainer: '#E1E0FF',
    onTertiary: '#FFFFFF',
    onTertiaryContainer: '#0B0C64',
    // Surface — One UI clean whites
    background: '#F4F7F6',
    onBackground: '#151918',
    surface: '#FFFFFF',
    onSurface: '#151918',
    surfaceVariant: '#E8F0EE',
    onSurfaceVariant: '#2E3B39',
    // Borders
    outline: '#6B7B79',
    outlineVariant: '#CAD6D3',
    // Error
    error: '#C0392B',
    onError: '#FFFFFF',
    errorContainer: '#FFDAD6',
    onErrorContainer: '#410002',
    // Elevation surfaces
    elevation: {
      level0: 'transparent',
      level1: '#EEF5F3',
      level2: '#E7F0EE',
      level3: '#E0EBE9',
      level4: '#DDEAE7',
      level5: '#D8E6E3',
    },
  },
};

export const darkPaperTheme: MD3Theme = {
  ...MD3DarkTheme,
  roundness: 6,
  colors: {
    ...MD3DarkTheme.colors,
    // Primary — Cyan-teal yang lebih bersih (One UI dark teal)
    primary: '#4DDECE',
    primaryContainer: '#00504A',
    onPrimary: '#00201C',
    onPrimaryContainer: '#9CF0E1',
    // Secondary
    secondary: '#A3CECA',
    secondaryContainer: '#243F3C',
    onSecondary: '#0A2422',
    onSecondaryContainer: '#BFE9E4',
    // Tertiary — Lavender accent
    tertiary: '#C2C3FF',
    tertiaryContainer: '#3B3E8A',
    onTertiary: '#0B0C64',
    onTertiaryContainer: '#E1E0FF',
    // Surfaces — One UI dark lebih dalam
    background: '#0F1312',
    onBackground: '#DDE4E2',
    surface: '#161C1B',
    onSurface: '#DDE4E2',
    surfaceVariant: '#1E2826',
    onSurfaceVariant: '#B0BCB9',
    // Borders
    outline: '#7A8C89',
    outlineVariant: '#2B3533',
    // Error
    error: '#FFB4AB',
    onError: '#690005',
    errorContainer: '#93000A',
    onErrorContainer: '#FFDAD6',
    elevation: {
      level0: 'transparent',
      level1: '#1A2220',
      level2: '#1D2523',
      level3: '#202826',
      level4: '#212927',
      level5: '#232B29',
    },
  },
};
