import { PressableScale } from '@/components/pressable-scale';
import { Colors, theme } from '@/constants/Theme';
import { projects as projectsTable, type Project } from '@/db/schema';
import { getTodayCraftSeconds } from '@/services/craft-sessions';
import { useDbStore } from '@/stores/dbStore';
import { useOnboardingStore } from '@/stores/onboardingStore';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Ionicons from '@expo/vector-icons/Ionicons';
import { desc } from 'drizzle-orm';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { router, useFocusEffect } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, ScrollView, StyleSheet, Text, View } from 'react-native';

type GoalCardProps = {
  icon: React.ComponentProps<typeof SymbolView>['name'];
  label: string;
  title: string;
  progress: number;
  onPress: () => void;
  rightAccessory?: React.ReactNode;
  footer?: React.ReactNode;
};

function getDayKey(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

function getProjectStreak(projects: Project[]) {
  const uniqueDays = Array.from(
    new Set(
      projects
        .map((project) => project.updatedAt)
        .filter((value): value is Date => value instanceof Date)
        .map((date) => getDayKey(date)),
    ),
  ).sort((a, b) => b - a);

  if (uniqueDays.length === 0) return 0;

  const todayKey = getDayKey(new Date());
  const yesterdayKey = todayKey - 24 * 60 * 60 * 1000;

  if (uniqueDays[0] !== todayKey && uniqueDays[0] !== yesterdayKey) {
    return 0;
  }

  let streak = 1;

  for (let index = 1; index < uniqueDays.length; index += 1) {
    if (uniqueDays[index - 1] - uniqueDays[index] !== 24 * 60 * 60 * 1000) {
      break;
    }
    streak += 1;
  }

  return streak;
}

function getCurrentWeek(): { id: number; label: string; isToday: boolean }[] {
  const today = new Date();
  const todayKey = getDayKey(today);
  const days: { id: number; label: string; isToday: boolean }[] = [];

  for (let i = 6; i >= 0; i -= 1) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dayKey = getDayKey(date);
    days.push({
      id: dayKey,
      label: date.toLocaleDateString(undefined, { weekday: 'short' }).charAt(0),
      isToday: dayKey === todayKey,
    });
  }

  return days;
}

function getStreakDayKeys(projects: Project[]): Set<number> {
  const uniqueDays = Array.from(
    new Set(
      projects
        .map((project) => project.updatedAt)
        .filter((value): value is Date => value instanceof Date)
        .map((date) => getDayKey(date)),
    ),
  ).sort((a, b) => b - a);

  if (uniqueDays.length === 0) return new Set();

  const todayKey = getDayKey(new Date());
  const yesterdayKey = todayKey - 86_400_000;

  if (uniqueDays[0] !== todayKey && uniqueDays[0] !== yesterdayKey) {
    return new Set();
  }

  const streakDays = new Set<number>();
  streakDays.add(uniqueDays[0]);

  for (let index = 1; index < uniqueDays.length; index += 1) {
    if (uniqueDays[index - 1] - uniqueDays[index] !== 86_400_000) break;
    streakDays.add(uniqueDays[index]);
  }

  return streakDays;
}

function getCompletedProjectsThisYear(projects: Project[]) {
  const now = new Date();
  const year = now.getFullYear();

  return projects.filter((project) => {
    if (project.status !== 'completed') return false;
    if (!(project.completedAt instanceof Date)) return false;
    return project.completedAt.getFullYear() === year;
  }).length;
}

function getMonthsRemainingInclusive() {
  const now = new Date();
  return 12 - now.getMonth();
}

function HeaderButton({
  icon,
  onPress,
}: {
  icon: React.ComponentProps<typeof SymbolView>['name'];
  onPress: () => void;
}) {
  return (
    <PressableScale onPress={onPress} style={styles.headerButton}>
      <SymbolView
        name={icon}
        size={26}
        weight="bold"
        tintColor={theme.colors.textPrimary}
        fallback={<View style={styles.iconFallback} />}
      />
    </PressableScale>
  );
}

