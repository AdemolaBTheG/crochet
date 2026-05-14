import { patternImages, type PatternImageKey } from '@/constants/pattern-images';
import { theme } from '@/constants/Theme';
import {
  patterns as patternsTable,
  projects as projectsTable,
  type Pattern,
  type Project,
} from '@/db/schema';
import { useDbStore } from '@/stores/dbStore';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FlashList, type ListRenderItem } from '@shopify/flash-list';
import { desc, eq } from 'drizzle-orm';
import { Image } from 'expo-image';
import { Link, useFocusEffect } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
type ProjectListItem = Project & {
  pattern: Pattern | null;
};

type ProjectListRow =
  | { type: 'loading' }
  | { type: 'empty' }
  | { type: 'section'; id: string; title: string }
  | { type: 'project'; project: ProjectListItem };

function getStepCount(pattern: Pattern | null) {
  if (!pattern?.stepsJson) return 0;

  try {
    return (JSON.parse(pattern.stepsJson) as unknown[]).length;
  } catch {
    return 0;
  }
}

function getCounterSummary(
  project: Project,
  t: (key: string, options?: Record<string, unknown>) => string,
) {
  if (project.roundCount > 0) return t('common.counter.rounds', { count: project.roundCount });
  if (project.rowCount > 0) return t('common.counter.rows', { count: project.rowCount });

  return t('common.counter.none');
}

function getLastWorkedText(
  updatedAt: Date,
  t: (key: string, options?: Record<string, unknown>) => string,
) {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfUpdatedAt = new Date(
    updatedAt.getFullYear(),
    updatedAt.getMonth(),
    updatedAt.getDate(),
  ).getTime();
  const dayDifference = Math.round((startOfToday - startOfUpdatedAt) / 86_400_000);

  if (dayDifference === 0) return t('common.time.today');
  if (dayDifference === 1) return t('common.time.yesterday');
  if (dayDifference < 7) return t('common.time.daysAgo', { count: dayDifference });

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
  }).format(updatedAt);
}

