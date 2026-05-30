import {
  fetchPatternBySlug,
  type ResolvedPattern,
  type PatternStep,
} from '@/services/content';
import { useQuery } from '@tanstack/react-query';

export type { ResolvedPattern, PatternStep } from '@/services/content';

export function usePatternDetail(slug: string | undefined, locale: string) {
  return useQuery<ResolvedPattern | null>({
    queryKey: ['pattern', slug, locale],
    queryFn: () => fetchPatternBySlug(slug!, locale),
    staleTime: 5 * 60 * 1000,
    enabled: !!slug && !!locale,
  });
}
