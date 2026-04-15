import { PressableScale } from '@/components/pressable-scale';
import { theme } from '@/constants/Theme';
import i18n from '@/i18n';
import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics';
import { router } from 'expo-router';
import { FC, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NutrientsCarousel } from '../components/nutrients-carousel';
// alma-nutrients-circular-carousel-animation

export type NutrientsItem = {
  emoji: string;
  description: string;
  backgroundElement: ReactNode;
};

const styles = StyleSheet.create({
  borderCurve: {
    borderCurve: 'continuous',
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: theme.size['2xl'],
    lineHeight: 34,
    fontWeight: theme.weight.semibold,
  },
  titleAccent: {
    color: theme.colors.primary,
    textDecorationLine: 'underline',
  },
  ctaLabel: {
    color: theme.colors.white,
    fontSize: theme.size.lg,
    fontWeight: theme.weight.medium,
  },
  shapeBase: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  shapeTiltA: {
    transform: [{ rotate: '-45deg' }],
  },
  shapeTiltB: {
    transform: [{ rotate: '45deg' }],
  },
  shapeCircle: {
    position: 'absolute',
    width: '50%',
    aspectRatio: 1,
    borderRadius: 999,
  },
  shapePill: {
    position: 'absolute',
    width: '50%',
    height: '100%',
    borderRadius: 999,
    transform: [{ rotate: '25deg' }],
  },
  shapeTopLeft: {
    top: '-25%',
    left: '-5%',
  },
  shapeTopRight: {
    top: '-30%',
    right: '-8%',
  },
  shapeBottomLeft: {
    bottom: '-18%',
    left: '-8%',
  },
  shapeBottomRight: {
    bottom: '-25%',
    right: '-4%',
  },
  counterChip: {
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
});

const SLIDES: NutrientsItem[] = [
  {
    emoji: '🧶',
    description: 'Learn stitches',
    backgroundElement: (
      <>
        <View
          style={[
            styles.shapeBase,
            styles.shapeTiltA,
            { backgroundColor: theme.colors.primarySoft },
          ]}
        />
        <View
          style={[
            styles.shapeCircle,
            styles.shapeTopLeft,
            { backgroundColor: theme.colors.primaryBorder },
          ]}
        />
        <View
          style={[
            styles.shapePill,
            styles.shapeBottomRight,
            { backgroundColor: theme.colors.primarySoft },
          ]}
        />
      </>
    ),
  },
  {
    emoji: '✅',
    description: 'Finish projects',
    backgroundElement: (
      <>
        <View
          style={[
            styles.shapeBase,
            styles.shapeTiltB,
            { backgroundColor: theme.colors.primarySoft },
          ]}
        />
        <View
          style={[
            styles.shapeCircle,
            styles.shapeBottomLeft,
            { backgroundColor: theme.colors.primaryBorder },
          ]}
        />
        <View
          style={[
            styles.shapePill,
            styles.shapeTopRight,
            { backgroundColor: theme.colors.primarySoft },
          ]}
        />
      </>
    ),
  },
  {
    emoji: '📏',
    description: 'Track each row',
    backgroundElement: (
      <>
        <View
          style={[
            styles.shapeBase,
            styles.shapeTiltA,
            { backgroundColor: theme.colors.primarySoft },
          ]}
        />
        <View
          style={[
            styles.shapeCircle,
            styles.shapeBottomLeft,
            { backgroundColor: theme.colors.primaryBorder },
          ]}
        />
        <View
          style={[
            styles.shapePill,
            styles.shapeTopRight,
            { backgroundColor: theme.colors.primarySoft },
          ]}
        />
        <View
          style={[
            styles.counterChip,
            {
              backgroundColor: theme.colors.white,
              borderColor: theme.colors.border,
            },
          ]}>
          <Text style={{ color: theme.colors.textSecondary, fontSize: theme.size.sm }}>
            {i18n.t('onboarding.intro.rowProgress', { current: 18, total: 32 })}
          </Text>
        </View>
      </>
    ),
  },
  {
    emoji: '🧵',
    description: 'Build your habit',
    backgroundElement: (
      <>
        <View
          style={[
            styles.shapeBase,
            styles.shapeTiltB,
            { backgroundColor: theme.colors.primarySoft },
          ]}
        />
        <View
          style={[
            styles.shapeCircle,
            styles.shapeTopLeft,
            { backgroundColor: theme.colors.primaryBorder },
          ]}
        />
        <View
          style={[
            styles.shapePill,
            styles.shapeBottomRight,
            { backgroundColor: theme.colors.primarySoft },
          ]}
        />
      </>
    ),
  },
  {
    emoji: '🏁',
    description: 'Stay consistent',
    backgroundElement: (
      <>
        <View
          style={[
            styles.shapeBase,
            styles.shapeTiltA,
            { backgroundColor: theme.colors.primarySoft },
          ]}
        />
        <View
          style={[
            styles.shapeCircle,
            styles.shapeBottomLeft,
            { backgroundColor: theme.colors.primaryBorder },
          ]}
        />
        <View
          style={[
            styles.shapePill,
            styles.shapeTopRight,
            { backgroundColor: theme.colors.primarySoft },
          ]}
        />
      </>
    ),
  },
];

export const Nutrients: FC = () => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const slides: NutrientsItem[] = [
    { ...SLIDES[0], description: t('onboarding.intro.slides.learnStitches') },
    { ...SLIDES[1], description: t('onboarding.intro.slides.finishProjects') },
    { ...SLIDES[2], description: t('onboarding.intro.slides.trackRows') },
    { ...SLIDES[3], description: t('onboarding.intro.slides.buildHabit') },
    { ...SLIDES[4], description: t('onboarding.intro.slides.stayConsistent') },
  ];

  return (
    <View
      className="flex-1"
      style={{
        backgroundColor: theme.colors.background,
        paddingTop: insets.top + 8,
        paddingBottom: insets.bottom + 8,
      }}>
      <NutrientsCarousel slides={slides} />

      <Text className="px-10 text-center" style={styles.title}>
        {t('onboarding.intro.titlePrefix')}{' '}
        <Text style={styles.titleAccent}>{t('onboarding.intro.titleAccent')}</Text>
      </Text>

      <View className="px-8 mt-auto">
        <PressableScale
          className="h-14 px-3 rounded-[19px] items-center justify-center"
          style={[styles.borderCurve, { backgroundColor: theme.colors.primary }]}
          onPress={() => {
            impactAsync(ImpactFeedbackStyle.Medium);
            router.push('/(onboarding)/questions');
          }}>
          <Text style={styles.ctaLabel}>{t('common.continue')}</Text>
        </PressableScale>
      </View>
    </View>
  );
};

// alma-nutrients-circular-carousel-animation
