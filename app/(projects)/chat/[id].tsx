import { ProjectChat, type ProjectChatStep } from '@/components/project-chat';
import { theme } from '@/constants/Theme';
import { usePremiumGate } from '@/hooks/usePremiumGate';
import {
  patterns as patternsTable,
  projects as projectsTable,
  type Pattern,
  type Project,
} from '@/db/schema';
import { useDbStore } from '@/stores/dbStore';
import { eq } from 'drizzle-orm';
import { isLiquidGlassAvailable } from 'expo-glass-effect';
import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function parseSteps(stepsJson: string | null) {
  if (!stepsJson) return [];

  try {
    return JSON.parse(stepsJson) as ProjectChatStep[];
  } catch {
    return [];
  }
}

export default function ProjectChatScreen() {
  const isPro = usePremiumGate();
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { db } = useDbStore();
  const [project, setProject] = useState<Project | null>(null);
  const [pattern, setPattern] = useState<Pattern | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const projectId = Number(id);

  useEffect(() => {
    let isMounted = true;

    async function loadProject() {
      if (!db || !Number.isFinite(projectId)) return;

      setIsLoading(true);

      try {
        const projectResult = await db
          .select()
          .from(projectsTable)
          .where(eq(projectsTable.id, projectId))
          .limit(1);
        const projectRow = projectResult[0] ?? null;
        const patternResult = projectRow
          ? await db
              .select()
              .from(patternsTable)
              .where(eq(patternsTable.id, projectRow.patternId))
              .limit(1)
          : [];

        if (isMounted) {
          setProject(projectRow);
          setPattern(patternResult[0] ?? null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadProject();

    return () => {
      isMounted = false;
    };
  }, [db, projectId]);

  const steps = useMemo(() => parseSteps(project?.stepsJson ?? null), [project]);
  const currentStep =
    project && steps.length > 0
      ? steps[Math.min(project.currentStepIndex, steps.length - 1)]
      : null;
  const counterLabel = currentStep?.counterLabel;
  const counterValue =
    counterLabel === 'row'
      ? (project?.rowCount ?? 0)
      : counterLabel === 'round'
        ? (project?.roundCount ?? 0)
        : null;

  if (!isPro) return null;

  return (
    <>
      <Stack.Screen
        options={{
          title: currentStep?.title ?? project?.name ?? 'Ask AI',
          headerLargeTitle: false,
          headerTransparent: isLiquidGlassAvailable(),
          headerStyle: {
            backgroundColor: isLiquidGlassAvailable() ? 'transparent' : theme.colors.background,
          },
        }}
      />
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        {isLoading ? (
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: theme.colors.background,
            }}>
            <ActivityIndicator color={theme.colors.primary} />
          </View>
        ) : null}

        {!isLoading && !project ? (
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              padding: theme.spacing.xl,
              backgroundColor: theme.colors.background,
            }}>
            <View
              style={{
                padding: theme.spacing.lg,
                borderRadius: theme.radius.xl,
                backgroundColor: theme.colors.surface,
                borderWidth: 1,
                borderColor: theme.colors.border,
              }}>
              <Text selectable style={{ color: theme.colors.textSecondary }}>
                Project not found.
              </Text>
            </View>
          </View>
        ) : null}

        {project ? (
          <ProjectChat
            pattern={pattern ?? undefined}
            currentStep={currentStep}
            counterLabel={counterLabel}
            counterValue={counterValue}
            bottomInset={insets.bottom}
          />
        ) : null}
      </View>
    </>
  );
}
