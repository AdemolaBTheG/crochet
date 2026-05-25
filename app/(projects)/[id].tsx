import { NavigationHeaderAction } from '@/components/navigation-header-action';
import { PressableScale } from '@/components/pressable-scale';
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
import { useSubscription } from '@/context/SubscriptionContext';
import {
  patterns as patternsTable,
  projects as projectsTable,
  type Project,
} from '@/db/schema';
import { resolvePatternTranslation, type ResolvedPattern } from '@/db/translations';
import { cta, tap, warn } from '@/services/haptics';
import { useDbStore } from '@/stores/dbStore';
import { eq } from 'drizzle-orm';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
  type FlatList,
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeOutDown,
  FadeOutUp,
  useAnimatedScrollHandler,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type PatternStep = ProjectChatStep;

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
          setSelectedStepIndex(projectRow?.currentStepIndex ?? 0);
        } else if (isMounted) {
          setProject(projectRow);
          setPattern(null);
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
    tap();
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
              <PressableScale
                onPress={() => {
                  if (!isPro) {
                    warn();
                    router.push('/(paywalls)');
                    return;
                  }

                  cta();
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
