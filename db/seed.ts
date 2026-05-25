import deLessonContentMap from "@/content/lessons/de";
import enLessonContentMap from "@/content/lessons/en";
import esLessonContentMap from "@/content/lessons/es";
import frLessonContentMap from "@/content/lessons/fr";
import itLessonContentMap from "@/content/lessons/it";
import jaLessonContentMap from "@/content/lessons/ja";
import koLessonContentMap from "@/content/lessons/ko";
import nlLessonContentMap from "@/content/lessons/nl";
import plLessonContentMap from "@/content/lessons/pl";
import ptBrLessonContentMap from "@/content/lessons/pt-BR";
import svLessonContentMap from "@/content/lessons/sv";
import dePatternContentMap from "@/content/patterns/de";
import enPatternContentMap from "@/content/patterns/en";
import esPatternContentMap from "@/content/patterns/es";
import frPatternContentMap from "@/content/patterns/fr";
import itPatternContentMap from "@/content/patterns/it";
import jaPatternContentMap from "@/content/patterns/ja";
import koPatternContentMap from "@/content/patterns/ko";
import nlPatternContentMap from "@/content/patterns/nl";
import plPatternContentMap from "@/content/patterns/pl";
import ptBrPatternContentMap from "@/content/patterns/pt-BR";
import svPatternContentMap from "@/content/patterns/sv";
import * as schema from "@/db/schema";
import type { ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite";

const lessonSlugs = [
  "slip-knot-and-hold",
  "foundation-chain",
  "single-crochet",
  "slip-stitch-and-join",
  "half-double-crochet",
  "double-crochet",
  "working-in-rows",
  "working-in-rounds",
  "magic-ring",
  "fasten-off-and-weave-ends",
  "increasing-and-decreasing",
  "chain-spaces-and-corners",
  "back-loop-only-ribbing",
  "color-changes",
  "joining-granny-squares",
  "invisible-decrease-for-amigurumi",
];

const lessonMetadata: Record<
  string,
  { sortOrder: number; difficulty: string; videoUrl: string | null }
> = {
  "slip-knot-and-hold": { sortOrder: 1, difficulty: "beginner", videoUrl: null },
  "foundation-chain": { sortOrder: 2, difficulty: "beginner", videoUrl: null },
  "single-crochet": { sortOrder: 3, difficulty: "beginner", videoUrl: null },
  "slip-stitch-and-join": { sortOrder: 4, difficulty: "beginner", videoUrl: null },
  "half-double-crochet": { sortOrder: 5, difficulty: "beginner", videoUrl: null },
  "double-crochet": { sortOrder: 6, difficulty: "beginner", videoUrl: null },
  "working-in-rows": { sortOrder: 7, difficulty: "beginner", videoUrl: null },
  "working-in-rounds": { sortOrder: 8, difficulty: "beginner", videoUrl: null },
  "magic-ring": { sortOrder: 9, difficulty: "beginner", videoUrl: null },
  "fasten-off-and-weave-ends": { sortOrder: 10, difficulty: "beginner", videoUrl: null },
  "increasing-and-decreasing": { sortOrder: 11, difficulty: "beginner", videoUrl: null },
  "chain-spaces-and-corners": { sortOrder: 12, difficulty: "beginner", videoUrl: null },
  "back-loop-only-ribbing": { sortOrder: 13, difficulty: "beginner", videoUrl: null },
  "color-changes": { sortOrder: 14, difficulty: "beginner", videoUrl: null },
  "joining-granny-squares": { sortOrder: 15, difficulty: "beginner", videoUrl: null },
  "invisible-decrease-for-amigurumi": { sortOrder: 16, difficulty: "beginner", videoUrl: null },
};

const lessonContentMaps = {
  en: enLessonContentMap,
  de: deLessonContentMap,
  fr: frLessonContentMap,
  es: esLessonContentMap,
  nl: nlLessonContentMap,
  it: itLessonContentMap,
  ja: jaLessonContentMap,
  ko: koLessonContentMap,
  "pt-BR": ptBrLessonContentMap,
  pl: plLessonContentMap,
  sv: svLessonContentMap,
} as const;

const patternSlugs = [
  "minimalist-coaster",
  "simple-dishcloth",
  "beginner-scarf",
  "basic-granny-square",
  "mini-granny-square-join",
  "cotton-face-scrubbies",
  "cozy-mug-sleeve",
  "ribbed-scrunchie",
  "slim-bookmark",
  "tiny-heart-applique",
  "simple-flower-applique",
  "chunky-storage-basket",
  "easy-ribbed-beanie",
  "round-trivet",
  "granny-stripe-scarf",
  "ribbed-washcloth",
  "basic-amigurumi-ball",
  "ribbed-headband",
  "simple-drawstring-pouch",
  "granny-square-tote",
  "mesh-market-bag",
  "basic-baby-blanket",
  "amigurumi-whale",
];

const patternMetadata: Record<
  string,
  {
    difficulty: string;
    category: string;
    coverImageKey: string;
    estimatedMinutes: number;
  }
> = {
  "minimalist-coaster": {
    difficulty: "beginner",
    category: "home",
    coverImageKey: "minimalist-coaster",
    estimatedMinutes: 20,
  },
  "simple-dishcloth": {
    difficulty: "beginner",
    category: "home",
    coverImageKey: "simple-dishcloth",
    estimatedMinutes: 45,
  },
  "beginner-scarf": {
    difficulty: "beginner",
    category: "wearable",
    coverImageKey: "beginner-scarf",
    estimatedMinutes: 120,
  },
  "basic-granny-square": {
    difficulty: "beginner",
    category: "motif",
    coverImageKey: "basic-granny-square",
    estimatedMinutes: 35,
  },
  "mini-granny-square-join": {
    difficulty: "beginner",
    category: "motif",
    coverImageKey: "mini-granny-square-join",
    estimatedMinutes: 75,
  },
  "cotton-face-scrubbies": {
    difficulty: "beginner",
    category: "home",
    coverImageKey: "cotton-face-scrubbies",
    estimatedMinutes: 25,
  },
  "cozy-mug-sleeve": {
    difficulty: "beginner",
    category: "home",
    coverImageKey: "cozy-mug-sleeve",
    estimatedMinutes: 40,
  },
  "ribbed-scrunchie": {
    difficulty: "beginner",
    category: "wearable",
    coverImageKey: "ribbed-scrunchie",
    estimatedMinutes: 35,
  },
  "slim-bookmark": {
    difficulty: "beginner",
    category: "gift",
    coverImageKey: "slim-bookmark",
    estimatedMinutes: 30,
  },
  "tiny-heart-applique": {
    difficulty: "beginner",
    category: "gift",
    coverImageKey: "tiny-heart-applique",
    estimatedMinutes: 20,
  },
  "simple-flower-applique": {
    difficulty: "beginner",
    category: "gift",
    coverImageKey: "simple-flower-applique",
    estimatedMinutes: 25,
  },
  "chunky-storage-basket": {
    difficulty: "intermediate",
    category: "home",
    coverImageKey: "chunky-storage-basket",
    estimatedMinutes: 90,
  },
  "easy-ribbed-beanie": {
    difficulty: "intermediate",
    category: "wearable",
    coverImageKey: "easy-ribbed-beanie",
    estimatedMinutes: 110,
  },
  "round-trivet": {
    difficulty: "beginner",
    category: "home",
    coverImageKey: "round-trivet",
    estimatedMinutes: 35,
  },
  "granny-stripe-scarf": {
    difficulty: "beginner",
    category: "wearable",
    coverImageKey: "granny-stripe-scarf",
    estimatedMinutes: 135,
  },
  "ribbed-washcloth": {
    difficulty: "beginner",
    category: "home",
    coverImageKey: "ribbed-washcloth",
    estimatedMinutes: 40,
  },
  "basic-amigurumi-ball": {
    difficulty: "beginner",
    category: "toy",
    coverImageKey: "basic-amigurumi-ball",
    estimatedMinutes: 55,
  },
  "ribbed-headband": {
    difficulty: "beginner",
    category: "wearable",
    coverImageKey: "ribbed-headband",
    estimatedMinutes: 65,
  },
  "simple-drawstring-pouch": {
    difficulty: "beginner",
    category: "gift",
    coverImageKey: "simple-drawstring-pouch",
    estimatedMinutes: 80,
  },
  "granny-square-tote": {
    difficulty: "beginner",
    category: "gift",
    coverImageKey: "granny-square-tote",
    estimatedMinutes: 150,
  },
  "mesh-market-bag": {
    difficulty: "beginner",
    category: "gift",
    coverImageKey: "mesh-market-bag",
    estimatedMinutes: 120,
  },
  "basic-baby-blanket": {
    difficulty: "beginner",
    category: "home",
    coverImageKey: "basic-baby-blanket",
    estimatedMinutes: 240,
  },
  "amigurumi-whale": {
    difficulty: "beginner",
    category: "toy",
    coverImageKey: "amigurumi-whale",
    estimatedMinutes: 90,
  },
};

const patternContentMaps = {
  en: enPatternContentMap,
  de: dePatternContentMap,
  fr: frPatternContentMap,
  es: esPatternContentMap,
  nl: nlPatternContentMap,
  it: itPatternContentMap,
  ja: jaPatternContentMap,
  ko: koPatternContentMap,
  "pt-BR": ptBrPatternContentMap,
  pl: plPatternContentMap,
  sv: svPatternContentMap,
} as const;

export async function seedDatabase(db: ExpoSQLiteDatabase<typeof schema>) {
  const lessonSeedRows: schema.NewLesson[] = lessonSlugs.map((slug) => {
    const meta = lessonMetadata[slug];
    const content = enLessonContentMap[slug];
    return {
      slug,
      title: content?.title ?? slug,
      description: content?.description ?? null,
      sortOrder: meta.sortOrder,
      difficulty: meta.difficulty,
      content: JSON.stringify(content?.content ?? {}),
      videoUrl: meta.videoUrl,
    };
  });

  const patternSeedRows: schema.NewPattern[] = patternSlugs.map((slug) => {
    const meta = patternMetadata[slug];
    const content = enPatternContentMap[slug];
    return {
      slug,
      title: content?.title ?? slug,
      description: content?.description ?? null,
      difficulty: meta.difficulty,
      category: meta.category,
      coverImageKey: meta.coverImageKey,
      estimatedMinutes: meta.estimatedMinutes,
      materialsText: content?.materials?.join(", ") ?? null,
      skillsText: content?.skills?.join(", ") ?? null,
      expectationText: content?.expectationText ?? null,
      stepsJson: JSON.stringify(content?.steps ?? []),
    };
  });

  await db
    .insert(schema.lessons)
    .values(lessonSeedRows)
    .onConflictDoNothing({ target: schema.lessons.slug });

  await db
    .insert(schema.patterns)
    .values(patternSeedRows)
    .onConflictDoNothing({ target: schema.patterns.slug });

  const lessonRows = await db.select().from(schema.lessons);
  const lessonIdBySlug = new Map(lessonRows.map((l) => [l.slug, l.id]));

  const lessonTranslationRows: schema.NewLessonTranslation[] = [];
  for (const locale of schema.SUPPORTED_LANGUAGES) {
    const localeContentMap = lessonContentMaps[locale];

    for (const slug of lessonSlugs) {
      const lessonId = lessonIdBySlug.get(slug);
      if (!lessonId) continue;

      const content = localeContentMap[slug] ?? enLessonContentMap[slug];
      if (!content) continue;

      lessonTranslationRows.push({
        lessonId,
        locale,
        title: content.title,
        description: content.description,
        contentJson: JSON.stringify(content.content),
      });
    }
  }

  if (lessonTranslationRows.length > 0) {
    await db
      .insert(schema.lessonTranslations)
      .values(lessonTranslationRows)
      .onConflictDoNothing({
        target: [
          schema.lessonTranslations.lessonId,
          schema.lessonTranslations.locale,
        ],
      });
  }

  const patternRows = await db.select().from(schema.patterns);
  const patternIdBySlug = new Map(patternRows.map((p) => [p.slug, p.id]));

  const patternTranslationRows: schema.NewPatternTranslation[] = [];
  for (const locale of schema.SUPPORTED_LANGUAGES) {
    const localeContentMap = patternContentMaps[locale];

    for (const slug of patternSlugs) {
      const patternId = patternIdBySlug.get(slug);
      if (!patternId) continue;

      const content = localeContentMap[slug] ?? enPatternContentMap[slug];
      if (!content) continue;

      patternTranslationRows.push({
        patternId,
        locale,
        title: content.title,
        description: content.description,
        materialsJson: JSON.stringify(content.materials),
        skillsJson: JSON.stringify(content.skills),
        expectationText: content.expectationText,
        stepsJson: JSON.stringify(content.steps),
      });
    }
  }

  if (patternTranslationRows.length > 0) {
    await db
      .insert(schema.patternTranslations)
      .values(patternTranslationRows)
      .onConflictDoNothing({
        target: [
          schema.patternTranslations.patternId,
          schema.patternTranslations.locale,
        ],
      });
  }
}
