import { theme } from '@/constants/Theme';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { FC } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, {
  useAnimatedReaction,
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Dots } from '../components/dots';
import { FeatureItem } from '../components/feature-item';
import { StaggeredText } from '../components/stagged-text';

// alma-onboarding-carousel-animation 🔽

// Layout constants for precise positioning calculations
const HEADER_HEIGHT = 50; // Fixed header height for content padding calculations
const GRADIENT_HEIGHT = 50; // Fade gradient height to blend bottom content seamlessly

type OnboardingItem = {
  description: string;
};

const data: OnboardingItem[] = [
  {
    description: 'Learn core stitches, one step at a time 🧶',
  },
  {
    description: 'Start beginner projects you can actually finish ✅',
  },
  {
    description: 'Track every row so you never lose your place 📏',
  },
];

const FIRST_CARD_IMAGE = require('@/assets/images/patterns/simple-dishcloth.png');

export const Onboarding: FC = () => {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  // Scroll tracking shared values for coordinated animations across components
  const prevOffsetX = useSharedValue(0); // Previous scroll position for direction detection
  const scrollDirection = useSharedValue<'to-left' | 'to-right' | 'idle'>('idle'); // Current scroll direction for animation coordination

  // Index tracking for carousel state management
  const activeIndex = useSharedValue(0); // Current active carousel item (drives dots, text, feature animations)
  const prevIndex = useSharedValue(0); // Previous active item for transition direction detection

  // Worklet-optimized scroll handler for 60fps carousel animations
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      const offsetX = event.contentOffset.x;
      // Clamp to positive values to handle iOS bounce effects
      const positiveOffsetX = Math.max(offsetX, 0);
      const positivePrevOffsetX = Math.max(prevOffsetX.get(), 0);

      // Calculate active index with 0.5 threshold for smooth page transitions
      // That means that when we scroll to the middle of the screen, we switch to the next page
      activeIndex.set(Math.floor(offsetX / width + 0.5));

      // Direction detection logic for feature item transition animations
      if (
        positivePrevOffsetX - positiveOffsetX < 0 &&
        (scrollDirection.get() === 'idle' || scrollDirection.get() === 'to-left')
      ) {
        scrollDirection.set('to-right'); // Scrolling right (next item)
      }

      if (
        positivePrevOffsetX - positiveOffsetX > 0 &&
        (scrollDirection.get() === 'idle' || scrollDirection.get() === 'to-right')
      ) {
        scrollDirection.set('to-left'); // Scrolling left (previous item)
      }

      prevOffsetX.set(offsetX);
    },
  });

  // Capture previous index when scroll direction changes for transition animations
  useAnimatedReaction(
    () => scrollDirection.get(),
    () => {
      prevIndex.set(activeIndex.get()); // Store current as previous for feature item exit animations
    },
  );

  return (
    <View className="flex-1" style={{ backgroundColor: theme.colors.background }}>
      <View
        className="absolute left-0 right-0 items-center justify-center"
        style={{ height: HEADER_HEIGHT, top: insets.top + 8 }}>
        <View
          className="w-12 h-12 rounded-[17px]"
          style={[styles.borderCurve, { backgroundColor: theme.colors.primary }]}
        />
        <Pressable
          className="absolute right-6 z-50"
          onPress={() => router.replace('/(tabs)/(home)')}>
          <Text
            className="font-medium"
            style={{ color: theme.colors.primary, fontSize: theme.size.md }}>
            Skip
          </Text>
        </Pressable>
      </View>
      <Animated.FlatList
        data={data}
        renderItem={({ index }) => (
          <View className="flex-1 items-center justify-center" style={{ width }}>
            <View
              className="w-3/4 h-full rounded-[40px] bg-white overflow-hidden"
              style={styles.borderCurve}>
              {index === 0 ? (
                <>
                  <Image source={FIRST_CARD_IMAGE} contentFit="cover" className="w-full h-full" />
                  <LinearGradient
                    colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.22)']}
                    style={StyleSheet.absoluteFill}
                  />
                  <View
                    className="absolute left-4 top-4 px-3 py-2 rounded-xl"
                    style={{
                      backgroundColor: theme.colors.whiteSoft,
                      borderWidth: 1,
                      borderColor: theme.colors.whiteBorder,
                    }}>
                    <Text
                      style={{
                        color: theme.colors.primary,
                        fontWeight: theme.weight.semibold,
                        fontSize: theme.size.sm,
                      }}>
                      Lesson 1: Chain Stitch
                    </Text>
                  </View>
                </>
              ) : null}
            </View>
          </View>
        )}
        contentContainerStyle={{ paddingTop: insets.top + HEADER_HEIGHT + 28 }}
        horizontal
        pagingEnabled // Enables snap-to-page behavior for carousel
        showsHorizontalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16} // ~60fps scroll updates for smooth animations
      />
      <View
        className="absolute bottom-0 left-0 right-0 px-8 pt-6"
        style={{ backgroundColor: theme.colors.background, paddingBottom: insets.bottom + 8 }}>
        {/* Fade gradient creates seamless blend from transparent to background color */}
        <LinearGradient
          colors={['rgba(247, 244, 238, 0)', theme.colors.background]} // 0% to 100% opacity fade
          style={styles.gradient}
        />
        <View className="items-center mb-10">
          <View className="mb-5 items-center justify-center h-8">
            {/* Overlapping text animations - only one visible per carousel state */}
            <View className="absolute">
              <StaggeredText
                text="Welcome to Crova"
                activeIndex={activeIndex}
                showIndex={[0, 1]} // Show on first two carousel items
              />
            </View>
            <View className="absolute">
              {/* Show on third item */}
              <StaggeredText
                text="Let us set up your path"
                activeIndex={activeIndex}
                showIndex={[2]}
              />
            </View>
          </View>
          <View className="h-14 w-full mb-8 items-center justify-center">
            {data.map((item, index) => (
              <FeatureItem
                key={index}
                label={item.description}
                itemIndex={index}
                activeIndex={activeIndex} // Drives enter/exit animations
                prevIndex={prevIndex} // Determines transition direction
              />
            ))}
          </View>
          {/* Pagination dots with smooth color transitions */}
          <Dots numberOfDots={data.length} activeIndex={activeIndex} />
        </View>
        <Pressable
          className="h-14 px-3 rounded-[19px] items-center justify-center"
          style={[styles.borderCurve, { backgroundColor: theme.colors.primary }]}
          onPress={() => router.push('/(onboarding)/questions')}>
          <Text
            className="text-lg font-medium"
            style={{ color: theme.colors.white, fontSize: theme.size.lg }}>
            Get Started
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  borderCurve: {
    borderCurve: 'continuous',
  },
  gradient: {
    position: 'absolute',
    top: -GRADIENT_HEIGHT,
    left: 0,
    right: 0,
    height: GRADIENT_HEIGHT,
  },
});

// alma-onboarding-carousel-animation 🔼
