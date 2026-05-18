import { theme } from '@/constants/Theme';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Icon, VectorIcon } from 'expo-router';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';

export default function TabsLayout() {
  const { t } = useTranslation();
  const isIOS = Platform.OS === 'ios';

  return (
    <NativeTabs tintColor={theme.colors.primary}>
      <NativeTabs.Trigger name="(home)">
        <NativeTabs.Trigger.Label>{t('tabs.home')}</NativeTabs.Trigger.Label>
        {isIOS ? (
          <NativeTabs.Trigger.Icon sf={{ default: 'house', selected: 'house.fill' }} />
        ) : (
          <Icon src={<VectorIcon family={MaterialIcons} name="home" />} />
        )}
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="(learn)">
        <NativeTabs.Trigger.Label>{t('tabs.learn')}</NativeTabs.Trigger.Label>
        {isIOS ? (
          <NativeTabs.Trigger.Icon sf={{ default: 'book', selected: 'book.fill' }} />
        ) : (
          <Icon src={<VectorIcon family={MaterialIcons} name="menu-book" />} />
        )}
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="(projects)">
        <NativeTabs.Trigger.Label>{t('tabs.projects')}</NativeTabs.Trigger.Label>
        {isIOS ? (
          <NativeTabs.Trigger.Icon sf={{ default: 'scissors', selected: 'scissors.circle.fill' }} />
        ) : (
          <Icon src={<VectorIcon family={MaterialIcons} name="content-cut" />} />
        )}
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
