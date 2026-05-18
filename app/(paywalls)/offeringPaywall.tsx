import { useSubscription } from "@/context/SubscriptionContext";
import { theme } from '@/constants/Theme';
import { logFirebaseEvent } from '@/services/firebaseAnalytics';
import { Redirect, router } from "expo-router";
import { usePostHog } from 'posthog-react-native';
import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import Purchases, { PurchasesOffering } from "react-native-purchases";
import RevenueCatUI from "react-native-purchases-ui";
export default function Paywall() {
    const posthog = usePostHog();
    const [promoOffering, setPromoOffering] =
        React.useState<PurchasesOffering | null>(null);
    const { isLoading, isPro } = useSubscription();

    useEffect(() => {
        posthog?.capture('Paywall Viewed', { source: 'onboarding' });
        void logFirebaseEvent('paywall_view', { source: 'offering' });
    }, [posthog]);

    useEffect(() => {
        const fetchOfferings = async () => {
            try {
                const offerings = await Purchases.getOfferings();
                if (
                    offerings.current !== null &&
                    offerings.current.availablePackages.length !== 0
                ) {
                    // Display packages for sale
                    setPromoOffering(offerings.all?.Offer);
                }
            } catch (e) {
                console.error("Error fetching offerings", e);
            }
        };
        fetchOfferings();
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
            {promoOffering ? (
                <RevenueCatUI.Paywall
                    options={{
                        offering: promoOffering,
                    }}
                    onDismiss={() => {
                        posthog?.capture('Paywall Dismissed');
                        router.replace("/(tabs)/(home)");
                    }}
                    onPurchaseCompleted={async () => {
                        router.replace("/(tabs)/(home)");
                    }}
                />
            ) : (
                <ActivityIndicator
                    size="large"
                    color="#14b8a6"
                    style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
                />
            )}
        </View>
    );
}
