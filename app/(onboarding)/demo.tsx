import { theme } from '@/constants/Theme';
import { logFirebaseEvent } from '@/services/firebaseAnalytics';
import {
  useOnboardingStore,
  type Goal,
  type Handedness,
  type SkillLevel,
} from '@/stores/onboardingStore';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { type ComponentProps, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type SymbolName = ComponentProps<typeof SymbolView>['name'];

type DemoCard = {
  id: string;
  title: string;
  body: string;
  icon: SymbolName;
};

function getSkillAudience(skillLevel: SkillLevel, t: (key: string) => string) {
  switch (skillLevel) {
    case 'beginner':
      return t('onboarding.demo.skillAudience.beginner');
    case 'intermediate':
      return t('onboarding.demo.skillAudience.intermediate');
    case 'advanced':
      return t('onboarding.demo.skillAudience.advanced');
    default:
      return t('onboarding.demo.skillAudience.default');
  }
}

function getGoalFocus(goal: Goal, t: (key: string) => string) {
  switch (goal) {
    case 'learn-basics':
      return t('onboarding.demo.goalFocus.learnBasics');
    case 'finish-first-project':
      return t('onboarding.demo.goalFocus.finishFirstProject');
    case 'build-habit':
      return t('onboarding.demo.goalFocus.buildHabit');
    default:
      return t('onboarding.demo.goalFocus.default');
  }
}

function getHandednessChip(handedness: Handedness, t: (key: string, options?: Record<string, unknown>) => string) {
  const value =
    handedness === 'left'
      ? t('onboarding.quiz.steps.handedness.options.left')
      : handedness === 'right'
        ? t('onboarding.quiz.steps.handedness.options.right')
        : t('onboarding.loader.summaryFallbacks.handedness');

  return t('onboarding.demo.chips.handedness', { value });
}

function getSkillStepBody(skillLevel: SkillLevel, t: (key: string) => string) {
  switch (skillLevel) {
    case 'beginner':
      return t('onboarding.demo.stepBodies.skill.beginner');
    case 'intermediate':
      return t('onboarding.demo.stepBodies.skill.intermediate');
    case 'advanced':
      return t('onboarding.demo.stepBodies.skill.advanced');
    default:
      return t('onboarding.demo.stepBodies.skill.default');
  }
}

function getGoalStepBody(goal: Goal, t: (key: string) => string) {
  switch (goal) {
    case 'learn-basics':
      return t('onboarding.demo.stepBodies.goal.learnBasics');
    case 'finish-first-project':
      return t('onboarding.demo.stepBodies.goal.finishFirstProject');
    case 'build-habit':
      return t('onboarding.demo.stepBodies.goal.buildHabit');
    default:
      return t('onboarding.demo.stepBodies.goal.default');
  }
}

function DemoChip({ icon, label }: { icon: SymbolName; label: string }) {
  return (
    <View style={styles.chip}>
      <SymbolView
        name={icon}
        size={14}
        weight="semibold"
        tintColor={theme.colors.primary}
        fallback={<View style={styles.chipIconFallback} />}
      />
      <Text selectable={false} style={styles.chipLabel}>
        {label}
      </Text>
    </View>
  );
}

function ProgressLabel({
  currentStep,
  totalSteps,
}: {
  currentStep: number;
  totalSteps: number;
}) {
  const { t } = useTranslation();

  return (
    <Text selectable={false} style={styles.progressLabel}>
      {t('shared.stepOf', { current: currentStep, total: totalSteps })}
    </Text>
  );
}

export default function OnboardingDemoScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { skillLevel, goal, handedness, setOnboardingCompleted } = useOnboardingStore();
  const [stepIndex, setStepIndex] = useState(0);

  const cards = useMemo<DemoCard[]>(
    () => [
      {
        id: 'one',
        title: t('onboarding.demo.cards.one.title'),
        body: getSkillStepBody(skillLevel, t),
        icon: { ios: '1.circle.fill', android: 'filter_1', web: 'filter_1' },
      },
      {
        id: 'two',
        title: t('onboarding.demo.cards.two.title'),
        body: t('onboarding.demo.stepBodies.progress'),
        icon: { ios: '2.circle.fill', android: 'filter_2', web: 'filter_2' },
      },
      {
        id: 'three',
        title: t('onboarding.demo.cards.three.title'),
        body: getGoalStepBody(goal, t),
        icon: { ios: '3.circle.fill', android: 'filter_3', web: 'filter_3' },
      },
    ],
    [goal, skillLevel, t],
  );

  const currentCard = cards[stepIndex];
  const progress = (stepIndex + 1) / cards.length;
  const isLastStep = stepIndex === cards.length - 1;

  function goPrevious() {
    if (stepIndex === 0) return;
    void Haptics.selectionAsync();
    setStepIndex((value) => value - 1);
  }

  function goNext() {
    void Haptics.selectionAsync();

    if (isLastStep) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setOnboardingCompleted(true);
      void logFirebaseEvent('onboarding_complete', {
        goal: goal ?? null,
        skill_level: skillLevel ?? null,
      });
      router.replace('/(paywalls)/onboardingPaywall');
      return;
    }

    setStepIndex((value) => value + 1);
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{
          paddingTop: insets.top,
          paddingHorizontal: theme.spacing.lg,
          paddingBottom: insets.bottom + 132,
          gap: theme.spacing.xl,
          flexGrow: 1,
        }}>
        <View style={styles.hero}>
          <Text selectable style={styles.eyebrow}>
            {t('onboarding.demo.eyebrow')}
          </Text>
          <Text selectable style={styles.title}>
            {t('onboarding.demo.title')}
          </Text>
          <Text selectable style={styles.subtitle}>
            {t('onboarding.demo.subtitle', {
              skillLabel: getSkillAudience(skillLevel, t),
              goalLabel: getGoalFocus(goal, t),
            })}
          </Text>

          <View style={styles.chipsWrap}>
            <DemoChip
              icon={{ ios: 'clock.fill', android: 'schedule', web: 'schedule' }}
              label={t('onboarding.demo.chips.duration')}
            />
            <DemoChip
              icon={{ ios: 'hand.raised.fill', android: 'back_hand', web: 'back_hand' }}
              label={getHandednessChip(handedness, t)}
            />
          </View>
        </View>

        <View style={styles.progressSection}>
          <ProgressLabel currentStep={stepIndex + 1} totalSteps={cards.length} />
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
        </View>

        <Animated.View
          key={currentCard.id}
          entering={FadeInDown.duration(220)}
          style={styles.card}>
          <View style={styles.cardIconWrap}>
            <SymbolView
              name={currentCard.icon}
              size={30}
              weight="semibold"
              tintColor={theme.colors.primary}
              fallback={<View style={styles.cardIconFallback} />}
            />
          </View>

          <View style={styles.cardTextWrap}>
            <Text selectable style={styles.cardStepLabel}>
              {t('onboarding.demo.stepLabel', { current: stepIndex + 1 })}
            </Text>
            <Text selectable style={styles.cardTitle}>
              {currentCard.title}
            </Text>
            <Text selectable style={styles.cardBody}>
              {currentCard.body}
            </Text>
          </View>
        </Animated.View>

        <View style={styles.noteCard}>
          <Text selectable style={styles.noteText}>
            {t('onboarding.demo.note')}
          </Text>
        </View>
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
        <View style={styles.footerActions}>
          {stepIndex > 0 ? (
            <Pressable onPress={goPrevious} style={styles.secondaryButton}>
              <Text selectable style={styles.secondaryButtonLabel}>
                {t('onboarding.demo.actions.previous')}
              </Text>
            </Pressable>
          ) : null}

          <Pressable
            onPress={goNext}
            style={[styles.primaryButton, stepIndex === 0 && styles.primaryButtonFullWidth]}>
            <Text selectable style={styles.primaryButtonLabel}>
              {isLastStep ? t('onboarding.demo.actions.finish') : t('onboarding.demo.actions.next')}
            </Text>
          </Pressable>
        </View>
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
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.pill,
    borderCurve: 'continuous',
    backgroundColor: theme.colors.primarySoft,
    borderWidth: 1,
    borderColor: theme.colors.primaryBorder,
  },
  chipIconFallback: {
    width: 14,
    height: 14,
  },
  chipLabel: {
    fontSize: theme.size.sm,
    fontWeight: theme.weight.semibold,
    color: theme.colors.primary,
  },
  progressSection: {
    gap: theme.spacing.sm,
  },
  progressLabel: {
    fontSize: theme.size.md,
    fontWeight: theme.weight.semibold,
    color: theme.colors.textSecondary,
    fontVariant: ['tabular-nums'],
  },
  progressTrack: {
    height: 8,
    borderRadius: theme.radius.pill,
    borderCurve: 'continuous',
    backgroundColor: theme.colors.muted,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
  },
  card: {
    padding: theme.spacing.xl,
    gap: theme.spacing.lg,
    borderRadius: theme.radius.xl,
    borderCurve: 'continuous',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    boxShadow: '0 10px 24px rgba(0, 0, 0, 0.06)',
  },
  cardIconWrap: {
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
  cardIconFallback: {
    width: 30,
    height: 30,
  },
  cardTextWrap: {
    gap: theme.spacing.sm,
  },
  cardStepLabel: {
    fontSize: theme.size.sm,
    fontWeight: theme.weight.semibold,
    color: theme.colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardTitle: {
    fontSize: theme.size['2xl'],
    lineHeight: 32,
    fontWeight: theme.weight.bold,
    color: theme.colors.textPrimary,
  },
  cardBody: {
    fontSize: theme.size.lg,
    lineHeight: 26,
    color: theme.colors.textSecondary,
  },
  noteCard: {
    padding: theme.spacing.lg,
    borderRadius: theme.radius.xl,
    borderCurve: 'continuous',
    backgroundColor: theme.colors.muted,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  noteText: {
    fontSize: theme.size.md,
    lineHeight: 22,
    color: theme.colors.textSecondary,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  footerActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  secondaryButton: {
    minHeight: 56,
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.xl,
    borderCurve: 'continuous',
    backgroundColor: theme.colors.muted,
  },
  secondaryButtonLabel: {
    fontSize: theme.size.lg,
    fontWeight: theme.weight.semibold,
    color: theme.colors.textSecondary,
  },
  primaryButton: {
    flex: 1,
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.xl,
    borderCurve: 'continuous',
    backgroundColor: theme.colors.primary,
  },
  primaryButtonFullWidth: {
    flex: undefined,
    width: '100%',
  },
  primaryButtonLabel: {
    fontSize: theme.size.lg,
    fontWeight: theme.weight.semibold,
    color: theme.colors.white,
  },
});
