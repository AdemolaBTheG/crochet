import { FREE_ACTIVE_PROJECT_LIMIT, isPatternFree } from '@/constants/gates';
import { patternImages, type PatternImageKey } from '@/constants/pattern-images';
import { theme } from '@/constants/Theme';
import { useSubscription } from '@/context/SubscriptionContext';
import {
  patterns as patternsTable,
  projects as projectsTable,
  type Pattern,
  type Project,
} from '@/db/schema';
import { useDbStore } from '@/stores/dbStore';
import { Host, Button as SwiftUIButton } from '@expo/ui/swift-ui';
import { buttonStyle, controlSize, disabled, tint } from '@expo/ui/swift-ui/modifiers';
import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { and, eq } from 'drizzle-orm';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { Image } from 'expo-image';
import {
  Link,
  Stack,
  useLocalSearchParams,
  usePreventZoomTransitionDismissal,
  useRouter,
} from 'expo-router';
import { SymbolView } from 'expo-symbols';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type PatternStep = {
  type?: 'instruction' | 'row' | 'round' | 'repeat';
  title: string;
  instruction: string;
  counterLabel?: string;
  targetCount?: number;
};

function DetailCard({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.ComponentProps<typeof View>['style'];
}) {
  const cardStyle = [
    {
      padding: theme.spacing.lg,
      borderRadius: theme.radius.xl,
      borderCurve: 'continuous' as const,
    },
    style,
  ];

  if (isLiquidGlassAvailable()) {
    return (
      <GlassView glassEffectStyle="regular" style={cardStyle}>
        {children}
      </GlassView>
    );
  }

  return (
    <View
      style={[
        {
          backgroundColor: theme.colors.surface,
          borderWidth: 1,
          borderColor: theme.colors.border,
        },
        ...cardStyle,
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
    <DetailCard
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
    </DetailCard>
  );
}

function parseMaterials(materialsText: string | null) {
  if (!materialsText) return [];

  return materialsText
    .split(',')
    .map((item) => item.trim().replace(/\.$/, ''))
    .filter(Boolean);
}

function parseSkills(skillsText: string | null) {
  if (!skillsText) return [];

  return skillsText
    .split(',')
    .map((item) => item.trim().replace(/\.$/, ''))
    .filter(Boolean);
}

function getMaterialIcon(material: string): React.ComponentProps<typeof SymbolView>['name'] {
  const value = material.toLowerCase();

  if (value.includes('yarn')) return 'circle.hexagongrid.fill';
  if (value.includes('hook')) return 'wrench.adjustable.fill';
  if (value.includes('needle')) return 'pin.fill';
  if (value.includes('scissors')) return 'scissors';

  return 'basket.fill';
}

function MaterialPill({ material }: { material: string }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.xs,
        paddingVertical: theme.spacing.xs + 2,
        paddingHorizontal: theme.spacing.md,
        borderRadius: theme.radius.pill,
        backgroundColor: theme.colors.primarySoft,
        borderColor: theme.colors.primaryBorder,
      }}>
      <SymbolView
        name={getMaterialIcon(material)}
        size={15}
        weight="semibold"
        tintColor={theme.colors.primary}
        fallback={
          <View
            style={{
              width: 15,
              height: 15,
              borderRadius: theme.radius.pill,
              backgroundColor: theme.colors.primary,
            }}
          />
        }
      />
      <Text
        selectable
        style={{
          fontSize: theme.size.md,
          fontWeight: theme.weight.medium,
          color: theme.colors.primary,
        }}>
        {material}
      </Text>
    </View>
  );
}

function SkillPill({ skill }: { skill: string }) {
  return (
    <View
      style={{
        paddingVertical: theme.spacing.xs + 2,
        paddingHorizontal: theme.spacing.md,
        borderRadius: theme.radius.pill,
        backgroundColor: theme.colors.primarySoft,
        borderColor: theme.colors.primaryBorder,
      }}>
      <Text
        selectable
        style={{
          fontSize: theme.size.md,
          fontWeight: theme.weight.medium,
          color: theme.colors.primary,
        }}>
        {skill}
      </Text>
    </View>
  );
}

