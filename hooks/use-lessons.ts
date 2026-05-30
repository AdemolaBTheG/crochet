import { fetchLessons, type ResolvedLesson } from '@/services/content';
import { useQuery } from '@tanstack/react-query';

export type { ResolvedLesson } from '@/services/content';

export function useLessons(locale: string) {
  return useQuery<ResolvedLesson[]>({
    queryKey: ['lessons', locale],
    queryFn: () => fetchLessons(locale),
    staleTime: 5 * 60 * 1000,
    enabled: !!locale,
  });
}
