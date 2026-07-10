import { theme } from '@/constants/Theme';
import { usePatterns, type ResolvedPattern } from '@/hooks/use-patterns';
import { tap } from '@/services/haptics';
import * as Clipboard from 'expo-clipboard';
import * as ExpoLinking from 'expo-linking';
import { Image } from 'expo-image';
import { getPatternImageSource } from '@/constants/pattern-images';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';

function extractVideoId(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return '';

  const directMatch = trimmed.match(/^[\w-]{11}$/);
  if (directMatch) return directMatch[0];

  const urlMatch =
    trimmed.match(/[?&]v=([\w-]{11})/) ??
    trimmed.match(/youtu\.be\/([\w-]{11})/) ??
    trimmed.match(/embed\/([\w-]{11})/);

  return urlMatch?.[1] ?? '';
}

function ReviewAction({
  label,
  onPress,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.actionButton, disabled && { opacity: 0.45 }]}>
      <Text style={styles.actionText}>{label}</Text>
    </Pressable>
  );
}

function ReviewRow({
  pattern,
}: {
  pattern: ResolvedPattern;
}) {
  const [candidate, setCandidate] = useState(pattern?.youtubeVideoId ?? '');
  const [isExpanded, setIsExpanded] = useState(false);
  const currentVideoId = pattern?.youtubeVideoId ?? '';
  const candidateVideoId = extractVideoId(candidate);
  const previewVideoId = candidateVideoId || currentVideoId;

  function handleCopySnippet() {
    if (!candidateVideoId) return;
    tap();
    void Clipboard.setStringAsync(`"${pattern.slug}": "${candidateVideoId}"`);
  }

  function handleOpenSearch() {
    tap();
    const query = encodeURIComponent(`crochet ${pattern.title} tutorial`);
    void ExpoLinking.openURL(`https://www.youtube.com/results?search_query=${query}`);
  }

  function handleOpenCurrent() {
    if (!currentVideoId) return;
    tap();
    void ExpoLinking.openURL(`https://www.youtube.com/watch?v=${currentVideoId}`);
  }

  return (
    <View style={styles.card}>
      <View style={styles.rowTop}>
        <Image
          source={getPatternImageSource(pattern.coverImageKey)}
          contentFit="cover"
          style={styles.thumb}
        />
        <View style={{ flex: 1, gap: 6 }}>
          <Text style={styles.title}>{pattern.title}</Text>
          <Text style={styles.slug}>{pattern.slug}</Text>
          <Text style={styles.meta}>
            {pattern.category ?? 'general'} · {pattern.difficulty}
          </Text>
          <Text style={styles.meta}>
            Current video ID: {currentVideoId || 'missing'}
          </Text>
        </View>
      </View>

      <View style={styles.fieldWrap}>
        <Text style={styles.fieldLabel}>Candidate video ID or URL</Text>
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="Paste video ID or YouTube URL"
          placeholderTextColor={theme.colors.textTertiary}
          style={styles.input}
          value={candidate}
          onChangeText={setCandidate}
        />
      </View>

      <View style={styles.actionsWrap}>
        <ReviewAction
          label={isExpanded ? 'Hide Preview' : 'Preview'}
          onPress={() => {
            tap();
            setIsExpanded((value) => !value);
          }}
          disabled={!previewVideoId}
        />
        <ReviewAction label="Search YouTube" onPress={handleOpenSearch} />
        <ReviewAction label="Open Current" onPress={handleOpenCurrent} disabled={!currentVideoId} />
        <ReviewAction
          label="Copy JSON Patch"
          onPress={handleCopySnippet}
          disabled={!candidateVideoId}
        />
      </View>

      {isExpanded && previewVideoId ? (
        <View style={styles.playerWrap}>
          <YoutubePlayer
            height={210}
            play={false}
            videoId={previewVideoId}
            initialPlayerParams={{ modestbranding: true, rel: false }}
          />
        </View>
      ) : null}
    </View>
  );
}

export default function PatternVideoReviewScreen() {
  const { i18n } = useTranslation();
  const [search, setSearch] = useState('');
  const { data: patterns = [], isLoading } = usePatterns(i18n.language);

  const filteredPatterns = useMemo(() => {
    const query = search.trim().toLowerCase();
    const sorted = [...patterns].sort((a, b) => a.title.localeCompare(b.title));
    if (!query) return sorted;

    return sorted.filter((pattern) =>
      [pattern.title, pattern.slug, pattern.category ?? '', pattern.youtubeVideoId ?? '']
        .some((value) => value.toLowerCase().includes(query)),
    );
  }, [patterns, search]);

  return (
    <FlatList
      data={filteredPatterns}
      renderItem={({ item }) => <ReviewRow pattern={item} />}
      keyExtractor={(item) => item.slug}
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={styles.content}
      ItemSeparatorComponent={() => <View style={{ height: theme.spacing.lg }} />}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Pattern Video Review</Text>
          <Text style={styles.headerCopy}>
            Verify the live Supabase video IDs here. When a match is wrong, paste the corrected
            YouTube URL or video ID, copy the JSON patch, update
            `data/pattern-videos.json`, then run `npm run sync-pattern-videos`.
          </Text>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="Search by title, slug, category, or video ID"
            placeholderTextColor={theme.colors.textTertiary}
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
          />
          <Text style={styles.headerMeta}>
            {isLoading ? 'Loading patterns…' : `${filteredPatterns.length} patterns`}
          </Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  content: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing['3xl'],
  },
  header: {
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  headerTitle: {
    fontSize: theme.size['2xl'],
    fontWeight: theme.weight.bold,
    color: theme.colors.textPrimary,
  },
  headerCopy: {
    fontSize: theme.size.md,
    lineHeight: 22,
    color: theme.colors.textSecondary,
  },
  headerMeta: {
    fontSize: theme.size.sm,
    fontWeight: theme.weight.semibold,
    color: theme.colors.textTertiary,
  },
  searchInput: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    color: theme.colors.textPrimary,
    fontSize: theme.size.md,
  },
  card: {
    gap: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
  },
  rowTop: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    alignItems: 'flex-start',
  },
  thumb: {
    width: 76,
    height: 96,
    borderRadius: theme.radius.lg,
  },
  title: {
    fontSize: theme.size.lg,
    fontWeight: theme.weight.bold,
    color: theme.colors.textPrimary,
  },
  slug: {
    fontSize: theme.size.sm,
    color: theme.colors.textTertiary,
  },
  meta: {
    fontSize: theme.size.sm,
    color: theme.colors.textSecondary,
  },
  fieldWrap: {
    gap: theme.spacing.xs,
  },
  fieldLabel: {
    fontSize: theme.size.sm,
    fontWeight: theme.weight.semibold,
    color: theme.colors.textSecondary,
  },
  input: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    color: theme.colors.textPrimary,
    fontSize: theme.size.md,
  },
  actionsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  actionButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primarySoft,
  },
  actionText: {
    fontSize: theme.size.sm,
    fontWeight: theme.weight.semibold,
    color: theme.colors.primary,
  },
  playerWrap: {
    overflow: 'hidden',
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.background,
  },
});
