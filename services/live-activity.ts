import { type LiveActivity } from 'expo-widgets';
import ProjectActivity, { type ProjectActivityProps } from '@/widgets/ProjectActivity';

let currentInstance: LiveActivity<ProjectActivityProps> | null = null;

export function startProjectActivity(props: ProjectActivityProps) {
  if (currentInstance) {
    void currentInstance.end('immediate');
    currentInstance = null;
  }

  console.log('[LiveActivity] Starting with props:', JSON.stringify(props));
  currentInstance = ProjectActivity.start(props);
  console.log('[LiveActivity] Started, instance:', !!currentInstance);
  return currentInstance;
}

export async function updateProjectActivity(props: ProjectActivityProps) {
  if (!currentInstance) return;
  try {
    console.log('[LiveActivity] Updating with props:', JSON.stringify(props));
    await currentInstance.update(props);
  } catch (e) {
    console.warn('[LiveActivity] Update failed:', e);
    currentInstance = null;
  }
}

export async function endProjectActivity(props?: ProjectActivityProps) {
  if (!currentInstance) return;
  const instance = currentInstance;
  currentInstance = null;
  try {
    console.log('[LiveActivity] Ending...');
    await instance.end('default', props);
    console.log('[LiveActivity] Ended successfully');
  } catch (e) {
    console.warn('[LiveActivity] End failed:', e);
  }
}
