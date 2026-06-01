import {
  CounterButton,
  CounterValueText,
  ProgressBar,
  StepInstructionCard,
  StepNavigationBar,
  StepProgressLabel,
  TargetCountText,
  triggerNavigationHaptic,
} from '@/components/project-step-flow';
import type { ProjectChatStep } from '@/components/project-chat';
import { theme } from '@/constants/Theme';
import { logFirebaseEvent } from '@/services/firebaseAnalytics';
import { complete, tap } from '@/services/haptics';
import {
  useOnboardingStore,
  type Goal,
  type SkillLevel,
} from '@/stores/onboardingStore';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import Animated, {
  FadeInDown,
  FadeOutDown,
  useAnimatedScrollHandler,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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

export default function OnboardingDemoScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { t } = useTranslation();
  const { skillLevel, goal, setOnboardingCompleted } = useOnboardingStore();
  const stepListRef = useRef<FlatList<ProjectChatStep>>(null);
  const hasPositionedStepListRef = useRef(false);
  const isProgrammaticStepScrollRef = useRef(false);
  const [selectedStepIndex, setSelectedStepIndex] = useState(0);
  const [demoRowCount, setDemoRowCount] = useState(2);

  const steps = useMemo<ProjectChatStep[]>(
    () => [
      {
        type: 'instruction',
        title: t('onboarding.demo.cards.one.title'),
        instruction: getSkillStepBody(skillLevel, t),
      },
      {
        type: 'row',
        title: t('onboarding.demo.cards.two.title'),
        instruction: t('onboarding.demo.stepBodies.progress'),
        counterLabel: 'row',
        targetCount: 4,
      },
      {
        type: 'instruction',
        title: t('onboarding.demo.cards.three.title'),
        instruction: getGoalStepBody(goal, t),
      },
    ],
    [goal, skillLevel, t],
  );

  const currentStepIndex = Math.min(selectedStepIndex, Math.max(steps.length - 1, 0));
  const currentStep = steps[currentStepIndex] ?? null;
  const progress = steps.length > 0 ? (currentStepIndex + 1) / steps.length : 0;
  const stepCardGap = theme.spacing.md;
  const stepCardWidth = width - theme.spacing.xl * 2;
  const stepCardSnapInterval = stepCardWidth + stepCardGap;
  const stepCardScrollX = useSharedValue(currentStepIndex * stepCardSnapInterval);
  const stepCardProgress = useSharedValue(progress);
  const onStepCardScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      stepCardScrollX.value = event.contentOffset.x;

      if (steps.length > 0) {
        const rawIndex = event.contentOffset.x / stepCardSnapInterval;
        stepCardProgress.value = Math.max(0, Math.min(1, (rawIndex + 1) / steps.length));
      }
    },
  });
  const counterLabel = currentStep?.counterLabel;
  const counterValue = counterLabel === 'row' ? demoRowCount : null;

  useEffect(() => {
    if (steps.length === 0) return;

    const nextOffset = currentStepIndex * stepCardSnapInterval;
    stepCardScrollX.value = nextOffset;
    stepCardProgress.value = withTiming((currentStepIndex + 1) / steps.length, { duration: 220 });
    stepListRef.current?.scrollToOffset({
      offset: nextOffset,
      animated: hasPositionedStepListRef.current,
    });
    hasPositionedStepListRef.current = true;
  }, [currentStepIndex, stepCardProgress, stepCardScrollX, stepCardSnapInterval, steps.length]);

  async function goToStepIndex(nextIndex: number, animated = true) {
    if (steps.length === 0) return;

    const clampedIndex = Math.max(0, Math.min(steps.length - 1, nextIndex));
    if (clampedIndex === currentStepIndex) return;

    const nextOffset = clampedIndex * stepCardSnapInterval;
    isProgrammaticStepScrollRef.current = true;
    setSelectedStepIndex(clampedIndex);
    stepListRef.current?.scrollToOffset({
      offset: nextOffset,
      animated,
    });
    stepCardScrollX.value = withTiming(nextOffset, { duration: 240 });
    stepCardProgress.value = withTiming((clampedIndex + 1) / steps.length, { duration: 240 });
    setTimeout(() => {
      isProgrammaticStepScrollRef.current = false;
    }, 500);
  }

  async function settleStepCard(offsetX: number) {
    if (steps.length === 0) return;
    if (isProgrammaticStepScrollRef.current) return;

    const nextIndex = Math.max(
      0,
      Math.min(steps.length - 1, Math.round(offsetX / stepCardSnapInterval)),
    );

    if (nextIndex === currentStepIndex) return;

    triggerNavigationHaptic();
    setSelectedStepIndex(nextIndex);
  }

  function updateCounter(delta: number) {
    tap();
    setDemoRowCount((value) => Math.max(0, value + delta));
  }

  async function finishDemo() {
    complete();
    setOnboardingCompleted(true);
    void logFirebaseEvent('onboarding_complete', {
      goal: goal ?? null,
      skill_level: skillLevel ?? null,
    });
    router.replace('/(onboarding)/rating');
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={{
          flex: 1,
          backgroundColor: theme.colors.background,
        }}
        contentContainerStyle={{
          paddingHorizontal: theme.spacing.xl,
          paddingTop: insets.top + theme.spacing.sm,
          paddingBottom: insets.bottom + 128,
          gap: theme.spacing.lg,
          backgroundColor: theme.colors.background,
        }}>
        {steps.length > 0 ? (
          <Animated.View entering={FadeInDown.duration(180)} style={{ gap: theme.spacing.md }}>
            <StepProgressLabel currentStep={currentStepIndex + 1} totalSteps={steps.length} />
            <ProgressBar progress={progress} animatedProgress={stepCardProgress} />
          </Animated.View>
        ) : null}

        {steps.length > 0 ? (
          <Animated.FlatList
            ref={stepListRef}
            data={steps}
            horizontal
            keyExtractor={(item, index) => `${item.title}-${index}`}
            renderItem={({ item, index }) => (
              <StepInstructionCard
                step={item}
                index={index}
                cardWidth={stepCardWidth}
                snapInterval={stepCardSnapInterval}
                scrollX={stepCardScrollX}
              />
            )}
            ItemSeparatorComponent={() => <View style={{ width: stepCardGap }} />}
            getItemLayout={(_, index) => ({
              length: stepCardSnapInterval,
              offset: stepCardSnapInterval * index,
              index,
            })}
            snapToInterval={stepCardSnapInterval}
            snapToAlignment="start"
            decelerationRate="fast"
            scrollEventThrottle={16}
            showsHorizontalScrollIndicator={false}
            onScroll={onStepCardScroll}
            onMomentumScrollEnd={(event) => void settleStepCard(event.nativeEvent.contentOffset.x)}
          />
        ) : null}

        {counterLabel && counterValue !== null ? (
          <Animated.View
            entering={FadeInDown.duration(180)}
            exiting={FadeOutDown.duration(140)}
            style={{
              padding: theme.spacing.lg,
              borderRadius: theme.radius.xl,
              backgroundColor: theme.colors.surface,
              gap: theme.spacing.md,
            }}>
            <Text
              selectable
              style={{
                fontSize: theme.size.md,
                fontWeight: theme.weight.semibold,
                color: theme.colors.textPrimary,
                textTransform: 'capitalize',
              }}>
              {counterLabel} counter
            </Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: theme.spacing.lg,
              }}>
              <CounterButton
                label="-"
                onPress={() => updateCounter(-1)}
                disabled={counterValue === 0}
              />
              <CounterValueText value={counterValue} />
              <CounterButton label="+" onPress={() => updateCounter(1)} />
            </View>
            {currentStep?.targetCount ? (
              <TargetCountText value={currentStep.targetCount} label={counterLabel} />
            ) : null}
          </Animated.View>
        ) : null}
      </ScrollView>

      <StepNavigationBar
        currentStepIndex={currentStepIndex}
        stepCount={steps.length}
        bottomInset={insets.bottom}
        onPrevious={() => void goToStepIndex(currentStepIndex - 1)}
        onNext={() => void goToStepIndex(currentStepIndex + 1)}
        onComplete={() => void finishDemo()}
        previousLabel={t('onboarding.demo.actions.previous')}
        nextLabel={t('onboarding.demo.actions.next')}
        completeLabel={t('onboarding.demo.actions.finish')}
      />
    </View>
  );
}
