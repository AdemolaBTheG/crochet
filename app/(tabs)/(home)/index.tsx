import { theme } from '@/constants/Theme';
import { isPatternFree } from '@/constants/gates';
import { getPatternImageSource } from '@/constants/pattern-images';
import { useSubscription } from '@/context/SubscriptionContext';
import { projects as projectsTable, type Project } from '@/db/schema';
import { usePatterns } from '@/hooks/use-patterns';
import { tap, warn } from '@/services/haptics';
import { useDbStore } from '@/stores/dbStore';
import { FlashList } from '@shopify/flash-list';
import { desc, eq } from 'drizzle-orm';
import { Image } from 'expo-image';
import { Link, router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FlatList,
  Pressable,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import LoadingShimmer from '@/components/shimmer/loading-shimmer';

type ActiveProject = Project & {
  patternSlug: string | null;
  coverImageKey: string | null;
  stepsJson: string | null;
};

type CategoryFilter = 'all' | string;

function getStepCount(stepsJson: string | null) {
  if (!stepsJson) return 0;

  try {
    return (JSON.parse(stepsJson) as unknown[]).length;
  } catch {
    return 0;
  }
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

function getCounterSummary(
  project: Project,
  t: (key: string, options?: Record<string, unknown>) => string,
) {
  if (project.roundCount > 0) return t('common.counter.rounds', { count: project.roundCount });
  if (project.rowCount > 0) return t('common.counter.rows', { count: project.rowCount });

  return t('common.counter.none');
}

function formatCategory(category: string) {
  return category.charAt(0).toUpperCase() + category.slice(1);
}

function ActiveProjectCard({ project, width }: { project: ActiveProject; width: number }) {
  const { t } = useTranslation();
  const source = project.coverImageKey ? getPatternImageSource(project.coverImageKey) : undefined;
  const stepCount = getStepCount(project.stepsJson);
  const completedStepCount =
    stepCount > 0
      ? Math.min(project.currentStepIndex + 1, stepCount)
      : project.currentStepIndex + 1;
  const progress = stepCount > 0 ? completedStepCount / stepCount : 0;
  const progressText =
    stepCount > 0
      ? t('common.steps.progress', { current: completedStepCount, total: stepCount })
      : t('common.steps.stepOnly', { current: project.currentStepIndex + 1 });

  return (
    <Link
      href={{
        pathname: '/(projects)/[id]',
        params: { id: String(project.id) },
      }}
      asChild>
      <Pressable
        onPress={() => {
          tap();
        }}
        style={{
          width,
          flexDirection: 'row',
          gap: theme.spacing.md,
          padding: theme.spacing.md,
          borderRadius: theme.radius.xl,
          borderCurve: 'continuous',
          backgroundColor: theme.colors.surface,
        }}
        accessibilityRole="button"
        accessibilityLabel={t('home.accessibility.continueProject', { name: project.name })}>
        {source ? (
          <Image
            source={source}
            contentFit="cover"
            style={{
              width: 82,
              height: 104,
              borderRadius: theme.radius.lg,
            }}
          />
        ) : null}

        <View style={{ flex: 1, justifyContent: 'center', gap: theme.spacing.sm }}>
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
                  backgroundColor: theme.colors.primarySoft,
                }}>
                <Text
                  selectable
                  style={{
                    fontSize: theme.size.sm,
                    fontWeight: theme.weight.semibold,
                    color: theme.colors.primary,
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
                backgroundColor: theme.colors.primary,
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

function ActiveProjectsRail({
  projects,
  cardWidth,
  horizontalInset,
}: {
  projects: ActiveProject[];
  cardWidth: number;
  horizontalInset: number;
}) {
  const { t } = useTranslation();
  if (projects.length === 0) return null;

  return (
    <View style={{ paddingBottom: theme.spacing.lg, gap: theme.spacing.md }}>
      <Text
        selectable
        style={{
          fontSize: theme.size.lg,
          fontWeight: theme.weight.semibold,
          color: theme.colors.textPrimary,
        }}>
        {t('home.sections.activeProjects')}
      </Text>
      <FlatList
        data={projects}
        horizontal
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <ActiveProjectCard project={item} width={cardWidth} />}
        ItemSeparatorComponent={() => <View style={{ width: theme.spacing.md }} />}
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={cardWidth + theme.spacing.md}
        snapToAlignment="start"
        style={{ marginHorizontal: -horizontalInset }}
        contentContainerStyle={{
          paddingHorizontal: horizontalInset,
        }}
      />
    </View>
  );
}

function CategoryChips({
  categories,
  selectedCategory,
  onSelectCategory,
  horizontalInset,
}: {
  categories: string[];
  selectedCategory: CategoryFilter;
  onSelectCategory: (category: CategoryFilter) => void;
  horizontalInset: number;
}) {
  const { t } = useTranslation();
  if (categories.length === 0) return null;

  const items: CategoryFilter[] = ['all', ...categories];

  return (
    <FlatList
      data={items}
      horizontal
      keyExtractor={(item) => item}
      showsHorizontalScrollIndicator={false}
      ItemSeparatorComponent={() => <View style={{ width: theme.spacing.sm }} />}
      style={{ marginHorizontal: -horizontalInset, marginBottom: theme.spacing.lg }}
      contentContainerStyle={{ paddingHorizontal: horizontalInset }}
      renderItem={({ item: category }) => {
        const isSelected = selectedCategory === category;

        return (
          <Pressable
            key={category}
            onPress={() => {
              tap();
              onSelectCategory(category);
            }}
            style={{
              paddingVertical: theme.spacing.xs + 2,
              paddingHorizontal: theme.spacing.md,
              borderRadius: theme.radius.pill,
              backgroundColor: isSelected ? theme.colors.primary : theme.colors.surface,
            }}
            accessibilityRole="button"
            accessibilityLabel={t('home.accessibility.showPatterns', {
              category: category === 'all' ? t('common.filters.all').toLowerCase() : category,
            })}>
            <Text
              selectable
              style={{
                fontSize: theme.size.md,
                fontWeight: theme.weight.semibold,
                color: isSelected ? theme.colors.white : theme.colors.primary,
              }}>
              {category === 'all' ? t('common.filters.all') : formatCategory(category)}
            </Text>
          </Pressable>
        );
      }}
    />
  );
}

export default function HomeScreen() {
  const { db } = useDbStore();
  const { i18n } = useTranslation();
  const { isPro } = useSubscription();
  const { width } = useWindowDimensions();
  const { data: patterns = [], isLoading: isPatternsLoading } = usePatterns(i18n.language);
  const [activeProjects, setActiveProjects] = useState<ActiveProject[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
  const isLoading = isPatternsLoading || isLoadingProjects;
  const gridGap = 10;
  const horizontalPadding = 16;
  const itemWidth = Math.floor((width - horizontalPadding * 2 - gridGap) / 2);
  const activeProjectCardWidth = Math.min(width - horizontalPadding * 2, 360);
  const categories = Array.from(
    new Set(patterns.map((p) => p.category).filter(Boolean) as string[]),
  ).sort();
  const filteredPatterns =
    selectedCategory === 'all' ? patterns : patterns.filter((p) => p.category === selectedCategory);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      async function loadProjects() {
        if (!db) return;

        setIsLoadingProjects(true);

        try {
          const activeRows = await db
            .select()
            .from(projectsTable)
            .where(eq(projectsTable.status, 'active'))
            .orderBy(desc(projectsTable.updatedAt))
            .limit(8);

          if (isMounted) {
            setActiveProjects(
              activeRows.map((row) => ({
                ...row,
                patternId: 0,
                notes: null,
                startedAt: new Date(),
                completedAt: null,
                patternSlug: row.patternSlug ?? null,
                coverImageKey: row.coverImageKey ?? null,
                stepsJson: row.stepsJson ?? null,
              })),
            );
          }
        } finally {
          if (isMounted) {
            setIsLoadingProjects(false);
          }
        }
      }

      void loadProjects();

      return () => {
        isMounted = false;
      };
    }, [db]),
  );

  return (
    <FlashList
      style={{ backgroundColor: theme.colors.background }}
      contentInsetAdjustmentBehavior="automatic"
      data={filteredPatterns}
      numColumns={2}
      keyExtractor={(item) => item.slug}
      contentContainerStyle={{
        paddingHorizontal: horizontalPadding,
        paddingTop: 16,
        paddingBottom: 32,
        backgroundColor: theme.colors.background,
      }}
      ListHeaderComponent={
        <>
          <ActiveProjectsRail
            projects={activeProjects}
            cardWidth={activeProjectCardWidth}
            horizontalInset={horizontalPadding}
          />
          <CategoryChips
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            horizontalInset={horizontalPadding}
          />
        </>
      }
      ItemSeparatorComponent={() => <View style={{ height: gridGap }} />}
      ListEmptyComponent={
        isLoading ? (
          <LoadingShimmer />
        ) : null
      }
      renderItem={({ item, index }) => {
        const source = getPatternImageSource(item.coverImageKey);
        const isLeftColumn = index % 2 === 0;
        const isLocked = !isPro && !isPatternFree(item);
        const card = (
          <Pressable
            onPress={() => {
              if (isLocked) {
                warn();
                router.push('/(paywalls)');
                return;
              }

              tap();
            }}
            style={{
              borderRadius: 24,
              borderCurve: 'continuous',
              overflow: 'hidden',
              backgroundColor: theme.colors.muted,
            }}
            accessibilityRole="button"
            accessibilityLabel={`${isLocked ? 'Unlock' : 'Open'} ${item.title} pattern`}>
            {isLocked ? (
              <Image
                source={source}
                contentFit="cover"
                style={{ width: '100%', aspectRatio: 4 / 5, opacity: 0.72 }}
              />
            ) : (
              <Link.AppleZoom>
                <Image
                  source={source}
                  contentFit="cover"
                  style={{ width: '100%', aspectRatio: 4 / 5 }}
                />
              </Link.AppleZoom>
            )}
            {isLocked ? (
              <View
                style={{
                  position: 'absolute',
                  right: theme.spacing.sm,
                  top: theme.spacing.sm,
                  paddingVertical: theme.spacing.xs,
                  paddingHorizontal: theme.spacing.sm,
                  borderRadius: theme.radius.pill,
                  backgroundColor: 'rgba(255, 255, 255, 0.86)',
                }}>
                <Text
                  selectable
                  style={{
                    fontSize: theme.size.sm,
                    fontWeight: theme.weight.bold,
                    color: theme.colors.primary,
                  }}>
                  Pro
                </Text>
              </View>
            ) : null}
          </Pressable>
        );

        return (
          <View
            style={{
              width: itemWidth,
              marginRight: isLeftColumn ? gridGap : 0,
            }}>
            {isLocked ? (
              card
            ) : (
              <Link
                href={{
                  pathname: '/(patterns)/[slug]',
                  params: { slug: item.slug },
                }}
                asChild>
                {card}
              </Link>
            )}
          </View>
        );
      }}
    />
  );
}
