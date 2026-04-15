import { theme } from '@/constants/Theme';
import { useOnboardingStore } from '@/stores/onboardingStore';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
    FadeIn,
    FadeOut,
    LinearTransition,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const STEP_DURATION_MS = 900;

function LoadingPulse() {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(withTiming(1, { duration: 1200 }), -1, false);
  }, [progress]);

  const outerRingStyle = useAnimatedStyle(() => {
    const p = progress.value;
    return {
      transform: [{ scale: interpolate(p, [0, 1], [0.72, 1.28]) }],
      opacity: interpolate(p, [0, 1], [0.48, 0]),
    };
  });

  const innerRingStyle = useAnimatedStyle(() => {
    const p = (progress.value + 0.5) % 1;
    return {
      transform: [{ scale: interpolate(p, [0, 1], [0.72, 1.28]) }],
      opacity: interpolate(p, [0, 1], [0.34, 0]),
    };
  });

  return (
    <View style={styles.loaderWrap}>
      <Animated.View style={[styles.loaderRing, outerRingStyle]} />
      <Animated.View style={[styles.loaderRing, innerRingStyle]} />
      <View style={styles.loaderCore} />
    </View>
  );
}

export default function Loader() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { goal, skillLevel, setOnboardingCompleted } = useOnboardingStore();
  const [messageIndex, setMessageIndex] = useState(0);
  const [isReady, setIsReady] = useState(false);

  const messages = useMemo(() => {
    const goalLabel =
      goal === 'learn-basics'
        ? t('onboarding.loader.goalLabels.learnBasics')
        : goal === 'finish-first-project'
          ? t('onboarding.loader.goalLabels.finishFirstProject')
          : goal === 'build-habit'
            ? t('onboarding.loader.goalLabels.buildHabit')
            : t('onboarding.loader.goalLabels.default');

    const skillLabel =
      skillLevel === 'beginner'
        ? t('onboarding.loader.skillLabels.beginner')
        : skillLevel === 'intermediate'
          ? t('onboarding.loader.skillLabels.intermediate')
          : skillLevel === 'advanced'
            ? t('onboarding.loader.skillLabels.advanced')
            : t('onboarding.loader.skillLabels.default');

    return [
      t('onboarding.loader.messages.buildingPlan', { skillLabel }),
      t('onboarding.loader.messages.pickingLessons', { goalLabel }),
      t('onboarding.loader.messages.tracking'),
      t('onboarding.loader.messages.finalizing'),
    ];
  }, [goal, skillLevel, t]);

  useEffect(() => {
    const timer = setInterval(() => {
      setMessageIndex((prev) => {
        if (prev >= messages.length - 1) {
          clearInterval(timer);
          setIsReady(true);
          void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          return prev;
        }

        return prev + 1;
      });
    }, STEP_DURATION_MS);

    return () => clearInterval(timer);
  }, [messages.length]);

  function handleContinue() {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setOnboardingCompleted(true);
    router.replace('/(paywalls)/onboardingPaywall');
  }

  return (
    <View style={styles.screen}>
      <View style={styles.content}>
        {!isReady ? <LoadingPulse /> : null}

        <Animated.View entering={FadeIn.duration(220)} layout={LinearTransition.duration(180)}>
          <Text style={styles.title}>
            {isReady ? t('onboarding.loader.titleReady') : t('onboarding.loader.titlePreparing')}
          </Text>
        </Animated.View>

        <View style={styles.messageWrap}>
          <Animated.Text
            key={messageIndex}
            entering={FadeIn.duration(220)}
            exiting={FadeOut.duration(180)}
            style={styles.message}>
            {messages[messageIndex]}
          </Animated.Text>
        </View>

        <View style={styles.progressTrack}>
          <Animated.View
            layout={LinearTransition.duration(250)}
            style={[
              styles.progressFill,
              { width: `${((messageIndex + 1) / messages.length) * 100}%` },
            ]}
          />
        </View>
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + theme.spacing.md }]}>
        <Pressable
          disabled={!isReady}
          onPress={handleContinue}
          style={[styles.ctaButton, !isReady && styles.ctaButtonDisabled]}>
          <Text style={styles.ctaLabel}>
            {isReady ? t('onboarding.loader.ctaReady') : t('common.preparing')}
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
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
  },
  title: {
    fontSize: theme.size['2xl'],
    lineHeight: 34,
    fontWeight: theme.weight.bold,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  loaderWrap: {
    alignSelf: 'center',
    width: 94,
    height: 94,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderRing: {
    position: 'absolute',
    width: 94,
    height: 94,
    borderRadius: 999,
    borderWidth: 6,
    borderColor: theme.colors.primary,
  },
  loaderCore: {
    width: 32,
    height: 32,
    borderRadius: 999,
    backgroundColor: theme.colors.primary,
    opacity: 0.9,
  },
  messageWrap: {
    minHeight: 28,
    justifyContent: 'center',
  },
  message: {
    fontSize: theme.size.lg,
    color: theme.colors.textSecondary,
    textAlign: 'center',
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
  footer: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },
  ctaButton: {
    minHeight: 56,
    borderRadius: theme.radius.xl,
    borderCurve: 'continuous',
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaButtonDisabled: {
    backgroundColor: theme.colors.textTertiary,
  },
  ctaLabel: {
    fontSize: theme.size.lg,
    fontWeight: theme.weight.semibold,
    color: theme.colors.white,
  },
});
