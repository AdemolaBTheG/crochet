import { PressableScale } from '@/components/pressable-scale';
import { Colors, theme } from '@/constants/Theme';
import { usePatternImportStore } from '@/stores/patternImportStore';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type LinkSource = 'website' | 'youtube';

function getSourceConfig(source: LinkSource) {
  if (source === 'youtube') {
    return {
      headerTitle: 'Add YouTube Link',
      title: 'YouTube Link',
      subtitle:
        'Paste a YouTube tutorial link and we will use it as the source for a draft pattern.',
      placeholder: 'https://www.youtube.com/watch?v=...',
      icon: { ios: 'play.rectangle', android: 'smart_display', web: 'smart_display' } as const,
      tintColor: '#E53935',
      buttonLabel: 'Use YouTube Link',
    };
  }

  return {
    headerTitle: 'Add Website Link',
    title: 'Website Link',
    subtitle: 'Paste a pattern page URL and we will use it as the source for a draft pattern.',
    placeholder: 'https://example.com/pattern',
    icon: { ios: 'link', android: 'link', web: 'link' } as const,
    tintColor: '#355C9A',
    buttonLabel: 'Use Website Link',
  };
}

export default function LinkScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ source?: string }>();
  const setRequest = usePatternImportStore((state) => state.setRequest);
  const source: LinkSource = params.source === 'youtube' ? 'youtube' : 'website';
  const config = useMemo(() => getSourceConfig(source), [source]);
  const [value, setValue] = useState('');
  const isDisabled = value.trim().length === 0;

  function handleSubmit() {
    if (isDisabled) return;
    setRequest(
      source === 'youtube'
        ? { source: 'youtube', url: value.trim() }
        : { source: 'website', url: value.trim() },
    );
    router.replace('/(add)/processing');
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: config.headerTitle,
          headerBackTitle: 'Back',
        }}
      />

      <KeyboardAwareScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom: insets.bottom + theme.spacing['2xl'],
          },
        ]}>
        <View style={styles.inputCard}>
          <Text selectable={false} style={styles.inputLabel}>
            Paste link
          </Text>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            placeholder={config.placeholder}
            placeholderTextColor={theme.colors.textTertiary}
            style={styles.input}
            value={value}
            onChangeText={setValue}
          />
        </View>
        <View>
          <PressableScale
            style={{
              backgroundColor: Colors.primary,
              paddingHorizontal: 20,
              paddingVertical: 18,
              borderRadius: 9999,
              alignItems: 'center',
            }}
            onPress={handleSubmit}
            disabled={isDisabled}>
            <Text style={styles.buttonText}>Create Pattern</Text>
          </PressableScale>
        </View>
      </KeyboardAwareScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: theme.spacing['2xl'],
    paddingHorizontal: theme.spacing.xl,
  },
  input: {
    color: theme.colors.textPrimary,
    fontSize: theme.size.lg,
    fontWeight: theme.weight.medium,
    paddingVertical: theme.spacing.sm,
  },
  inputCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    gap: theme.spacing.sm,
    padding: theme.spacing.lg,
  },
  inputLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.size.md,
    fontWeight: theme.weight.semibold,
  },
  buttonText: {
    color: theme.colors.white,
    fontSize: theme.size.lg,
    fontWeight: theme.weight.bold,
  },
});
