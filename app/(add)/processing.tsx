import Shimmer from '@/components/shimmer';
import { theme } from '@/constants/Theme';
import {
  importPatternFromFile,
  importPatternFromPhoto,
  importPatternFromWebsite,
  importPatternFromYoutube,
} from '@/services/ai';
import { confirm, cta, warn } from '@/services/haptics';
import { usePatternImportStore } from '@/stores/patternImportStore';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

const STAGE_KEYS = [
  'uploading',
  'reading',
  'building',
  'preparing',
] as const;

function SourceBadge({ source }: { source: 'file' | 'photo' | 'website' | 'youtube' }) {
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{source.toUpperCase()}</Text>
    </View>
  );
}

function ImportSkeleton() {
  return (
    <View style={styles.skeletonWrap}>
      <Shimmer style={styles.skeletonCard}>
        <Shimmer.Overlay width="55%" duration={1800} repeatDelay={600}>
          <View style={styles.overlayGradient} />
        </Shimmer.Overlay>
        <View style={styles.skeletonContent}>
          <View style={[styles.skeletonBlock, styles.skeletonTitle]} />
          <View style={[styles.skeletonBlock, styles.skeletonLineWide]} />
          <View style={[styles.skeletonBlock, styles.skeletonLineMid]} />
          <View style={[styles.skeletonBlock, styles.skeletonLineShort]} />
        </View>
      </Shimmer>

      <Shimmer style={styles.skeletonCardSecondary}>
        <Shimmer.Overlay width="48%" duration={2000} repeatDelay={800}>
          <View style={styles.overlayGradient} />
        </Shimmer.Overlay>
        <View style={styles.skeletonRow}>
          <View style={[styles.skeletonPill, { width: 92 }]} />
          <View style={[styles.skeletonPill, { width: 118 }]} />
          <View style={[styles.skeletonPill, { width: 84 }]} />
        </View>
      </Shimmer>
    </View>
  );
}

