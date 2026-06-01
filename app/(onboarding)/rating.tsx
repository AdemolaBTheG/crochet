import { theme } from '@/constants/Theme';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import * as StoreReview from 'expo-store-review';
import { SymbolView } from 'expo-symbols';
import LottieView from 'lottie-react-native';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const stars = [1, 2, 3, 4, 5] as const;
const ratingAnimation = require('../../assets/animations/rating.json');

export default function Rating() {
  const insets = useSafeAreaInsets();
  const width = useWindowDimensions().width;
  const { t } = useTranslation();
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [isContinuing, setIsContinuing] = useState(false);

  const continueToPaywall = useCallback(async () => {
    if (isContinuing) return;

    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsContinuing(true);

    if ((selectedRating ?? 0) >= 4) {
      try {
        const isAvailable = await StoreReview.isAvailableAsync();
        if (isAvailable) {
          await StoreReview.requestReview();
        }
      } catch {
        // Ignore review prompt failures and continue onboarding.
      }
    }

    router.replace('/(onboarding)/trial-offer');
  }, [isContinuing, selectedRating]);

  return (
    <View style={styles.screen}>
      <View style={styles.content}>
        <LottieView
          source={ratingAnimation}
          autoPlay
          loop
          style={{ width: width * 0.8, aspectRatio: 1 }}
        />

        <View style={styles.copy}>
          <Text selectable style={styles.eyebrow}>
            {t('onboarding.rating.eyebrow')}
          </Text>
          <Text selectable style={styles.title}>
            {t('onboarding.rating.title')}
          </Text>
          <Text selectable style={styles.body}>
            {t('onboarding.rating.body')}
          </Text>
        </View>

        <View style={styles.starRow}>
          {stars.map((star) => {
            const isSelected = selectedRating != null && star <= selectedRating;

            return (
              <Pressable
                key={star}
                accessibilityRole="button"
                accessibilityLabel={t('onboarding.rating.accessibility.rateStars', { count: star })}
                onPress={() => {
                  void Haptics.selectionAsync();
                  setSelectedRating(star);
                }}
                style={styles.starButton}>
                <SymbolView
                  name={
                    isSelected
                      ? { ios: 'star.fill', android: 'star', web: 'star' }
                      : { ios: 'star', android: 'star_outline', web: 'star_outline' }
                  }
                  size={36}
                  weight="semibold"
                  tintColor={isSelected ? '#F59E0B' : theme.colors.textTertiary}
                  fallback={<View style={styles.starFallback} />}
                />
              </Pressable>
            );
          })}
        </View>

        <Text selectable style={styles.helpText}>
          {t('onboarding.rating.helpText')}
        </Text>
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + theme.spacing.xl }]}>
        <Pressable
          accessibilityRole="button"
          disabled={isContinuing}
          onPress={continueToPaywall}
          style={[styles.primaryButton, isContinuing && styles.primaryButtonDisabled]}>
          <Text style={styles.primaryButtonText}>
            {selectedRating != null
              ? t('onboarding.rating.continue')
              : t('onboarding.rating.skipForNow')}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  animationWrap: {
    alignItems: 'center',
    backgroundColor: theme.colors.primarySoft,
    borderColor: theme.colors.primaryBorder,
    borderCurve: 'continuous',
    borderRadius: theme.radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    justifyContent: 'center',
    padding: theme.spacing.md,
  },
  body: {
    color: theme.colors.textSecondary,
    fontSize: theme.size.md,
    lineHeight: 22,
    textAlign: 'center',
  },
  content: {
    alignItems: 'center',
    flex: 1,
    gap: theme.spacing['2xl'],
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  copy: {
    gap: theme.spacing.sm,
    maxWidth: 328,
  },
  eyebrow: {
    color: theme.colors.primary,
    fontSize: theme.size.sm,
    fontWeight: theme.weight.bold,
    letterSpacing: 0.5,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  footer: {
    gap: theme.spacing.md,
    paddingBottom: 64,
    paddingHorizontal: theme.spacing.xl,
  },
  helpText: {
    color: theme.colors.textTertiary,
    fontSize: theme.size.sm,
    fontWeight: theme.weight.medium,
    textAlign: 'center',
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderCurve: 'continuous',
    borderRadius: theme.radius.pill,
    justifyContent: 'center',
    minHeight: 58,
    paddingHorizontal: theme.spacing.xl,
  },
  primaryButtonDisabled: {
    opacity: 0.55,
  },
  primaryButtonText: {
    color: theme.colors.white,
    fontSize: theme.size.lg,
    fontWeight: theme.weight.bold,
  },
  screen: {
    backgroundColor: theme.colors.background,
    flex: 1,
  },
  starButton: {
    padding: theme.spacing.xs,
  },
  starFallback: {
    height: 36,
    width: 36,
  },
  starRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: theme.size['2xl'],
    fontWeight: theme.weight.bold,
    lineHeight: 30,
    textAlign: 'center',
  },
});
