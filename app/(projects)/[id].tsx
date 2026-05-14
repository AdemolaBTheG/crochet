import { NavigationHeaderAction } from '@/components/navigation-header-action';
import { PressableScale } from '@/components/pressable-scale';
import type { ProjectChatStep } from '@/components/project-chat';
import { theme } from '@/constants/Theme';
import { useSubscription } from '@/context/SubscriptionContext';
import {
  patterns as patternsTable,
  projects as projectsTable,
  type Pattern,
  type Project,
} from '@/db/schema';
import { resolvePatternTranslation, type ResolvedPattern } from '@/db/translations';
import { useDbStore } from '@/stores/dbStore';
import { Host, Text as SwiftText } from '@expo/ui/swift-ui';
import {
  Animation,
  contentTransition,
  font,
  foregroundStyle,
  frame,
  monospacedDigit,
  animation as swiftAnimation,
} from '@expo/ui/swift-ui/modifiers';
import { eq } from 'drizzle-orm';
import * as Haptics from 'expo-haptics';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
  type FlatList,
} from 'react-native';
import Animated, {
  Extrapolation,
  FadeInDown,
  FadeInLeft,
  FadeOutDown,
  FadeOutRight,
  FadeOutUp,
  LinearTransition,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type PatternStep = ProjectChatStep;
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const buttonLayoutTransition = LinearTransition.duration(180);
const stepCardLayoutTransition = LinearTransition.duration(200);
const previousButtonEntering = FadeInLeft.duration(180);
const previousButtonExiting = FadeOutRight.duration(140);

function triggerNavigationHaptic() {
  if (process.env.EXPO_OS === 'ios') {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
}

function parseSteps(stepsJson: string | null) {
  if (!stepsJson) return [];

  try {
    return JSON.parse(stepsJson) as PatternStep[];
  } catch {
    return [];
  }
}

function CounterButton({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled}
      style={{
        width: 52,
        height: 52,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: theme.radius.pill,
        backgroundColor: disabled ? theme.colors.muted : theme.colors.primarySoft,
      }}
      accessibilityRole="button">
      <Text
        selectable
        style={{
          fontSize: theme.size['2xl'],
          fontWeight: theme.weight.semibold,
          color: disabled ? theme.colors.textTertiary : theme.colors.primary,
        }}>
        {label}
      </Text>
    </PressableScale>
  );
}

function ProgressBar({
  progress,
  animatedProgress,
}: {
  progress: number;
  animatedProgress?: SharedValue<number>;
}) {
  const clampedProgress = Math.max(0, Math.min(progress, 1));
  const internalProgress = useSharedValue(clampedProgress);

  useEffect(() => {
    if (!animatedProgress) {
      internalProgress.value = withTiming(clampedProgress, { duration: 280 });
    }
  }, [animatedProgress, clampedProgress, internalProgress]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: animatedProgress?.value ?? internalProgress.value }],
  }));

  return (
    <View
      style={{
        height: 6,
        borderRadius: theme.radius.pill,
        backgroundColor: theme.colors.muted,
        overflow: 'hidden',
      }}>
      <Animated.View
        style={[
          {
            width: '100%',
            height: '100%',
            borderRadius: theme.radius.pill,
            backgroundColor: theme.colors.primary,
            transformOrigin: 'left center',
          },
          animatedStyle,
        ]}
      />
    </View>
  );
}

function StepProgressLabel({
  currentStep,
  totalSteps,
}: {
  currentStep: number;
  totalSteps: number;
}) {
  const isIOS = process.env.EXPO_OS === 'ios';
  const labelModifiers = useMemo(
    () => [
      font({ size: theme.size.md, weight: 'semibold', design: 'rounded' }),
      foregroundStyle(theme.colors.textSecondary),
      monospacedDigit(),
      contentTransition('numericText'),
      swiftAnimation(Animation.easeInOut({ duration: 0.22 }), currentStep),
      frame({ minWidth: 82, alignment: 'trailing' }),
    ],
    [currentStep],
  );

  if (isIOS) {
    return (
      <Host matchContents style={{ width: 86, height: 24, alignSelf: 'flex-end' }}>
        <SwiftText modifiers={labelModifiers}>
          {currentStep}/{totalSteps} steps
        </SwiftText>
      </Host>
    );
  }

  return (
    <View style={{ width: 86, height: 24, alignSelf: 'flex-end' }}>
      <Text
        selectable={false}
        style={{
          minWidth: 82,
          fontSize: theme.size.md,
          fontWeight: theme.weight.semibold,
          color: theme.colors.textSecondary,
          fontVariant: ['tabular-nums'],
          textAlign: 'right',
        }}>
        {currentStep}/{totalSteps} steps
      </Text>
    </View>
  );
}

