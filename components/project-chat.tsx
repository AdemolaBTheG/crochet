import { theme } from '@/constants/Theme';
import type { Pattern } from '@/db/schema';
import { cta, warn } from '@/services/haptics';
import { askProjectChat, askStitchFixes, type AiChatMessage } from '@/services/ai';
import { LegendList } from '@legendapp/list';
import { SymbolView } from 'expo-symbols';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Text, TextInput, View } from 'react-native';
import { EnrichedMarkdownText, type MarkdownStyle } from 'react-native-enriched-markdown';
import { KeyboardGestureArea, KeyboardStickyView } from 'react-native-keyboard-controller';
import { PressableScale } from './pressable-scale';
export type ProjectChatStep = {
  type?: 'instruction' | 'row' | 'round' | 'repeat';
  title: string;
  instruction: string;
  counterLabel?: string;
  targetCount?: number;
};

type ProjectChatMessage = {
  id: string;
  role: 'assistant' | 'user';
  text: string;
};

const assistantMarkdownStyle: MarkdownStyle = {
  paragraph: {
    fontSize: theme.size.md,
    lineHeight: theme.size.md + 7,
    color: theme.colors.textPrimary,
    marginTop: 0,
    marginBottom: theme.spacing.sm,
  },
  list: {
    fontSize: theme.size.md,
    lineHeight: theme.size.md + 7,
    color: theme.colors.textPrimary,
    bulletColor: theme.colors.primary,
    markerColor: theme.colors.primary,
    markerFontWeight: theme.weight.bold,
    gapWidth: theme.spacing.sm,
    marginLeft: theme.spacing.md,
    marginTop: 0,
    marginBottom: theme.spacing.sm,
  },
  strong: {
    color: theme.colors.textPrimary,
    fontWeight: 'bold',
  },
  em: {
    color: theme.colors.textPrimary,
    fontStyle: 'italic',
  },
  code: {
    fontSize: theme.size.sm,
    color: theme.colors.primary,
    backgroundColor: theme.colors.primarySoft,
    borderColor: theme.colors.primaryBorder,
  },
  codeBlock: {
    fontSize: theme.size.sm,
    lineHeight: theme.size.sm + 6,
    color: theme.colors.textPrimary,
    backgroundColor: theme.colors.muted,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    padding: theme.spacing.md,
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  blockquote: {
    fontSize: theme.size.md,
    lineHeight: theme.size.md + 7,
    color: theme.colors.textSecondary,
    borderColor: theme.colors.primaryBorder,
    borderWidth: 2,
    gapWidth: theme.spacing.sm,
    backgroundColor: theme.colors.primarySoft,
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  link: {
    color: theme.colors.primary,
    underline: false,
  },
};

function sanitizeAssistantMarkdown(markdown: string) {
  return markdown
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .trim();
}

function ChatMessageBubble({ item }: { item: ProjectChatMessage }) {
  const isUser = item.role === 'user';

  return (
    <View
      style={{
        maxWidth: '84%',
        alignSelf: isUser ? 'flex-end' : 'flex-start',
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        borderRadius: theme.radius.xl,
        borderCurve: 'continuous',
        backgroundColor: isUser ? theme.colors.primary : theme.colors.surface,
      }}>
      {isUser ? (
        <Text
          selectable
          style={{
            fontSize: theme.size.md,
            lineHeight: theme.size.md + 7,
            color: theme.colors.white,
          }}>
          {item.text}
        </Text>
      ) : (
        <EnrichedMarkdownText
          markdown={sanitizeAssistantMarkdown(item.text)}
          markdownStyle={assistantMarkdownStyle}
          selectable
          allowTrailingMargin={false}
          flavor="commonmark"
          md4cFlags={{ latexMath: false, underline: false }}
        />
      )}
    </View>
  );
}

export function ProjectChat({
  mode = 'project',
  pattern,
  currentStep,
  counterLabel,
  counterValue,
  bottomInset,
  contextText,
  inputPlaceholder = 'Ask about this step',
  fallbackResponseText = 'I can help with that. For this MVP, this is the chat shell wired to the current step context. Next step is connecting it to an AI route.',
}: {
  mode?: 'project' | 'stitch-fixes';
  pattern?: Pattern;
  currentStep?: ProjectChatStep | null;
  counterLabel?: string | undefined;
  counterValue?: number | null;
  bottomInset: number;
  introText?: string;
  contextText?: string;
  inputPlaceholder?: string;
  fallbackResponseText?: string;
}) {
  const { t } = useTranslation();
  const inputNativeId = 'project-step-chat-input';
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);

  const [sentMessages, setSentMessages] = useState<ProjectChatMessage[]>([]);
  const trimmedInput = inputText.trim();
  const messages = useMemo(() => {
    return [
      ...sentMessages,
      ...(isSending
        ? [
            {
              id: 'assistant-thinking',
              role: 'assistant' as const,
              text: t('chat.thinking'),
            },
          ]
        : []),
    ] satisfies ProjectChatMessage[];
  }, [isSending, sentMessages, t]);

  async function sendMessage() {
    if (!trimmedInput || isSending) return;

    cta();

    const now = Date.now();
    const userMessage: ProjectChatMessage = {
      id: `user-${now}`,
      role: 'user',
      text: trimmedInput,
    };
    const previousMessages: AiChatMessage[] = sentMessages.map((message) => ({
      role: message.role,
      content: message.text,
    }));

    setSentMessages((currentMessages) => [...currentMessages, userMessage]);
    setInputText('');
    setIsSending(true);

    try {
      const response =
        mode === 'stitch-fixes'
          ? await askStitchFixes({
              problem: userMessage.text,
              messages: previousMessages,
              contextText,
            })
          : await askProjectChat({
              question: userMessage.text,
              messages: previousMessages,
              pattern,
              currentStep,
              counterLabel,
              counterValue,
            });

      setSentMessages((currentMessages) => [
        ...currentMessages,
        {
          id: `assistant-${now}`,
          role: 'assistant',
          text: response.reply || fallbackResponseText,
        },
      ]);
    } catch (error) {
      warn();
      console.warn('AI chat request failed', error);
      setSentMessages((currentMessages) => [
        ...currentMessages,
        {
          id: `assistant-error-${now}`,
          role: 'assistant',
          text:
            error instanceof Error ? `AI helper failed: ${error.message}` : t('chat.errorFallback'),
        },
      ]);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <KeyboardGestureArea
        interpolator="ios"
        offset={60}
        textInputNativeID={inputNativeId}
        style={{
          flex: 1,
          backgroundColor: theme.colors.background,
        }}>
        <LegendList
          alignItemsAtEnd
          contentContainerStyle={{
            paddingHorizontal: theme.spacing.xl,
            paddingTop: theme.spacing.md,
            gap: theme.spacing.sm,
          }}
          data={messages}
          {...(messages.length > 0 ? { initialScrollIndex: messages.length - 1 } : null)}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          keyExtractor={(item) => item.id}
          maintainScrollAtEnd
          maintainVisibleContentPosition
          renderItem={({ item }: { item: ProjectChatMessage }) => <ChatMessageBubble item={item} />}
          showsVerticalScrollIndicator={false}
          style={{ flex: 1, backgroundColor: theme.colors.background }}
        />
      </KeyboardGestureArea>
      <KeyboardStickyView offset={{ closed: 0, opened: bottomInset }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-end',
            gap: theme.spacing.sm,
            paddingHorizontal: theme.spacing.xl,
            paddingTop: theme.spacing.sm,
            paddingBottom: bottomInset + theme.spacing.sm,
            backgroundColor: theme.colors.background,
          }}>
          <TextInput
            nativeID={inputNativeId}
            value={inputText}
            onChangeText={setInputText}
            placeholder={inputPlaceholder}
            placeholderTextColor={theme.colors.textTertiary}
            multiline
            returnKeyType="send"
            onSubmitEditing={() => {
              void sendMessage();
            }}
            style={{
              flex: 1,
              flexGrow: 1,

              paddingHorizontal: theme.spacing.md,
              paddingVertical: theme.spacing.lg,
              borderRadius: theme.radius.xl,
              borderCurve: 'continuous',
              backgroundColor: theme.colors.surface,
              color: theme.colors.textPrimary,
              fontSize: theme.size.md,
            }}
          />
          <PressableScale
            disabled={!trimmedInput || isSending}
            onPress={() => {
              void sendMessage();
            }}
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: theme.spacing.md,
              paddingHorizontal: theme.spacing.md,
              borderRadius: theme.radius.pill,
              backgroundColor:
                trimmedInput && !isSending ? theme.colors.primary : theme.colors.muted,
            }}
            accessibilityRole="button">
            {isSending ? (
              <ActivityIndicator size="small" color={theme.colors.white} />
            ) : (
              <SymbolView
                name={{ ios: 'paperplane.fill', android: 'send', web: 'send' }}
                size={20}
                tintColor={theme.colors.white}
                fallback={<View style={{ width: 20, height: 20 }} />}
              />
            )}
          </PressableScale>
        </View>
      </KeyboardStickyView>
    </View>
  );
}
