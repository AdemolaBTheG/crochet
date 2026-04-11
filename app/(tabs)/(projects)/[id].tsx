import { PressableScale } from '@/components/pressable-scale';
import { patternImages, type PatternImageKey } from '@/constants/pattern-images';
import { theme } from '@/constants/Theme';
import {
  patterns as patternsTable,
  projects as projectsTable,
  type Pattern,
  type Project,
} from '@/db/schema';
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
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { eq } from 'drizzle-orm';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
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
  LinearTransition,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type PatternStep = {
  type?: 'instruction' | 'row' | 'round' | 'repeat';
  title: string;
  instruction: string;
  counterLabel?: string;
  targetCount?: number;
};

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

  return (
    <Host matchContents style={{ width: 86, height: 24, alignSelf: 'flex-end' }}>
      <SwiftText modifiers={labelModifiers}>
        {currentStep}/{totalSteps} steps
      </SwiftText>
    </Host>
  );
}

function CounterValueText({ value }: { value: number }) {
  const counterModifiers = useMemo(
    () => [
      font({ size: theme.size['3xl'], weight: 'bold', design: 'rounded' }),
      foregroundStyle(theme.colors.textPrimary),
      monospacedDigit(),
      contentTransition('numericText'),
      swiftAnimation(Animation.easeInOut({ duration: 0.18 }), value),
      frame({ minWidth: 104, minHeight: 48, alignment: 'center' }),
    ],
    [value],
  );

  return (
    <Host matchContents={false} style={{ width: 104, height: 48 }}>
      <SwiftText modifiers={counterModifiers}>{value.toString()}</SwiftText>
    </Host>
  );
}