function CounterValueText({ value }: { value: number }) {
  const isIOS = process.env.EXPO_OS === 'ios';
  const counterModifiers = useMemo(
    () => [
      font({ size: theme.size['3xl'], weight: 'bold', design: 'rounded' }),
      foregroundStyle(theme.colors.textPrimary),
      monospacedDigit(),
      contentTransition('numericText'),
      swiftAnimation(Animation.easeInOut({ duration: 0.18 }), value),
    ],
    [value],
  );

  if (isIOS) {
    return (
      <Host matchContents={false} style={{ width: 104, height: 48 }}>
        <SwiftText modifiers={counterModifiers}>{value.toString()}</SwiftText>
      </Host>
    );
  }

  return (
    <View style={{ width: 104, height: 48 }}>
      <Text
        selectable={false}
        style={{
          fontSize: theme.size['3xl'],
          fontWeight: theme.weight.bold,
          color: theme.colors.textPrimary,
          fontVariant: ['tabular-nums'],
          textAlign: 'center',
        }}>
        {value.toString()}
      </Text>
    </View>
  );
}

function TargetCountText({ value, label }: { value: number; label: string }) {
  const isIOS = process.env.EXPO_OS === 'ios';
  const targetLabel = `${label}${value === 1 ? '' : 's'}`;
  const targetModifiers = useMemo(
    () => [
      font({ size: theme.size.md, weight: 'regular', design: 'rounded' }),
      foregroundStyle(theme.colors.textSecondary),
      monospacedDigit(),
      contentTransition('numericText'),
      swiftAnimation(Animation.easeInOut({ duration: 0.18 }), value),
    ],
    [value],
  );

  if (isIOS) {
    return (
      <Host matchContents={false} style={{ width: 148, height: 24, alignSelf: 'center' }}>
        <SwiftText modifiers={targetModifiers}>
          Target: {value} {targetLabel}
        </SwiftText>
      </Host>
    );
  }

  return (
    <View style={{ width: 148, height: 24, alignSelf: 'center' }}>
      <Text
        selectable={false}
        style={{
          fontSize: theme.size.md,
          fontWeight: theme.weight.regular,
          color: theme.colors.textSecondary,
          fontVariant: ['tabular-nums'],
          textAlign: 'center',
        }}>
        Target: {value} {targetLabel}
      </Text>
    </View>
  );
}

function getStepKicker(step: PatternStep, index: number) {
  const stepLabel = `Step ${index + 1}`;

  if (step.counterLabel === 'round' || step.type === 'round') {
    return `${stepLabel} / Round`;
  }

  if (step.counterLabel === 'row' || step.type === 'row') {
    return `${stepLabel} / Row`;
  }

  return stepLabel;
}

