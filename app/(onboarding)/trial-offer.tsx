import { PressableScale } from '@/components/pressable-scale';
import { theme } from '@/constants/Theme';
import { cta } from '@/services/haptics';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Text, View, useWindowDimensions } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TrialOfferScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { t } = useTranslation();

  function goToPaywall() {
    cta();
    router.push('/(paywalls)');
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: theme.spacing.xl,
          gap: theme.spacing['2xl'],
        }}>
        <Animated.View
          entering={FadeInDown.duration(400).delay(200)}
          style={{ alignItems: 'center', gap: theme.spacing.md }}>
          <Animated.Text
            entering={FadeInDown.duration(500).delay(400)}
            style={{
              fontSize: theme.size['2xl'],
              fontWeight: theme.weight.extrabold,
              color: theme.colors.textPrimary,
              textAlign: 'center',
              letterSpacing: -0.5,
              lineHeight: theme.size['3xl'] * 1.2,
            }}>
            {(() => {
              const [line1, line2] = t('onboarding.trialOffer.title').split('\n');
              return (
                <>
                  {line1}
                  {'\n'}
                  <Text style={{ color: theme.colors.primary, fontWeight: theme.weight.black }}>
                    {line2}
                  </Text>
                </>
              );
            })()}
          </Animated.Text>
        </Animated.View>
        <Animated.View
          entering={FadeInDown.duration(400)}
          style={{
            width: width * 1.2,
            overflow: 'hidden',
          }}>
          <Image
            source={require('@/assets/images/trial-offer.png')}
            style={{
              width: '100%',
              aspectRatio: 1,
              borderRadius: theme.radius.lg,
            }}
            transition={300}
            contentFit="contain"
          />
        </Animated.View>
      </View>

      <View
        style={{
          paddingHorizontal: theme.spacing.xl,
          paddingBottom: insets.bottom + theme.spacing.xl,
          gap: theme.spacing.md,
        }}>
        <Animated.View entering={FadeInUp.duration(500).delay(800)}>
          <PressableScale
            onPress={goToPaywall}
            accessibilityRole="button"
            style={{
              paddingVertical: theme.spacing.lg,
              borderRadius: theme.radius.pill,
              backgroundColor: theme.colors.primary,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text
              style={{
                fontSize: theme.size.lg,
                fontWeight: theme.weight.bold,
                color: theme.colors.white,
              }}>
              {t('common.continue')}
            </Text>
          </PressableScale>
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(500).delay(1000)}>
          <Text
            style={{
              fontSize: theme.size.sm,
              fontWeight: theme.weight.regular,
              color: theme.colors.textTertiary,
              textAlign: 'center',
              lineHeight: theme.size.sm * 1.5,
            }}>
            {t('onboarding.trialOffer.footer')}
          </Text>
        </Animated.View>
      </View>
    </View>
  );
}
