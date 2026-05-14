import analytics from '@react-native-firebase/analytics';
import { Platform } from 'react-native';

type FirebaseEventParams = Record<string, string | number | boolean | null | undefined>;

const isFirebaseAnalyticsEnabled = Platform.OS === 'android';

function cleanParams(params: FirebaseEventParams = {}) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined),
  ) as Record<string, string | number | boolean | null>;
}

export async function getFirebaseAppInstanceId() {
  if (!isFirebaseAnalyticsEnabled) {
    return null;
  }

  return analytics().getAppInstanceId();
}

export async function logFirebaseEvent(name: string, params?: FirebaseEventParams) {
  if (!isFirebaseAnalyticsEnabled) {
    return;
  }

  try {
    await analytics().logEvent(name, cleanParams(params));
  } catch (error) {
    console.warn(`Firebase Analytics event failed: ${name}`, error);
  }
}
