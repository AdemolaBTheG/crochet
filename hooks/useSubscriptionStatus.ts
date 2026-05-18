import { useCallback, useEffect, useState } from 'react';
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

  const applyCustomerInfo = useCallback((customerInfo?: CustomerInfo | null) => {
    const isProActive = !!customerInfo?.entitlements.active?.[ENTITLEMENT_ID];
    setIsPro(isProActive);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!enabled) {
      setIsPro(false);
      setIsLoading(true);
      return;
    }

    let isMounted = true;
    let hasListener = false;
    const handleCustomerInfo = (customerInfo: CustomerInfo) => {
      if (!isMounted) return;
      applyCustomerInfo(customerInfo);
    };

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

        Purchases.addCustomerInfoUpdateListener(handleCustomerInfo);
        hasListener = true;

        const customerInfo = await Purchases.getCustomerInfo();

        if (isMounted) {
          applyCustomerInfo(customerInfo);
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
      if (hasListener) {
        Purchases.removeCustomerInfoUpdateListener(handleCustomerInfo);
      }
    };
  }, [applyCustomerInfo, enabled]);

  return { setIsPro, isPro, isLoading };
}