function OverviewStat({ label, value }: { label: string; value: string }) {
  return (
    <View
      style={{
        flex: 1,
        minHeight: 70,
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.spacing.xs,
        padding: theme.spacing.sm,
        borderRadius: theme.radius.lg,
        backgroundColor: theme.colors.muted,
      }}>
      <Text
        selectable
        numberOfLines={1}
        adjustsFontSizeToFit
        style={{
          fontSize: theme.size.lg,
          fontWeight: theme.weight.semibold,
          color: theme.colors.textPrimary,
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
          letterSpacing: 0.4,
        }}>
        {label}
      </Text>
    </View>
  );
}

function ProgressBar({ progress }: { progress: number }) {
  const clampedProgress = Math.max(0, Math.min(progress, 1));
  const animatedProgress = useSharedValue(clampedProgress);

  useEffect(() => {
    animatedProgress.value = withTiming(clampedProgress, { duration: 280 });
  }, [animatedProgress, clampedProgress]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: animatedProgress.value }],
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

function getProjectCounterSummary(
  project: Project | null,
  currentStep: PatternStep | null,
  t: (key: string, options?: Record<string, unknown>) => string,
) {
  if (!project || !currentStep?.counterLabel) return null;

  if (currentStep.counterLabel === 'row') {
    const label = currentStep.targetCount
      ? t('patternDetail.counterRowsTarget', {
          current: project.rowCount,
          target: currentStep.targetCount,
        })
      : t('patternDetail.counterRows', { count: project.rowCount });

    return {
      icon: 'list.number' as const,
      label,
    };
  }

  if (currentStep.counterLabel === 'round') {
    const label = currentStep.targetCount
      ? t('patternDetail.counterRoundsTarget', {
          current: project.roundCount,
          target: currentStep.targetCount,
        })
      : t('patternDetail.counterRounds', { count: project.roundCount });

    return {
      icon: 'arrow.triangle.2.circlepath' as const,
      label,
    };
  }

  return null;
}

function getLastWorkedText(
  updatedAt: Date | null,
  t: (key: string, options?: Record<string, unknown>) => string,
) {
  if (!updatedAt) return null;

  const today = new Date();
  const updatedDate = new Date(updatedAt);
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const startOfUpdated = new Date(
    updatedDate.getFullYear(),
    updatedDate.getMonth(),
    updatedDate.getDate(),
  ).getTime();
  const dayDiff = Math.round((startOfToday - startOfUpdated) / 86_400_000);

  if (dayDiff === 0) return t('patternDetail.lastWorkedToday');
  if (dayDiff === 1) return t('patternDetail.lastWorkedYesterday');
  if (dayDiff > 1 && dayDiff < 7) return t('patternDetail.lastWorkedDaysAgo', { count: dayDiff });

  return t('patternDetail.lastWorkedOnDate', {
    date: updatedDate.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    }),
  });
}

function getFlowLabel(
  steps: PatternStep[],
  t: (key: string, options?: Record<string, unknown>) => string,
) {
  const maxRounds = Math.max(
    0,
    ...steps
      .filter((step) => step.counterLabel === 'round' || step.type === 'round')
      .map((step) => step.targetCount ?? 1),
  );
  const maxRows = Math.max(
    0,
    ...steps
      .filter((step) => step.counterLabel === 'row' || step.type === 'row')
      .map((step) => step.targetCount ?? 1),
  );

  if (maxRounds > 0) return t('patternDetail.counterRounds', { count: maxRounds });
  if (maxRows > 0) return t('patternDetail.counterRows', { count: maxRows });

  return t('patternDetail.guided');
}

