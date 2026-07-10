import { theme } from '@/constants/Theme';
import { patternFolderItems } from '@/db/schema';
import { usePatternFolders } from '@/hooks/use-pattern-folders';
import { confirm, tap } from '@/services/haptics';
import type { PatternFolderWithCount } from '@/services/pattern-folders';
import { addPatternToFolder } from '@/services/pattern-folders';
import { useDbStore } from '@/stores/dbStore';
import { useQueryClient } from '@tanstack/react-query';
import { eq } from 'drizzle-orm';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { PressableScale } from 'pressto';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    FlatList,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    View,
    type ListRenderItem,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function FolderRow({
  folder,
  isSelected,
  isAlreadyInFolder,
  onToggle,
}: {
  folder: PatternFolderWithCount;
  isSelected: boolean;
  isAlreadyInFolder: boolean;
  onToggle: (id: number) => void;
}) {
  const { t } = useTranslation();
  const isDisabled = isAlreadyInFolder;
  const showCheck = isSelected || isAlreadyInFolder;

  return (
    <PressableScale
      onPress={() => {
        tap();
        if (!isDisabled) onToggle(folder.id);
      }}
      style={[styles.row, isDisabled && styles.rowDisabled]}>
      <SymbolView
        name={folder.icon as React.ComponentProps<typeof SymbolView>['name']}
        size={28}
        tintColor={isDisabled ? theme.colors.textTertiary : folder.color}
      />

      <View style={styles.rowText}>
        <Text numberOfLines={1} style={[styles.rowTitle, isDisabled && styles.rowTitleDisabled]}>
          {folder.name}
        </Text>
        <Text style={styles.rowCount}>
          {folder.patternCount === 1
            ? t('addToFolder.patternCount_one', { count: folder.patternCount })
            : t('addToFolder.patternCount_other', { count: folder.patternCount })}
        </Text>
      </View>

      <SymbolView
        name={showCheck ? 'checkmark.circle.fill' : 'circle'}
        size={22}
        weight={isDisabled ? 'light' : 'regular'}
        tintColor={
          isAlreadyInFolder
            ? theme.colors.textTertiary
            : isSelected
              ? theme.colors.primary
              : theme.colors.borderStrong
        }
      />
    </PressableScale>
  );
}

export default function AddFolderScreen() {
  const { t } = useTranslation();
  const { patternId } = useLocalSearchParams<{ patternId: string; patternName: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const db = useDbStore((state) => state.db);
  const queryClient = useQueryClient();
  const { data: folders = [] } = usePatternFolders();
  const patternIdNum = Number(patternId);

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [alreadyInFolderIds, setAlreadyInFolderIds] = useState<Set<number>>(new Set());
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!db || !patternIdNum) return;

    db.select({ folderId: patternFolderItems.folderId })
      .from(patternFolderItems)
      .where(eq(patternFolderItems.patternId, patternIdNum))
      .then((rows) => setAlreadyInFolderIds(new Set(rows.map((row) => row.folderId))));
  }, [db, patternIdNum]);

  const hasSelection = selectedIds.size > 0;

  const toggleFolder = useCallback((id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  async function handleConfirm() {
    if (!db || !patternIdNum || isSaving || !hasSelection) return;
    confirm();
    setIsSaving(true);
    try {
      for (const folderId of selectedIds) {
        await addPatternToFolder(db, folderId, patternIdNum);
      }
      await queryClient.invalidateQueries({ queryKey: ['pattern-folders'] });
      router.back();
    } finally {
      setIsSaving(false);
    }
  }

  const renderItem: ListRenderItem<PatternFolderWithCount> = ({ item }) => {
    const isAlreadyInFolder = alreadyInFolderIds.has(item.id);
    const isSelected = selectedIds.has(item.id);

    return (
      <FolderRow
        folder={item}
        isSelected={isSelected}
        isAlreadyInFolder={isAlreadyInFolder}
        onToggle={toggleFolder}
      />
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: t('addToFolder.title'),
          ...(Platform.OS === 'ios'
            ? {
                unstable_headerRightItems: () => [
                  {
                    type: 'button' as const,
                    label: t('addToFolder.done'),
                    variant: 'prominent',
                    tintColor: theme.colors.primary,
                    disabled: !hasSelection || isSaving,
                    onPress: () => {
                      void handleConfirm();
                    },
                  },
                ],
              }
            : {
                headerRight: () => (
                  <Pressable
                    onPress={() => {
                      void handleConfirm();
                    }}
                    disabled={!hasSelection || isSaving}
                    hitSlop={8}
                    style={{
                      opacity: hasSelection && !isSaving ? 1 : 0.4,
                    }}>
                    <Text
                      style={{
                        fontSize: theme.size.md,
                        fontWeight: theme.weight.semibold,
                        color: theme.colors.primary,
                      }}>
                      {t('addToFolder.done')}
                    </Text>
                  </Pressable>
                ),
              }),
        }}
      />

      <FlatList
        data={folders}
        renderItem={renderItem}
        keyExtractor={(item) => String(item.id)}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={{
          paddingHorizontal: theme.spacing.lg,
          paddingBottom: insets.bottom + theme.spacing.lg,
        }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <SymbolView
              name="folder.fill"
              size={48}
              tintColor={theme.colors.primary}
              weight="semibold"
            />
            <Text style={styles.emptyTitle}>{t('addToFolder.empty.title')}</Text>
            <Text style={styles.emptyCopy}>{t('addToFolder.empty.subtitle')}</Text>
          </View>
        }
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface,
  },
  rowPressed: {
    backgroundColor: theme.colors.muted,
  },
  rowDisabled: {
    opacity: 0.5,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  rowTitle: {
    fontSize: theme.size.lg,
    fontWeight: theme.weight.semibold,
    color: theme.colors.textPrimary,
  },
  rowTitleDisabled: {
    color: theme.colors.textTertiary,
  },
  rowCount: {
    fontSize: theme.size.sm,
    fontWeight: theme.weight.medium,
    color: theme.colors.textSecondary,
  },
  separator: {
    height: theme.spacing.sm,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
  },
  emptyTitle: {
    fontSize: theme.size['xl'],
    fontWeight: theme.weight.bold,
    color: theme.colors.textPrimary,
  },
  emptyCopy: {
    fontSize: theme.size.md,
    lineHeight: 22,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
  },
});
