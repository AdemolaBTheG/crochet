import { useDbStore } from '@/stores/dbStore';
import { getFirebaseAppInstanceId } from '@/services/firebaseAnalytics';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { OneSignal } from 'react-native-onesignal';
import Purchases from 'react-native-purchases';

const rc_apple_api_key = process.env.EXPO_PUBLIC_RC_APPLE_API_KEY || '';
const onesignal_app_id = process.env.EXPO_PUBLIC_ONESIGNAL_APP_ID || '';
const rc_google_api_key = process.env.EXPO_PUBLIC_RC_GOOGLE_API_KEY || '';

export function useAppInitialization() {
  const [isReady, setIsReady] = useState(false);
  const { initializeDb } = useDbStore();

  useEffect(() => {
    const isOneSignalEnabled = Platform.OS === 'ios' && !!onesignal_app_id;
    let isPurchasesConfigured = false;
    let userObserver: any | null = null;
    let isMounted = true;

    const configurePurchases = async () => {
      if (Platform.OS === 'ios' && rc_apple_api_key) {
        Purchases.configure({ apiKey: rc_apple_api_key });
      } else if (Platform.OS === 'android' && rc_google_api_key) {
        Purchases.configure({ apiKey: rc_google_api_key });
      }
      isPurchasesConfigured = await Purchases.isConfigured();
      if (isPurchasesConfigured) {
        await Purchases.enableAdServicesAttributionTokenCollection();
      }
    };

    const syncFirebaseAnalyticsToRevenueCat = async () => {
      if (!isPurchasesConfigured || Platform.OS !== 'android') {
        return;
      }

      try {
        const firebaseAppInstanceId = await getFirebaseAppInstanceId();
        if (firebaseAppInstanceId) {
          await Purchases.setFirebaseAppInstanceID(firebaseAppInstanceId);
          await Purchases.syncAttributesAndOfferingsIfNeeded?.();
        }
      } catch (e) {
        console.warn('Firebase Analytics -> RevenueCat sync failed', e);
      }
    };

    const initOneSignal = async () => {
      if (isOneSignalEnabled) {
        OneSignal.initialize(onesignal_app_id);
      }
    };

    const syncIdsToRevenueCat = async () => {
      if (!isOneSignalEnabled || !isPurchasesConfigured) {
        return;
      }

      try {
        const onesignalId = await OneSignal.User.getOnesignalId();
        if (onesignalId) {
          await Purchases.setAttributes({ $onesignalUserId: onesignalId });
          await Purchases.syncAttributesAndOfferingsIfNeeded?.();
        }
      } catch (e) {
        console.warn('Initial OneSignal -> RevenueCat sync failed', e);
      }
    };

    const attachObserver = () => {
      if (!isOneSignalEnabled || !isPurchasesConfigured) {
        return;
      }

      userObserver = OneSignal.User.addEventListener('change', async (user) => {
        try {
          const onesignalId = user.current?.onesignalId;
          if (onesignalId) {
            await Purchases.setAttributes({ $onesignalUserId: onesignalId });
            await Purchases.syncAttributesAndOfferingsIfNeeded?.();
          }
        } catch (e) {
          console.warn('OneSignal -> RevenueCat sync failed', e);
        }
      });
    };

    (async () => {
      try {
        await initializeDb();
        await configurePurchases();
        await syncFirebaseAnalyticsToRevenueCat();
        await initOneSignal();
        await syncIdsToRevenueCat();
        attachObserver();
      } catch (error) {
        console.warn('App initialization failed', error);
      } finally {
        if (isMounted) {
          setIsReady(true);
        }
      }
    })();

    return () => {
      isMounted = false;

      if (isOneSignalEnabled && userObserver) {
        OneSignal.User.removeEventListener?.('change', userObserver);
      }
    };
  }, [initializeDb]);

  return { isReady };
}
