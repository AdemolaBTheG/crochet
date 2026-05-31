import { PressableScale } from '@/components/pressable-scale';
import { AnimatedCount } from '@/components/wheel-picker/components/animated-count';
import { DraggableSlider } from '@/components/wheel-picker/components/draggable-slider';
import { theme } from '@/constants/Theme';
import { cta, tap } from '@/services/haptics';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { router, useLocalSearchParams } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, runOnJS, useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const GOAL_MINUTES = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60] as const;
const LINES_AMOUNT = GOAL_MINUTES.length - 1;
const DEFAULT_GOAL_MINUTES = 15;

function getGoalIndex(minutes: number | null) {
  const resolvedMinutes = minutes ?? DEFAULT_GOAL_MINUTES;
  const matchedIndex = GOAL_MINUTES.findIndex((value) => value === resolvedMinutes);
  return matchedIndex >= 0 ? matchedIndex : GOAL_MINUTES.indexOf(DEFAULT_GOAL_MINUTES);
}

export default function DailyGoalScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { dailyGoalMinutes, setDailyGoalMinutes } = useOnboardingStore();
  const params = useLocalSearchParams<{ mode?: string; returnTo?: string }>();
  const isEditMode = params.mode === 'edit';
  const returnTo = typeof params.returnTo === 'string' ? params.returnTo : '/goal';

  const initialIndex = useMemo(() => getGoalIndex(dailyGoalMinutes), [dailyGoalMinutes]);
  const [selectedMinutes, setSelectedMinutes] = useState<number>(GOAL_MINUTES[initialIndex]);

  const progress = useSharedValue(initialIndex / LINES_AMOUNT);
  const previousLineIndex = useSharedValue(initialIndex);
  const animatedMinutes = useSharedValue<number>(GOAL_MINUTES[initialIndex]);

  function updateSelectedMinutes(minutes: number) {
    setSelectedMinutes(minutes);
  }

  function handleContinue() {
    setDailyGoalMinutes(selectedMinutes);
    cta();
    if (isEditMode) {
      router.replace(returnTo as '/goal');
      return;
    }
    router.replace('/(onboarding)/yearly-goal');
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
          flexGrow: 1,
          gap: theme.spacing.xl,
        }}>
        <Animated.View entering={FadeInDown.duration(220)} style={styles.progressWrap}>
          {!isEditMode ? (
            <>
              <Text selectable={false} style={styles.progressLabel}>
                {t('onboarding.dailyGoal.stepOf', { current: 4, total: 5 })}
              </Text>
              <View style={styles.progressTrack}>
                <View style={styles.progressFill} />
              </View>
            </>
          ) : null}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(50).duration(220)} style={styles.hero}>
          <View style={styles.badge}>
            <SymbolView
              name={{ ios: 'flame.fill', android: 'local_fire_department', web: 'local_fire_department' }}
              size={22}
              weight="semibold"
              tintColor={theme.colors.primary}
              fallback={<View style={styles.badgeFallback} />}
            />
          </View>

          <View style={styles.heroTextWrap}>
            <Text selectable style={styles.title}>
              {t('onboarding.dailyGoal.title')}
            </Text>
            <Text selectable style={styles.subtitle}>
              {t('onboarding.dailyGoal.subtitle')}
            </Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(100).duration(220)} style={styles.goalSection}>
          <Text selectable style={styles.cardEyebrow}>
            {t('onboarding.dailyGoal.eyebrow')}
          </Text>

          <View style={styles.minutesRow}>
            <AnimatedCount
              count={animatedMinutes}
              maxDigits={2}
              textDigitWidth={42}
              textDigitHeight={72}
              fontSize={58}
              color={theme.colors.textPrimary}
            />
            <Text selectable style={styles.minutesLabel}>
              {t('onboarding.dailyGoal.minutesSuffix')}
            </Text>
          </View>

          <Text selectable style={styles.helperText}>
            {t('onboarding.dailyGoal.helper', { minutes: selectedMinutes })}
          </Text>

          <View style={styles.sliderWrap}>
            <View style={styles.sliderInner}>
              <DraggableSlider
                viewportWidth={280}
                initialProgress={initialIndex / LINES_AMOUNT}
                scrollableAreaHeight={140}
                spacePerLine={28}
                showBoundaryGradient
                boundaryColor={theme.colors.background}
                bigLineIndexOffset={3}
                snapEach={1}
                linesAmount={LINES_AMOUNT}
                maxLineHeight={28}
                minLineHeight={12}
                lineColor={theme.colors.borderStrong}
                bigLineColor={theme.colors.primaryBorder}
                onProgressChange={(sliderProgress) => {
                  'worklet';
                  if (sliderProgress < 0) return;

                  const currentLineIndex = Math.max(
                    0,
                    Math.min(LINES_AMOUNT, Math.round(sliderProgress * LINES_AMOUNT)),
                  );

                  if (currentLineIndex !== previousLineIndex.value) {
                    previousLineIndex.value = currentLineIndex;
                    animatedMinutes.value = GOAL_MINUTES[currentLineIndex];
                    runOnJS(tap)();
                    runOnJS(updateSelectedMinutes)(GOAL_MINUTES[currentLineIndex]);
                  }

                  progress.value = sliderProgress;
                }}
              />
            </View>
          </View>

          <View style={styles.markerRow}>
            <Text selectable style={styles.markerLabel}>
              {t('onboarding.dailyGoal.minLabel')}
            </Text>
            <Text selectable style={styles.markerLabel}>
              {t('onboarding.dailyGoal.maxLabel')}
            </Text>
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
        <PressableScale onPress={handleContinue} style={styles.ctaButton}>
          <Text selectable={false} style={styles.ctaText}>
            {t('onboarding.dailyGoal.cta')}
          </Text>
        </PressableScale>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    backgroundColor: theme.colors.primarySoft,
    borderColor: theme.colors.primaryBorder,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  badgeFallback: {
    backgroundColor: theme.colors.primary,
    borderRadius: 6,
    height: 12,
    width: 12,
  },
  cardEyebrow: {
    color: theme.colors.textSecondary,
    fontSize: theme.size.md,
    fontWeight: theme.weight.semibold,
    textTransform: 'uppercase',
  },
  ctaButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.pill,
    justifyContent: 'center',
    minHeight: 56,
  },
  ctaText: {
    color: theme.colors.white,
    fontSize: theme.size.lg,
    fontWeight: theme.weight.bold,
  },
  footer: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
  },
  goalSection: {
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingTop: theme.spacing.sm,
  },
  helperText: {
    color: theme.colors.textSecondary,
    fontSize: theme.size.md,
    lineHeight: 20,
    textAlign: 'center',
  },
  hero: {
    gap: theme.spacing.lg,
  },
  heroTextWrap: {
    gap: theme.spacing.sm,
  },
  markerLabel: {
    color: theme.colors.textTertiary,
    fontSize: theme.size.sm,
    fontWeight: theme.weight.medium,
  },
  markerRow: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -theme.spacing.sm,
  },
  minutesLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.size.lg,
    fontWeight: theme.weight.semibold,
    paddingBottom: theme.spacing.sm,
  },
  minutesRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: theme.spacing.sm,
    justifyContent: 'center',
  },
  progressFill: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.pill,
    flex: 1,
  },
  progressLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.size.md,
    fontWeight: theme.weight.semibold,
  },
  progressTrack: {
    backgroundColor: theme.colors.muted,
    borderRadius: theme.radius.pill,
    height: 8,
    overflow: 'hidden',
  },
  progressWrap: {
    gap: theme.spacing.sm,
  },
  screen: {
    backgroundColor: theme.colors.background,
    flex: 1,
  },
  sliderWrap: {
    alignItems: 'center',
    alignSelf: 'stretch',
    justifyContent: 'center',
    marginTop: theme.spacing.sm,
  },
  sliderInner: {
    width: 280,
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.size.lg,
    lineHeight: 26,
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: theme.size['3xl'],
    fontWeight: theme.weight.bold,
    lineHeight: 38,
  },
});
