import { theme } from '@/constants/Theme';
import { complete, cta } from '@/services/haptics';
import {
  useOnboardingStore,
  type Goal,
  type Handedness,
  type SkillLevel,
} from '@/stores/onboardingStore';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { type ComponentProps, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type SymbolName = ComponentProps<typeof SymbolView>['name'];

type SummaryRow = {
  id: string;
  label: string;
  value: string;
  icon: SymbolName;
};

type NextStep = {
  id: string;
  text: string;
};

function getDailyGoalLabel(minutes: number | null, t: (key: string, options?: Record<string, unknown>) => string) {
  if (!minutes) {
    return t('onboarding.loader.summaryFallbacks.dailyGoal');
  }

  return t('onboarding.loader.summaryValues.dailyGoal', { minutes });
}

function getYearlyGoalLabel(count: number | null, t: (key: string, options?: Record<string, unknown>) => string) {
  if (!count) {
    return t('onboarding.loader.summaryFallbacks.yearlyGoal');
  }

  return t('onboarding.loader.summaryValues.yearlyGoal', { count });
}

function SummaryIcon({ name }: { name: SymbolName }) {
  return (
    <View style={styles.summaryIconWrap}>
      <SymbolView
        name={name}
        size={20}
        weight="semibold"
        tintColor={theme.colors.primary}
        fallback={<View style={styles.iconFallback} />}
      />
    </View>
  );
}

function getSkillLabel(skillLevel: SkillLevel, t: (key: string) => string) {
  switch (skillLevel) {
    case 'beginner':
      return t('onboarding.quiz.steps.skillLevel.options.beginner');
    case 'intermediate':
      return t('onboarding.quiz.steps.skillLevel.options.intermediate');
    case 'advanced':
      return t('onboarding.quiz.steps.skillLevel.options.advanced');
    default:
      return t('onboarding.loader.summaryFallbacks.skillLevel');
  }
}

function getGoalLabel(goal: Goal, t: (key: string) => string) {
  switch (goal) {
    case 'learn-basics':
      return t('onboarding.quiz.steps.goal.options.learnBasics');
    case 'finish-first-project':
      return t('onboarding.quiz.steps.goal.options.finishFirstProject');
    case 'build-habit':
      return t('onboarding.quiz.steps.goal.options.buildHabit');
    default:
      return t('onboarding.loader.summaryFallbacks.goal');
  }
}

function getHandednessLabel(handedness: Handedness, t: (key: string) => string) {
  switch (handedness) {
    case 'right':
      return t('onboarding.quiz.steps.handedness.options.right');
    case 'left':
      return t('onboarding.quiz.steps.handedness.options.left');
    default:
      return t('onboarding.loader.summaryFallbacks.handedness');
  }
}

function getSkillStep(skillLevel: SkillLevel, t: (key: string) => string) {
  switch (skillLevel) {
    case 'beginner':
      return t('onboarding.loader.nextSteps.skillLevel.beginner');
    case 'intermediate':
      return t('onboarding.loader.nextSteps.skillLevel.intermediate');
    case 'advanced':
      return t('onboarding.loader.nextSteps.skillLevel.advanced');
    default:
      return t('onboarding.loader.nextSteps.skillLevel.default');
  }
}

function getGoalStep(goal: Goal, t: (key: string) => string) {
  switch (goal) {
    case 'learn-basics':
      return t('onboarding.loader.nextSteps.goal.learnBasics');
    case 'finish-first-project':
      return t('onboarding.loader.nextSteps.goal.finishFirstProject');
    case 'build-habit':
      return t('onboarding.loader.nextSteps.goal.buildHabit');
    default:
      return t('onboarding.loader.nextSteps.goal.default');
  }
}

export default function Loader() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { goal, skillLevel, handedness, dailyGoalMinutes, yearlyProjectGoal } = useOnboardingStore();

  useEffect(() => {
    complete();
  }, []);

  const summaryRows = useMemo<SummaryRow[]>(
    () => [
      {
        id: 'skillLevel',
        label: t('onboarding.loader.summaryLabels.skillLevel'),
        value: getSkillLabel(skillLevel, t),
        icon: { ios: 'sparkles', android: 'auto_awesome', web: 'auto_awesome' },
      },
      {
        id: 'goal',
        label: t('onboarding.loader.summaryLabels.goal'),
        value: getGoalLabel(goal, t),
        icon: { ios: 'flag.fill', android: 'flag', web: 'flag' },
      },
      {
        id: 'handedness',
        label: t('onboarding.loader.summaryLabels.handedness'),
        value: getHandednessLabel(handedness, t),
        icon: { ios: 'arrow.left.and.right.circle.fill', android: 'swap_horiz', web: 'swap_horiz' },
      },
      {
        id: 'dailyGoal',
        label: t('onboarding.loader.summaryLabels.dailyGoal'),
        value: getDailyGoalLabel(dailyGoalMinutes, t),
        icon: { ios: 'clock.fill', android: 'schedule', web: 'schedule' },
      },
      {
        id: 'yearlyGoal',
        label: t('onboarding.loader.summaryLabels.yearlyGoal'),
        value: getYearlyGoalLabel(yearlyProjectGoal, t),
        icon: { ios: 'calendar', android: 'calendar_month', web: 'calendar_month' },
      },
    ],
    [dailyGoalMinutes, goal, handedness, skillLevel, t, yearlyProjectGoal],
  );

  const nextSteps = useMemo<NextStep[]>(
    () => [
      {
        id: 'skillLevel',
        text: getSkillStep(skillLevel, t),
      },
      {
        id: 'goal',
        text: getGoalStep(goal, t),
      },
      {
        id: 'tracking',
        text: t('onboarding.loader.nextSteps.tracking'),
      },
      {
        id: 'dailyGoal',
        text: t('onboarding.loader.nextSteps.dailyGoal', {
          minutes: dailyGoalMinutes ?? 15,
        }),
      },
      {
        id: 'yearlyGoal',
        text: t('onboarding.loader.nextSteps.yearlyGoal', {
          count: yearlyProjectGoal ?? 8,
        }),
      },
    ],
    [dailyGoalMinutes, goal, skillLevel, t, yearlyProjectGoal],
  );

  function handleContinue() {
    cta();
    router.push('/(onboarding)/demo');
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{
          paddingTop: insets.top,
          paddingHorizontal: theme.spacing.lg,
          paddingBottom: insets.bottom + 104,
          gap: theme.spacing.xl,
          flexGrow: 1,
        }}>
        <Animated.View entering={FadeInDown.duration(220)} style={styles.hero}>
          <View style={styles.heroBadge}>
            <SymbolView
              name={{ ios: 'checkmark.circle.fill', android: 'task_alt', web: 'task_alt' }}
              size={28}
              weight="semibold"
              tintColor={theme.colors.primary}
              fallback={<View style={styles.heroIconFallback} />}
            />
          </View>

          <View style={styles.heroTextWrap}>
            <Text selectable style={styles.eyebrow}>
              {t('onboarding.loader.summaryEyebrow')}
            </Text>
            <Text selectable style={styles.title}>
              {t('onboarding.loader.titleReady')}
            </Text>
            <Text selectable style={styles.subtitle}>
              {t('onboarding.loader.summarySubtitle')}
            </Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(70).duration(220)} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text selectable style={styles.cardTitle}>
              {t('onboarding.loader.summaryCardTitle')}
            </Text>
            <Text selectable style={styles.cardSubtitle}>
              {t('onboarding.loader.summaryCardSubtitle')}
            </Text>
          </View>

          <View style={styles.rowsWrap}>
            {summaryRows.map((row, index) => (
              <View key={row.id}>
                <View style={styles.summaryRow}>
                  <SummaryIcon name={row.icon} />
                  <View style={styles.rowTextWrap}>
                    <Text selectable style={styles.rowLabel}>
                      {row.label}
                    </Text>
                    <Text selectable style={styles.rowValue}>
                      {row.value}
                    </Text>
                  </View>
                </View>
                {index < summaryRows.length - 1 ? <View style={styles.separator} /> : null}
              </View>
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(120).duration(220)} style={styles.card}>
          <Text selectable style={styles.cardTitle}>
            {t('onboarding.loader.nextTitle')}
          </Text>

          <View style={styles.nextStepsWrap}>
            {nextSteps.map((step) => (
              <View key={step.id} style={styles.nextStepRow}>
                <View style={styles.nextStepIconWrap}>
                  <SymbolView
                    name={{ ios: 'checkmark', android: 'check', web: 'check' }}
                    size={14}
                    weight="bold"
                    tintColor={theme.colors.primary}
                    fallback={<View style={styles.nextStepIconFallback} />}
                  />
                </View>
                <Text selectable style={styles.nextStepText}>
                  {step.text}
                </Text>
              </View>
            ))}
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
        <Pressable onPress={handleContinue} style={styles.ctaButton}>
          <Text selectable style={styles.ctaLabel}>
            {t('onboarding.loader.ctaPreview')}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  hero: {
    gap: theme.spacing.lg,
  },
  heroBadge: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    borderCurve: 'continuous',
    backgroundColor: theme.colors.primarySoft,
    borderWidth: 1,
    borderColor: theme.colors.primaryBorder,
  },
  heroIconFallback: {
    width: 28,
    height: 28,
  },
  heroTextWrap: {
    gap: theme.spacing.sm,
  },
  eyebrow: {
    fontSize: theme.size.sm,
    fontWeight: theme.weight.semibold,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  title: {
    fontSize: theme.size['3xl'],
    lineHeight: 38,
    fontWeight: theme.weight.bold,
    color: theme.colors.textPrimary,
  },
  subtitle: {
    fontSize: theme.size.lg,
    lineHeight: 24,
    color: theme.colors.textSecondary,
  },
  card: {
    gap: theme.spacing.lg,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.xl,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    boxShadow: '0 10px 24px rgba(0, 0, 0, 0.06)',
  },
  cardHeader: {
    gap: theme.spacing.xs,
  },
  cardTitle: {
    fontSize: theme.size.xl,
    lineHeight: 28,
    fontWeight: theme.weight.bold,
    color: theme.colors.textPrimary,
  },
  cardSubtitle: {
    fontSize: theme.size.md,
    lineHeight: 20,
    color: theme.colors.textSecondary,
  },
  rowsWrap: {
    overflow: 'hidden',
    borderRadius: theme.radius.lg,
    borderCurve: 'continuous',
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
  },
  summaryIconWrap: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.md,
    borderCurve: 'continuous',
    backgroundColor: theme.colors.primarySoft,
  },
  iconFallback: {
    width: 20,
    height: 20,
  },
  rowTextWrap: {
    flex: 1,
    gap: 2,
  },
  rowLabel: {
    fontSize: theme.size.sm,
    fontWeight: theme.weight.medium,
    color: theme.colors.textSecondary,
  },
  rowValue: {
    fontSize: theme.size.lg,
    lineHeight: 22,
    fontWeight: theme.weight.semibold,
    color: theme.colors.textPrimary,
  },
  separator: {
    height: 1,
    marginLeft: 68,
    backgroundColor: theme.colors.border,
  },
  nextStepsWrap: {
    gap: theme.spacing.md,
  },
  nextStepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.md,
  },
  nextStepIconWrap: {
    width: 24,
    height: 24,
    marginTop: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.primaryBorder,
    backgroundColor: theme.colors.primarySoft,
  },
  nextStepIconFallback: {
    width: 14,
    height: 14,
  },
  nextStepText: {
    flex: 1,
    fontSize: theme.size.md,
    lineHeight: 22,
    color: theme.colors.textPrimary,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  ctaButton: {
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.xl,
    borderCurve: 'continuous',
    backgroundColor: theme.colors.primary,
  },
  ctaLabel: {
    fontSize: theme.size.lg,
    fontWeight: theme.weight.semibold,
    color: theme.colors.white,
  },
});
