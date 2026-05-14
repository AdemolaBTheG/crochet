import { PressableScale } from '@/components/pressable-scale';
import { theme } from '@/constants/Theme';
import { isLessonFree } from '@/constants/gates';
import { useSubscription } from '@/context/SubscriptionContext';
import { lessons as lessonsTable, type Lesson } from '@/db/schema';
import { resolveLessonTranslation, type ResolvedLesson } from '@/db/translations';
import { useDbStore } from '@/stores/dbStore';
import { Host, Button as SwiftUIButton } from '@expo/ui/swift-ui';
import { buttonStyle, controlSize, tint } from '@expo/ui/swift-ui/modifiers';
import Ionicons from '@expo/vector-icons/Ionicons';
import { eq } from 'drizzle-orm';
import { isLiquidGlassAvailable } from 'expo-glass-effect';
import * as Haptics from 'expo-haptics';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <Text
      selectable
      style={{
        fontSize: theme.size.lg,
        fontWeight: theme.weight.semibold,
        color: theme.colors.textPrimary,
      }}>
      {children}
    </Text>
  );
}

function WhiteCard({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.ComponentProps<typeof View>['style'];
}) {
  return (
    <View
      style={[
        {
          padding: theme.spacing.lg,
          borderRadius: theme.radius.xl,
          borderCurve: 'continuous',
          backgroundColor: theme.colors.surface,
          gap: theme.spacing.md,
        },
        style,
      ]}>
      {children}
    </View>
  );
}

function MetaStatCard({
  icon,
  label,
  value,
  size,
}: {
  icon: React.ComponentProps<typeof SymbolView>['name'];
  label: string;
  value: string;
  size: number;
}) {
  return (
    <WhiteCard
      style={{
        width: size,
        height: size,
        padding: theme.spacing.sm,
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.spacing.xs,
      }}>
      <SymbolView
        name={icon}
        size={28}
        weight="semibold"
        tintColor={theme.colors.primary}
        fallback={<View style={{ width: 30, height: 30 }} />}
      />
      <Text
        selectable
        numberOfLines={2}
        adjustsFontSizeToFit
        minimumFontScale={0.82}
        style={{
          fontSize: theme.size.md,
          fontWeight: theme.weight.bold,
          color: theme.colors.textPrimary,
          textAlign: 'center',
        }}>
        {value}
      </Text>
      <Text
        selectable
        numberOfLines={1}
        style={{
          fontSize: theme.size.tiny,
          fontWeight: theme.weight.semibold,
          color: theme.colors.textTertiary,
          textTransform: 'uppercase',
          textAlign: 'center',
        }}>
        {label}
      </Text>
    </WhiteCard>
  );
}

function LessonStepCard({ step, stepLabel }: { step: string; stepLabel: string }) {
  return (
    <WhiteCard>
      <Text
        selectable
        style={{
          fontSize: theme.size.sm,
          fontWeight: theme.weight.bold,
          color: theme.colors.primary,
          textTransform: 'uppercase',
          letterSpacing: 0.6,
        }}>
        {stepLabel}
      </Text>
      <Text
        selectable
        style={{
          fontSize: theme.size.md,
          lineHeight: theme.size.md + 7,
          color: theme.colors.textPrimary,
        }}>
        {step}
      </Text>
    </WhiteCard>
  );
}

function MistakePill({ mistake }: { mistake: string }) {
  return (
    <View
      style={{
        paddingVertical: theme.spacing.xs + 2,
        gap: theme.spacing.xs,
        flexDirection: 'row',
        alignItems: 'center',
      }}>
      <Ionicons name="ellipse" size={12} color={theme.colors.primary} />
      <Text
        selectable
        style={{
          fontSize: theme.size.md,
          fontWeight: theme.weight.medium,
          color: theme.colors.textPrimary,
        }}>
        {mistake}
      </Text>
    </View>
  );
}

function formatDifficulty(
  difficulty: string,
  t: (key: string, options?: Record<string, unknown>) => string,
) {
  const normalized = difficulty.toLowerCase();
  const map: Record<string, string> = {
    beginner: t('lessonDetail.difficultyValues.beginner'),
    intermediate: t('lessonDetail.difficultyValues.intermediate'),
    advanced: t('lessonDetail.difficultyValues.advanced'),
  };

  return map[normalized] ?? difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
}

