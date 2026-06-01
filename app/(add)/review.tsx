import { PressableScale } from '@/components/pressable-scale';
import { theme } from '@/constants/Theme';
import { patterns as patternsTable, projects as projectsTable } from '@/db/schema';
import { cta } from '@/services/haptics';
import { useDbStore } from '@/stores/dbStore';
import { usePatternImportStore } from '@/stores/patternImportStore';
import { eq } from 'drizzle-orm';
import { router, Stack } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

function SectionTitle({ children }: { children: string }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

export default function AddPatternReviewScreen() {
  const { t } = useTranslation();
  const draft = usePatternImportStore((state) => state.result);
  const clear = usePatternImportStore((state) => state.clear);
  const { db } = useDbStore();
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!draft) {
      router.replace('/(add)');
    }
  }, [draft]);

  const generatedSlug = useMemo(() => {
    const normalized = (draft?.title ?? '')
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 48);

    return `imported-${normalized || 'pattern'}-${Date.now()}`;
  }, [draft?.title]);

  if (!draft) {
    return null;
  }

  const currentDraft = draft;

  async function handleDone() {
    if (!db || isSaving) return;
    cta();
    setIsSaving(true);

    try {
      const existingPattern = await db
        .select({ id: patternsTable.id })
        .from(patternsTable)
        .where(eq(patternsTable.slug, generatedSlug))
        .limit(1);

      const patternRow =
        existingPattern[0] ??
        (
          await db
            .insert(patternsTable)
            .values({
              slug: generatedSlug,
              title: currentDraft.title,
              description: currentDraft.description || null,
              difficulty: currentDraft.difficulty,
              category: currentDraft.category,
              coverImageKey: '',
              estimatedMinutes: currentDraft.estimatedMinutes,
              materialsText: currentDraft.materials.join(', '),
              skillsText: currentDraft.skills.join(', '),
              expectationText: currentDraft.expectationText || null,
              stepsJson: JSON.stringify(currentDraft.steps),
              isPublished: false,
            })
            .returning({ id: patternsTable.id })
        )[0];

      const createdProject = await db
        .insert(projectsTable)
        .values({
          patternId: patternRow.id,
          patternSlug: generatedSlug,
          coverImageKey: null,
          stepsJson: JSON.stringify(currentDraft.steps),
          name: currentDraft.title,
          status: 'active',
        })
        .returning();

      const project = createdProject[0];
      if (!project) return;

      clear();
      router.replace({
        pathname: '/(projects)/[id]',
        params: { id: String(project.id) },
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: currentDraft.title,
        }}
      />

      <ScrollView
        style={styles.screen}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          {currentDraft.description ? (
            <Text style={styles.description}>{currentDraft.description}</Text>
          ) : null}
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaPill}>
            <Text style={styles.metaText}>{currentDraft.difficulty}</Text>
          </View>
          {currentDraft.estimatedMinutes ? (
            <View style={styles.metaPill}>
              <Text style={styles.metaText}>{currentDraft.estimatedMinutes} min</Text>
            </View>
          ) : null}
          {currentDraft.source.type ? (
            <View style={styles.metaPill}>
              <Text style={styles.metaText}>{currentDraft.source.type}</Text>
            </View>
          ) : null}
        </View>

        {currentDraft.warnings.length > 0 ? (
          <View style={styles.warningCard}>
            <SectionTitle>{t('addPattern.review.sectionTitles.needsReview')}</SectionTitle>
            {currentDraft.warnings.map((warning) => (
              <Text key={warning} style={styles.warningText}>
                {warning}
              </Text>
            ))}
          </View>
        ) : null}

        <View style={styles.sectionCard}>
          <SectionTitle>{t('addPattern.review.sectionTitles.materials')}</SectionTitle>
          {currentDraft.materials.length > 0 ? (
            currentDraft.materials.map((material) => (
              <Text key={material} style={styles.bulletText}>
                • {material}
              </Text>
            ))
          ) : (
            <Text style={styles.emptyText}>{t('addPattern.review.empty.materials')}</Text>
          )}
        </View>

        <View style={styles.sectionCard}>
          <SectionTitle>{t('addPattern.review.sectionTitles.skills')}</SectionTitle>
          {currentDraft.skills.length > 0 ? (
            <View style={styles.skillWrap}>
              {currentDraft.skills.map((skill) => (
                <View key={skill} style={styles.skillPill}>
                  <Text style={styles.skillText}>{skill}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>{t('addPattern.review.empty.skills')}</Text>
          )}
        </View>

        <View style={styles.sectionCard}>
          <SectionTitle>{t('addPattern.review.sectionTitles.steps')}</SectionTitle>
          {currentDraft.steps.map((step, index) => (
            <View key={`${step.title}-${index}`} style={styles.stepCard}>
              <View style={styles.stepRow}>
                <Text style={styles.stepIndex}>{index + 1}</Text>
                <View style={styles.stepCopy}>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.stepInstruction}>{step.instruction}</Text>
                  {step.counterLabel ? (
                    <Text style={styles.stepMeta}>
                      {step.counterLabel}
                      {step.targetCount ? ` • ${t('addPattern.review.step.targetLabel')} ${step.targetCount}` : ''}
                    </Text>
                  ) : null}
                </View>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <PressableScale onPress={handleDone} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>
              {isSaving ? t('addPattern.review.button.saving') : t('addPattern.review.button.save')}
            </Text>
          </PressableScale>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  bulletText: {
    color: theme.colors.textPrimary,
    fontSize: theme.size.md,
    lineHeight: 24,
  },
  content: {
    gap: theme.spacing.lg,
    padding: theme.spacing.xl,
    paddingBottom: theme.spacing['3xl'],
  },
  description: {
    color: theme.colors.textSecondary,
    fontSize: theme.size.lg,
    lineHeight: 28,
  },
  emptyText: {
    color: theme.colors.textSecondary,
    fontSize: theme.size.md,
  },
  footer: {
    marginTop: theme.spacing.md,
  },
  header: {
    gap: theme.spacing.md,
  },
  metaPill: {
    backgroundColor: theme.colors.surface,
    borderRadius: 999,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  metaText: {
    color: theme.colors.textSecondary,
    fontSize: theme.size.sm,
    fontWeight: theme.weight.bold,
    textTransform: 'capitalize',
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: 999,
    justifyContent: 'center',
    minHeight: 56,
  },
  primaryButtonText: {
    color: theme.colors.white,
    fontSize: theme.size.lg,
    fontWeight: theme.weight.bold,
  },
  screen: {
    backgroundColor: theme.colors.background,
    flex: 1,
  },
  sectionCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.size.lg,
    fontWeight: theme.weight.bold,
  },
  skillPill: {
    backgroundColor: '#E8F0EB',
    borderRadius: 999,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  skillText: {
    color: theme.colors.primary,
    fontSize: theme.size.sm,
    fontWeight: theme.weight.semibold,
  },
  skillWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  stepCard: {
    borderColor: '#E1DDD6',
    borderRadius: theme.radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: theme.spacing.md,
  },
  stepCopy: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  stepIndex: {
    color: theme.colors.primary,
    fontSize: theme.size.md,
    fontWeight: theme.weight.bold,
    width: 24,
  },
  stepInstruction: {
    color: theme.colors.textSecondary,
    fontSize: theme.size.md,
    lineHeight: 24,
  },
  stepMeta: {
    color: theme.colors.textTertiary,
    fontSize: theme.size.sm,
    fontWeight: theme.weight.semibold,
  },
  stepRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  stepTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.size.md,
    fontWeight: theme.weight.bold,
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: 36,
    fontWeight: theme.weight.black,
    letterSpacing: -1,
    lineHeight: 40,
  },
  warningCard: {
    backgroundColor: '#FFF1E6',
    borderRadius: theme.radius.xl,
    gap: theme.spacing.sm,
    padding: theme.spacing.lg,
  },
  warningText: {
    color: '#8A4F1E',
    fontSize: theme.size.md,
    lineHeight: 22,
  },
});
