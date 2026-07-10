import { PressableScale } from '@/components/pressable-scale';
import { theme } from '@/constants/Theme';
import { tap } from '@/services/haptics';
import { usePatternImportStore } from '@/stores/patternImportStore';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useTranslation } from 'react-i18next';
import {
  ActionSheetIOS,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type SourceCard = {
  id: 'file' | 'photo' | 'website' | 'youtube';
  icon: React.ComponentProps<typeof SymbolView>['name'];
  tintColor: string;
  backgroundColor: string;
};

const sourceCards: SourceCard[] = [
  {
    id: 'file',
    icon: { ios: 'document', android: 'description', web: 'description' },
    tintColor: '#2F6B5A',
    backgroundColor: '#E3F0EA',
  },
  {
    id: 'photo',
    icon: { ios: 'photo', android: 'image', web: 'image' },
    tintColor: '#A4512B',
    backgroundColor: '#F5E4D8',
  },
  {
    id: 'website',
    icon: { ios: 'link', android: 'link', web: 'link' },
    tintColor: '#355C9A',
    backgroundColor: '#E3ECFA',
  },
  {
    id: 'youtube',
    icon: { ios: 'play.rectangle', android: 'smart_display', web: 'smart_display' },
    tintColor: '#E53935',
    backgroundColor: '#F9E0DE',
  },
];

export default function AddPatternScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const setRequest = usePatternImportStore((state) => state.setRequest);
  const horizontalPadding = theme.spacing['2xl'] * 2;
  const cardGap = theme.spacing.lg;
  const cardWidth = (width - horizontalPadding - cardGap) / 2;

  async function readBase64FromUri(uri: string) {
    return FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
  }

  async function pickPhotoFromLibrary() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        t('addPattern.photoSource.permissionTitle'),
        t('addPattern.photoSource.permissionMessage'),
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 1,
    });

    if (result.canceled) return;

    const asset = result.assets[0];
    const base64 = await readBase64FromUri(asset.uri);
    setRequest({
      source: 'photo',
      mimeType: asset.mimeType ?? 'image/jpeg',
      base64,
    });
    router.push('/(add)/processing');
  }

  async function takePhoto() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        t('addPattern.photoSource.cameraPermissionTitle'),
        t('addPattern.photoSource.cameraPermissionMessage'),
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 1,
      mediaTypes: ['images'],
    });

    if (result.canceled) return;

    const asset = result.assets[0];
    const base64 = await readBase64FromUri(asset.uri);
    setRequest({
      source: 'photo',
      mimeType: asset.mimeType ?? 'image/jpeg',
      base64,
    });
    router.push('/(add)/processing');
  }

  function openPhotoSourceMenu() {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [
            t('addPattern.photoSource.cancel'),
            t('addPattern.photoSource.takePicture'),
            t('addPattern.photoSource.photoLibrary'),
          ],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            void takePhoto();
            return;
          }

          if (buttonIndex === 2) {
            void pickPhotoFromLibrary();
          }
        },
      );
      return;
    }

    Alert.alert(t('addPattern.photoSource.chooseSource'), undefined, [
      { text: t('addPattern.photoSource.cancel'), style: 'cancel' },
      { text: t('addPattern.photoSource.takePicture'), onPress: () => void takePhoto() },
      {
        text: t('addPattern.photoSource.photoLibrary'),
        onPress: () => void pickPhotoFromLibrary(),
      },
    ]);
  }

  async function handleSourcePress(source: SourceCard['id']) {
    if (source === 'photo') {
      openPhotoSourceMenu();
      return;
    }

    if (source === 'file') {
      const result = await DocumentPicker.getDocumentAsync({
        multiple: false,
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;

      const asset = result.assets[0];
      const base64 = await readBase64FromUri(asset.uri);
      setRequest({
        source: 'file',
        fileName: asset.name,
        mimeType: asset.mimeType ?? 'application/octet-stream',
        base64,
      });
      router.push('/(add)/processing');
      return;
    }

    if (source === 'website' || source === 'youtube') {
      router.push({
        pathname: '/link',
        params: { source },
      });
    }
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom }]}>
      <View style={styles.grid}>
        {sourceCards.map((card) => (
          <View key={card.id} style={[styles.sourceCardWrap, { width: cardWidth }]}>
            <PressableScale
              onPress={() => {
                tap();
                void handleSourcePress(card.id);
              }}
              style={[styles.sourceCard, { backgroundColor: card.backgroundColor }]}>
              <SymbolView
                name={card.icon}
                size={36}
                weight="regular"
                tintColor={card.tintColor}
                fallback={<View style={styles.iconFallback} />}
              />
              <Text selectable={false} style={[styles.sourceLabel, { color: card.tintColor }]}>
                {t(`addPattern.sourceCards.${card.id}`)}
              </Text>
            </PressableScale>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: theme.spacing['2xl'],
    paddingHorizontal: theme.spacing['2xl'],
  },
  grabber: {
    alignSelf: 'center',
    backgroundColor: 'rgba(60, 53, 46, 0.22)',
    borderRadius: theme.radius.pill,
    height: 14,
    marginBottom: theme.spacing.lg,
    width: 110,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.lg,
  },
  iconFallback: {
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    height: 20,
    width: 20,
  },
  screen: {
    backgroundColor: '#D4D1CC',
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 44,
    borderTopRightRadius: 44,
    flex: 1,
  },
  sourceCard: {
    alignItems: 'center',
    borderRadius: 24,
    borderCurve: 'continuous',
    flex: 1,
    gap: theme.spacing.sm,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
  },
  sourceCardWrap: {
    minWidth: 0,
  },
  sourceLabel: {
    fontSize: theme.size.lg,
    fontWeight: theme.weight.semibold,
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: 76,
    fontWeight: theme.weight.black,
    letterSpacing: -2.8,
    lineHeight: 82,
  },
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing['2xl'],
  },
});