function TargetCountText({ value, label }: { value: number; label: string }) {
  const targetLabel = `${label}${value === 1 ? '' : 's'}`;
  const targetModifiers = useMemo(
    () => [
      font({ size: theme.size.md, weight: 'regular', design: 'rounded' }),
      foregroundStyle(theme.colors.textSecondary),
      monospacedDigit(),
      contentTransition('numericText'),
      swiftAnimation(Animation.easeInOut({ duration: 0.18 }), value),
      frame({ minWidth: 148, minHeight: 24, alignment: 'center' }),
    ],
    [value],
  );

  return (
    <Host matchContents={false} style={{ width: 148, height: 24, alignSelf: 'center' }}>
      <SwiftText modifiers={targetModifiers}>
        Target: {value} {targetLabel}
      </SwiftText>
    </Host>
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
              minHeight: 52,
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
              selectable
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
            minHeight: 52,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: theme.radius.pill,
            backgroundColor: stepCount === 0 ? theme.colors.muted : theme.colors.primary,
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.14)',
          }}
          accessibilityRole="button">
          <Animated.Text
            layout={buttonLayoutTransition}
            selectable
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
  const tabBarHeight = useBottomTabBarHeight();
  const { width } = useWindowDimensions();
  const { db } = useDbStore();
  const stepListRef = useRef<FlatList<PatternStep>>(null);
  const hasPositionedStepListRef = useRef(false);
  const [project, setProject] = useState<Project | null>(null);
  const [pattern, setPattern] = useState<Pattern | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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

        if (isMounted) {
          setProject(projectRow);
          setPattern(patternResult[0] ?? null);
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
  }, [db, projectId]);

  const steps = useMemo(() => parseSteps(pattern?.stepsJson ?? null), [pattern]);
  const currentStepIndex = Math.min(project?.currentStepIndex ?? 0, Math.max(steps.length - 1, 0));
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
  const projectHeaderMeta = useMemo(() => {
    if (!project || !pattern) return '';

    const isDefaultProjectName =
      project.name.trim().toLowerCase() === pattern.title.trim().toLowerCase();

    if (!isDefaultProjectName) {
      return pattern.title;
    }

    return [pattern.category, pattern.difficulty].filter(Boolean).join(' / ');
  }, [pattern, project]);
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
    stepListRef.current?.scrollToOffset({
      offset: nextOffset,
      animated,
    });
    stepCardScrollX.value = withTiming(nextOffset, { duration: 240 });
    stepCardProgress.value = withTiming((clampedIndex + 1) / steps.length, { duration: 240 });

    await updateProject({
      ...project,
      currentStepIndex: clampedIndex,
    });
  }

  async function settleStepCard(offsetX: number) {
    if (!project || steps.length === 0) return;

    const nextIndex = Math.max(
      0,
      Math.min(steps.length - 1, Math.round(offsetX / stepCardSnapInterval)),
    );

    if (nextIndex === currentStepIndex) return;

    triggerNavigationHaptic();
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
      completedAt: new Date(),
    });
    router.back();
  }

  return (
    <>
      <Stack.Screen options={{ title: project?.name ?? 'Project' }} />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={{ backgroundColor: theme.colors.background }}
        contentContainerStyle={{
          padding: theme.spacing.xl,
          paddingBottom: tabBarHeight + insets.bottom + 112,
          gap: theme.spacing.lg,
          backgroundColor: theme.colors.background,
        }}>
        {isLoading ? (
          <View style={{ paddingVertical: theme.spacing['3xl'], alignItems: 'center' }}>
            <ActivityIndicator color={theme.colors.primary} />
          </View>
        ) : null}

        {!isLoading && (!project || !pattern) ? (
          <View
            style={{
              padding: theme.spacing.xl,
              borderRadius: theme.radius.xl,
              backgroundColor: theme.colors.surface,
              borderWidth: 1,
              borderColor: theme.colors.border,
              gap: theme.spacing.sm,
            }}>
            <Text
              selectable
              style={{
                fontSize: theme.size.lg,
                fontWeight: theme.weight.semibold,
                color: theme.colors.textPrimary,
              }}>
              Project not found
            </Text>
            <Text selectable style={{ color: theme.colors.textSecondary }}>
              This project may have been deleted.
            </Text>
          </View>
        ) : null}

        {project && pattern ? (
          <>
            <View style={{ gap: theme.spacing.md }}>
              <View style={{ flexDirection: 'row', gap: theme.spacing.md, alignItems: 'center' }}>
                <Image
                  source={patternImages[pattern.coverImageKey as PatternImageKey]}
                  contentFit="cover"
                  style={{
                    width: 86,
                    height: 108,
                    borderRadius: theme.radius.xl,
                  }}
                />
                <View style={{ flex: 1, gap: theme.spacing.xs }}>
                  <Text
                    selectable
                    style={{
                      fontSize: theme.size['2xl'],
                      fontWeight: theme.weight.semibold,
                      color: theme.colors.textPrimary,
                    }}>
                    {project.name}
                  </Text>
                  {projectHeaderMeta ? (
                    <Text
                      selectable
                      style={{
                        fontSize: theme.size.md,
                        color: theme.colors.textSecondary,
                      }}>
                      {projectHeaderMeta}
                    </Text>
                  ) : null}
                </View>
              </View>
              <StepProgressLabel currentStep={currentStepIndex + 1} totalSteps={steps.length} />
              <ProgressBar progress={progress} animatedProgress={stepCardProgress} />
            </View>

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
            ) : (
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
            )}

            {counterLabel && counterValue !== null ? (
              <Animated.View
                entering={FadeInDown}
                exiting={FadeOutDown}
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
                    onPress={() => {
                      Haptics.selectionAsync();
                      void updateCounter(-1);
                    }}
                    disabled={counterValue === 0}
                  />
                  <CounterValueText value={counterValue} />
                  <CounterButton
                    label="+"
                    onPress={() => {
                      Haptics.selectionAsync();
                      void updateCounter(1);
                    }}
                  />
                </View>
                {currentStep.targetCount ? (
                  <TargetCountText value={currentStep.targetCount} label={counterLabel} />
                ) : null}
              </Animated.View>
            ) : null}
          </>
        ) : null}
      </ScrollView>
      {project && pattern ? (
        <StepNavigationBar
          currentStepIndex={currentStepIndex}
          stepCount={steps.length}
          bottomInset={tabBarHeight}
          onPrevious={() => void goToStep(-1)}
          onNext={() => void goToStep(1)}
          onComplete={() => void finishProject()}
        />
      ) : null}
    </>
  );
}
