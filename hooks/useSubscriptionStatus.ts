import { useEffect, useState } from 'react';
import Purchases, { CustomerInfo } from 'react-native-purchases';
import { ENTITLEMENT_ID } from '../constants/Subscriptions';

interface SubscriptionStatus {
  isPro: boolean;
  isLoading: boolean;
  setIsPro: (isPro: boolean) => void;
}

export function useSubscriptionStatus(enabled = true): SubscriptionStatus {
  const [isPro, setIsPro] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleCustomerInfo = (customerInfo: CustomerInfo) => {
    const isProActive = !!customerInfo.entitlements.active[ENTITLEMENT_ID];

    setIsPro(isProActive);
    setIsLoading(false); // Set loading to false after fetching customer info
  };

  useEffect(() => {
    if (!enabled) {
      setIsLoading(true);
      return;
    }

    let isMounted = true;
    Purchases.addCustomerInfoUpdateListener(handleCustomerInfo);

    const fetchInitialStatus = async () => {
      setIsLoading(true);

      try {
        const configured = await Purchases.isConfigured();

        if (!configured) {
          if (isMounted) {
            setIsPro(false);
            setIsLoading(false);
          }
          return;
        }

        const customerInfo = await Purchases.getCustomerInfo();

        if (isMounted) {
          handleCustomerInfo(customerInfo);
        }
      } catch (error) {
        console.error('Failed to fetch customer info:', error);

        if (isMounted) {
          setIsPro(false);
          setIsLoading(false);
        }
      }
    };

    void fetchInitialStatus();

    return () => {
      isMounted = false;
      Purchases.removeCustomerInfoUpdateListener(handleCustomerInfo);
    };
  }, [enabled]);

  return { setIsPro, isPro, isLoading };
}
