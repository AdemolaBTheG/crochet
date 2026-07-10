import LoadingShimmer from '@/components/shimmer/loading-shimmer';
import { theme } from '@/constants/Theme';
import { isPatternFree } from '@/constants/gates';
import { getPatternImageSource } from '@/constants/pattern-images';
import { useSubscription } from '@/context/SubscriptionContext';
import { usePatternFolder, usePatternIdsForFolder } from '@/hooks/use-pattern-folders';
import { usePatterns } from '@/hooks/use-patterns';
import { tap, warn } from '@/services/haptics';
import { FlashList } from '@shopify/flash-list';
import { Image } from 'expo-image';
import {
    Link,
    router,
    Stack,
    useLocalSearchParams,
    usePreventZoomTransitionDismissal,
} from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, Pressable, Text, useWindowDimensions, View } from 'react-native';

export default function FolderDetailScreen() {
  const { t, i18n } = useTranslation();
  const { isPro } = useSubscription();
  usePreventZoomTransitionDismissal();
  const params = useLocalSearchParams<{ id?: string }>();
  const { width } = useWindowDimensions();
  const [searchQuery, setSearchQuery] = useState('');
  const folderId = typeof params.id === 'string' ? Number.parseInt(params.id, 10) : null;
  const validFolderId = Number.isFinite(folderId) ? folderId : null;
  const { data: folder, isLoading: isFolderLoading } = usePatternFolder(validFolderId);
  const { data: patternIds = [], isLoading: isFolderPatternIdsLoading } =
    usePatternIdsForFolder(validFolderId);
  const { data: patterns = [], isLoading: isPatternsLoading } = usePatterns(i18n.language);
  const horizontalPadding = theme.spacing.lg;
  const gridGap = theme.spacing.md;
  const itemWidth = (width - horizontalPadding * 2 - gridGap) / 2;

  const filteredPatterns = useMemo(() => {
    const folderPatternIds = new Set(patternIds);
    const query = searchQuery.trim().toLowerCase();

    return patterns.filter((pattern) => {
      if (!folderPatternIds.has(pattern.id)) return false;
      if (!query) return true;

      const haystacks = [
        pattern.title,
        pattern.description ?? '',
        pattern.category ?? '',
        pattern.materials.join(' '),
        pattern.skills.join(' '),
      ];

      return haystacks.some((value) => value.toLowerCase().includes(query));
    });
  }, [patternIds, patterns, searchQuery]);

  const isLoading = isFolderLoading || isFolderPatternIdsLoading || isPatternsLoading;

  return (
    <>
      <Stack.Screen
        options={{
          title: folder?.name ?? t('folders.detail.fallbackTitle'),
          headerLargeTitle: false,
          headerTransparent: true,
          ...(Platform.OS === 'ios'
            ? {
                headerSearchBarOptions: {
                  placeholder: t('folders.detail.searchPlaceholder'),
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
        style={{ backgroundColor: theme.colors.background }}
        contentInsetAdjustmentBehavior="automatic"
        data={filteredPatterns}
        numColumns={2}
        keyExtractor={(item) => item.slug}
        contentContainerStyle={{
          paddingHorizontal: horizontalPadding,
          paddingTop: 16,
          backgroundColor: theme.colors.background,
        }}
        ListHeaderComponent={
          folder ? (
            <View
              style={{
                paddingBottom: theme.spacing.lg,
              }}>
              <SymbolView
                name={folder.icon as React.ComponentProps<typeof SymbolView>['name']}
                size={42}
                tintColor={folder.color}
              />

              <Text
                selectable
                style={{
                  fontSize: theme.size.md,
                  color: theme.colors.textSecondary,
                }}>
                {folder.patternCount === 1
                  ? t('folders.detail.patternCount_one', { count: folder.patternCount })
                  : t('folders.detail.patternCount_other', { count: folder.patternCount })}
              </Text>
            </View>
          ) : null
        }
        ItemSeparatorComponent={() => <View style={{ height: gridGap }} />}
        ListEmptyComponent={
          isLoading ? (
            <LoadingShimmer />
          ) : (
            <View
              style={{
                paddingTop: theme.spacing['2xl'],
                alignItems: 'center',
                gap: theme.spacing.md,
              }}>
              <SymbolView
                name="square.grid.2x2.fill"
                size={40}
                tintColor={theme.colors.textTertiary}
                weight="semibold"
              />
              <Text
                selectable
                style={{
                  fontSize: theme.size.lg,
                  fontWeight: theme.weight.semibold,
                  color: theme.colors.textPrimary,
                }}>
                {searchQuery.trim()
                  ? t('folders.detail.emptySearchTitle')
                  : t('folders.detail.emptyTitle')}
              </Text>
              <Text
                selectable
                style={{
                  maxWidth: 280,
                  textAlign: 'center',
                  fontSize: theme.size.md,
                  lineHeight: 22,
                  color: theme.colors.textSecondary,
                }}>
                {searchQuery.trim()
                  ? t('folders.detail.emptySearchSubtitle')
                  : t('folders.detail.emptySubtitle')}
              </Text>
            </View>
          )
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
              accessibilityLabel={
                isLocked
                  ? t('folders.detail.accessibility.unlockPattern', { title: item.title })
                  : t('folders.detail.accessibility.openPattern', { title: item.title })
              }>
              {isLocked ? (
                <Image
                  source={source}
                  contentFit="cover"
                  transition={300}
                  cachePolicy="memory-disk"
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
                    {t('common.badges.pro')}
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
    </>
  );
}
