import { PressableScale } from '@/components/pressable-scale';
import { Colors, theme } from '@/constants/Theme';
import { useCreatePatternFolder } from '@/hooks/use-pattern-folders';
import { tap } from '@/services/haptics';
import { ColorPicker, Host } from '@expo/ui/swift-ui';
import { Stack, router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const DEFAULT_FOLDER_COLOR = '#6F8424';

export default function CreateFolderScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const createFolder = useCreatePatternFolder();
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(DEFAULT_FOLDER_COLOR);
  const isDisabled = name.trim().length === 0 || createFolder.isPending;

  function handleColorChange(nextColor: string) {
    if (!nextColor || nextColor === selectedColor) return;
    setSelectedColor(nextColor);
  }

  async function handleSubmit() {
    if (isDisabled) return;

    try {
      await createFolder.mutateAsync({
        name: name.trim(),
        icon: 'folder.fill',
        color: selectedColor,
      });
      tap();
      router.back();
    } catch (error) {
      Alert.alert(
        t('folders.create.errorTitle'),
        error instanceof Error ? error.message : t('folders.create.errorMessage'),
      );
    }
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: t('folders.create.title'),
          headerBackTitle: t('folders.create.back'),
        }}
      />

      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
        style={{ flex: 1, backgroundColor: theme.colors.background }}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + theme.spacing['2xl'] },
        ]}>
        <View style={styles.heroIconWrap}>
          <SymbolView name="folder.fill" size={144} tintColor={selectedColor} weight="semibold" />
        </View>

        <View style={styles.section}>
          <Text selectable style={styles.sectionTitle}>
            {t('folders.create.color')}
          </Text>
          <View style={styles.colorCard}>
            {Platform.OS === 'ios' ? (
              <Host matchContents={{ vertical: true }} style={styles.colorPickerHost}>
                <ColorPicker
                  label={t('folders.create.colorLabel')}
                  selection={selectedColor}
                  supportsOpacity={false}
                  onSelectionChange={handleColorChange}
                />
              </Host>
            ) : null}
          </View>
        </View>

        <View style={styles.inputCard}>
          <Text selectable={false} style={styles.inputLabel}>
            {t('folders.create.nameLabel')}
          </Text>
          <TextInput
            autoCapitalize="words"
            autoCorrect={false}
            placeholder={t('folders.create.namePlaceholder')}
            placeholderTextColor={theme.colors.textTertiary}
            style={styles.input}
            value={name}
            onChangeText={setName}
          />
        </View>

        <View>
          <PressableScale
            style={[styles.button, isDisabled && { opacity: 0.55 }]}
            onPress={handleSubmit}
            disabled={isDisabled}>
            <Text style={styles.buttonText}>
              {createFolder.isPending ? t('folders.create.creating') : t('folders.create.submit')}
            </Text>
          </PressableScale>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: theme.spacing.xl,
    paddingHorizontal: theme.spacing.xl,
  },
  heroIconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: theme.spacing.sm,
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
  input: {
    color: theme.colors.textPrimary,
    fontSize: theme.size.lg,
    fontWeight: theme.weight.medium,
    paddingVertical: theme.spacing.sm,
  },
  section: {
    gap: theme.spacing.md,
  },
  sectionTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.size.lg,
    fontWeight: theme.weight.bold,
  },
  colorCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
  },
  colorPickerHost: {
    width: '100%',
  },
  helperText: {
    color: theme.colors.textSecondary,
    fontSize: theme.size.md,
    lineHeight: 22,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderRadius: 9999,
    alignItems: 'center',
  },
  buttonText: {
    color: theme.colors.white,
    fontSize: theme.size.lg,
    fontWeight: theme.weight.bold,
  },
});
