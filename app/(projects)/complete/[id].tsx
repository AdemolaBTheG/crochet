import { PressableScale } from '@/components/pressable-scale';
import { getPatternImageSource } from '@/constants/pattern-images';
import { theme } from '@/constants/Theme';
import { projects as projectsTable, type Project } from '@/db/schema';
import { usePatternDetail } from '@/hooks/use-pattern-detail';
import { complete, cta, tap } from '@/services/haptics';
import { useDbStore } from '@/stores/dbStore';
import { askForReview } from '@/utils/review';
import { eq } from 'drizzle-orm';
import { isLiquidGlassAvailable } from 'expo-glass-effect';
import { Image } from 'expo-image';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import LoadingShimmer from '@/components/shimmer/loading-shimmer';
import { ScrollView, Text, View } from 'react-native';
import { Confetti } from 'react-native-fast-confetti';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  const { t, i18n } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { db } = useDbStore();
  const [project, setProject] = useState<Project | null>(null);
  const [patternSlug, setPatternSlug] = useState<string | null>(null);
  const [isLoadingProject, setIsLoadingProject] = useState(true);
  const [isCreatingAnother, setIsCreatingAnother] = useState(false);
  const didRequestReviewRef = useRef(false);
  const didPlayCompletionHapticRef = useRef(false);
  const projectId = Number(id);

  useEffect(() => {
    let isMounted = true;

    async function loadProject() {
      if (!db || !Number.isFinite(projectId)) return;

      setIsLoadingProject(true);

      try {
        const projectResult = await db
          .select()
          .from(projectsTable)
          .where(eq(projectsTable.id, projectId))
          .limit(1);
        const projectRow = projectResult[0] ?? null;

        if (isMounted) {
          setProject(projectRow);
          setPatternSlug(projectRow?.patternSlug ?? null);
        }
      } finally {
        if (isMounted) {
          setIsLoadingProject(false);
        }
      }
    }

    void loadProject();

    return () => {
      isMounted = false;
    };
  }, [db, projectId]);

  const { data: pattern, isLoading: isPatternLoading } = usePatternDetail(
    patternSlug ?? undefined,
    i18n.language,
  );
  const isLoading = isLoadingProject || isPatternLoading;

  const steps = pattern?.steps ?? [];
  const counterSummary =
    project && project.roundCount > 0
      ? `${project.roundCount} rounds`
      : project && project.rowCount > 0
        ? `${project.rowCount} rows`
        : t('projectComplete.done');
  const completedText = formatCompletedDate(project?.completedAt ?? null, t);
  const imageSource = project?.coverImageKey
    ? getPatternImageSource(project.coverImageKey)
    : undefined;

  useEffect(() => {
    if (!project || didPlayCompletionHapticRef.current) return;
    if (project.status !== 'completed') return;

    didPlayCompletionHapticRef.current = true;
    complete();
  }, [project]);

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
    cta();

    setIsCreatingAnother(true);

    try {
      const createdProject = await db
        .insert(projectsTable)
        .values({
          patternId: pattern.id,
          patternSlug: pattern.slug,
          coverImageKey: pattern.coverImageKey,
          stepsJson: JSON.stringify(pattern.steps),
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
    tap();
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
          <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: theme.spacing['3xl'] }}>
            <LoadingShimmer centered={false} />
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
