import { theme } from '@/constants/Theme';
import { isLessonFree } from '@/constants/gates';
import { useSubscription } from '@/context/SubscriptionContext';
import { resolveLessonTranslations, type ResolvedLesson } from '@/db/translations';
import { tap, warn } from '@/services/haptics';
import { useDbStore } from '@/stores/dbStore';
import { Link, router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
  type ListRenderItem,
} from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';

type ToolItem = {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentProps<typeof SymbolView>['name'];
  href?:
    | '/(tools)/row-counter'
    | '/(tools)/stitch-fixes'
    | '/(tools)/size-calculator'
    | '/(tools)/identify-stitch';
};

const toolItems: ToolItem[] = [
  {
    id: 'row-counter',
    title: 'Row Counter',
    description: 'Count rows, rounds, and repeats without losing your place.',
    icon: { ios: 'number', android: 'format_list_numbered', web: 'format_list_numbered' },
    href: '/(tools)/row-counter',
  },
  {
    id: 'stitch-fixes',
    title: 'Stitch Fixes',
    description: 'Quick help for curling, uneven edges, gaps, and missed stitches.',
    icon: { ios: 'bandage', android: 'medical_services', web: 'medical_services' },
    href: '/(tools)/stitch-fixes',
  },
  {
    id: 'size-calculator',
    title: 'Size Calculator',
    description: 'Estimate stitch and row counts from your gauge.',
    icon: { ios: 'ruler', android: 'straighten', web: 'straighten' },
    href: '/(tools)/size-calculator',
  },
  {
    id: 'identify-stitch',
    title: 'Identify Stitch',
    description: 'Use a photo to understand the stitch you are looking at.',
    icon: { ios: 'camera.viewfinder', android: 'photo_camera', web: 'photo_camera' },
    href: '/(tools)/identify-stitch',
  },
];

function getToolTitle(id: string, t: (key: string) => string) {
  return t(`learn.tools.${id}.title`);
}

function getToolDescription(id: string, t: (key: string) => string) {
  return t(`learn.tools.${id}.description`);
}

function getLessonStepCount(lesson: ResolvedLesson) {
  return Array.isArray(lesson.content.steps) ? lesson.content.steps.length : 0;
}

function formatDifficulty(difficulty: string) {
  return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
}

function ToolCard({ tool, width, isLocked }: { tool: ToolItem; width: number; isLocked: boolean }) {
  const { t } = useTranslation();
  const title = getToolTitle(tool.id, t);
  const description = getToolDescription(tool.id, t);

  return (
    <Pressable
      onPress={() => {
        if (isLocked) {
          warn();
          router.push('/(paywalls)');
        } else {
          tap();
          if (tool.href) {
            router.push(tool.href);
          }
        }
      }}
      accessibilityRole="button"
      accessibilityLabel={t('learn.accessibility.unlockTool', { title })}
      style={{
        width,
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        padding: theme.spacing.md,
        borderRadius: theme.radius.lg,
        borderCurve: 'continuous',
        backgroundColor: theme.colors.surface,
        gap: theme.spacing.md,
      }}>
      {isLocked && (
        <View
          style={{
            position: 'absolute',
            right: theme.spacing.sm,
            top: theme.spacing.sm,
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
      )}

      <View
        style={{
          padding: theme.spacing.md,
          borderRadius: theme.radius.md,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.colors.primarySoft,
        }}>
        <SymbolView
          name={tool.icon}
          size={22}
          weight="semibold"
          tintColor={theme.colors.primary}
          fallback={<View style={{ width: 22, height: 22 }} />}
        />
      </View>

      <View style={{ flex: 1, gap: theme.spacing.xs }}>
        <Text
          selectable
          numberOfLines={1}
          style={{
            fontSize: theme.size.lg,
            fontWeight: theme.weight.bold,
            color: theme.colors.textPrimary,
          }}>
          {title}
        </Text>
        <Text
          selectable
          numberOfLines={2}
          style={{
            fontSize: theme.size.sm,
            lineHeight: theme.size.sm + 5,
            color: theme.colors.textSecondary,
          }}>
          {description}
        </Text>
      </View>
    </Pressable>
  );
}

function LessonCard({
  lesson,
  index,
  cardWidth,
  snapInterval,
  scrollX,
  isLocked,
}: {
  lesson: ResolvedLesson;
  index: number;
  cardWidth: number;
  snapInterval: number;
  scrollX: SharedValue<number>;
  isLocked: boolean;
}) {
  const { t } = useTranslation();
  const stepCount = getLessonStepCount(lesson);
  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * snapInterval,
      index * snapInterval,
      (index + 1) * snapInterval,
    ];

    return {
      opacity: interpolate(scrollX.value, inputRange, [0.62, 1, 0.62], Extrapolation.CLAMP),
      transform: [
        {
          scale: interpolate(scrollX.value, inputRange, [0.92, 1, 0.92], Extrapolation.CLAMP),
        },
        {
          translateY: interpolate(scrollX.value, inputRange, [10, 0, 10], Extrapolation.CLAMP),
        },
      ],
    };
  });

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
      accessibilityRole="button"
      accessibilityLabel={t('learn.accessibility.lessonCard', {
        action: isLocked ? t('learn.actions.unlock') : t('learn.actions.open'),
        title: lesson.title,
      })}>
      <Animated.View
        style={[
          {
            width: cardWidth,
            alignSelf: 'flex-start',
            padding: theme.spacing.lg,
            borderRadius: theme.radius.xl,
            borderCurve: 'continuous',
            backgroundColor: theme.colors.surface,
            gap: theme.spacing.md,
            opacity: isLocked ? 0.78 : 1,
          },
          animatedStyle,
        ]}>
        {isLocked ? (
          <View
            style={{
              alignSelf: 'flex-start',
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
        <View style={{ gap: theme.spacing.xs }}>
          <Text
            selectable
            style={{
              fontSize: theme.size.sm,
              fontWeight: theme.weight.bold,
              color: theme.colors.primary,
              textTransform: 'uppercase',
            }}>
            {t('learn.lessonLabel', { index: index + 1 })}
          </Text>
          <Text
            selectable
            numberOfLines={2}
            style={{
              fontSize: theme.size.lg,
              fontWeight: theme.weight.bold,
              color: theme.colors.textPrimary,
            }}>
            {lesson.title}
          </Text>
        </View>

        <Text
          selectable
          numberOfLines={3}
          style={{
            fontSize: theme.size.md,
            color: theme.colors.textSecondary,
          }}>
          {lesson.description}
        </Text>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: theme.spacing.md,
          }}>
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              gap: theme.spacing.sm,
            }}>
            <View
              style={{
                paddingHorizontal: theme.spacing.md,
                paddingVertical: theme.spacing.sm,
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

          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: theme.radius.pill,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: theme.colors.primary,
            }}>
            <SymbolView
              name={{ ios: 'play.fill', android: 'play_arrow', web: 'play_arrow' }}
              size={15}
              weight="bold"
              tintColor={theme.colors.white}
              fallback={
                <Text
                  style={{
                    color: theme.colors.white,
                    fontSize: theme.size.sm,
                    fontWeight: theme.weight.bold,
                  }}>
                  Play
                </Text>
              }
            />
          </View>
        </View>
      </Animated.View>
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
      {card}
    </Link>
  );
}

