import { Colors, theme } from '@/constants/Theme';
import { usePatternFolders } from '@/hooks/use-pattern-folders';
import { tap } from '@/services/haptics';
import type { PatternFolderWithCount } from '@/services/pattern-folders';
import { Link, router, Stack } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useTranslation } from 'react-i18next';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type ListRenderItem,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function FolderTile({
  item,
  isLeftColumn,
  iconSize,
}: {
  item: PatternFolderWithCount;
  isLeftColumn: boolean;
  iconSize: number;
}) {
  const { t } = useTranslation();
  const countLabel =
    item.patternCount === 1
      ? t('folders.patternCount_one', { count: item.patternCount })
      : t('folders.patternCount_other', { count: item.patternCount });

  return (
    <Link href={{ pathname: '/(folders)/[id]', params: { id: String(item.id) } }} asChild>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('folders.accessibility.folderTile', {
          name: item.name,
          count: item.patternCount,
          countLabel,
        })}
        onPress={() => tap()}
        style={StyleSheet.flatten([
          styles.tileWrap,
          {
            marginRight: isLeftColumn ? theme.spacing.sm : 0,
            marginLeft: isLeftColumn ? 0 : theme.spacing.sm,
          },
        ])}>
        <SymbolView
          name={item.icon as React.ComponentProps<typeof SymbolView>['name']}
          size={iconSize}
          tintColor={item.color}
        />

        <View style={styles.textBlock}>
          <Text numberOfLines={2} selectable style={styles.title}>
            {item.name}
          </Text>
          <Text selectable style={styles.count}>
            {item.patternCount === 1
              ? t('folders.patternCount_one', { count: item.patternCount })
              : t('folders.patternCount_other', { count: item.patternCount })}
          </Text>
        </View>
      </Pressable>
    </Link>
  );
}

export default function FoldersScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { data: folders = [] } = usePatternFolders();
  const columnGap = theme.spacing.lg;
  const horizontalPadding = theme.spacing.lg * 2;
  const columnWidth = (width - horizontalPadding - columnGap) / 2;
  const iconSize = Math.max(84, Math.min(132, columnWidth * 0.72));

  const renderItem: ListRenderItem<PatternFolderWithCount> = ({ item, index }) => (
    <FolderTile item={item} isLeftColumn={index % 2 === 0} iconSize={iconSize} />
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: t('folders.title'),
          headerLargeTitle: false,
          headerTransparent: true,
          unstable_headerRightItems: () => [
            {
              type: 'button' as const,
              label: t('folders.addButton'),
              variant: 'prominent',
              tintColor: Colors.primary,
              icon: { type: 'sfSymbol' as const, name: 'plus' },
              onPress: () => router.push('/(folders)/create'),
            },
          ],
        }}
      />

      <FlatList
        data={folders}
        renderItem={renderItem}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        style={styles.list}
        contentContainerStyle={{
          paddingHorizontal: theme.spacing.lg,
          paddingTop: theme.spacing.md,
          paddingBottom: insets.bottom + theme.spacing['3xl'],
        }}
        ItemSeparatorComponent={() => <View style={{ height: theme.spacing.xl }} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <SymbolView
              name="folder.fill"
              size={54}
              tintColor={theme.colors.primary}
              weight="semibold"
            />
            <Text selectable style={styles.emptyTitle}>
              {t('folders.empty.title')}
            </Text>
            <Text selectable style={styles.emptyCopy}>
              {t('folders.empty.subtitle')}
            </Text>
          </View>
        }
      />
    </>
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  headerButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DDE4B9',
  },
  headerCopyWrap: {
    paddingBottom: theme.spacing.xl,
  },
  headerCopy: {
    fontSize: theme.size.lg,
    lineHeight: 24,
    color: theme.colors.textSecondary,
  },
  tileWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: theme.spacing.sm,
  },
  textBlock: {
    alignItems: 'center',
    gap: 0,
    paddingHorizontal: theme.spacing.xs,
  },
  title: {
    textAlign: 'center',
    fontSize: theme.size.lg,
    fontWeight: theme.weight.semibold,
    color: theme.colors.textPrimary,
  },
  count: {
    textAlign: 'center',
    fontSize: theme.size.sm,
    fontWeight: theme.weight.medium,
    color: theme.colors.textSecondary,
  },
  emptyState: {
    paddingTop: theme.spacing['3xl'],
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  emptyTitle: {
    fontSize: theme.size['2xl'],
    fontWeight: theme.weight.bold,
    color: theme.colors.textPrimary,
  },
  emptyCopy: {
    maxWidth: 300,
    textAlign: 'center',
    fontSize: theme.size.md,
    lineHeight: 22,
    color: theme.colors.textSecondary,
  },
});
