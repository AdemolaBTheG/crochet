import { logFirebaseEvent } from '@/services/firebaseAnalytics';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { View } from 'react-native';
import RevenueCatUI from 'react-native-purchases-ui';

export default function Paywall() {
    useEffect(() => {
        void logFirebaseEvent('paywall_view', { source: 'default' });
    }, []);

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