function ProjectCard({ project }: { project: ProjectListItem }) {
  const { t } = useTranslation();
  const pattern = project.pattern;
  const source = pattern ? patternImages[pattern.coverImageKey as PatternImageKey] : undefined;
  const stepCount = getStepCount(pattern);
  const completedStepCount =
    project.status === 'completed'
      ? stepCount
      : stepCount > 0
        ? Math.min(project.currentStepIndex + 1, stepCount)
        : project.currentStepIndex + 1;
  const progress = stepCount > 0 ? completedStepCount / stepCount : 0;
  const progressText =
    stepCount > 0
      ? t('common.steps.progress', { current: completedStepCount, total: stepCount })
      : t('common.steps.stepOnly', { current: project.currentStepIndex + 1 });
  const isCompleted = project.status === 'completed';
  const href = isCompleted
    ? {
        pathname: '/(projects)/complete/[id]' as const,
        params: { id: String(project.id) },
      }
    : {
        pathname: '/(projects)/[id]' as const,
        params: { id: String(project.id) },
      };

  return (
    <Link href={href} asChild>
      <Pressable
        style={{
          flexDirection: 'row',
          gap: theme.spacing.md,
          padding: theme.spacing.md,
          borderRadius: theme.radius.xl,
          borderCurve: 'continuous',
          backgroundColor: theme.colors.surface,
        }}
        accessibilityRole="button"
        accessibilityLabel={t('projects.accessibility.openProject', { name: project.name })}>
        {source ? (
          <Image
            source={source}
            contentFit="cover"
            style={{
              width: 78,
              height: 96,
              borderRadius: theme.radius.lg,
            }}
          />
        ) : null}
        <View style={{ flex: 1, gap: theme.spacing.sm, justifyContent: 'center' }}>
          <View style={{ gap: theme.spacing.xs }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
              <Text
                selectable
                numberOfLines={2}
                style={{
                  flex: 1,
                  fontSize: theme.size.lg,
                  fontWeight: theme.weight.semibold,
                  color: theme.colors.textPrimary,
                }}>
                {project.name}
              </Text>
              <View
                style={{
                  paddingHorizontal: theme.spacing.sm,
                  paddingVertical: theme.spacing.xs,
                  borderRadius: theme.radius.pill,
                  backgroundColor: isCompleted ? theme.colors.muted : theme.colors.primarySoft,
                }}>
                <Text
                  selectable
                  style={{
                    fontSize: theme.size.sm,
                    fontWeight: theme.weight.semibold,
                    color: isCompleted ? theme.colors.textSecondary : theme.colors.primary,
                    textTransform: 'capitalize',
                  }}>
                  {project.status}
                </Text>
              </View>
            </View>
            <Text
              selectable
              style={{
                fontSize: theme.size.md,
                color: theme.colors.textSecondary,
                fontVariant: ['tabular-nums'],
              }}>
              {progressText}
            </Text>
          </View>

          <View
            style={{
              height: 5,
              borderRadius: theme.radius.pill,
              backgroundColor: theme.colors.muted,
              overflow: 'hidden',
            }}>
            <View
              style={{
                width: `${Math.max(0, Math.min(progress, 1)) * 100}%`,
                height: '100%',
                borderRadius: theme.radius.pill,
                backgroundColor: isCompleted ? theme.colors.textTertiary : theme.colors.primary,
              }}
            />
          </View>

          <Text
            selectable
            numberOfLines={1}
            style={{
              fontSize: theme.size.sm,
              color: theme.colors.textSecondary,
            }}>
            {getCounterSummary(project, t)} {t('home.lastWorkedSeparator')}{' '}
            {t('home.lastWorkedPrefix')} {getLastWorkedText(project.updatedAt, t)}
          </Text>
        </View>
      </Pressable>
    </Link>
  );
}

export default function ProjectsScreen() {
  const { t } = useTranslation();
  const { db } = useDbStore();
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadProjects = useCallback(async () => {
    if (!db) return;

    setIsLoading(true);

    try {
      const rows = await db
        .select({
          project: projectsTable,
          pattern: patternsTable,
        })
        .from(projectsTable)
        .leftJoin(patternsTable, eq(patternsTable.id, projectsTable.patternId))
        .orderBy(desc(projectsTable.updatedAt));

      setProjects(rows.map((row) => ({ ...row.project, pattern: row.pattern })));
    } finally {
      setIsLoading(false);
    }
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      async function loadFocusedProjects() {
        if (!isMounted) return;

        await loadProjects();
      }

      void loadFocusedProjects();

      return () => {
        isMounted = false;
      };
    }, [loadProjects]),
  );

  const listData = useMemo<ProjectListRow[]>(() => {
    if (isLoading) return [{ type: 'loading' }];
    if (projects.length === 0) return [{ type: 'empty' }];

    const activeProjects = projects.filter((project) => project.status !== 'completed');
    const completedProjects = projects.filter((project) => project.status === 'completed');
    const rows: ProjectListRow[] = [];

    if (activeProjects.length > 0) {
      rows.push({ type: 'section', id: 'active', title: t('projects.sections.inProgress') });
      rows.push(...activeProjects.map((project) => ({ type: 'project' as const, project })));
    }

    if (completedProjects.length > 0) {
      rows.push({ type: 'section', id: 'completed', title: t('projects.sections.completed') });
      rows.push(...completedProjects.map((project) => ({ type: 'project' as const, project })));
    }

    return rows;
  }, [isLoading, projects, t]);

  const renderItem: ListRenderItem<ProjectListRow> = useCallback(
    ({ item }) => {
      if (item.type === 'loading') {
        return (
          <View style={{ paddingVertical: theme.spacing['3xl'], alignItems: 'center' }}>
            <ActivityIndicator color={theme.colors.primary} />
          </View>
        );
      }

      if (item.type === 'empty') {
        return (
          <View
            style={{
              padding: theme.spacing.xl,
              borderRadius: theme.radius.xl,
              backgroundColor: theme.colors.surface,
              gap: theme.spacing.sm,
              alignItems: 'center',
            }}>
            <MaterialCommunityIcons
              name="scissors-cutting"
              size={48}
              color={theme.colors.textSecondary}
            />
            <Text
              selectable
              style={{
                fontSize: theme.size.lg,
                fontWeight: theme.weight.semibold,
                color: theme.colors.textPrimary,
              }}>
              {t('projects.empty.title')}
            </Text>
            <Text
              selectable
              style={{
                fontSize: theme.size.md,
                lineHeight: theme.size.md + 6,
                color: theme.colors.textSecondary,
              }}>
              {t('projects.empty.subtitle')}
            </Text>
          </View>
        );
      }

      if (item.type === 'section') {
        return (
          <Text
            selectable
            style={{
              paddingTop: theme.spacing.sm,
              fontSize: theme.size.lg,
              fontWeight: theme.weight.semibold,
              color: theme.colors.textPrimary,
            }}>
            {item.title}
          </Text>
        );
      }

      return <ProjectCard project={item.project} />;
    },
    [t],
  );

  return (
    <FlashList
      data={listData}
      renderItem={renderItem}
      keyExtractor={(item, index) => {
        if (item.type === 'project') return `project-${item.project.id}`;
        if (item.type === 'section') return `section-${item.id}`;
        return `${item.type}-${index}`;
      }}
      getItemType={(item) => item.type}
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
      ItemSeparatorComponent={() => <View style={{ height: theme.spacing.md }} />}
      style={{ backgroundColor: theme.colors.background }}
      contentContainerStyle={{
        padding: theme.spacing.xl,
      }}
    />
  );
}
