import type { Lesson, Pattern } from '@/db/schema';

export const FREE_ACTIVE_PROJECT_LIMIT = 1;
export const FREE_PATTERN_SLUGS = [
  'minimalist-coaster',
  'simple-dishcloth',
  'beginner-scarf',
] as const;
export const FREE_LESSON_SLUGS = ['slip-knot-and-hold'] as const;
export const PREMIUM_TOOL_IDS = [
  'row-counter',
  'stitch-fixes',
  'size-calculator',
  'identify-stitch',
] as const;

export function isPatternFree(pattern: Pick<Pattern, 'slug'> | null | undefined) {
  return !!pattern && FREE_PATTERN_SLUGS.includes(pattern.slug as (typeof FREE_PATTERN_SLUGS)[number]);
}

export function isLessonFree(lesson: Pick<Lesson, 'slug'> | null | undefined) {
  return !!lesson && FREE_LESSON_SLUGS.includes(lesson.slug as (typeof FREE_LESSON_SLUGS)[number]);
}
