import { PressableScale } from '@/components/pressable-scale';
import { theme } from '@/constants/Theme';
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
import * as Haptics from 'expo-haptics';
import React, { useEffect, useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  Extrapolation,
  FadeInDown,
  FadeInLeft,
  FadeOutRight,
  LinearTransition,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import type { ProjectChatStep } from './project-chat';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const buttonLayoutTransition = LinearTransition.duration(180);
const stepCardLayoutTransition = LinearTransition.duration(200);
const previousButtonEntering = FadeInLeft.duration(180);
const previousButtonExiting = FadeOutRight.duration(140);

export function triggerNavigationHaptic() {
  if (process.env.EXPO_OS === 'ios') {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
}

export function CounterButton({
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

export function ProgressBar({
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

export function StepProgressLabel({
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

export function CounterValueText({ value }: { value: number }) {
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

export function TargetCountText({ value, label }: { value: number; label: string }) {
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

export function getStepKicker(step: ProjectChatStep, index: number) {
  const stepLabel = `Step ${index + 1}`;

  if (step.counterLabel === 'round' || step.type === 'round') {
    return `${stepLabel} / Round`;
  }

  if (step.counterLabel === 'row' || step.type === 'row') {
    return `${stepLabel} / Row`;
  }

  return stepLabel;
}

export function StepInstructionCard({
  step,
  index,
  cardWidth,
  snapInterval,
  scrollX,
}: {
  step: ProjectChatStep;
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

export function StepNavigationBar({
  currentStepIndex,
  stepCount,
  bottomInset,
  onPrevious,
  onNext,
  onComplete,
  previousLabel = 'Previous',
  nextLabel = 'Next',
  completeLabel = 'Complete',
}: {
  currentStepIndex: number;
  stepCount: number;
  bottomInset: number;
  onPrevious: () => void;
  onNext: () => void;
  onComplete: () => void;
  previousLabel?: string;
  nextLabel?: string;
  completeLabel?: string;
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
              {previousLabel}
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
            key={`${isLastStep}`}
            style={{
              fontSize: theme.size.md,
              fontWeight: theme.weight.semibold,
              color: stepCount === 0 ? theme.colors.textTertiary : theme.colors.white,
            }}>
            {isLastStep ? completeLabel : nextLabel}
          </Animated.Text>
        </AnimatedPressable>
      </Animated.View>
    </View>
  );
}
