import React from 'react';
import { StyleSheet, View, ScrollView, Text } from 'react-native';
import Markdown from '@ronradtke/react-native-markdown-display';
import { useTheme } from 'react-native-paper';

interface MarkdownPreviewProps {
  content: string;
}

export const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({ content }) => {
  const theme = useTheme();
  const colors = theme.colors;
  const isDark = theme.dark;

  const markdownRules = {
    fence: (node: any) => {
      const language = node.sourceInfo?.trim() || '';
      return (
        <View
          key={node.key}
          style={[
            codeBlockStyles.wrapper,
            {
              borderColor: colors.outlineVariant,
              backgroundColor: isDark ? '#282c34' : '#fafafa',
            },
          ]}
        >
          {language ? (
            <View style={[codeBlockStyles.langBadge, { backgroundColor: colors.primary + '22' }]}>
              <Text style={[codeBlockStyles.langText, { color: colors.primary }]}>
                {language}
              </Text>
            </View>
          ) : null}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <Text
              style={[
                codeBlockStyles.codeText,
                { color: isDark ? '#abb2bf' : '#383a42' },
              ]}
            >
              {node.content?.trim() ?? ''}
            </Text>
          </ScrollView>
        </View>
      );
    },

    code_block: (node: any) => (
      <View
        key={node.key}
        style={[
          codeBlockStyles.wrapper,
          {
            borderColor: colors.outlineVariant,
            backgroundColor: isDark ? '#282c34' : '#fafafa',
          },
        ]}
      >
        <Text
          style={[
            codeBlockStyles.codeText,
            { color: isDark ? '#abb2bf' : '#383a42' },
          ]}
        >
          {node.content?.trim() ?? ''}
        </Text>
      </View>
    ),
  };

  const mdStyles = {
    container: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: colors.background,
    },
    body: {
      color: colors.onSurface,
      fontSize: 16,
      lineHeight: 24,
    },
    // Headings
    heading1: {
      color: colors.primary,
      fontSize: 26,
      fontWeight: '700' as const,
      marginTop: 20,
      marginBottom: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.outlineVariant,
      paddingBottom: 6,
    },
    heading2: {
      color: colors.primary,
      fontSize: 20,
      fontWeight: '600' as const,
      marginTop: 18,
      marginBottom: 8,
    },
    heading3: {
      color: colors.onSurface,
      fontSize: 18,
      fontWeight: '600' as const,
      marginTop: 16,
      marginBottom: 6,
    },
    heading4: {
      color: colors.onSurface,
      fontSize: 16,
      fontWeight: '600' as const,
      marginTop: 14,
      marginBottom: 4,
    },
    heading5: {
      color: colors.onSurface,
      fontSize: 14,
      fontWeight: '600' as const,
      marginTop: 12,
      marginBottom: 4,
    },
    heading6: {
      color: colors.onSurfaceVariant,
      fontSize: 12,
      fontWeight: '600' as const,
      marginTop: 10,
      marginBottom: 4,
    },
    hr: {
      backgroundColor: colors.outlineVariant,
      height: 1.5,
      marginVertical: 16,
    },
    strong: {
      fontWeight: '700' as const,
      color: colors.onSurface,
    },
    em: {
      fontStyle: 'italic' as const,
    },
    s: {
      textDecorationLine: 'line-through' as const,
    },
    blockquote: {
      backgroundColor: colors.surfaceVariant + '33',
      borderLeftColor: colors.primary,
      borderLeftWidth: 4,
      paddingHorizontal: 12,
      paddingVertical: 8,
      marginVertical: 12,
      borderRadius: 4,
    },
    bullet_list: { marginVertical: 8 },
    ordered_list: { marginVertical: 8 },
    list_item: {
      flexDirection: 'row' as const,
      alignItems: 'flex-start' as const,
      marginVertical: 4,
      lineHeight: 22,
    },
    // Inline code tetap pakai style biasa
    code_inline: {
      fontFamily: 'monospace',
      fontSize: 14,
      color: colors.tertiary,
      backgroundColor: colors.surfaceVariant + '55',
      paddingHorizontal: 5,
      paddingVertical: 1,
      borderRadius: 4,
    },
    // fence & code_block pakai custom rules, biarkan kosong
    fence: {},
    code_block: {},
    // Tables
    table: {
      borderWidth: 1,
      borderColor: colors.outlineVariant,
      borderRadius: 8,
      marginVertical: 12,
      overflow: 'hidden' as const,
    },
    thead: { backgroundColor: colors.secondaryContainer + 'AA' },
    tbody: {},
    tr: {
      flexDirection: 'row' as const,
      borderBottomWidth: 1,
      borderBottomColor: colors.outlineVariant,
    },
    th: {
      flex: 1,
      padding: 8,
      fontWeight: '700' as const,
      color: colors.onSecondaryContainer,
      fontSize: 14,
    },
    td: {
      flex: 1,
      padding: 8,
      color: colors.onSurface,
      fontSize: 14,
    },
    link: {
      color: colors.primary,
      textDecorationLine: 'underline' as const,
      fontWeight: '500' as const,
    },
    blocklink: { color: colors.primary },
    image: {
      width: '100%',
      height: 200,
      resizeMode: 'contain' as const,
      marginVertical: 10,
      borderRadius: 8,
    },
  };

  return (
    <View style={styles.wrapper}>
      <Markdown style={mdStyles as any} rules={markdownRules as any}>
        {content}
      </Markdown>
    </View>
  );
};

const codeBlockStyles = StyleSheet.create({
  wrapper: {
    borderRadius: 10,
    borderWidth: 1,
    marginVertical: 10,
    overflow: 'hidden',
  },
  langBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    borderBottomRightRadius: 6,
  },
  langText: {
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '600',
    textTransform: 'lowercase',
  },
  codeText: {
    fontFamily: 'monospace',
    fontSize: 13,
    lineHeight: 20,
    padding: 12,
  },
});

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    width: '100%',
  },
});