function GoalCard({
  icon,
  label,
  title,
  progress,
  onPress,
  rightAccessory,
  footer,
}: GoalCardProps) {
  return (
    <View style={styles.card}>
      <PressableScale onPress={onPress} style={styles.cardPressable}>
        <View style={styles.cardTopRow}>
          <View style={styles.cardLabelWrap}>
            <SymbolView
              name={icon}
              size={24}
              weight="semibold"
              tintColor={theme.colors.textSecondary}
              fallback={<View style={styles.iconFallback} />}
            />
            <Text selectable style={styles.cardLabel}>
              {label}
            </Text>
          </View>

          <SymbolView
            name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
            size={16}
            weight="semibold"
            tintColor={theme.colors.textSecondary}
            fallback={<View style={styles.iconFallback} />}
          />
        </View>

        <View style={styles.cardMainRow}>
          <Text selectable style={styles.cardTitle}>
            {title}
          </Text>
        </View>

        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${Math.max(0, Math.min(100, progress * 100))}%` },
            ]}
          />
        </View>
      </PressableScale>

      {footer}
    </View>
  );
}

export default function GoalScreen() {
  const { t } = useTranslation();
  const { db } = useDbStore();
  const { dailyGoalMinutes, yearlyProjectGoal } = useOnboardingStore();
  const [projects, setProjects] = useState<Project[]>([]);
  const [todayCraftSeconds, setTodayCraftSeconds] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      async function loadProjects() {
        if (!db) return;

        const [rows, sessionSeconds] = await Promise.all([
          db.select().from(projectsTable).orderBy(desc(projectsTable.updatedAt)),
          getTodayCraftSeconds(db),
        ]);

        if (isMounted) {
          setProjects(rows);
          setTodayCraftSeconds(sessionSeconds);
        }
      }

      void loadProjects();

      return () => {
        isMounted = false;
      };
    }, [db]),
  );

  const completedThisYear = useMemo(() => getCompletedProjectsThisYear(projects), [projects]);
  const currentStreak = useMemo(() => getProjectStreak(projects), [projects]);
  const currentWeek = useMemo(() => getCurrentWeek(), []);
  const currentStreakDayKeys = useMemo(() => getStreakDayKeys(projects), [projects]);
  const dailyGoalTarget = dailyGoalMinutes ?? 15;
  const dailyGoalProgressMinutes = Math.floor(todayCraftSeconds / 60);
  const yearlyGoalTarget = yearlyProjectGoal ?? 5;
  const remainingProjects = Math.max(0, yearlyGoalTarget - completedThisYear);
  const monthlyPace = remainingProjects / getMonthsRemainingInclusive();
  const completedRatio = yearlyGoalTarget > 0 ? completedThisYear / yearlyGoalTarget : 0;
  const projectMilestones = useMemo(() => {
    if (yearlyGoalTarget <= 0) return [];
    return Array.from({ length: yearlyGoalTarget }, (_, index) => index + 1);
  }, [yearlyGoalTarget]);

  const yearlyProgressTitle = t('goals.yearlyProgress', {
    count: completedThisYear,
    completed: completedThisYear,
    target: yearlyGoalTarget,
  });

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{
        paddingHorizontal: theme.spacing.lg,
        gap: theme.spacing['2xl'],
      }}>
      <View style={styles.cardsWrap}>
        <GlassView
          isInteractive
          style={{
            paddingHorizontal: theme.spacing.lg,
            paddingVertical: theme.spacing.lg,
            borderRadius: theme.radius.xl + 4,
            borderCurve: 'continuous',
            backgroundColor: !isLiquidGlassAvailable() ? theme.colors.surface : undefined,
            gap: theme.spacing.xl,
          }}>
          <View
            style={{
              gap: theme.spacing.sm,
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            <FontAwesome6 name="fire" size={32} color={theme.colors.primary} />
            <Text
              style={{
                fontSize: theme.size.xl,
                color: Colors.textPrimary,
                fontWeight: theme.weight.semibold,
                fontVariant: ['tabular-nums'],
              }}>
              {t('stats.streak', { count: currentStreak })}
            </Text>
          </View>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: theme.spacing.xs,
            }}>
            {currentWeek.map((day) => {
              const isStreaked = currentStreakDayKeys.has(day.id);

              return (
                <View
                  key={day.id}
                  style={{
                    alignItems: 'center',
                    gap: theme.spacing.xs,
                    flex: 1,
                  }}>
                  <Text
                    selectable
                    style={{
                      color: day.isToday ? theme.colors.textPrimary : theme.colors.textSecondary,
                      fontSize: theme.size.sm,
                      fontWeight: day.isToday ? theme.weight.semibold : theme.weight.medium,
                    }}>
                    {day.label}
                  </Text>
                  <View
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 17,
                      borderCurve: 'continuous',
                      borderStyle: 'dashed',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: isStreaked ? Colors.primary : undefined,
                      borderWidth: isStreaked ? 0 : 2,
                      borderColor: theme.colors.border,
                    }}>
                    {isStreaked ? (
                      <Ionicons name="checkmark-sharp" size={18} color={Colors.white} />
                    ) : null}
                  </View>
                </View>
              );
            })}
          </View>
        </GlassView>

        <GoalCard
          icon={{ ios: 'scissors', android: 'content_cut', web: 'content_cut' }}
          label={t('goals.dailyCraftingGoal')}
          title={t('goals.dailyProgressTime', {
            completed: dailyGoalProgressMinutes,
            target: dailyGoalTarget,
          })}
          progress={dailyGoalTarget > 0 ? dailyGoalProgressMinutes / dailyGoalTarget : 0}
          onPress={() =>
            router.push({
              pathname: '/(onboarding)/daily-goal',
              params: { mode: 'edit', returnTo: '/goal' },
            })
          }
        />

        <GoalCard
          icon={{ ios: 'target', android: 'track_changes', web: 'track_changes' }}
          label={t('goals.yearlyProjectGoal', { year: new Date().getFullYear() })}
          title={yearlyProgressTitle}
          progress={completedRatio}
          onPress={() =>
            router.push({
              pathname: '/(onboarding)/yearly-goal',
              params: { mode: 'edit', returnTo: '/goal' },
            })
          }
          footer={
            <View style={styles.yearlyFooter}>
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={projectMilestones}
                style={{ marginHorizontal: -theme.spacing.lg }}
                keyExtractor={(milestoneValue) => `goal-pill-${milestoneValue}`}
                contentContainerStyle={styles.projectPillsRow}
                renderItem={({ item: milestoneValue }) => {
                  const isDone = completedThisYear >= milestoneValue;
                  return (
                    <View style={[styles.projectPill, isDone && styles.projectPillActive]}>
                      <Text
                        selectable
                        style={[styles.projectPillText, isDone && styles.projectPillTextActive]}>
                        {milestoneValue}
                      </Text>
                    </View>
                  );
                }}
              />

              <View style={styles.yearlyHintRow}>
                <SymbolView
                  name={{ ios: 'sparkles', android: 'auto_awesome', web: 'auto_awesome' }}
                  size={16}
                  weight="medium"
                  tintColor={theme.colors.textSecondary}
                  fallback={<View style={styles.iconFallback} />}
                />
                <Text selectable style={styles.yearlyHintText}>
                  {t('goals.remainingHint', {
                    remaining: remainingProjects,
                    pace: monthlyPace.toFixed(1),
                  })}
                </Text>
              </View>
            </View>
          }
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    borderCurve: 'continuous',
    gap: theme.spacing.lg,
    padding: theme.spacing.lg,
  },
  cardPressable: {
    gap: theme.spacing.lg,
  },
  cardLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.size.lg,
    fontWeight: theme.weight.semibold,
  },
  cardLabelWrap: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  cardMainRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardTitle: {
    color: theme.colors.textPrimary,
    flex: 1,
    fontSize: theme.size.xl,
    fontWeight: theme.weight.bold,
  },
  cardTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardsWrap: {
    gap: theme.spacing.xl,
  },
  headerButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.surface,
    borderRadius: 32,
    height: 64,
    justifyContent: 'center',
    width: 64,
  },
  iconFallback: {
    backgroundColor: theme.colors.primary,
    borderRadius: 6,
    height: 12,
    width: 12,
  },
  pageTitle: {
    color: theme.colors.textPrimary,
    fontSize: 72,
    fontWeight: theme.weight.black,
    lineHeight: 76,
  },
  progressFill: {
    backgroundColor: Colors.primary,
    borderRadius: theme.radius.pill,
    height: '100%',
  },
  progressTrack: {
    backgroundColor: Colors.primarySoft,
    borderRadius: theme.radius.pill,
    height: 8,
    overflow: 'hidden',
  },
  projectPill: {
    alignItems: 'center',
    backgroundColor: '#F4F2ED',
    borderRadius: 16,
    justifyContent: 'center',
    paddingVertical: theme.spacing['2xl'],
    paddingHorizontal: theme.spacing.xl,
  },
  projectPillActive: {
    backgroundColor: theme.colors.primarySoft,
  },
  projectPillText: {
    color: theme.colors.textTertiary,
    fontSize: theme.size.md,
    fontWeight: theme.weight.medium,
  },
  projectPillTextActive: {
    color: theme.colors.primary,
  },
  projectPillsRow: {
    gap: theme.spacing.md,
    marginHorizontal: theme.spacing.md,
  },
  screen: {
    backgroundColor: theme.colors.background,
    flex: 1,
  },
  sectionTitle: {
    color: theme.colors.textPrimary,
    fontSize: 44,
    fontWeight: theme.weight.black,
    lineHeight: 50,
  },
  streakPill: {
    alignItems: 'center',
    backgroundColor: '#F4F2ED',
    borderColor: '#DDD8CE',
    borderRadius: 28,
    borderWidth: 1,
    flexDirection: 'row',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  streakPillText: {
    color: theme.colors.textPrimary,
    fontSize: 34,
    fontWeight: theme.weight.black,
  },
  titleBlock: {
    gap: theme.spacing.xl,
  },
  yearlyFooter: {
    gap: theme.spacing.lg,
  },
  yearlyHintRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  yearlyHintText: {
    color: theme.colors.textSecondary,
    flex: 1,
    fontSize: theme.size.md,
    fontWeight: theme.weight.medium,
  },
});
