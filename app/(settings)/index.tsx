import { theme } from '@/constants/Theme';
import { useSubscription } from '@/context/SubscriptionContext';
import { askForReview } from '@/utils/review';
import { LinearGradient } from 'expo-linear-gradient';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, SectionList, Text, View } from 'react-native';
import RevenueCatUI from 'react-native-purchases-ui';

type SettingsRow = {
  id: string;
  label: string;
  icon: React.ComponentProps<typeof SymbolView>['name'];
  onPress: () => void;
};

type SettingsSection = {
  title: string;
  data: SettingsRow[][];
};

const supportEmail = 'hahaderbre@gmail.com';
const termsUrl =
  'https://ajar-prune-18d.notion.site/Terms-Of-Service-28799fdd69fc80108a38c0ed9a941492';
const privacyUrl =
  'https://ajar-prune-18d.notion.site/Privacy-Policy-28799fdd69fc8054a359d8d2fd95cb46';

function SettingsIcon({ name }: { name: React.ComponentProps<typeof SymbolView>['name'] }) {
  return (
    <View
      style={{
        padding: 8,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: theme.radius.md,
        borderCurve: 'continuous',
        backgroundColor: theme.colors.primarySoft,
      }}>
      <SymbolView
        name={name}
        size={20}
        weight="semibold"
        tintColor={theme.colors.primary}
        fallback={<View style={{ width: 18, height: 18 }} />}
      />
    </View>
  );
}

