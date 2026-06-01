import { PressableScale } from '@/components/pressable-scale';
import { theme } from '@/constants/Theme';
import { cta, tap } from '@/services/haptics';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { Host, Picker } from '@expo/ui';
import { router, useLocalSearchParams } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const YEARLY_PROJECT_OPTIONS = [2, 4, 6, 8, 12, 18, 24] as const;
const DEFAULT_YEARLY_PROJECT_GOAL = 8;

function getYearlyGoalCopy(
  value: number,
  t: (key: string, options?: Record<string, unknown>) => string,
) {
  if (value === 12) {
    return t('onboarding.yearlyGoal.helperMonthly');
  }

  if (value < 12) {
    return t('onboarding.yearlyGoal.helperSteady', { count: value });
  }

  return t('onboarding.yearlyGoal.helperAmbitious', { count: value });
}

export default function YearlyGoalScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { yearlyProjectGoal, setYearlyProjectGoal, setOnboardingCompleted } = useOnboardingStore();
  const params = useLocalSearchParams<{ mode?: string; returnTo?: string }>();
  const isEditMode = params.mode === 'edit';
  const returnTo = typeof params.returnTo === 'string' ? params.returnTo : '/goal';

  const initialGoal = useMemo(
    () =>
      YEARLY_PROJECT_OPTIONS.find((value) => value === yearlyProjectGoal) ??
      DEFAULT_YEARLY_PROJECT_GOAL,
    [yearlyProjectGoal],
  );
  const [selectedGoal, setSelectedGoal] = useState<number>(initialGoal);

  function handleChange(value: number) {
    tap();
    setSelectedGoal(value);
  }

  function handleContinue() {
    setYearlyProjectGoal(selectedGoal);
    cta();
    if (isEditMode) {
      router.replace(returnTo as '/goal');
      return;
    }
    setOnboardingCompleted(true);
    router.replace('/(onboarding)/loader');
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{
          paddingHorizontal: theme.spacing.lg,
          paddingBottom: insets.bottom,
          gap: theme.spacing.xl,
        }}>
        <Animated.View entering={FadeInDown.duration(220)} style={styles.progressWrap}>
          {!isEditMode ? (
            <>
              <Text selectable={false} style={styles.progressLabel}>
                {t('onboarding.yearlyGoal.stepOf', { current: 5, total: 5 })}
              </Text>
              <View style={styles.progressTrack}>
                <View style={styles.progressFill} />
              </View>
            </>
          ) : null}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(50).duration(220)} style={styles.hero}>
          <View style={styles.badge}>
            <SymbolView
              name={{ ios: 'calendar.badge.clock', android: 'event_repeat', web: 'event_repeat' }}
              size={22}
              weight="semibold"
              tintColor={theme.colors.primary}
              fallback={<View style={styles.badgeFallback} />}
            />
          </View>

          <View style={styles.heroTextWrap}>
            <Text selectable style={styles.title}>
              {t('onboarding.yearlyGoal.title')}
            </Text>
            <Text selectable style={styles.subtitle}>
              {t('onboarding.yearlyGoal.subtitle')}
            </Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(100).duration(220)} style={styles.goalSection}>
          <Text selectable style={styles.cardEyebrow}>
            {t('onboarding.yearlyGoal.eyebrow')}
          </Text>

          <Text selectable style={styles.selectedGoalLabel}>
            {t('onboarding.yearlyGoal.selectedValue', { count: selectedGoal })}
          </Text>

          <Text selectable style={styles.helperText}>
            {getYearlyGoalCopy(selectedGoal, t)}
          </Text>

          <View style={styles.pickerWrap}>
            <Host style={styles.pickerHost}>
              <Picker<number>
                selectedValue={selectedGoal}
                onValueChange={handleChange}
                appearance="wheel">
                {YEARLY_PROJECT_OPTIONS.map((value) => (
                  <Picker.Item
                    key={value}
                    label={t('onboarding.yearlyGoal.optionLabel', { count: value })}
                    value={value}
                  />
                ))}
              </Picker>
            </Host>
          </View>
        </Animated.View>
      </ScrollView>

      <View
        pointerEvents="box-none"
        style={[
          styles.footer,
          {
            paddingHorizontal: theme.spacing.lg,
            paddingBottom: insets.bottom + theme.spacing.md,
          },
        ]}>
        <PressableScale onPress={handleContinue} style={styles.ctaButton}>
          <Text selectable={false} style={styles.ctaText}>
            {t('onboarding.yearlyGoal.cta')}
          </Text>
        </PressableScale>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    backgroundColor: theme.colors.primarySoft,
    borderColor: theme.colors.primaryBorder,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  badgeFallback: {
    backgroundColor: theme.colors.primary,
    borderRadius: 6,
    height: 12,
    width: 12,
  },
  cardEyebrow: {
    color: theme.colors.textSecondary,
    fontSize: theme.size.md,
    fontWeight: theme.weight.semibold,
    textTransform: 'uppercase',
  },
  ctaButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.pill,
    justifyContent: 'center',
    minHeight: 56,
  },
  ctaText: {
    color: theme.colors.white,
    fontSize: theme.size.lg,
    fontWeight: theme.weight.bold,
  },
  footer: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
  },
  goalSection: {
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingTop: theme.spacing.sm,
  },
  helperText: {
    color: theme.colors.textSecondary,
    fontSize: theme.size.md,
    lineHeight: 20,
    textAlign: 'center',
  },
  hero: {
    gap: theme.spacing.lg,
  },
  heroTextWrap: {
    gap: theme.spacing.sm,
  },
  pickerHost: {
    height: 216,
    width: 220,
  },
  pickerWrap: {
    alignItems: 'center',
    alignSelf: 'stretch',
    justifyContent: 'center',
    marginTop: theme.spacing.sm,
  },
  progressFill: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.pill,
    flex: 1,
  },
  progressLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.size.md,
    fontWeight: theme.weight.semibold,
  },
  progressTrack: {
    backgroundColor: theme.colors.muted,
    borderRadius: theme.radius.pill,
    height: 8,
    overflow: 'hidden',
  },
  progressWrap: {
    gap: theme.spacing.sm,
  },
  screen: {
    backgroundColor: theme.colors.background,
    flex: 1,
  },
  selectedGoalLabel: {
    color: theme.colors.textPrimary,
    fontSize: theme.size['2xl'],
    fontWeight: theme.weight.bold,
    textAlign: 'center',
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.size.lg,
    lineHeight: 26,
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: theme.size['3xl'],
    fontWeight: theme.weight.bold,
    lineHeight: 38,
  },
});
