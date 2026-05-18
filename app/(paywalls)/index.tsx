import { theme } from '@/constants/Theme';
import { useSubscription } from '@/context/SubscriptionContext';
import { logFirebaseEvent } from '@/services/firebaseAnalytics';
import { Redirect, router } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import RevenueCatUI from 'react-native-purchases-ui';

export default function Paywall() {
    const { isLoading, isPro } = useSubscription();

    useEffect(() => {
        void logFirebaseEvent('paywall_view', { source: 'default' });
    }, []);

    if (isLoading) {
        return (
            <View
                style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: theme.colors.background,
                }}>
                <ActivityIndicator color={theme.colors.primary} />
            </View>
        );
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
