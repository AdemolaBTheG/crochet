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
  "treble-crochet",
  "front-post-and-back-post",
  "shell-stitch",
  "reading-pattern-abbreviations",
  "gauge-basics",
  "blocking-basics",
  "seaming-and-assembly-basics",
  "borders-and-edgings",
  "crochet-cords-and-straps",
  "buttonholes-and-simple-closures",
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
  "treble-crochet": { sortOrder: 17, difficulty: "beginner", videoUrl: "https://www.youtube.com/watch?v=-u1EUGyD5Mg" },
  "front-post-and-back-post": { sortOrder: 18, difficulty: "beginner", videoUrl: "https://www.youtube.com/watch?v=fvBkU5Yl3qA" },
  "shell-stitch": { sortOrder: 19, difficulty: "beginner", videoUrl: "https://www.youtube.com/watch?v=F4ZKmRwBGR4" },
  "reading-pattern-abbreviations": { sortOrder: 20, difficulty: "beginner", videoUrl: "https://www.youtube.com/watch?v=jOdPCill7OE" },
  "gauge-basics": { sortOrder: 21, difficulty: "beginner", videoUrl: "https://www.youtube.com/watch?v=AnT89huAi6E" },
  "blocking-basics": { sortOrder: 22, difficulty: "beginner", videoUrl: "https://www.youtube.com/watch?v=jrMVQGQiQlc" },
  "seaming-and-assembly-basics": { sortOrder: 23, difficulty: "beginner", videoUrl: null },
  "borders-and-edgings": { sortOrder: 24, difficulty: "beginner", videoUrl: null },
  "crochet-cords-and-straps": { sortOrder: 25, difficulty: "beginner", videoUrl: "https://www.youtube.com/watch?v=HVkY0ZpKqyM" },
  "buttonholes-and-simple-closures": { sortOrder: 26, difficulty: "beginner", videoUrl: "https://www.youtube.com/watch?v=UFUvEyXfsCY" },
};

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
  "granny-square-bag",
  "striped-placemat",
  "mini-cactus",
  "ear-warmer",
  "keychain-wristlet",
  "phone-pouch",
  "bobble-stitch-coaster",
  "mini-pumpkin",
  "chunky-infinity-scarf",
  "crochet-headband",
  "hexagon-motif-blanket",
  "simple-cup-cozy",
  "star-applique",
  "chevron-washcloth",
  "envelope-pouch",
  "bucket-hat",
  "crochet-bunny",
  "shell-stitch-scarf",
  "simple-market-bag",
  "tunisian-potholder",
  "crochet-mouse",
  "flower-granny-square",
  "simple-beanie",
  "wave-stitch-blanket",
  "mesh-beach-bag",
  "simple-crochet-vest",
  "baby-booties",
  "bandana-headscarf",
  "crochet-laptop-sleeve",
  "water-bottle-holder",
  "glasses-case",
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
  "minimalist-coaster": { difficulty: "beginner", category: "home", coverImageKey: "minimalist-coaster", estimatedMinutes: 20 },
  "simple-dishcloth": { difficulty: "beginner", category: "home", coverImageKey: "simple-dishcloth", estimatedMinutes: 45 },
  "beginner-scarf": { difficulty: "beginner", category: "wearable", coverImageKey: "beginner-scarf", estimatedMinutes: 120 },
  "basic-granny-square": { difficulty: "beginner", category: "motif", coverImageKey: "basic-granny-square", estimatedMinutes: 35 },
  "mini-granny-square-join": { difficulty: "beginner", category: "motif", coverImageKey: "mini-granny-square-join", estimatedMinutes: 75 },
  "cotton-face-scrubbies": { difficulty: "beginner", category: "home", coverImageKey: "cotton-face-scrubbies", estimatedMinutes: 25 },
  "cozy-mug-sleeve": { difficulty: "beginner", category: "home", coverImageKey: "cozy-mug-sleeve", estimatedMinutes: 40 },
  "ribbed-scrunchie": { difficulty: "beginner", category: "wearable", coverImageKey: "ribbed-scrunchie", estimatedMinutes: 35 },
  "slim-bookmark": { difficulty: "beginner", category: "gift", coverImageKey: "slim-bookmark", estimatedMinutes: 30 },
  "tiny-heart-applique": { difficulty: "beginner", category: "gift", coverImageKey: "tiny-heart-applique", estimatedMinutes: 20 },
  "simple-flower-applique": { difficulty: "beginner", category: "gift", coverImageKey: "simple-flower-applique", estimatedMinutes: 25 },
  "chunky-storage-basket": { difficulty: "intermediate", category: "home", coverImageKey: "chunky-storage-basket", estimatedMinutes: 90 },
  "easy-ribbed-beanie": { difficulty: "intermediate", category: "wearable", coverImageKey: "easy-ribbed-beanie", estimatedMinutes: 110 },
  "round-trivet": { difficulty: "beginner", category: "home", coverImageKey: "round-trivet", estimatedMinutes: 35 },
  "granny-stripe-scarf": { difficulty: "beginner", category: "wearable", coverImageKey: "granny-stripe-scarf", estimatedMinutes: 135 },
  "ribbed-washcloth": { difficulty: "beginner", category: "home", coverImageKey: "ribbed-washcloth", estimatedMinutes: 40 },
  "basic-amigurumi-ball": { difficulty: "beginner", category: "toy", coverImageKey: "basic-amigurumi-ball", estimatedMinutes: 55 },
  "ribbed-headband": { difficulty: "beginner", category: "wearable", coverImageKey: "ribbed-headband", estimatedMinutes: 65 },
  "simple-drawstring-pouch": { difficulty: "beginner", category: "gift", coverImageKey: "simple-drawstring-pouch", estimatedMinutes: 80 },
  "granny-square-tote": { difficulty: "intermediate", category: "wearable", coverImageKey: "granny-square-tote", estimatedMinutes: 150 },
  "mesh-market-bag": { difficulty: "beginner", category: "wearable", coverImageKey: "mesh-market-bag", estimatedMinutes: 90 },
  "basic-baby-blanket": { difficulty: "beginner", category: "home", coverImageKey: "basic-baby-blanket", estimatedMinutes: 180 },
  "amigurumi-whale": { difficulty: "intermediate", category: "toy", coverImageKey: "amigurumi-whale", estimatedMinutes: 75 },
  "granny-square-bag": { difficulty: "intermediate", category: "wearable", coverImageKey: "granny-square-bag", estimatedMinutes: 120 },
  "striped-placemat": { difficulty: "beginner", category: "home", coverImageKey: "striped-placemat", estimatedMinutes: 60 },
  "mini-cactus": { difficulty: "beginner", category: "toy", coverImageKey: "mini-cactus", estimatedMinutes: 45 },
  "ear-warmer": { difficulty: "beginner", category: "wearable", coverImageKey: "ear-warmer", estimatedMinutes: 40 },
  "keychain-wristlet": { difficulty: "beginner", category: "gift", coverImageKey: "keychain-wristlet", estimatedMinutes: 15 },
  "phone-pouch": { difficulty: "beginner", category: "wearable", coverImageKey: "phone-pouch", estimatedMinutes: 35 },
  "bobble-stitch-coaster": { difficulty: "beginner", category: "home", coverImageKey: "bobble-stitch-coaster", estimatedMinutes: 30 },
  "mini-pumpkin": { difficulty: "beginner", category: "toy", coverImageKey: "mini-pumpkin", estimatedMinutes: 40 },
  "chunky-infinity-scarf": { difficulty: "beginner", category: "wearable", coverImageKey: "chunky-infinity-scarf", estimatedMinutes: 90 },
  "crochet-headband": { difficulty: "beginner", category: "wearable", coverImageKey: "crochet-headband", estimatedMinutes: 30 },
  "hexagon-motif-blanket": { difficulty: "intermediate", category: "home", coverImageKey: "hexagon-motif-blanket", estimatedMinutes: 240 },
  "simple-cup-cozy": { difficulty: "beginner", category: "home", coverImageKey: "simple-cup-cozy", estimatedMinutes: 25 },
  "star-applique": { difficulty: "beginner", category: "gift", coverImageKey: "star-applique", estimatedMinutes: 20 },
  "chevron-washcloth": { difficulty: "beginner", category: "home", coverImageKey: "chevron-washcloth", estimatedMinutes: 45 },
  "envelope-pouch": { difficulty: "beginner", category: "gift", coverImageKey: "envelope-pouch", estimatedMinutes: 50 },
  "bucket-hat": { difficulty: "beginner", category: "wearable", coverImageKey: "easy-ribbed-beanie", estimatedMinutes: 105 },
  "crochet-bunny": { difficulty: "intermediate", category: "toy", coverImageKey: "amigurumi-whale", estimatedMinutes: 120 },
  "shell-stitch-scarf": { difficulty: "beginner", category: "wearable", coverImageKey: "granny-stripe-scarf", estimatedMinutes: 150 },
  "simple-market-bag": { difficulty: "beginner", category: "wearable", coverImageKey: "mesh-market-bag", estimatedMinutes: 95 },
  "tunisian-potholder": { difficulty: "intermediate", category: "home", coverImageKey: "ribbed-washcloth", estimatedMinutes: 70 },
  "crochet-mouse": { difficulty: "beginner", category: "toy", coverImageKey: "basic-amigurumi-ball", estimatedMinutes: 80 },
  "flower-granny-square": { difficulty: "beginner", category: "motif", coverImageKey: "basic-granny-square", estimatedMinutes: 35 },
  "simple-beanie": { difficulty: "beginner", category: "wearable", coverImageKey: "easy-ribbed-beanie", estimatedMinutes: 90 },
  "wave-stitch-blanket": { difficulty: "intermediate", category: "home", coverImageKey: "basic-baby-blanket", estimatedMinutes: 240 },
  "mesh-beach-bag": { difficulty: "beginner", category: "wearable", coverImageKey: "mesh-market-bag", estimatedMinutes: 105 },
  "simple-crochet-vest": { difficulty: "intermediate", category: "wearable", coverImageKey: "simple-crochet-vest", estimatedMinutes: 180 },
  "baby-booties": { difficulty: "beginner", category: "wearable", coverImageKey: "baby-booties", estimatedMinutes: 70 },
  "bandana-headscarf": { difficulty: "beginner", category: "wearable", coverImageKey: "bandana-headscarf", estimatedMinutes: 75 },
  "crochet-laptop-sleeve": { difficulty: "beginner", category: "gift", coverImageKey: "crochet-laptop-sleeve", estimatedMinutes: 150 },
  "water-bottle-holder": { difficulty: "beginner", category: "wearable", coverImageKey: "water-bottle-holder", estimatedMinutes: 60 },
  "glasses-case": { difficulty: "beginner", category: "gift", coverImageKey: "glasses-case", estimatedMinutes: 45 },
};

export async function seedDatabase(db: ExpoSQLiteDatabase<typeof schema>) {
  const lessonSeedRows: schema.NewLesson[] = lessonSlugs.map((slug) => {
    const meta = lessonMetadata[slug];
    return {
      slug,
      title: slug,
      sortOrder: meta.sortOrder,
      difficulty: meta.difficulty,
      content: "{}",
      videoUrl: meta.videoUrl,
      isPublished: true,
    };
  });

  const patternSeedRows: schema.NewPattern[] = patternSlugs.map((slug) => {
    const meta = patternMetadata[slug];
    return {
      slug,
      title: slug,
      difficulty: meta.difficulty,
      category: meta.category,
      coverImageKey: meta.coverImageKey,
      estimatedMinutes: meta.estimatedMinutes,
      stepsJson: "[]",
      isPublished: true,
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
}
