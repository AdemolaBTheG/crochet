import { patternImages, type PatternImageKey } from '@/constants/pattern-images';
import { theme } from '@/constants/Theme';
import { patterns as patternsTable, projects as projectsTable, type Pattern, type Project } from '@/db/schema';
import { useDbStore } from '@/stores/dbStore';
import { desc, eq } from 'drizzle-orm';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';

type ProjectListItem = Project & {
  pattern: Pattern | null;
};

export default function ProjectsScreen() {
  const { db } = useDbStore();
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadProjects() {
      if (!db) return;

      setIsLoading(true);

      try {
        const rows = await db
          .select({
            project: projectsTable,
            pattern: patternsTable,
          })
          .from(projectsTable)
          .leftJoin(patternsTable, eq(patternsTable.id, projectsTable.patternId))
          .orderBy(desc(projectsTable.updatedAt));

        if (isMounted) {
          setProjects(rows.map((row) => ({ ...row.project, pattern: row.pattern })));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadProjects();

    return () => {
      isMounted = false;
    };
  }, [db]);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ backgroundColor: theme.colors.background }}
      contentContainerStyle={{
        padding: theme.spacing.xl,
        gap: theme.spacing.lg,
        backgroundColor: theme.colors.background,
      }}>
      <View style={{ gap: theme.spacing.sm }}>
        <Text
          selectable
          style={{
            fontSize: theme.size['3xl'] - 2,
            fontWeight: theme.weight.semibold,
            color: theme.colors.textPrimary,
          }}>
          Your projects
        </Text>
        <Text
          selectable
          style={{
            fontSize: theme.size.lg,
            lineHeight: theme.size.lg + 6,
            color: theme.colors.textSecondary,
          }}>
          Resume active crochet work and keep your counters in one place.
        </Text>
      </View>

      {isLoading ? (
        <View style={{ paddingVertical: theme.spacing['3xl'], alignItems: 'center' }}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      ) : null}

      {!isLoading && projects.length === 0 ? (
        <View
          style={{
            padding: theme.spacing.xl,
            borderRadius: theme.radius.xl,
            backgroundColor: theme.colors.surface,
            borderWidth: 1,
            borderColor: theme.colors.border,
            gap: theme.spacing.sm,
          }}>
          <Text
            selectable
            style={{
              fontSize: theme.size.lg,
              fontWeight: theme.weight.semibold,
              color: theme.colors.textPrimary,
            }}>
            No projects yet
          </Text>
          <Text
            selectable
            style={{
              fontSize: theme.size.md,
              lineHeight: theme.size.md + 6,
              color: theme.colors.textSecondary,
            }}>
            Pick a pattern from Home and tap Start Project.
          </Text>
        </View>
      ) : null}

      {projects.map((project) => {
        const pattern = project.pattern;
        const source = pattern
          ? patternImages[pattern.coverImageKey as PatternImageKey]
          : undefined;

        return (
          <Link
            key={project.id}
            href={{
              pathname: '/(projects)/[id]',
              params: { id: String(project.id) },
            }}
            asChild>
            <Pressable
              style={{
                flexDirection: 'row',
                gap: theme.spacing.md,
                padding: theme.spacing.md,
                borderRadius: theme.radius.xl,
                borderCurve: 'continuous',
                backgroundColor: theme.colors.surface,
                borderWidth: 1,
                borderColor: theme.colors.border,
              }}
              accessibilityRole="button"
              accessibilityLabel={`Open ${project.name}`}>
              {source ? (
                <Image
                  source={source}
                  contentFit="cover"
                  style={{
                    width: 78,
                    height: 96,
                    borderRadius: theme.radius.lg,
                  }}
                />
              ) : null}
              <View style={{ flex: 1, gap: theme.spacing.xs, justifyContent: 'center' }}>
                <Text
                  selectable
                  numberOfLines={2}
                  style={{
                    fontSize: theme.size.lg,
                    fontWeight: theme.weight.semibold,
                    color: theme.colors.textPrimary,
                  }}>
                  {project.name}
                </Text>
                <Text
                  selectable
                  style={{
                    fontSize: theme.size.md,
                    fontWeight: theme.weight.medium,
                    color: theme.colors.primary,
                    textTransform: 'capitalize',
                  }}>
                  {project.status}
                </Text>
                <Text
                  selectable
                  style={{
                    fontSize: theme.size.md,
                    color: theme.colors.textSecondary,
                    fontVariant: ['tabular-nums'],
                  }}>
                  Step {project.currentStepIndex + 1}
                </Text>
              </View>
            </Pressable>
          </Link>
        );
      })}
    </ScrollView>
  );
}
