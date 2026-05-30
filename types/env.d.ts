declare namespace NodeJS {
    interface ProcessEnv {
        EXPO_PUBLIC_SUPABASE_URL: string;
        EXPO_PUBLIC_SUPABASE_ANON_KEY: string;
        EXPO_PUBLIC_RC_APPLE_API_KEY: string;
        EXPO_PUBLIC_ONESIGNAL_APP_ID: string;
        EXPO_PUBLIC_POSTHOG_API_KEY: string;
        EXPO_PUBLIC_POSTHOG_HOST: string;
    }
}

declare module 'react-native-pulsar' {
  const Presets: Record<string, () => void>;
  const HapticSupport: { NO_SUPPORT: number };
  const Settings: {
    enableHaptics(state: boolean): void;
    enableSound(state: boolean): void;
    enableCache(state: boolean): void;
    preloadPresets(presets: readonly string[]): void;
    getHapticsSupportLevel(): number;
  };
}
