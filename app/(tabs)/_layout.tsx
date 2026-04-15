import { theme } from '@/constants/Theme';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useTranslation } from 'react-i18next';

export default function TabsLayout() {
  const { t } = useTranslation();

  return (
    <NativeTabs tintColor={theme.colors.primary}>
      <NativeTabs.Trigger name="(home)">
        <NativeTabs.Trigger.Label>{t('tabs.home')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={'house.fill'} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="(learn)">
        <NativeTabs.Trigger.Label>{t('tabs.learn')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={'book.fill'} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="(projects)">
        <NativeTabs.Trigger.Label>{t('tabs.projects')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={'scissors.circle.fill'} />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
