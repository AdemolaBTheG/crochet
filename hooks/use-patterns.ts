import { fetchPatterns, type ResolvedPattern } from '@/services/content';
import { useQuery } from '@tanstack/react-query';

export type { ResolvedPattern } from '@/services/content';

export function usePatterns(locale: string) {
  return useQuery<ResolvedPattern[]>({
    queryKey: ['patterns', locale],
    queryFn: () => fetchPatterns(locale),
    staleTime: 5 * 60 * 1000,
    enabled: !!locale,
  });
}
