import { theme } from '@/constants/Theme';
import { complete, softAdvance, tap } from '@/services/haptics';
import {
  useOnboardingStore,
  type Goal,
  type Handedness,
  type SkillLevel,
} from '@/stores/onboardingStore';
import { Host, Text as SwiftText } from '@expo/ui/swift-ui';
import {
  Animation,
  contentTransition,
  font,
  foregroundStyle,
  monospacedDigit,
  animation as swiftAnimation,
} from '@expo/ui/swift-ui/modifiers';
import { router, type Href } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { type ComponentProps, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeInDown,
  FadeInRight,
  FadeOutLeft,
  FadeOutUp,
  LinearTransition,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
export type QuizField = 'skillLevel' | 'goal' | 'handedness';
type QuizOptionIcon = ComponentProps<typeof SymbolView>['name'];

export type QuizOption = {
  id: NonNullable<SkillLevel> | NonNullable<Goal> | NonNullable<Handedness>;
  label: string;
  icon: QuizOptionIcon;
};

export type QuizScreenConfig = {
  field: QuizField;
  title: string;
  subtitle: string;
  ctaLabel: string;
  options: QuizOption[];
};
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedText = Animated.createAnimatedComponent(Text);
type QuizValue = QuizOption['id'] | null;
const optionLayoutTransition = LinearTransition.duration(180);

function QuizOptionCard({
  option,
  isSelected,
  onSelect,
}: {
  option: QuizOption;
  isSelected: boolean;
  onSelect: (value: QuizOption['id']) => void;
}) {
  const scale = useSharedValue(1);
  const selectionProgress = useSharedValue(isSelected ? 1 : 0);

  useEffect(() => {
    selectionProgress.value = withTiming(isSelected ? 1 : 0);
  }, [isSelected, selectionProgress]);

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    backgroundColor: interpolateColor(
      selectionProgress.value,
      [0, 1],
      [theme.colors.surface, theme.colors.primarySoft],
    ),
    borderColor: interpolateColor(
      selectionProgress.value,
      [0, 1],
      [theme.colors.border, theme.colors.primaryBorder],
    ),
  }));

  const labelAnimatedStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      selectionProgress.value,
      [0, 1],
      [theme.colors.textPrimary, theme.colors.primary],
    ),
  }));

  const iconWrapAnimatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      selectionProgress.value,
      [0, 1],
      [theme.colors.muted, theme.colors.primarySoft],
    ),
  }));

  return (
    <AnimatedPressable
      onPressIn={() => {
        scale.value = withTiming(0.95);
      }}
      onPressOut={() => {
        scale.value = withTiming(1);
        onSelect(option.id);
      }}
      style={[styles.optionCard, cardAnimatedStyle]}>
      <Animated.View style={[styles.iconWrap, iconWrapAnimatedStyle]}>
        <SymbolView
          name={option.icon}
          size={22}
          weight="semibold"
          tintColor={isSelected ? theme.colors.primary : theme.colors.textSecondary}
          fallback={<View style={styles.iconFallback} />}
        />
      </Animated.View>
      <AnimatedText selectable style={[styles.optionLabel, labelAnimatedStyle]}>
        {option.label}
      </AnimatedText>
    </AnimatedPressable>
  );
}

function StepProgressLabel({
  currentStep,
  totalSteps,
}: {
  currentStep: number;
  totalSteps: number;
}) {
  const { t } = useTranslation();
  const isIOS = process.env.EXPO_OS === 'ios';

  const labelModifiers = useMemo(
    () => [
      font({ size: theme.size.md, weight: 'semibold', design: 'rounded' }),
      foregroundStyle(theme.colors.textSecondary),
      monospacedDigit(),
      contentTransition('numericText'),
      swiftAnimation(Animation.easeInOut({ duration: 0.2 }), currentStep),
    ],
    [currentStep],
  );

  if (isIOS) {
    return (
      <Host matchContents useViewportSizeMeasurement>
        <SwiftText modifiers={labelModifiers}>
          {t('onboarding.quiz.stepOf', { current: currentStep, total: totalSteps })}
        </SwiftText>
      </Host>
    );
  }

  return (
    <Text
      selectable={false}
      style={{
        fontSize: theme.size.md,
        fontWeight: theme.weight.semibold,
        color: theme.colors.textSecondary,
        fontVariant: ['tabular-nums'],
      }}>
      {t('onboarding.quiz.stepOf', { current: currentStep, total: totalSteps })}
    </Text>
  );
}

function getStoredValue(
  field: QuizField,
  values: {
    skillLevel: SkillLevel;
    goal: Goal;
    handedness: Handedness;
  },
): QuizValue {
  switch (field) {
    case 'skillLevel':
      return values.skillLevel;
    case 'goal':
      return values.goal;
    case 'handedness':
      return values.handedness;
  }
}