export default function LessonDetailScreen() {
  const { t, i18n } = useTranslation();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const { db } = useDbStore();
  const { isPro } = useSubscription();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [lesson, setLesson] = useState<ResolvedLesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const contentPadding = theme.spacing.xl;
  const metaGap = theme.spacing.sm;
  const metaCardSize = Math.floor((width - contentPadding * 2 - metaGap * 2) / 3);
  const ctaWidth = Math.min(width - contentPadding * 2, 236);
  const liquidGlassAvailable = useMemo(() => isLiquidGlassAvailable(), []);

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
          setLesson(resolved);
        } else if (isMounted) {
          setLesson(null);
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
    if (!lesson || isPro || isLessonFree(lesson)) return;

    router.replace('/(paywalls)');
  }, [isPro, lesson, router]);

  const content = lesson?.content;
  const steps = content?.steps ?? [];
  const mistakes = content?.commonMistakes ?? [];
  const ctaModifiers = useMemo(
    () => [
      buttonStyle(liquidGlassAvailable ? 'glassProminent' : 'borderedProminent'),
      controlSize('large'),
      tint(theme.colors.primary),
    ],
    [liquidGlassAvailable],
  );

  function handleStartPractice() {
    if (process.env.EXPO_OS === 'ios') {
      void Haptics.selectionAsync();
    }

    router.push({
      pathname: '/(lessons)/practice/[slug]',
      params: { slug },
    });
  }

  return (
    <>
      <Stack.Screen options={{ title: lesson?.title ?? t('lessonDetail.lesson') }} />
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          style={{ backgroundColor: theme.colors.background }}
          contentContainerStyle={{
            padding: contentPadding,
            paddingBottom: insets.bottom + 2 * theme.spacing.xl,
            gap: theme.spacing.lg,
            backgroundColor: theme.colors.background,
          }}>
          {isLoading ? (
            <View style={{ paddingVertical: theme.spacing['3xl'], alignItems: 'center' }}>
              <ActivityIndicator color={theme.colors.primary} />
            </View>
          ) : null}

          {!isLoading && !lesson ? (
            <WhiteCard>
              <Text selectable style={{ color: theme.colors.textSecondary }}>
                {t('lessonDetail.notFound')}
              </Text>
            </WhiteCard>
          ) : null}

          {lesson ? (
            <>
              <View style={{ gap: theme.spacing.sm }}>
                <Text
                  selectable
                  style={{
                    fontSize: theme.size.lg,
                    lineHeight: theme.size.lg + 6,
                    color: theme.colors.textSecondary,
                  }}>
                  {content?.summary ?? lesson.description}
                </Text>
              </View>

              <View style={{ flexDirection: 'row', gap: metaGap, justifyContent: 'center' }}>
                <MetaStatCard
                  icon={{ ios: 'dial.medium.fill', android: 'tune', web: 'tune' }}
                  label={t('lessonDetail.difficulty')}
                  value={formatDifficulty(lesson.difficulty, t)}
                  size={metaCardSize}
                />
                <MetaStatCard
                  icon={{
                    ios: 'list.number',
                    android: 'format_list_numbered',
                    web: 'format_list_numbered',
                  }}
                  label={t('lessonDetail.steps')}
                  value={`${steps.length}`}
                  size={metaCardSize}
                />
                <MetaStatCard
                  icon={{ ios: 'clock.fill', android: 'schedule', web: 'schedule' }}
                  label={t('lessonDetail.practice')}
                  value={t('lessonDetail.practicePaceShort')}
                  size={metaCardSize}
                />
              </View>

              {content?.whyItMatters ? (
                <View style={{ gap: theme.spacing.sm + 2 }}>
                  <SectionTitle>{t('lessonDetail.whyItMatters')}</SectionTitle>
                  <WhiteCard>
                    <Text
                      selectable
                      style={{
                        fontSize: theme.size.md,
                        lineHeight: theme.size.md + 7,
                        color: theme.colors.textSecondary,
                      }}>
                      {content.whyItMatters}
                    </Text>
                  </WhiteCard>
                </View>
              ) : null}

              {steps.length > 0 ? (
                <View style={{ gap: theme.spacing.sm + 2 }}>
                  <SectionTitle>{t('lessonDetail.steps')}</SectionTitle>
                  <View style={{ gap: theme.spacing.md }}>
                    {steps.map((step, index) => (
                      <LessonStepCard
                        key={`${step}-${index}`}
                        step={step}
                        stepLabel={t('common.steps.stepOnly', { current: index + 1 })}
                      />
                    ))}
                  </View>
                </View>
              ) : null}

              {content?.practice ? (
                <View style={{ gap: theme.spacing.sm + 2 }}>
                  <SectionTitle>{t('lessonDetail.practice')}</SectionTitle>
                  <WhiteCard>
                    <Text
                      selectable
                      style={{
                        fontSize: theme.size.md,
                        lineHeight: theme.size.md + 7,
                        color: theme.colors.textSecondary,
                      }}>
                      {content.practice}
                    </Text>
                  </WhiteCard>
                </View>
              ) : null}

              {mistakes.length > 0 ? (
                <View style={{ gap: theme.spacing.sm + 2 }}>
                  <SectionTitle>{t('lessonDetail.commonMistakes')}</SectionTitle>
                  <WhiteCard>
                    <View style={{ flexDirection: 'column', gap: theme.spacing.sm }}>
                      {mistakes.map((mistake) => (
                        <MistakePill key={mistake} mistake={mistake} />
                      ))}
                    </View>
                  </WhiteCard>
                </View>
              ) : null}
            </>
          ) : null}
        </ScrollView>

        {lesson && content?.practice ? (
          process.env.EXPO_OS === 'ios' ? (
            <Host
              matchContents={false}
              style={{
                position: 'absolute',
                bottom: insets.bottom + 24,
                left: (width - ctaWidth) / 2,
                width: ctaWidth,
                height: 56,
              }}>
              <SwiftUIButton
                label={t('lessonDetail.startPractice')}
                onPress={handleStartPractice}
                modifiers={ctaModifiers}
              />
            </Host>
          ) : (
            <View
              style={{
                position: 'absolute',
                bottom: insets.bottom + 24,
                left: (width - ctaWidth) / 2,
                width: ctaWidth,
                height: 56,
              }}>
              <PressableScale
                onPress={handleStartPractice}
                accessibilityRole="button"
                accessibilityLabel={t('lessonDetail.startPractice')}
                style={{
                  flex: 1,
                  minHeight: 56,
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingHorizontal: theme.spacing.lg,
                  borderRadius: theme.radius.pill,
                  backgroundColor: theme.colors.primary,
                }}>
                <Text
                  selectable={false}
                  style={{
                    fontSize: theme.size.md,
                    fontWeight: theme.weight.semibold,
                    color: theme.colors.white,
                  }}>
                  {t('lessonDetail.startPractice')}
                </Text>
              </PressableScale>
            </View>
          )
        ) : null}
      </View>
    </>
  );
}
