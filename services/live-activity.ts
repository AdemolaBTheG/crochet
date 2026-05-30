import { after, type LiveActivity } from 'expo-widgets';
import ProjectActivity, { type ProjectActivityProps } from '@/widgets/ProjectActivity';

let currentInstance: LiveActivity<ProjectActivityProps> | null = null;

export function startProjectActivity(props: ProjectActivityProps) {
  if (currentInstance) {
    void currentInstance.end('immediate');
  }

  currentInstance = ProjectActivity.start(props);
  return currentInstance;
}

export async function updateProjectActivity(props: ProjectActivityProps) {
  if (!currentInstance) return;
  await currentInstance.update(props);
}

export async function endProjectActivity(props?: ProjectActivityProps) {
  if (!currentInstance) return;
  await currentInstance.end(
    after(new Date(Date.now() + 15 * 60 * 1000)),
    props,
    new Date(),
  );
  currentInstance = null;
}
