import { projects as projectsTable, type Project } from '@/db/schema';
import CurrentProjectWidget, {
  type CurrentProjectWidgetProps,
} from '@/widgets/CurrentProjectWidget';
import { desc, eq } from 'drizzle-orm';
import type { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import { Platform } from 'react-native';
import * as schema from '@/db/schema';

type AppDb = ExpoSQLiteDatabase<typeof schema>;

const EMPTY_WIDGET_PROPS: CurrentProjectWidgetProps = {
  hasActiveProject: false,
  projectName: '',
  currentStep: 0,
  totalSteps: 0,
  counterLabel: '',
  counterValue: 0,
};

function getStepCount(stepsJson: string | null) {
  if (!stepsJson) return 0;

  try {
    return (JSON.parse(stepsJson) as unknown[]).length;
  } catch {
    return 0;
  }
}

function getCounter(project: Project) {
  if (project.roundCount > 0) {
    return {
      counterLabel: 'round',
      counterValue: project.roundCount,
    };
  }

  if (project.rowCount > 0) {
    return {
      counterLabel: 'row',
      counterValue: project.rowCount,
    };
  }

  return {
    counterLabel: '',
    counterValue: 0,
  };
}

function getWidgetProps(project: Project, stepCountOverride?: number): CurrentProjectWidgetProps {
  if (project.status !== 'active') {
    return EMPTY_WIDGET_PROPS;
  }

  const totalSteps = Math.max(0, stepCountOverride ?? getStepCount(project.stepsJson));
  const { counterLabel, counterValue } = getCounter(project);

  return {
    hasActiveProject: true,
    projectName: project.name,
    currentStep: totalSteps > 0 ? Math.min(project.currentStepIndex + 1, totalSteps) : 0,
    totalSteps,
    counterLabel,
    counterValue,
  };
}

export async function syncCurrentProjectWidgetFromProject(
  project: Project | null,
  stepCountOverride?: number,
) {
  if (Platform.OS !== 'ios') return;

  CurrentProjectWidget.updateSnapshot(project ? getWidgetProps(project, stepCountOverride) : EMPTY_WIDGET_PROPS);
}

export async function syncCurrentProjectWidgetFromDb(db: AppDb | null) {
  if (Platform.OS !== 'ios' || !db) return;

  const activeProjects = await db
    .select()
    .from(projectsTable)
    .where(eq(projectsTable.status, 'active'))
    .orderBy(desc(projectsTable.updatedAt))
    .limit(1);

  const activeProject = activeProjects[0] ?? null;
  CurrentProjectWidget.updateSnapshot(
    activeProject ? getWidgetProps(activeProject) : EMPTY_WIDGET_PROPS,
  );
}
