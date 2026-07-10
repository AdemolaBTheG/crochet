import LoadingShimmer from '@/components/shimmer/loading-shimmer';
import { theme } from '@/constants/Theme';
import { isLessonFree } from '@/constants/gates';
import { useSubscription } from '@/context/SubscriptionContext';
import { useLessons, type ResolvedLesson } from '@/hooks/use-lessons';
import { tap } from '@/services/haptics';
import { useCompletedLessonsStore } from '@/stores/completedLessonsStore';
import { FlashList } from '@shopify/flash-list';
import { Link, Stack } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, Pressable, Text, View } from 'react-native';

function getStepCount(lesson: ResolvedLesson) {
  return Array.isArray(lesson.content.steps) ? lesson.content.steps.length : 0;
}

function formatDifficulty(difficulty: string) {
  return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
}

function LessonRow({
  lesson,
  index,
  isLocked,
  isCompleted,
}: {
  lesson: ResolvedLesson;
  index: number;
  isLocked: boolean;
  isCompleted: boolean;
}) {
  const { t } = useTranslation();
  const stepCount = getStepCount(lesson);

  const card = (
    <Pressable
      onPress={() => {
        tap();
      }}
      accessibilityRole="button"
      accessibilityLabel={t('learn.accessibility.lessonCard', {
        action: isLocked ? t('learn.actions.unlock') : t('learn.actions.open'),
        title: lesson.title,
      })}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: theme.spacing.lg,
        borderRadius: theme.radius.xl,
        borderCurve: 'continuous',
        backgroundColor: theme.colors.surface,
        gap: theme.spacing.md,
        opacity: isCompleted ? 0.48 : isLocked ? 0.78 : 1,
      }}>
      <Text
        selectable
        style={{
          fontSize: theme.size.lg,
          fontWeight: theme.weight.bold,
          color: theme.colors.primary,
          fontVariant: ['tabular-nums'],
        }}>
        {index + 1}
      </Text>

      <View style={{ flex: 1, gap: theme.spacing.xs }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}>
          <Text
            selectable
            numberOfLines={2}
            style={{
              flex: 1,
              fontSize: theme.size.lg,
              fontWeight: theme.weight.bold,
              color: theme.colors.textPrimary,
              textDecorationLine: isCompleted ? 'line-through' : undefined,
            }}>
            {lesson.title}
          </Text>
          {isLocked ? (
            <View
              style={{
                paddingVertical: theme.spacing.xs,
                paddingHorizontal: theme.spacing.sm,
                borderRadius: theme.radius.pill,
                backgroundColor: theme.colors.primarySoft,
              }}>
              <Text
                selectable
                style={{
                  fontSize: theme.size.sm,
                  fontWeight: theme.weight.bold,
                  color: theme.colors.primary,
                }}>
                {t('common.badges.pro')}
              </Text>
            </View>
          ) : null}
        </View>

        <Text
          selectable
          numberOfLines={2}
          style={{
            fontSize: theme.size.md,
            color: theme.colors.textSecondary,
            textDecorationLine: isCompleted ? 'line-through' : undefined,
          }}>
          {lesson.description}
        </Text>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.spacing.sm,
          }}>
          <View
            style={{
              paddingHorizontal: theme.spacing.md,
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
              }}>
              {formatDifficulty(lesson.difficulty)}
            </Text>
          </View>
          {stepCount > 0 ? (
            <Text
              selectable
              style={{
                fontSize: theme.size.sm,
                color: theme.colors.textSecondary,
                fontVariant: ['tabular-nums'],
              }}>
              {t('common.steps.count', { count: stepCount })}
            </Text>
          ) : null}
        </View>
      </View>

      <SymbolView
        name={{ ios: 'chevron.forward', android: 'chevron_right', web: 'chevron_right' }}
        size={16}
        weight="semibold"
        tintColor={theme.colors.textTertiary}
      />
    </Pressable>
  );

  if (isLocked) return card;

  return (
    <Link
      href={{
        pathname: '/(lessons)/[slug]',
        params: { slug: lesson.slug },
      }}
      asChild>
      <Link.AppleZoom>{card}</Link.AppleZoom>
    </Link>
  );
}

export default function AllLessonsScreen() {
  const { t, i18n } = useTranslation();
  const { isPro } = useSubscription();
  const { data: lessons = [], isLoading } = useLessons(i18n.language);
  const [searchQuery, setSearchQuery] = useState('');
  const isLessonCompleted = useCompletedLessonsStore((s) => s.isCompleted);
  const horizontalPadding = theme.spacing.xl;
  const rowGap = theme.spacing.md;

  const filteredLessons = lessons.filter((l) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return l.title.toLowerCase().includes(q) || (l.description?.toLowerCase().includes(q) ?? false);
  });

  if (isLoading) return <LoadingShimmer />;

  return (
    <>
      <Stack.Screen
        options={{
          ...(Platform.OS === 'ios'
            ? {
                headerSearchBarOptions: {
                  placeholder: 'Search lessons',
                  onChangeText: (event) => {
                    setSearchQuery(event.nativeEvent.text);
                  },
                  onCancelButtonPress: () => {
                    setSearchQuery('');
                  },
                },
              }
            : {}),
        }}
      />
      <FlashList
        data={filteredLessons}
        keyExtractor={(item) => item.slug}
        contentInsetAdjustmentBehavior="automatic"
        style={{ backgroundColor: theme.colors.background }}
        contentContainerStyle={{
          paddingHorizontal: horizontalPadding,
          paddingTop: theme.spacing.xl,
          paddingBottom: theme.spacing.xl,
        }}
        ItemSeparatorComponent={() => <View style={{ height: rowGap }} />}
      renderItem={({ item, index }) => (
        <LessonRow
          lesson={item}
          index={index}
          isLocked={!isPro && !isLessonFree(item)}
          isCompleted={isLessonCompleted(item.slug)}
        />
      )}
        ListEmptyComponent={
          <View
            style={{
              padding: theme.spacing.xl,
              borderRadius: theme.radius.xl,
              borderCurve: 'continuous',
              backgroundColor: theme.colors.surface,
              borderWidth: 1,
              borderColor: theme.colors.border,
              gap: theme.spacing.sm,
            }}>
            <Text
              selectable
              style={{
                fontSize: theme.size.lg,
                fontWeight: theme.weight.semibold,
                color: theme.colors.textPrimary,
              }}>
              {t('learn.empty.title')}
            </Text>
            <Text
              selectable
              style={{
                fontSize: theme.size.md,
                lineHeight: theme.size.md + 6,
                color: theme.colors.textSecondary,
              }}>
              {t('learn.empty.subtitle')}
            </Text>
          </View>
        }
      />
    </>
  );
}