export default function QuizScreenView({
  steps,
  completeHref = '/(tabs)/(home)',
  markCompletedOnFinish = true,
}: {
  steps: QuizScreenConfig[];
  completeHref?: Href;
  markCompletedOnFinish?: boolean;
}) {
  const insets = useSafeAreaInsets();
  const {
    skillLevel,
    goal,
    handedness,
    setSkillLevel,
    setGoal,
    setHandedness,
    setOnboardingCompleted,
  } = useOnboardingStore();
  const [stepIndex, setStepIndex] = useState(0);
  const [selected, setSelected] = useState<QuizValue>(null);

  const currentStep = steps[stepIndex];
  const progress = (stepIndex + 1) / steps.length;
  const progressValue = useSharedValue(progress);

  useEffect(() => {
    setSelected(
      getStoredValue(currentStep.field, {
        skillLevel,
        goal,
        handedness,
      }),
    );
  }, [currentStep.field, goal, handedness, skillLevel]);

  useEffect(() => {
    progressValue.value = withTiming(progress, { duration: 240 });
  }, [progress, progressValue]);

  const progressFillAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: progressValue.value }],
  }));

  function persistAnswer(field: QuizField, value: QuizValue) {
    if (!value) return;

    switch (field) {
      case 'skillLevel':
        setSkillLevel(value as NonNullable<SkillLevel>);
        break;
      case 'goal':
        setGoal(value as NonNullable<Goal>);
        break;
      case 'handedness':
        setHandedness(value as NonNullable<Handedness>);
        break;
    }
  }

  function handleSelect(value: QuizValue) {
    tap();
    setSelected(value);
  }

  function handleContinue() {
    if (!selected) return;
    persistAnswer(currentStep.field, selected);

    const isLastStep = stepIndex === steps.length - 1;
    if (isLastStep) {
      complete();
      if (markCompletedOnFinish) {
        setOnboardingCompleted(true);
      }
      router.replace(completeHref);
      return;
    }

    softAdvance();
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
          paddingBottom: insets.bottom + 104,
          gap: theme.spacing.xl,
          flexGrow: 1,
        }}>
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, progressFillAnimatedStyle]} />
        </View>

        <Animated.View
          key={currentStep.field}
          entering={FadeInRight.duration(220)}
          exiting={FadeOutLeft.duration(180)}
          style={{ gap: theme.spacing.xl }}>
          <View style={{ gap: theme.spacing.sm }}>
            <StepProgressLabel currentStep={stepIndex + 1} totalSteps={steps.length} />
            <Text selectable style={styles.title}>
              {currentStep.title}
            </Text>
            <Text selectable style={styles.subtitle}>
              {currentStep.subtitle}
            </Text>
          </View>

          <View style={styles.optionsContainer}>
            {currentStep.options.map((option, index) => {
              const isSelected = selected === option.id;

              return (
                <Animated.View
                  key={option.id}
                  layout={optionLayoutTransition}
                  entering={FadeInDown.duration(220).delay(index * 45)}
                  exiting={FadeOutUp.duration(140)}>
                  <QuizOptionCard
                    option={option}
                    isSelected={isSelected}
                    onSelect={handleSelect}
                  />
                </Animated.View>
              );
            })}
          </View>
        </Animated.View>
      </ScrollView>

      <View
        pointerEvents="box-none"
        style={[
          styles.floatingCtaContainer,
          {
            paddingHorizontal: theme.spacing.lg,
            paddingBottom: insets.bottom + theme.spacing.md,
          },
        ]}>
        <Pressable
          disabled={!selected}
          onPress={handleContinue}
          style={[styles.ctaButton, !selected && styles.ctaButtonDisabled]}>
          <Animated.Text
            key={currentStep.field}
            entering={FadeInDown.duration(180)}
            exiting={FadeOutUp.duration(120)}
            selectable
            style={styles.ctaLabel}>
            {currentStep.ctaLabel}
          </Animated.Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  progressTrack: {
    height: 8,
    borderRadius: theme.radius.pill,
    borderCurve: 'continuous',
    backgroundColor: theme.colors.muted,
    overflow: 'hidden',
  },
  progressFill: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.primary,
    transformOrigin: 'left center',
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
  optionsContainer: {
    gap: theme.spacing.md,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    borderCurve: 'continuous',
    borderWidth: 1,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.md,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconFallback: {
    width: 22,
    height: 22,
  },
  optionLabel: {
    flex: 1,
    fontSize: theme.size.lg,
    lineHeight: 22,
    fontWeight: theme.weight.semibold,
  },
  ctaButton: {
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.xl,
    borderCurve: 'continuous',
    backgroundColor: theme.colors.primary,
  },
  ctaButtonDisabled: {
    backgroundColor: theme.colors.textTertiary,
  },
  ctaLabel: {
    fontSize: theme.size.lg,
    fontWeight: theme.weight.semibold,
    color: theme.colors.white,
  },
  floatingCtaContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
});
