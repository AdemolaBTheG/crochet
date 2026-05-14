import { theme } from '@/constants/Theme';
import { isLessonFree } from '@/constants/gates';
import { useSubscription } from '@/context/SubscriptionContext';
import { lessons as lessonsTable, type Lesson } from '@/db/schema';
import { resolveLessonTranslation, type ResolvedLesson } from '@/db/translations';
import { logFirebaseEvent } from '@/services/firebaseAnalytics';
import { useDbStore } from '@/stores/dbStore';
import { askForReview } from '@/utils/review';
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
import { isLiquidGlassAvailable } from 'expo-glass-effect';
import * as Haptics from 'expo-haptics';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
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

function ProgressBar({ progress }: { progress: SharedValue<number> }) {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: progress.value }],
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
      <Host
        matchContents
        useViewportSizeMeasurement
        style={{ width: 86, height: 24, alignSelf: 'flex-end' }}>
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

function PracticeStepCard({
  step,
  index,
  cardWidth,
  snapInterval,
  scrollX,
}: {
  step: string;
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
          padding: theme.spacing.lg,
          gap: theme.spacing.md,
          borderRadius: theme.radius.xl,
          borderCurve: 'continuous',
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
        Practice Step {index + 1}
      </Text>
      <Text
        selectable
        style={{
          fontSize: theme.size.lg,
          fontWeight: theme.weight.semibold,
          lineHeight: theme.size['2xl'] + 8,
          color: theme.colors.textPrimary,
        }}>
        {step}
      </Text>
      <Text
        selectable
        style={{
          fontSize: theme.size.md,
          lineHeight: theme.size.md + 7,
          color: theme.colors.textSecondary,
        }}>
        Work this slowly before moving on. If it feels off, repeat this step once more.
      </Text>
    </Animated.View>
  );
}

function PracticeNavigationBar({
  currentStepIndex,
  stepCount,
  bottomInset,
  onPrevious,
  onNext,
  onFinish,
}: {
  currentStepIndex: number;
  stepCount: number;
  bottomInset: number;
  onPrevious: () => void;
  onNext: () => void;
  onFinish: () => void;
}) {
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex >= stepCount - 1;

  function handlePreviousPress() {
    triggerNavigationHaptic();
    onPrevious();
  }

  function handlePrimaryPress() {
    triggerNavigationHaptic();

    if (isLastStep) {
      onFinish();
      return;
    }

    onNext();
  }

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
            {isLastStep ? 'Finish Practice' : 'Next'}
          </Animated.Text>
        </AnimatedPressable>
      </Animated.View>
    </View>
  );
}

export default function LessonPracticeScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { db } = useDbStore();
  const { isPro } = useSubscription();
  const { i18n } = useTranslation();
  const stepListRef = useRef<FlatList<string>>(null);
  const hasPositionedStepListRef = useRef(false);
  const isProgrammaticStepScrollRef = useRef(false);
  const [resolvedLesson, setResolvedLesson] = useState<ResolvedLesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStepIndex, setSelectedStepIndex] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function loadLesson() {
      if (!db || !slug) return;

      setIsLoading(true);

      try {
        const result = await db
          .select()
          .from(lessonsTable)
          .where(eq(lessonsTable.slug, slug))
          .limit(1);

        const baseLesson = result[0] ?? null;

        if (isMounted && baseLesson) {
          const resolved = await resolveLessonTranslation(
            db,
            baseLesson,
            i18n.language,
          );
          setResolvedLesson(resolved);
          setSelectedStepIndex(0);
          hasPositionedStepListRef.current = false;
        } else if (isMounted) {
          setResolvedLesson(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadLesson();

    return () => {
      isMounted = false;
    };
  }, [db, slug, i18n.language]);

  useEffect(() => {
    if (!resolvedLesson || isPro || isLessonFree(resolvedLesson)) return;

    router.replace('/(paywalls)');
  }, [isPro, resolvedLesson, router]);

  const steps = resolvedLesson?.content.steps ?? [];
  const content = resolvedLesson?.content;
  const currentStepIndex = Math.min(selectedStepIndex, Math.max(steps.length - 1, 0));
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

  function goToStepIndex(nextIndex: number, animated = true) {
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

  function settleStepCard(offsetX: number) {
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

  async function finishPractice() {
    if (resolvedLesson) {
      void logFirebaseEvent('lesson_complete', {
        lesson_slug: resolvedLesson.slug,
        lesson_title: resolvedLesson.title,
        difficulty: resolvedLesson.difficulty,
      });
    }

    await askForReview({ source: 'lesson-practice-complete' });
    router.back();
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: resolvedLesson?.title ? `${resolvedLesson.title} Practice` : 'Practice',
          headerLargeTitle: false,
          headerShadowVisible: false,
          headerTransparent: isLiquidGlassAvailable(),
          headerStyle: {
            backgroundColor: isLiquidGlassAvailable() ? 'transparent' : theme.colors.background,
          },
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

        {!isLoading && !resolvedLesson ? (
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
                Lesson not found.
              </Text>
            </View>
          </View>
        ) : null}

        {resolvedLesson ? (
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
                <ProgressBar progress={stepCardProgress} />
              </Animated.View>
            ) : null}

            {steps.length > 0 ? (
              <Animated.FlatList
                ref={stepListRef}
                data={steps}
                horizontal
                keyExtractor={(item, index) => `${item}-${index}`}
                renderItem={({ item, index }) => (
                  <PracticeStepCard
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
                onMomentumScrollEnd={(event) => settleStepCard(event.nativeEvent.contentOffset.x)}
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
                  This lesson has no practice steps yet.
                </Text>
              </View>
            ) : null}
          </ScrollView>
        ) : null}

        {resolvedLesson ? (
          <PracticeNavigationBar
            currentStepIndex={currentStepIndex}
            stepCount={steps.length}
            bottomInset={insets.bottom}
            onPrevious={() => goToStepIndex(currentStepIndex - 1)}
            onNext={() => goToStepIndex(currentStepIndex + 1)}
            onFinish={() => void finishPractice()}
          />
        ) : null}
      </View>
    </>
  );
}
