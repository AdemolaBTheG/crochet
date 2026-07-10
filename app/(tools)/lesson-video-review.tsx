import { theme } from '@/constants/Theme';
import { useLessons, type ResolvedLesson } from '@/hooks/use-lessons';
import { tap } from '@/services/haptics';
import * as Clipboard from 'expo-clipboard';
import * as ExpoLinking from 'expo-linking';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
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

function normalizeVideoUrl(value: string) {
  const videoId = extractVideoId(value);
  if (videoId) return `https://www.youtube.com/watch?v=${videoId}`;
  return value.trim();
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

function ReviewRow({ lesson }: { lesson: ResolvedLesson }) {
  const [candidate, setCandidate] = useState(lesson.videoUrl ?? '');
  const [isExpanded, setIsExpanded] = useState(false);
  const currentVideoUrl = lesson.videoUrl ?? '';
  const currentVideoId = extractVideoId(currentVideoUrl);
  const candidateVideoId = extractVideoId(candidate);
  const previewVideoId = candidateVideoId || currentVideoId;

  function handleCopySnippet() {
    const normalizedUrl = normalizeVideoUrl(candidate);
    if (!normalizedUrl) return;
    tap();
    void Clipboard.setStringAsync(`"${lesson.slug}": "${normalizedUrl}"`);
  }

  function handleOpenSearch() {
    tap();
    const query = encodeURIComponent(`crochet ${lesson.title} tutorial`);
    void ExpoLinking.openURL(`https://www.youtube.com/results?search_query=${query}`);
  }

  function handleOpenCurrent() {
    if (!currentVideoUrl) return;
    tap();
    void ExpoLinking.openURL(currentVideoUrl);
  }

  return (
    <View style={styles.card}>
      <View style={{ gap: 6 }}>
        <Text style={styles.title}>{lesson.title}</Text>
        <Text style={styles.slug}>{lesson.slug}</Text>
        <Text style={styles.meta}>Difficulty: {lesson.difficulty}</Text>
        <Text style={styles.meta}>Current video: {currentVideoUrl || 'missing'}</Text>
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
        <ReviewAction label="Open Current" onPress={handleOpenCurrent} disabled={!currentVideoUrl} />
        <ReviewAction label="Copy JSON Patch" onPress={handleCopySnippet} disabled={!candidate.trim()} />
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

export default function LessonVideoReviewScreen() {
  const { i18n } = useTranslation();
  const [search, setSearch] = useState('');
  const { data: lessons = [], isLoading } = useLessons(i18n.language);

  const filteredLessons = useMemo(() => {
    const query = search.trim().toLowerCase();
    const sorted = [...lessons].sort((a, b) => a.sortOrder - b.sortOrder);
    if (!query) return sorted;

    return sorted.filter((lesson) =>
      [lesson.title, lesson.slug, lesson.difficulty, lesson.videoUrl ?? ''].some((value) =>
        value.toLowerCase().includes(query),
      ),
    );
  }, [lessons, search]);

  return (
    <FlatList
      data={filteredLessons}
      renderItem={({ item }) => <ReviewRow lesson={item} />}
      keyExtractor={(item) => item.slug}
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={styles.content}
      ItemSeparatorComponent={() => <View style={{ height: theme.spacing.lg }} />}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Lesson Video Review</Text>
          <Text style={styles.headerCopy}>
            Verify the lesson tutorial links here. When a match is wrong, paste the corrected
            YouTube URL or video ID, copy the JSON patch, update `data/lesson-videos.json`, then
            run `npm run sync-lesson-videos`.
          </Text>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="Search by title, slug, difficulty, or URL"
            placeholderTextColor={theme.colors.textTertiary}
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
          />
          <Text style={styles.headerMeta}>
            {isLoading ? 'Loading lessons…' : `${filteredLessons.length} lessons`}
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
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.background,
  },
  actionText: {
    fontSize: theme.size.sm,
    fontWeight: theme.weight.semibold,
    color: theme.colors.textPrimary,
  },
  playerWrap: {
    overflow: 'hidden',
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.background,
  },
});
