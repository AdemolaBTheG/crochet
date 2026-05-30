import { useSubscription } from '@/context/SubscriptionContext';
import { logFirebaseEvent } from '@/services/firebaseAnalytics';
import { Redirect, router } from 'expo-router';
import React, { useEffect } from 'react';
import LoadingShimmer from '@/components/shimmer/loading-shimmer';
import { View } from 'react-native';
import RevenueCatUI from 'react-native-purchases-ui';

export default function Paywall() {
    const { isLoading, isPro } = useSubscription();

    useEffect(() => {
        void logFirebaseEvent('paywall_view', { source: 'default' });
    }, []);

    if (isLoading) {
        return <LoadingShimmer />;
    }

    if (isPro) {
        return <Redirect href="/(tabs)/(home)" />;
    }

    return (
        <View style={{ flex: 1 }}>
            <RevenueCatUI.Paywall
                onDismiss={() => {
                    if (router.canGoBack()) {
                        router.back();
                    } else {
                        router.replace('/(tabs)/(home)');
                    }
                }}
                onPurchaseCompleted={() => {
                    router.replace('/(tabs)/(home)');
                }}
            />
        </View>
    );
}
