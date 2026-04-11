import { theme } from '@/constants/Theme';
import { patternImages, type PatternImageKey } from '@/constants/pattern-images';
import { patterns as patternsTable, type Pattern } from '@/db/schema';
import { useDbStore } from '@/stores/dbStore';
import { FlashList } from '@shopify/flash-list';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, useWindowDimensions, View } from 'react-native';

export default function HomeScreen() {
  const { db } = useDbStore();
  const { width } = useWindowDimensions();
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const gridGap = 10;
  const horizontalPadding = 16;
  const itemWidth = Math.floor((width - horizontalPadding * 2 - gridGap) / 2);

  useEffect(() => {
    let isMounted = true;

    async function loadPatterns() {
      if (!db) {
        return;
      }

      setIsLoading(true);

      try {
        const result = await db.select().from(patternsTable);

        if (isMounted) {
          setPatterns(result);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadPatterns();

    return () => {
      isMounted = false;
    };
  }, [db]);

  return (
    <FlashList
      style={{ backgroundColor: theme.colors.background }}
      contentInsetAdjustmentBehavior="automatic"
      data={patterns}
      numColumns={2}
      keyExtractor={(item) => item.slug}
      contentContainerStyle={{
        paddingHorizontal: horizontalPadding,
        paddingTop: 16,
        paddingBottom: 32,
        backgroundColor: theme.colors.background,
      }}
      ItemSeparatorComponent={() => <View style={{ height: gridGap }} />}
      ListEmptyComponent={
        isLoading ? (
          <View style={{ paddingVertical: 32, alignItems: 'center' }}>
            <ActivityIndicator color={theme.colors.primary} />
          </View>
        ) : null
      }
      renderItem={({ item, index }) => {
        const source = patternImages[item.coverImageKey as PatternImageKey];
        const isLeftColumn = index % 2 === 0;

        return (
          <View
            style={{
              width: itemWidth,
              marginRight: isLeftColumn ? gridGap : 0,
            }}>
            <Link
              href={{
                pathname: '/(patterns)/[slug]',
                params: { slug: item.slug },
              }}
              asChild>
              <Pressable
                style={{
                  borderRadius: 24,
                  borderCurve: 'continuous',
                  overflow: 'hidden',
                  backgroundColor: theme.colors.muted,
                }}
                accessibilityRole="button"
                accessibilityLabel={`Open ${item.title} pattern`}>
                <Link.AppleZoom>
                  <Image
                    source={source}
                    contentFit="cover"
                    style={{ width: '100%', aspectRatio: 4 / 5 }}
                  />
                </Link.AppleZoom>
              </Pressable>
            </Link>
          </View>
        );
      }}
    />
  );
}
