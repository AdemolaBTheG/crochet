import { fetchLessonBySlug, type ResolvedLesson } from '@/services/content';
import { useQuery } from '@tanstack/react-query';

export type { ResolvedLesson } from '@/services/content';

export function useLessonDetail(slug: string | undefined, locale: string) {
  return useQuery<ResolvedLesson | null>({
    queryKey: ['lesson', slug, locale],
    queryFn: () => fetchLessonBySlug(slug!, locale),
    staleTime: 5 * 60 * 1000,
    enabled: !!slug && !!locale,
  });
}