export default function PatternDetailScreen() {
  const { t } = useTranslation();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  usePreventZoomTransitionDismissal();
  const { width } = useWindowDimensions();
  const { db } = useDbStore();
  const { isPro } = useSubscription();
  const [pattern, setPattern] = useState<Pattern | null>(null);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStartingProject, setIsStartingProject] = useState(false);
  const contentPadding = theme.spacing.xl;
  const metaGap = theme.spacing.sm;
  const metaCardSize = Math.floor((width - contentPadding * 2 - metaGap * 2) / 3);
  const heroHeight = Math.min(Math.round((width - contentPadding * 2) * 1.08), 420);
  const ctaWidth = Math.min(width - contentPadding * 2, 236);
  const liquidGlassAvailable = useMemo(() => isLiquidGlassAvailable(), []);

  useEffect(() => {
    let isMounted = true;

    async function loadPattern() {
      if (!db || !slug) return;

      setIsLoading(true);

      try {
        const result = await db
          .select()
          .from(patternsTable)
          .where(eq(patternsTable.slug, slug))
          .limit(1);
        const patternRow = result[0] ?? null;
        const projectResult = patternRow
          ? await db
              .select()
              .from(projectsTable)
              .where(
                and(eq(projectsTable.patternId, patternRow.id), eq(projectsTable.status, 'active')),
              )
              .limit(1)
          : [];

        if (isMounted) {
          setPattern(patternRow);
          setActiveProject(projectResult[0] ?? null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadPattern();

    return () => {
      isMounted = false;
    };
  }, [db, slug]);

  const steps = useMemo(() => {
    if (!pattern) return [];
    try {
      return JSON.parse(pattern.stepsJson) as PatternStep[];
    } catch {
      return [];
    }
  }, [pattern]);
  const materials = useMemo(() => parseMaterials(pattern?.materialsText ?? null), [pattern]);
  const skills = useMemo(() => parseSkills(pattern?.skillsText ?? null), [pattern]);
  const trackedStepCount = useMemo(
    () => steps.filter((step) => typeof step.targetCount === 'number').length,
    [steps],
  );
  const flowLabel = useMemo(() => getFlowLabel(steps, t), [steps, t]);
  const expectationText = pattern?.expectationText ?? pattern?.description;
  const activeProjectProgress =
    activeProject && steps.length > 0 ? (activeProject.currentStepIndex + 1) / steps.length : 0;
  const activeProjectStep = activeProject
    ? (steps[Math.min(activeProject.currentStepIndex, Math.max(steps.length - 1, 0))] ?? null)
    : null;
  const activeProjectCounterSummary = getProjectCounterSummary(activeProject, activeProjectStep, t);
  const activeProjectLastWorkedText = getLastWorkedText(activeProject?.updatedAt ?? null, t);
  const isPatternLocked = !!pattern && !isPro && !isPatternFree(pattern);

  useEffect(() => {
    if (!isPatternLocked) return;

    router.replace('/(paywalls)');
  }, [isPatternLocked, router]);

  const ctaLabel = isStartingProject
    ? t('patternDetail.opening')
    : isPatternLocked
      ? t('shared.unlockPremium')
      : activeProject
        ? t('patternDetail.resumeProject')
        : t('patternDetail.startProject');
  const stackOptions = useMemo<NativeStackNavigationOptions>(
    () => ({
      title: pattern?.title ?? t('patternDetail.pattern'),
      headerTransparent: liquidGlassAvailable,
      unstable_headerLeftItems: () => [
        {
          type: 'button' as const,
          label: t('shared.close'),
          icon: { type: 'sfSymbol' as const, name: 'chevron.backward' },
          onPress: () => router.back(),
        },
      ],
    }),
    [liquidGlassAvailable, pattern?.title, router, t],
  );
  const ctaModifiers = useMemo(
    () => [
      buttonStyle(liquidGlassAvailable ? 'glassProminent' : 'borderedProminent'),
      controlSize('large'),
      tint(theme.colors.primary),
      disabled(isStartingProject),
    ],
    [isStartingProject, liquidGlassAvailable],
  );

  async function handleStartProject() {
    if (!db || !pattern || isStartingProject) return;

    if (isPatternLocked) {
      router.push('/(paywalls)');
      return;
    }

    setIsStartingProject(true);

    try {
      let project = activeProject;

      if (!project) {
        const existingProject = await db
          .select()
          .from(projectsTable)
          .where(and(eq(projectsTable.patternId, pattern.id), eq(projectsTable.status, 'active')))
          .limit(1);

        project = existingProject[0] ?? null;
      }

      if (!project) {
        if (!isPro) {
          const activeProjects = await db
            .select({ id: projectsTable.id })
            .from(projectsTable)
            .where(eq(projectsTable.status, 'active'))
            .limit(FREE_ACTIVE_PROJECT_LIMIT);

          if (activeProjects.length >= FREE_ACTIVE_PROJECT_LIMIT) {
            router.push('/(paywalls)');
            return;
          }
        }

        const createdProject = await db
          .insert(projectsTable)
          .values({
            patternId: pattern.id,
            name: pattern.title,
            status: 'active',
          })
          .returning();

        project = createdProject[0] ?? null;
      }

      if (!project) return;

      setActiveProject(project);
      router.push({
        pathname: '/(projects)/[id]',
        params: { id: String(project.id) },
      });
    } finally {
      setIsStartingProject(false);
    }
  }

  return (
    <>
      <Stack.Screen options={stackOptions} />
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={{
            padding: contentPadding,
            paddingBottom: 136,
            gap: theme.spacing.lg,
            backgroundColor: theme.colors.background,
          }}>
          {isLoading ? (
            <View style={{ paddingVertical: theme.spacing['3xl'], alignItems: 'center' }}>
              <ActivityIndicator color={theme.colors.primary} />
            </View>
          ) : null}

          {pattern ? (
            <>
              <Link.AppleZoomTarget>
                <Image
                  source={patternImages[pattern.coverImageKey as PatternImageKey]}
                  contentFit="cover"
                  style={{
                    width: '100%',
                    height: heroHeight,
                    borderRadius: theme.radius.xl + theme.spacing.sm,
                  }}
                />
              </Link.AppleZoomTarget>

              <View style={{ gap: theme.spacing.sm }}>
                <Text
                  selectable
                  style={{
                    fontSize: theme.size['3xl'] - 2,
                    fontWeight: theme.weight.semibold,
                    letterSpacing: -0.5,
                    color: theme.colors.textPrimary,
                  }}>
                  {pattern.title}
                </Text>
                <Text
                  selectable
                  style={{
                    fontSize: theme.size.lg,
                    lineHeight: theme.size.lg + 6,
                    color: theme.colors.textSecondary,
                  }}>
                  {pattern.description}
                </Text>
              </View>

              {activeProject ? (
                <View style={{ gap: theme.spacing.sm + 2 }}>
                  <Text
                    selectable
                    style={{
                      fontSize: theme.size.lg,
                      fontWeight: theme.weight.semibold,
                      color: theme.colors.textPrimary,
                    }}>
                    {t('patternDetail.projectInProgress')}
                  </Text>
                  <View
                    style={{
                      gap: theme.spacing.sm,
                      padding: theme.spacing.lg,
                      borderRadius: theme.radius.xl,
                      borderCurve: 'continuous',
                      backgroundColor: theme.colors.surface,
                    }}>
                    <Text
                      selectable
                      style={{
                        fontSize: theme.size.md,
                        fontWeight: theme.weight.semibold,
                        color: theme.colors.textPrimary,
                      }}>
                      {t('shared.stepOf', {
                        current: Math.min(activeProject.currentStepIndex + 1, steps.length),
                        total: steps.length,
                      })}
                    </Text>
                    <ProgressBar progress={activeProjectProgress} />
                    {activeProjectCounterSummary ? (
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: theme.spacing.xs,
                          marginTop: theme.spacing.xs,
                        }}>
                        <SymbolView
                          name={activeProjectCounterSummary.icon}
                          size={15}
                          weight="semibold"
                          tintColor={theme.colors.primary}
                          fallback={<View style={{ width: 15, height: 15 }} />}
                        />
                        <Text
                          selectable
                          style={{
                            fontSize: theme.size.md,
                            fontWeight: theme.weight.medium,
                            color: theme.colors.textSecondary,
                            fontVariant: ['tabular-nums'],
                          }}>
                          {activeProjectCounterSummary.label}
                        </Text>
                      </View>
                    ) : null}
                    {activeProjectLastWorkedText ? (
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: theme.spacing.xs,
                          marginTop: activeProjectCounterSummary ? 0 : theme.spacing.xs,
                        }}>
                        <SymbolView
                          name="clock.arrow.circlepath"
                          size={14}
                          weight="semibold"
                          tintColor={theme.colors.textTertiary}
                          fallback={<View style={{ width: 14, height: 14 }} />}
                        />
                        <Text
                          selectable
                          style={{
                            fontSize: theme.size.sm,
                            fontWeight: theme.weight.medium,
                            color: theme.colors.textTertiary,
                          }}>
                          {activeProjectLastWorkedText}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              ) : null}

              <View style={{ flexDirection: 'row', gap: metaGap, justifyContent: 'center' }}>
                <MetaStatCard
                  icon="dial.medium.fill"
                  label={t('patternDetail.difficulty')}
                  value={pattern.difficulty}
                  size={metaCardSize}
                />
                <MetaStatCard
                  icon="square.grid.2x2.fill"
                  label={t('patternDetail.category')}
                  value={pattern.category ?? t('patternDetail.general')}
                  size={metaCardSize}
                />
                <MetaStatCard
                  icon="clock.fill"
                  label={t('patternDetail.time')}
                  value={t('patternDetail.minutesShort', { count: pattern.estimatedMinutes ?? 0 })}
                  size={metaCardSize}
                />
              </View>

              {skills.length > 0 ? (
                <View style={{ gap: theme.spacing.sm + 2 }}>
                  <Text
                    selectable
                    style={{
                      fontSize: theme.size.lg,
                      fontWeight: theme.weight.semibold,
                      color: theme.colors.textPrimary,
                    }}>
                    {t('patternDetail.skillsNeeded')}
                  </Text>
                  <View
                    style={{
                      gap: theme.spacing.sm + 2,
                      backgroundColor: theme.colors.surface,
                      padding: theme.spacing.lg,
                      borderRadius: theme.radius.xl,
                    }}>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
                      {skills.map((skill) => (
                        <SkillPill key={skill} skill={skill} />
                      ))}
                    </View>
                  </View>
                </View>
              ) : null}

              <View style={{ gap: theme.spacing.sm + 2 }}>
                <Text
                  selectable
                  style={{
                    fontSize: theme.size.lg,
                    fontWeight: theme.weight.semibold,
                    color: theme.colors.textPrimary,
                  }}>
                  {t('patternDetail.materials')}
                </Text>
                <View
                  style={{
                    gap: theme.spacing.sm + 2,
                    backgroundColor: theme.colors.surface,
                    padding: theme.spacing.lg,
                    borderRadius: theme.radius.xl,
                  }}>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
                    {materials.map((material) => (
                      <MaterialPill key={material} material={material} />
                    ))}
                  </View>
                </View>
              </View>

              <View style={{ gap: theme.spacing.sm + 2 }}>
                <Text
                  selectable
                  style={{
                    fontSize: theme.size.lg,
                    fontWeight: theme.weight.semibold,
                    color: theme.colors.textPrimary,
                  }}>
                  {t('patternDetail.patternOverview')}
                </Text>
                <View
                  style={{
                    gap: theme.spacing.md + 2,
                    backgroundColor: theme.colors.surface,
                    padding: theme.spacing.lg,
                    borderRadius: theme.radius.xl,
                  }}>
                  <View style={{ flexDirection: 'row', gap: theme.spacing.xs + 2 }}>
                    <OverviewStat label={t('patternDetail.steps')} value={`${steps.length}`} />
                    <OverviewStat label={t('patternDetail.structure')} value={flowLabel} />
                    <OverviewStat
                      label={t('patternDetail.counters')}
                      value={
                        trackedStepCount > 0 ? `${trackedStepCount}` : t('patternDetail.basic')
                      }
                    />
                  </View>

                  <View style={{ gap: theme.spacing.xs + 2 }}>
                    <Text
                      selectable
                      style={{
                        fontSize: theme.size.md,
                        fontWeight: theme.weight.semibold,
                        color: theme.colors.textPrimary,
                      }}>
                      {t('patternDetail.whatToExpect')}
                    </Text>
                    <Text
                      selectable
                      style={{
                        fontSize: theme.size.md,
                        lineHeight: theme.size.md + 6,
                        color: theme.colors.textSecondary,
                      }}>
                      {expectationText}
                    </Text>
                  </View>
                </View>
              </View>
            </>
          ) : null}
        </ScrollView>

        {pattern ? (
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
              label={ctaLabel}
              onPress={() => void handleStartProject()}
              modifiers={ctaModifiers}
            />
          </Host>
        ) : null}
      </View>
    </>
  );
}