function SettingsSectionCard({ rows }: { rows: SettingsRow[] }) {
  return (
    <View
      style={{
        width: '100%',
        overflow: 'hidden',
        borderRadius: theme.radius.xl,
        borderCurve: 'continuous',
        backgroundColor: theme.colors.surface,
      }}>
      {rows.map((row, index) => (
        <React.Fragment key={row.id}>
          <Pressable
            onPress={row.onPress}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: theme.spacing.md,
              paddingVertical: theme.spacing.md,
              paddingHorizontal: theme.spacing.lg,
            }}
            accessibilityRole="button">
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}>
              <SettingsIcon name={row.icon} />
              <Text
                selectable
                style={{
                  fontSize: theme.size.lg,
                  fontWeight: theme.weight.semibold,
                  color: theme.colors.textPrimary,
                }}>
                {row.label}
              </Text>
            </View>

            <SymbolView
              name={{ ios: 'chevron.forward', android: 'chevron_right', web: 'chevron_right' }}
              size={15}
              weight="semibold"
              tintColor={theme.colors.textTertiary}
              fallback={<View style={{ width: 15, height: 15 }} />}
            />
          </Pressable>
          {index < rows.length - 1 ? (
            <View
              style={{
                height: 1,
                marginLeft: 64,
                backgroundColor: theme.colors.border,
              }}
            />
          ) : null}
        </React.Fragment>
      ))}
    </View>
  );
}

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { isPro } = useSubscription();

  async function openCustomerCenter() {
    try {
      await RevenueCatUI.presentCustomerCenter();
    } catch {
      Alert.alert(
        t('settings.alerts.customerCenterUnavailableTitle'),
        t('settings.alerts.customerCenterUnavailableMessage'),
      );
    }
  }

  const sections: SettingsSection[] = [
    {
      title: t('settings.sections.support'),
      data: [
        [
          {
            id: 'feedback',
            label: t('settings.rows.sendFeedback'),
            icon: { ios: 'envelope.fill', android: 'mail', web: 'mail' },
            onPress: () => {
              void Linking.openURL(`mailto:${supportEmail}`);
            },
          },
          {
            id: 'rate-app',
            label: t('settings.rows.rateApp'),
            icon: { ios: 'star.fill', android: 'star', web: 'star' },
            onPress: () => {
              void askForReview({ source: 'settings', force: true });
            },
          },
          {
            id: 'customer-center',
            label: t('settings.rows.customerCenter'),
            icon: { ios: 'questionmark.circle.fill', android: 'help', web: 'help' },
            onPress: () => {
              void openCustomerCenter();
            },
          },
        ],
      ],
    },
    {
      title: t('settings.sections.legal'),
      data: [
        [
          {
            id: 'terms',
            label: t('settings.rows.terms'),
            icon: { ios: 'doc.text.fill', android: 'description', web: 'description' },
            onPress: () => {
              void Linking.openURL(termsUrl);
            },
          },
          {
            id: 'privacy',
            label: t('settings.rows.privacyPolicy'),
            icon: { ios: 'lock.fill', android: 'lock', web: 'lock' },
            onPress: () => {
              void Linking.openURL(privacyUrl);
            },
          },
        ],
      ],
    },
  ];

  return (
    <SectionList
      ListHeaderComponent={
        !isPro ? (
          <Pressable
            onPress={() => router.push('/(paywalls)')}
            style={{
              marginTop: theme.spacing.lg,
              marginBottom: theme.spacing.sm,
              overflow: 'hidden',
              borderRadius: theme.radius.xl + 4,
              borderCurve: 'continuous',
            }}
            accessibilityRole="button"
            accessibilityLabel={t('settings.accessibility.openPremiumUpgrade')}>
            <LinearGradient
              colors={['#1F4E42', theme.colors.primary, '#6F8F5D']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                paddingVertical: theme.spacing.xl,
                paddingHorizontal: theme.spacing.lg,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: theme.spacing.md,
              }}>
              <View
                style={{
                  flex: 1,
                  minWidth: 0,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: theme.spacing.md,
                }}>
                <SymbolView
                  name={{ ios: 'sparkles', android: 'auto_awesome', web: 'auto_awesome' }}
                  size={32}
                  weight="semibold"
                  tintColor={theme.colors.white}
                  fallback={<View style={{ width: 22, height: 22 }} />}
                />
                <View style={{ flex: 1, minWidth: 0, gap: theme.spacing.xs }}>
                  <Text
                    selectable
                    numberOfLines={1}
                    style={{
                      fontSize: theme.size.lg,
                      fontWeight: theme.weight.bold,
                      color: theme.colors.white,
                    }}>
                    {t('settings.premium.title')}
                  </Text>
                  <Text
                    selectable
                    numberOfLines={2}
                    style={{
                      fontSize: theme.size.md,
                      lineHeight: theme.size.md + 5,
                      color: 'rgba(255, 255, 255, 0.78)',
                    }}>
                    {t('settings.premium.subtitle')}
                  </Text>
                </View>
              </View>
              <View
                style={{
                  paddingVertical: theme.spacing.sm,
                  paddingHorizontal: theme.spacing.md,
                  borderRadius: theme.radius.pill,
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.34)',
                  backgroundColor: 'rgba(255, 255, 255, 0.18)',
                }}>
                <Text
                  selectable
                  style={{
                    fontSize: theme.size.md,
                    fontWeight: theme.weight.bold,
                    color: theme.colors.white,
                  }}>
                  {t('settings.premium.cta')}
                </Text>
              </View>
            </LinearGradient>
          </Pressable>
        ) : null
      }
      sections={sections}
      keyExtractor={(_, index) => index.toString()}
      contentInsetAdjustmentBehavior="automatic"
      stickySectionHeadersEnabled={false}
      showsVerticalScrollIndicator={false}
      style={{ backgroundColor: theme.colors.background }}
      contentContainerStyle={{
        paddingHorizontal: theme.spacing.xl,
        paddingBottom: theme.spacing['3xl'],
        backgroundColor: theme.colors.background,
      }}
      renderSectionHeader={({ section }) => (
        <Text
          selectable
          style={{
            marginTop: theme.spacing.xl,
            marginBottom: theme.spacing.sm,
            marginLeft: theme.spacing.sm,
            fontSize: theme.size.sm,
            fontWeight: theme.weight.semibold,
            color: theme.colors.textTertiary,
            textTransform: 'uppercase',
            letterSpacing: 0.6,
          }}>
          {section.title}
        </Text>
      )}
      renderItem={({ item }) => <SettingsSectionCard rows={item} />}
    />
  );
}