export default function AddPatternProcessingScreen() {
  const { t } = useTranslation();
  const request = usePatternImportStore((state) => state.request);
  const setResult = usePatternImportStore((state) => state.setResult);
  const setError = usePatternImportStore((state) => state.setError);
  const [stageIndex, setStageIndex] = useState(0);

  const sourceLabel = request?.source ?? 'file';

  const headline = useMemo(() => {
    const key = `addPattern.processing.headline_${request?.source ?? 'file'}` as const;
    return t(key);
  }, [request?.source, t]);

  useEffect(() => {
    if (!request) {
      router.replace('/(add)');
      return;
    }

    const currentRequest = request;
    let active = true;
    cta();

    const interval = setInterval(() => {
      setStageIndex((current) => (current < STAGE_KEYS.length - 1 ? current + 1 : current));
    }, 1100);

    async function run() {
      try {
        const result =
          currentRequest.source === 'photo'
            ? await importPatternFromPhoto({
                imageBase64: currentRequest.base64,
                mimeType: currentRequest.mimeType,
              })
            : currentRequest.source === 'file'
              ? await importPatternFromFile({
                  base64: currentRequest.base64,
                  mimeType: currentRequest.mimeType,
                  fileName: currentRequest.fileName,
                  sourceText: currentRequest.sourceText,
                  sourceUrl: currentRequest.sourceUrl,
                })
              : currentRequest.source === 'website'
                ? await importPatternFromWebsite({
                    url: currentRequest.url,
                  })
                : await importPatternFromYoutube({
                    url: currentRequest.url,
                  });

        if (!active) return;
        confirm();
        setResult(result);
        router.replace('/(add)/review');
      } catch (error) {
        if (!active) return;

        warn();
        const message = error instanceof Error ? error.message : t('addPattern.processing.error.fallbackMessage');
        setError(message);
      } finally {
        clearInterval(interval);
      }
    }

    void run();

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [request, setError, setResult]);

  const error = usePatternImportStore((state) => state.error);

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" style={styles.screen}>
      <SourceBadge source={sourceLabel} />
      <Text style={styles.title}>{headline}</Text>
      <Text style={styles.subtitle}>
        {t('addPattern.processing.subtitle')}
      </Text>

      <ImportSkeleton />

      <View style={styles.stageWrap}>
        {STAGE_KEYS.map((stageKey, index) => (
          <View key={stageKey} style={styles.stageRow}>
            <View
              style={[
                styles.stageDot,
                index <= stageIndex ? styles.stageDotActive : styles.stageDotInactive,
              ]}
            />
            <Text
              style={[
                styles.stageText,
                index === stageIndex ? styles.stageTextActive : styles.stageTextInactive,
              ]}>
              {t(`addPattern.processing.stages.${stageKey}`)}
            </Text>
          </View>
        ))}
      </View>

      {error ? (
        <View style={styles.errorCard}>
          <Text style={styles.errorTitle}>{t('addPattern.processing.error.title')}</Text>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.errorHint} onPress={() => router.replace('/(add)')}>
            {t('addPattern.processing.error.retry')}
          </Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E6F0EB',
    borderRadius: 999,
    marginBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  badgeText: {
    color: theme.colors.primary,
    fontSize: theme.size.sm,
    fontWeight: theme.weight.bold,
    letterSpacing: 0.8,
  },
  errorCard: {
    backgroundColor: '#FCE7E5',
    borderRadius: theme.radius.xl,
    gap: theme.spacing.sm,
    marginTop: theme.spacing.xl,
    padding: theme.spacing.lg,
  },
  errorHint: {
    color: '#A53A32',
    fontSize: theme.size.md,
    fontWeight: theme.weight.bold,
  },
  errorText: {
    color: '#7E342E',
    fontSize: theme.size.md,
    lineHeight: 22,
  },
  errorTitle: {
    color: '#6A231E',
    fontSize: theme.size.lg,
    fontWeight: theme.weight.bold,
  },
  overlayGradient: {
    backgroundColor: 'rgba(255,255,255,0.45)',
    flex: 1,
  },
  screen: {
    backgroundColor: theme.colors.background,
    flex: 1,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xl,
  },
  skeletonBlock: {
    backgroundColor: '#D8E3DC',
    borderRadius: 999,
    height: 14,
  },
  skeletonCard: {
    backgroundColor: '#EEF4F0',
    borderRadius: theme.radius.xl,
    marginTop: theme.spacing['2xl'],
    minHeight: 180,
    overflow: 'hidden',
    padding: theme.spacing.xl,
  },
  skeletonCardSecondary: {
    backgroundColor: '#F4F0EA',
    borderRadius: theme.radius.xl,
    marginTop: theme.spacing.lg,
    minHeight: 88,
    overflow: 'hidden',
    padding: theme.spacing.lg,
  },
  skeletonContent: {
    gap: theme.spacing.md,
  },
  skeletonLineMid: {
    width: '72%',
  },
  skeletonLineShort: {
    width: '48%',
  },
  skeletonLineWide: {
    width: '88%',
  },
  skeletonPill: {
    backgroundColor: '#DDD8CF',
    borderRadius: 999,
    height: 28,
  },
  skeletonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  skeletonTitle: {
    height: 22,
    width: '58%',
  },
  skeletonWrap: {
    marginTop: theme.spacing.md,
  },
  stageDot: {
    borderRadius: 999,
    height: 10,
    marginTop: 6,
    width: 10,
  },
  stageDotActive: {
    backgroundColor: theme.colors.primary,
  },
  stageDotInactive: {
    backgroundColor: '#D5D2CC',
  },
  stageRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  stageText: {
    fontSize: theme.size.md,
  },
  stageTextActive: {
    color: theme.colors.textPrimary,
    fontWeight: theme.weight.semibold,
  },
  stageTextInactive: {
    color: theme.colors.textSecondary,
  },
  stageWrap: {
    gap: theme.spacing.md,
    marginTop: theme.spacing.xl,
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.size.lg,
    lineHeight: 28,
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: theme.size.xl,
    fontWeight: theme.weight.bold,
  },
});
