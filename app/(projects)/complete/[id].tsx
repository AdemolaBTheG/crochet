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
import { askForReview } from '@/utils/review';
import { eq } from 'drizzle-orm';
import { isLiquidGlassAvailable } from 'expo-glass-effect';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { Confetti } from 'react-native-fast-confetti';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
type PatternStep = {
  type?: 'instruction' | 'row' | 'round' | 'repeat';
  title: string;
  instruction: string;
  counterLabel?: string;
  targetCount?: number;
};

function parseSteps(stepsJson: string | null) {
  if (!stepsJson) return [];

  try {
    return JSON.parse(stepsJson) as PatternStep[];
  } catch {
    return [];
  }
}

function formatCompletedDate(
  date: Date | null,
  t: (key: string, options?: Record<string, unknown>) => string,
) {
  if (!date) return t('projectComplete.finishedJustNow');

  return t('projectComplete.finishedOn', {
    date: new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date),
  });
}

function CompletionStat({ label, value }: { label: string; value: string }) {
  return (
    <View
      style={{
        flex: 1,
        paddingVertical: theme.spacing.xl,
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing.md,
        borderRadius: theme.radius.xl,
        borderCurve: 'continuous',
        backgroundColor: theme.colors.surface,
        gap: theme.spacing.xs,
      }}>
      <Text
        selectable
        style={{
          fontSize: theme.size.xl,
          fontWeight: theme.weight.bold,
          color: theme.colors.textPrimary,
          fontVariant: ['tabular-nums'],
        }}>
        {value}
      </Text>
      <Text
        selectable
        style={{
          fontSize: theme.size.sm,
          fontWeight: theme.weight.medium,
          color: theme.colors.textSecondary,
          textAlign: 'center',
        }}>
        {label}
      </Text>
    </View>
  );
}

export default function ProjectCompleteScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { db } = useDbStore();
  const [project, setProject] = useState<Project | null>(null);
  const [pattern, setPattern] = useState<Pattern | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingAnother, setIsCreatingAnother] = useState(false);
  const didRequestReviewRef = useRef(false);
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
  const counterSummary =
    project && project.roundCount > 0
      ? `${project.roundCount} rounds`
      : project && project.rowCount > 0
        ? `${project.rowCount} rows`
        : t('projectComplete.done');
  const completedText = formatCompletedDate(project?.completedAt ?? null, t);
  const imageSource = pattern ? patternImages[pattern.coverImageKey as PatternImageKey] : undefined;

  useEffect(() => {
    if (!project || !pattern || didRequestReviewRef.current) return;
    if (project.status !== 'completed') return;

    didRequestReviewRef.current = true;
    const timeout = setTimeout(() => {
      void askForReview({ source: 'project-complete' });
    }, 1400);

    return () => clearTimeout(timeout);
  }, [pattern, project]);

  async function createAnotherProject() {
    if (!db || !pattern || isCreatingAnother) return;

    if (process.env.EXPO_OS === 'ios') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    setIsCreatingAnother(true);

    try {
      const createdProject = await db
        .insert(projectsTable)
        .values({
          patternId: pattern.id,
          name: pattern.title,
          status: 'active',
        })
        .returning();
      const nextProject = createdProject[0];

      if (!nextProject) return;

      router.replace({
        pathname: '/(projects)/[id]',
        params: { id: String(nextProject.id) },
      });
    } finally {
      setIsCreatingAnother(false);
    }
  }

  function goToProjects() {
    if (process.env.EXPO_OS === 'ios') {
      void Haptics.selectionAsync();
    }

    router.replace('/(tabs)/(projects)');
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: t('projectComplete.title'),
          headerLargeTitle: false,
          headerTransparent: isLiquidGlassAvailable(),
          headerStyle: {
            backgroundColor: isLiquidGlassAvailable() ? 'transparent' : theme.colors.background,
          },
        }}
      />
      <Confetti />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={{ flex: 1, backgroundColor: theme.colors.background }}
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          padding: theme.spacing.xl,
          paddingBottom: insets.bottom + theme.spacing['2xl'],
          gap: theme.spacing.xl,
          backgroundColor: theme.colors.background,
        }}>
        {isLoading ? (
          <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator color={theme.colors.primary} />
          </View>
        ) : null}

        {!isLoading && (!project || !pattern) ? (
          <View
            style={{
              padding: theme.spacing.lg,
              borderRadius: theme.radius.xl,
              backgroundColor: theme.colors.surface,
              borderWidth: 1,
              borderColor: theme.colors.border,
            }}>
            <Text selectable style={{ color: theme.colors.textSecondary }}>
              {t('projectComplete.notFound')}
            </Text>
          </View>
        ) : null}

        {project && pattern ? (
          <>
            <Animated.View
              entering={FadeInDown.duration(220)}
              style={{
                alignItems: 'center',
                gap: theme.spacing.lg,
              }}>
              {imageSource ? (
                <Image
                  source={imageSource}
                  contentFit="cover"
                  style={{
                    width: 132,
                    height: 168,
                    borderRadius: theme.radius.xl,
                  }}
                />
              ) : null}

              <View style={{ alignItems: 'center', gap: theme.spacing.sm }}>
                <Text
                  selectable
                  style={{
                    fontSize: theme.size['3xl'],
                    fontWeight: theme.weight.bold,
                    color: theme.colors.textPrimary,
                    textAlign: 'center',
                  }}>
                  {project.name}
                </Text>
                <Text
                  selectable
                  style={{
                    fontSize: theme.size.md,
                    color: theme.colors.textSecondary,
                    textAlign: 'center',
                  }}>
                  {completedText}
                </Text>
              </View>
            </Animated.View>

            <Animated.View
              entering={FadeInDown.delay(80).duration(220)}
              style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
              <CompletionStat
                label={t('projectComplete.stepsDone')}
                value={
                  steps.length > 0 ? `${steps.length}/${steps.length}` : t('projectComplete.done')
                }
              />
              <CompletionStat label={t('projectComplete.counter')} value={counterSummary} />
            </Animated.View>

            <Animated.View
              entering={FadeInDown.delay(140).duration(220)}
              style={{ gap: theme.spacing.sm }}>
              <PressableScale
                onPress={goToProjects}
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingHorizontal: theme.spacing.lg,
                  paddingVertical: theme.spacing.lg,
                  borderRadius: theme.radius.pill,
                  backgroundColor: theme.colors.primary,
                }}
                accessibilityRole="button">
                <Text
                  style={{
                    fontSize: theme.size.md,
                    fontWeight: theme.weight.semibold,
                    color: theme.colors.white,
                  }}>
                  {t('projectComplete.backToProjects')}
                </Text>
              </PressableScale>

              <PressableScale
                onPress={() => void createAnotherProject()}
                disabled={isCreatingAnother}
                style={{
                  paddingVertical: theme.spacing.lg,
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingHorizontal: theme.spacing.lg,
                  borderRadius: theme.radius.pill,
                  backgroundColor: theme.colors.surface,
                }}
                accessibilityRole="button">
                <Text
                  style={{
                    fontSize: theme.size.md,
                    fontWeight: theme.weight.semibold,
                    color: isCreatingAnother ? theme.colors.textTertiary : theme.colors.textPrimary,
                  }}>
                  {isCreatingAnother
                    ? t('projectComplete.starting')
                    : t('projectComplete.makeAnother')}
                </Text>
              </PressableScale>
            </Animated.View>
          </>
        ) : null}
      </ScrollView>
    </>
  );
}
