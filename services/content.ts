import { supabase } from '@/utils/supabase';
import type {
  LessonRow,
  LessonTranslationRow,
  PatternRow,
  PatternTranslationRow,
} from '@/types/supabase';

const SUPPORTED_LOCALES = ['en', 'de', 'fr', 'es', 'nl'] as const;

function parseJson<T>(value: unknown, fallback: T): T {
  if (!value) return fallback;

  try {
    return (typeof value === 'string' ? JSON.parse(value) : value) as T;
  } catch {
    return fallback;
  }
}

function pickBestTranslation<T extends { locale: string }>(
  translations: T[],
  preferredLocale: string,
): T | undefined {
  return (
    translations.find((t) => t.locale === preferredLocale) ??
    translations.find((t) => t.locale === 'en')
  );
}

export type LessonContent = {
  summary: string;
  whyItMatters: string;
  steps: string[];
  practice: string;
  commonMistakes: string[];
};

export type PatternStep = {
  type: 'instruction' | 'row' | 'round' | 'repeat';
  title: string;
  instruction: string;
  counterLabel?: string;
  targetCount?: number;
};

export type ResolvedPattern = {
  id: number;
  slug: string;
  difficulty: string;
  category: string | null;
  coverImageKey: string;
  estimatedMinutes: number | null;
  isPublished: boolean;
  title: string;
  description: string | null;
  materials: string[];
  skills: string[];
  expectationText: string | null;
  steps: PatternStep[];
};

export type ResolvedLesson = {
  id: number;
  slug: string;
  sortOrder: number;
  difficulty: string;
  videoUrl: string | null;
  isPublished: boolean;
  title: string;
  description: string | null;
  content: LessonContent;
};

function resolvePatternFromRow(
  pattern: PatternRow,
  translations: PatternTranslationRow[],
  locale: string,
): ResolvedPattern {
  const best = pickBestTranslation(translations, locale);

  const title = best?.title ?? pattern.title;
  const description = best?.description ?? pattern.description ?? null;
  const materials = parseJson<string[]>(
    best?.materials_json,
    pattern.materials_text
      ? pattern.materials_text
          .split(',')
          .map((s) => s.trim().replace(/\.$/, ''))
          .filter(Boolean)
      : [],
  );
  const skills = parseJson<string[]>(
    best?.skills_json,
    pattern.skills_text
      ? pattern.skills_text
          .split(',')
          .map((s) => s.trim().replace(/\.$/, ''))
          .filter(Boolean)
      : [],
  );
  const expectationText =
    best?.expectation_text ?? pattern.expectation_text ?? null;
  const steps = parseJson<PatternStep[]>(
    best?.steps_json ?? pattern.steps_json,
    [],
  );

  return {
    id: pattern.id,
    slug: pattern.slug,
    difficulty: pattern.difficulty,
    category: pattern.category,
    coverImageKey: pattern.cover_image_key,
    estimatedMinutes: pattern.estimated_minutes,
    isPublished: pattern.is_published,
    title,
    description,
    materials,
    skills,
    expectationText,
    steps,
  };
}

function resolveLessonFromRow(
  lesson: LessonRow,
  translations: LessonTranslationRow[],
  locale: string,
): ResolvedLesson {
  const best = pickBestTranslation(translations, locale);

  const title = best?.title ?? lesson.title;
  const description = best?.description ?? lesson.description ?? null;
  const content = parseJson<LessonContent>(
    best?.content_json ?? lesson.content,
    {
      summary: '',
      whyItMatters: '',
      steps: [],
      practice: '',
      commonMistakes: [],
    },
  );

  return {
    id: lesson.id,
    slug: lesson.slug,
    sortOrder: lesson.sort_order,
    difficulty: lesson.difficulty,
    videoUrl: lesson.video_url,
    isPublished: lesson.is_published,
    title,
    description,
    content,
  };
}

export async function fetchPatterns(locale: string): Promise<ResolvedPattern[]> {
  const { data: patterns, error } = await supabase
    .from('patterns')
    .select('*')
    .eq('is_published', true)
    .returns<PatternRow[]>();

  if (error) throw error;
  if (!patterns?.length) return [];

  const patternIds = patterns.map((p) => p.id);

  const { data: translations, error: trError } = await supabase
    .from('pattern_translations')
    .select('*')
    .in('pattern_id', patternIds)
    .in('locale', [locale, 'en'])
    .returns<PatternTranslationRow[]>();

  if (trError) throw trError;

  const translationsById = new Map<number, PatternTranslationRow[]>();
  for (const t of translations ?? []) {
    const list = translationsById.get(t.pattern_id) ?? [];
    list.push(t);
    translationsById.set(t.pattern_id, list);
  }

  return patterns.map((p) =>
    resolvePatternFromRow(p, translationsById.get(p.id) ?? [], locale),
  );
}

export async function fetchPatternBySlug(
  slug: string,
  locale: string,
): Promise<ResolvedPattern | null> {
  const { data: patterns, error } = await supabase
    .from('patterns')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .limit(1)
    .returns<PatternRow[]>();

  if (error) throw error;
  const pattern = patterns?.[0] ?? null;
  if (!pattern) return null;

  const { data: translations, error: trError } = await supabase
    .from('pattern_translations')
    .select('*')
    .eq('pattern_id', pattern.id)
    .in('locale', [locale, 'en'])
    .returns<PatternTranslationRow[]>();

  if (trError) throw trError;

  return resolvePatternFromRow(pattern, translations ?? [], locale);
}

export async function fetchLessons(locale: string): Promise<ResolvedLesson[]> {
  const { data: lessons, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('is_published', true)
    .order('sort_order', { ascending: true })
    .returns<LessonRow[]>();

  if (error) throw error;
  if (!lessons?.length) return [];

  const lessonIds = lessons.map((l) => l.id);

  const { data: translations, error: trError } = await supabase
    .from('lesson_translations')
    .select('*')
    .in('lesson_id', lessonIds)
    .in('locale', [locale, 'en'])
    .returns<LessonTranslationRow[]>();

  if (trError) throw trError;

  const translationsById = new Map<number, LessonTranslationRow[]>();
  for (const t of translations ?? []) {
    const list = translationsById.get(t.lesson_id) ?? [];
    list.push(t);
    translationsById.set(t.lesson_id, list);
  }

  return lessons.map((l) =>
    resolveLessonFromRow(l, translationsById.get(l.id) ?? [], locale),
  );
}

export async function fetchLessonBySlug(
  slug: string,
  locale: string,
): Promise<ResolvedLesson | null> {
  const { data: lessons, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .limit(1)
    .returns<LessonRow[]>();

  if (error) throw error;
  const lesson = lessons?.[0] ?? null;
  if (!lesson) return null;

  const { data: translations, error: trError } = await supabase
    .from('lesson_translations')
    .select('*')
    .eq('lesson_id', lesson.id)
    .in('locale', [locale, 'en'])
    .returns<LessonTranslationRow[]>();

  if (trError) throw trError;

  return resolveLessonFromRow(lesson, translations ?? [], locale);
}
