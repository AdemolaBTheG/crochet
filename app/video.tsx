import { PressableScale } from '@/components/pressable-scale';
import { theme } from '@/constants/Theme';
import { usePremiumGate } from '@/hooks/usePremiumGate';
import * as ExpoLinking from 'expo-linking';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import YoutubePlayer from 'react-native-youtube-iframe';

function extractYoutubeVideoId(value: string | null | undefined) {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  const directMatch = trimmed.match(/^[\w-]{11}$/);
  if (directMatch) return directMatch[0];

  const urlMatch =
    trimmed.match(/[?&]v=([\w-]{11})/) ??
    trimmed.match(/youtu\.be\/([\w-]{11})/) ??
    trimmed.match(/embed\/([\w-]{11})/);

  return urlMatch?.[1] ?? null;
}

export default function VideoScreen() {
  const isPro = usePremiumGate();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ title?: string; videoUrl?: string; videoId?: string }>();
  const videoId = useMemo(
    () => params.videoId ?? extractYoutubeVideoId(params.videoUrl),
    [params.videoId, params.videoUrl],
  );
  const title = params.title?.trim() || 'Tutorial';
  const canonicalUrl = params.videoUrl?.trim()
    ? params.videoUrl.trim()
    : videoId
      ? `https://www.youtube.com/watch?v=${videoId}`
      : null;

  if (!isPro) return null;

  return (
    <>
      <Stack.Screen options={{ title }} />
      <View
        style={{
          flex: 1,
          paddingTop: insets.top + theme.spacing.lg,
          padding: theme.spacing.xl,
          gap: theme.spacing.lg,
        }}>
        {videoId ? (
          <View
            style={{
              overflow: 'hidden',
              borderRadius: theme.radius.xl,
              borderCurve: 'continuous',
              backgroundColor: theme.colors.surface,
            }}>
            <YoutubePlayer
              height={Math.min(420, Math.round(360 * (9 / 16)))}
              play={false}
              videoId={videoId}
              initialPlayerParams={{
                modestbranding: true,
                rel: false,
              }}
            />
          </View>
        ) : (
          <View
            style={{
              padding: theme.spacing.lg,
              borderRadius: theme.radius.xl,
              backgroundColor: theme.colors.surface,
            }}>
            <Text style={{ color: theme.colors.textSecondary }}>
              No tutorial video is available for this screen yet.
            </Text>
          </View>
        )}

        {canonicalUrl ? (
          <PressableScale
            onPress={() => {
              void ExpoLinking.openURL(canonicalUrl);
            }}
            style={{
              paddingVertical: theme.spacing.xl,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: theme.radius.pill,
              backgroundColor: theme.colors.primary,
              paddingHorizontal: theme.spacing.lg,
            }}>
            <Text
              style={{
                fontSize: theme.size.md,
                fontWeight: theme.weight.semibold,
                color: theme.colors.white,
              }}>
              Open in YouTube
            </Text>
          </PressableScale>
        ) : null}
      </View>
    </>
  );
}