function StepInstructionCard({
  step,
  index,
  cardWidth,
  snapInterval,
  scrollX,
}: {
  step: PatternStep;
  index: number;
  cardWidth: number;
  snapInterval: number;
  scrollX: SharedValue<number>;
}) {
  const animatedStyle = useAnimatedStyle(() => {
    const itemOffset = index * snapInterval;
    const distance = Math.abs(scrollX.value - itemOffset);
    const opacity = interpolate(distance, [0, snapInterval], [1, 0.72], Extrapolation.CLAMP);
    const scale = interpolate(distance, [0, snapInterval], [1, 0.97], Extrapolation.CLAMP);

    return {
      opacity,
      transform: [{ scale }],
    };
  });

  return (
    <Animated.View
      layout={stepCardLayoutTransition}
      style={[
        {
          width: cardWidth,
          minHeight: 204,
          padding: theme.spacing.lg,
          gap: theme.spacing.md,
          borderRadius: theme.radius.xl,
          backgroundColor: theme.colors.surface,
        },
        animatedStyle,
      ]}>
      <Text
        selectable
        style={{
          fontSize: theme.size.sm,
          fontWeight: theme.weight.semibold,
          color: theme.colors.primary,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        }}>
        {getStepKicker(step, index)}
      </Text>
      <Text
        selectable
        style={{
          fontSize: theme.size['2xl'],
          fontWeight: theme.weight.semibold,
          color: theme.colors.textPrimary,
        }}>
        {step.title}
      </Text>
      <Text
        selectable
        style={{
          fontSize: theme.size.lg,
          lineHeight: theme.size.lg + 8,
          color: theme.colors.textSecondary,
        }}>
        {step.instruction}
      </Text>
    </Animated.View>
  );
}