export default function LearnScreen() {
  const { t, i18n } = useTranslation();
  const { db } = useDbStore();
  const { isPro } = useSubscription();
  const { width } = useWindowDimensions();
  const [lessons, setLessons] = useState<ResolvedLesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const cardWidth = Math.min(300, width - theme.spacing.xl * 2);
  const cardGap = theme.spacing.md;
  const snapInterval = cardWidth + cardGap;
  const toolCardWidth = Math.min(280, width * 0.72);
  const toolGap = theme.spacing.md;
  const toolSnapInterval = toolCardWidth + toolGap;
  const scrollX = useSharedValue(0);
  const onLessonScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  useEffect(() => {
    let isMounted = true;

    async function loadLessons() {
      if (!db) return;

      setIsLoading(true);

      try {
        const result = await resolveLessonTranslations(db, i18n.language);

        if (isMounted) {
          setLessons(result);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadLessons();

    return () => {
      isMounted = false;
    };
  }, [db, i18n.language]);

  const renderLesson: ListRenderItem<ResolvedLesson> = ({ item, index }) => (
    <LessonCard
      lesson={item}
      index={index}
      cardWidth={cardWidth}
      snapInterval={snapInterval}
      scrollX={scrollX}
      isLocked={!isPro && !isLessonFree(item)}
    />
  );

  const renderTool: ListRenderItem<ToolItem> = ({ item }) => (
    <ToolCard tool={item} width={toolCardWidth} isLocked={!isPro} />
  );

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ backgroundColor: theme.colors.background }}
      contentContainerStyle={{
        paddingVertical: theme.spacing.xl,
        gap: theme.spacing.xl,
      }}>
      {isLoading ? (
        <View
          style={{
            paddingVertical: 32,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      ) : null}

      {!isLoading ? (
        <Animated.FlatList
          horizontal
          data={lessons}
          renderItem={renderLesson}
          keyExtractor={(item) => item.slug}
          snapToInterval={snapInterval}
          snapToAlignment="start"
          decelerationRate="fast"
          disableIntervalMomentum
          scrollEventThrottle={16}
          onScroll={onLessonScroll}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: theme.spacing.xl,
          }}
          ItemSeparatorComponent={() => <View style={{ width: cardGap }} />}
          ListEmptyComponent={
            <Animated.View
              style={{
                width: cardWidth,
                alignSelf: 'flex-start',
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
            </Animated.View>
          }
        />
      ) : null}

      <View
        style={{
          paddingHorizontal: theme.spacing.xl,
          gap: theme.spacing.xs,
        }}>
        <Text
          selectable
          style={{
            fontSize: theme.size.xl,
            fontWeight: theme.weight.bold,
            color: theme.colors.textPrimary,
          }}>
          {t('learn.toolsSectionTitle')}
        </Text>
      </View>

      <Animated.FlatList
        horizontal
        data={toolItems}
        renderItem={renderTool}
        keyExtractor={(item) => item.id}
        snapToInterval={toolSnapInterval}
        snapToAlignment="start"
        decelerationRate="fast"
        disableIntervalMomentum
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: theme.spacing.xl,
        }}
        ItemSeparatorComponent={() => <View style={{ width: toolGap }} />}
      />
    </ScrollView>
  );
}
