import {
  lessonTranslations as lessonTranslationsTable,
  lessons as lessonsTable,
  patternTranslations as patternTranslationsTable,
  patterns as patternsTable,
  type Lesson,
  type LessonTranslation,
  type Pattern,
  type PatternTranslation,
  type SupportedLanguage,
} from "@/db/schema";
import type { ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite";
import { and, eq, inArray } from "drizzle-orm";

type LessonContent = {
  summary: string;
  whyItMatters: string;
  steps: string[];
  practice: string;
  commonMistakes: string[];
};

type PatternStep = {
  type: "instruction" | "row" | "round" | "repeat";
  title: string;
  instruction: string;
  counterLabel?: string;
  targetCount?: number;
};

type PatternContentJson = {
  materials: string[];
  skills: string[];
  expectationText: string;
  steps: PatternStep[];
};

export type ResolvedLesson = Pick<
  Lesson,
  "id" | "slug" | "sortOrder" | "difficulty" | "videoUrl" | "isPublished"
> & {
  title: string;
  description: string | null;
  content: LessonContent;
};

export type ResolvedPattern = Pick<
  Pattern,
  | "id"
  | "slug"
  | "difficulty"
  | "category"
  | "coverImageKey"
  | "estimatedMinutes"
  | "isPublished"
> & {
  title: string;
  description: string | null;
  materials: string[];
  skills: string[];
  expectationText: string | null;
  steps: PatternStep[];
};

function parseJson<T>(value: unknown, fallback: T): T {
  if (!value) return fallback;

  try {
    return (typeof value === "string" ? JSON.parse(value) : value) as T;
  } catch {
    return fallback;
  }
}

function pickBestTranslation<T extends { locale: string }>(
  translations: T[],
  preferredLocale: string,
): T | undefined {
  const preferred = translations.find((t) => t.locale === preferredLocale);
  if (preferred) return preferred;

  return translations.find((t) => t.locale === "en");
}

export async function resolveLessonTranslations(
  db: ExpoSQLiteDatabase<any>,
  locale: string,
): Promise<ResolvedLesson[]> {
  const lessonRows = await db
    .select()
    .from(lessonsTable)
    .orderBy(lessonsTable.sortOrder);

  if (lessonRows.length === 0) return [];

  const lessonIds = lessonRows.map((l) => l.id);

  const translationRows = await db
    .select()
    .from(lessonTranslationsTable)
    .where(
      and(
        inArray(lessonTranslationsTable.lessonId, lessonIds),
        inArray(lessonTranslationsTable.locale, [locale as SupportedLanguage, "en"]),
      ),
    );

  const translationsByLessonId = new Map<number, LessonTranslation[]>();
  for (const t of translationRows) {
    const list = translationsByLessonId.get(t.lessonId) ?? [];
    list.push(t);
    translationsByLessonId.set(t.lessonId, list);
  }

  return lessonRows.map((lesson) => {
    const translations = translationsByLessonId.get(lesson.id) ?? [];
    const bestTranslation = pickBestTranslation(translations, locale);

    const title = bestTranslation?.title ?? lesson.title;
    const description = bestTranslation?.description ?? lesson.description ?? null;
    const content = parseJson<LessonContent>(
      bestTranslation?.contentJson ?? lesson.content,
      {
        summary: "",
        whyItMatters: "",
        steps: [],
        practice: "",
        commonMistakes: [],
      },
    );

    return {
      id: lesson.id,
      slug: lesson.slug,
      sortOrder: lesson.sortOrder,
      difficulty: lesson.difficulty,
      videoUrl: lesson.videoUrl,
      isPublished: lesson.isPublished,
      title,
      description,
      content,
    };
  });
}

export async function resolveLessonTranslation(
  db: ExpoSQLiteDatabase<any>,
  lesson: Lesson,
  locale: string,
): Promise<ResolvedLesson> {
  const translations = await db
    .select()
    .from(lessonTranslationsTable)
    .where(
      and(
        eq(lessonTranslationsTable.lessonId, lesson.id),
        inArray(lessonTranslationsTable.locale, [
          locale as SupportedLanguage,
          "en",
        ]),
      ),
    );

  const bestTranslation = pickBestTranslation(translations, locale);

  const title = bestTranslation?.title ?? lesson.title;
  const description =
    bestTranslation?.description ?? lesson.description ?? null;
  const content = parseJson<LessonContent>(
    bestTranslation?.contentJson ?? lesson.content,
    {
      summary: "",
      whyItMatters: "",
      steps: [],
      practice: "",
      commonMistakes: [],
    },
  );

  return {
    id: lesson.id,
    slug: lesson.slug,
    sortOrder: lesson.sortOrder,
    difficulty: lesson.difficulty,
    videoUrl: lesson.videoUrl,
    isPublished: lesson.isPublished,
    title,
    description,
    content,
  };
}

export async function resolvePatternTranslation(
  db: ExpoSQLiteDatabase<any>,
  pattern: Pattern,
  locale: string,
): Promise<ResolvedPattern> {
  const translations = await db
    .select()
    .from(patternTranslationsTable)
    .where(
      and(
        eq(patternTranslationsTable.patternId, pattern.id),
        inArray(patternTranslationsTable.locale, [
          locale as SupportedLanguage,
          "en",
        ]),
      ),
    );

  const bestTranslation = pickBestTranslation(translations, locale);

  const title = bestTranslation?.title ?? pattern.title;
  const description =
    bestTranslation?.description ?? pattern.description ?? null;
  const materials = parseJson<string[]>(
    bestTranslation?.materialsJson,
    pattern.materialsText
      ? pattern.materialsText
          .split(",")
          .map((s: string) => s.trim().replace(/\.$/, ""))
          .filter(Boolean)
      : [],
  );
  const skills = parseJson<string[]>(
    bestTranslation?.skillsJson,
    pattern.skillsText
      ? pattern.skillsText
          .split(",")
          .map((s: string) => s.trim().replace(/\.$/, ""))
          .filter(Boolean)
      : [],
  );
  const expectationText =
    bestTranslation?.expectationText ??
    pattern.expectationText ??
    null;
  const steps = parseJson<PatternStep[]>(
    bestTranslation?.stepsJson ?? pattern.stepsJson,
    [],
  );

  return {
    id: pattern.id,
    slug: pattern.slug,
    difficulty: pattern.difficulty,
    category: pattern.category,
    coverImageKey: pattern.coverImageKey,
    estimatedMinutes: pattern.estimatedMinutes,
    isPublished: pattern.isPublished,
    title,
    description,
    materials,
    skills,
    expectationText,
    steps,
  };
}