function StepNavigationBar({
  currentStepIndex,
  stepCount,
  bottomInset,
  onPrevious,
  onNext,
  onComplete,
}: {
  currentStepIndex: number;
  stepCount: number;
  bottomInset: number;
  onPrevious: () => void;
  onNext: () => void;
  onComplete: () => void;
}) {
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex >= stepCount - 1;
  const handlePreviousPress = () => {
    triggerNavigationHaptic();
    onPrevious();
  };
  const handlePrimaryPress = () => {
    triggerNavigationHaptic();
    if (isLastStep) {
      onComplete();
      return;
    }

    onNext();
  };

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        paddingHorizontal: theme.spacing.xl,
        paddingTop: theme.spacing.md,
        paddingBottom: bottomInset + theme.spacing.md,
        zIndex: 20,
      }}>
      <Animated.View
        layout={buttonLayoutTransition}
        style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
        {!isFirstStep ? (
          <AnimatedPressable
            layout={buttonLayoutTransition}
            entering={previousButtonEntering}
            exiting={previousButtonExiting}
            onPress={handlePreviousPress}
            style={{
              flex: 1,
              paddingVertical: 16,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: theme.radius.pill,
              backgroundColor: theme.colors.surface,
              borderWidth: 1,
              borderColor: theme.colors.border,
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.10)',
            }}
            accessibilityRole="button">
            <Text
              style={{
                fontSize: theme.size.md,
                fontWeight: theme.weight.semibold,
                color: theme.colors.textPrimary,
              }}>
              Previous
            </Text>
          </AnimatedPressable>
        ) : null}
        <AnimatedPressable
          layout={buttonLayoutTransition}
          onPress={handlePrimaryPress}
          disabled={stepCount === 0}
          style={{
            flex: 1,
            paddingVertical: 16,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: theme.radius.pill,
            backgroundColor: stepCount === 0 ? theme.colors.muted : theme.colors.primary,
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.14)',
          }}
          accessibilityRole="button">
          <Animated.Text
            layout={buttonLayoutTransition}
            entering={FadeInDown.duration(180)}
            exiting={FadeOutUp.duration(140)}
            key={`${isLastStep}`}
            style={{
              fontSize: theme.size.md,
              fontWeight: theme.weight.semibold,
              color: stepCount === 0 ? theme.colors.textTertiary : theme.colors.white,
            }}>
            {isLastStep ? 'Complete' : 'Next'}
          </Animated.Text>
        </AnimatedPressable>
      </Animated.View>
    </View>
  );
}

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { db } = useDbStore();
  const { isPro } = useSubscription();
  const { i18n } = useTranslation();
  const stepListRef = useRef<FlatList<PatternStep>>(null);
  const hasPositionedStepListRef = useRef(false);
  const isProgrammaticStepScrollRef = useRef(false);
  const [project, setProject] = useState<Project | null>(null);
  const [pattern, setPattern] = useState<ResolvedPattern | null>(null);
  const [patternBase, setPatternBase] = useState<Pattern | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStepIndex, setSelectedStepIndex] = useState(0);
  const projectId = Number(id);

  useEffect(() => {
    let isMounted = true;

    async function loadProject() {
      if (!db || !Number.isFinite(projectId)) return;

      setIsLoading(true);

      try {
        const projectResult = await db
          .select()
          .from(projectsTable)
          .where(eq(projectsTable.id, projectId))
          .limit(1);
        const projectRow = projectResult[0] ?? null;
        const patternResult = projectRow
          ? await db
              .select()
              .from(patternsTable)
              .where(eq(patternsTable.id, projectRow.patternId))
              .limit(1)
          : [];

        const patternRow = patternResult[0] ?? null;

        if (isMounted && patternRow) {
          const resolved = await resolvePatternTranslation(
            db,
            patternRow,
            i18n.language,
          );
          setProject(projectRow);
          setPattern(resolved);
          setPatternBase(patternRow);
          setSelectedStepIndex(projectRow?.currentStepIndex ?? 0);
        } else if (isMounted) {
          setProject(projectRow);
          setPattern(null);
          setPatternBase(null);
          setSelectedStepIndex(projectRow?.currentStepIndex ?? 0);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadProject();

    return () => {
      isMounted = false;
    };
  }, [db, projectId, i18n.language]);

  const steps = pattern?.steps ?? [];
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
  const counterValue =
    counterLabel === 'row'
      ? (project?.rowCount ?? 0)
      : counterLabel === 'round'
        ? (project?.roundCount ?? 0)
        : null;

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

  useEffect(() => {
    if (steps.length === 0 || selectedStepIndex <= steps.length - 1) return;

    setSelectedStepIndex(steps.length - 1);
  }, [selectedStepIndex, steps.length]);

  async function updateProject(nextProject: Project) {
    if (!db) return;

    setProject(nextProject);
    await db
      .update(projectsTable)
      .set({
        currentStepIndex: nextProject.currentStepIndex,
        rowCount: nextProject.rowCount,
        roundCount: nextProject.roundCount,
        status: nextProject.status,
        completedAt: nextProject.completedAt,
        updatedAt: new Date(),
      })
      .where(eq(projectsTable.id, nextProject.id));
  }

  async function updateCounter(delta: number) {
    Haptics.selectionAsync();
    if (!project || !counterLabel) return;

    if (counterLabel === 'row') {
      await updateProject({
        ...project,
        rowCount: Math.max(0, project.rowCount + delta),
      });
      return;
    }

    if (counterLabel === 'round') {
      await updateProject({
        ...project,
        roundCount: Math.max(0, project.roundCount + delta),
      });
    }
  }

  async function goToStepIndex(nextIndex: number, animated = true) {
    if (!project || steps.length === 0) return;

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

    await updateProject({
      ...project,
      currentStepIndex: clampedIndex,
    });
  }

  async function settleStepCard(offsetX: number) {
    if (!project || steps.length === 0) return;
    if (isProgrammaticStepScrollRef.current) return;

    const nextIndex = Math.max(
      0,
      Math.min(steps.length - 1, Math.round(offsetX / stepCardSnapInterval)),
    );

    if (nextIndex === currentStepIndex) return;

    triggerNavigationHaptic();
    setSelectedStepIndex(nextIndex);
    await updateProject({
      ...project,
      currentStepIndex: nextIndex,
    });
  }

  async function goToStep(delta: number) {
    await goToStepIndex(currentStepIndex + delta);
  }

  async function finishProject() {
    if (!project) return;

    await updateProject({
      ...project,
      status: 'completed',
      currentStepIndex: steps.length > 0 ? steps.length - 1 : project.currentStepIndex,
      completedAt: new Date(),
    });
    router.replace({
      pathname: '/(projects)/complete/[id]',
      params: { id: String(project.id) },
    });
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: project?.name ?? 'Project',
          headerLargeTitle: false,
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: theme.colors.background,
          },
          ...(Platform.OS === 'ios'
            ? {
                unstable_headerLeftItems: () => [
                  {
                    type: 'button' as const,
                    label: 'Close',
                    icon: { type: 'sfSymbol' as const, name: 'chevron.backward' },
                    onPress: () => router.back(),
                  },
                ],
              }
            : {
                headerLeft: () => (
                  <NavigationHeaderAction
                    label="Close"
                    icon="chevron-left"
                    onPress={() => router.back()}
                  />
                ),
              }),
        }}
      />
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        {isLoading ? (
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: theme.colors.background,
            }}>
            <ActivityIndicator color={theme.colors.primary} />
          </View>
        ) : null}

        {!isLoading && (!project || !pattern) ? (
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              padding: theme.spacing.xl,
              backgroundColor: theme.colors.background,
            }}>
            <View
              style={{
                padding: theme.spacing.lg,
                borderRadius: theme.radius.xl,
                backgroundColor: theme.colors.surface,
                borderWidth: 1,
                borderColor: theme.colors.border,
              }}>
              <Text selectable style={{ color: theme.colors.textSecondary }}>
                Project not found.
              </Text>
            </View>
          </View>
        ) : null}

        {project && pattern ? (
          <>
            <View
              style={{
                paddingHorizontal: theme.spacing.xl,
                paddingTop: theme.spacing.sm,
                paddingBottom: theme.spacing.sm,
                backgroundColor: theme.colors.background,
              }}>
              <PressableScale
                onPress={() => {
                  triggerNavigationHaptic();
                  if (!isPro) {
                    router.push('/(paywalls)');
                    return;
                  }

                  router.push({
                    pathname: '/(projects)/chat/[id]',
                    params: { id: String(project.id) },
                  });
                }}
                style={{
                  paddingVertical: 16,
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingHorizontal: theme.spacing.lg,
                  borderRadius: theme.radius.pill,
                  backgroundColor: theme.colors.primarySoft,
                }}
                accessibilityRole="button">
                <Text
                  style={{
                    fontSize: theme.size.md,
                    fontWeight: theme.weight.semibold,
                    color: theme.colors.primary,
                  }}>
                  {isPro ? 'Ask AI about this step' : 'Unlock AI help'}
                </Text>
              </PressableScale>
            </View>

            <ScrollView
              contentInsetAdjustmentBehavior="automatic"
              style={{
                flex: 1,
                backgroundColor: theme.colors.background,
              }}
              contentContainerStyle={{
                paddingHorizontal: theme.spacing.xl,
                paddingTop: theme.spacing.sm,
                paddingBottom: insets.bottom + 128,
                gap: theme.spacing.lg,
                backgroundColor: theme.colors.background,
              }}>
              {steps.length > 0 ? (
                <Animated.View
                  entering={FadeInDown.duration(180)}
                  exiting={FadeOutUp.duration(140)}
                  style={{ gap: theme.spacing.md }}>
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
                  onMomentumScrollEnd={(event) =>
                    void settleStepCard(event.nativeEvent.contentOffset.x)
                  }
                />
              ) : null}

              {steps.length === 0 ? (
                <View
                  style={{
                    padding: theme.spacing.lg,
                    borderRadius: theme.radius.xl,
                    backgroundColor: theme.colors.surface,
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                  }}>
                  <Text selectable style={{ color: theme.colors.textSecondary }}>
                    This project has no steps yet.
                  </Text>
                </View>
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
                      onPress={() => void updateCounter(-1)}
                      disabled={counterValue === 0}
                    />
                    <CounterValueText value={counterValue} />
                    <CounterButton label="+" onPress={() => void updateCounter(1)} />
                  </View>
                  {currentStep.targetCount ? (
                    <TargetCountText value={currentStep.targetCount} label={counterLabel} />
                  ) : null}
                </Animated.View>
              ) : null}
            </ScrollView>
          </>
        ) : null}

        {project && pattern ? (
          <StepNavigationBar
            currentStepIndex={currentStepIndex}
            stepCount={steps.length}
            bottomInset={insets.bottom}
            onPrevious={() => void goToStep(-1)}
            onNext={() => void goToStep(1)}
            onComplete={() => void finishProject()}
          />
        ) : null}
      </View>
    </>
  );
}
