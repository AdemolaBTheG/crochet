import fetch from 'cross-fetch';
import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env file (Expo's .env uses standard KEY=value format)
const envPath = resolve(__dirname, '..', '.env');
if (existsSync(envPath)) {
  const envContent = readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let value = trimmed.slice(eqIdx + 1).trim();
    // Strip surrounding quotes
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL) {
  console.error('Missing EXPO_PUBLIC_SUPABASE_URL');
  process.exit(1);
}

console.log(`Using Supabase URL: ${SUPABASE_URL}`);

if (!SERVICE_ROLE_KEY) {
  console.error(
    'Missing SUPABASE_SERVICE_ROLE_KEY\n' +
      'Get it from Supabase Dashboard > Project Settings > API > service_role key',
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
  global: { fetch },
});

const LOCALES = ['en', 'de', 'fr', 'es', 'nl', 'it', 'ja', 'ko', 'pl', 'pt-BR', 'sv'];
const CONTENT_DIR = resolve(__dirname, '..', 'content');
const PATTERN_VIDEOS_PATH = resolve(__dirname, '..', 'data', 'pattern-videos.json');
const LESSON_VIDEOS_PATH = resolve(__dirname, '..', 'data', 'lesson-videos.json');

const lessonMetadata = {
  'slip-knot-and-hold': { sortOrder: 1, difficulty: 'beginner' },
  'foundation-chain': { sortOrder: 2, difficulty: 'beginner' },
  'single-crochet': { sortOrder: 3, difficulty: 'beginner' },
  'slip-stitch-and-join': { sortOrder: 4, difficulty: 'beginner' },
  'half-double-crochet': { sortOrder: 5, difficulty: 'beginner' },
  'double-crochet': { sortOrder: 6, difficulty: 'beginner' },
  'working-in-rows': { sortOrder: 7, difficulty: 'beginner' },
  'working-in-rounds': { sortOrder: 8, difficulty: 'beginner' },
  'magic-ring': { sortOrder: 9, difficulty: 'beginner' },
  'fasten-off-and-weave-ends': { sortOrder: 10, difficulty: 'beginner' },
  'increasing-and-decreasing': { sortOrder: 11, difficulty: 'beginner' },
  'chain-spaces-and-corners': { sortOrder: 12, difficulty: 'beginner' },
  'back-loop-only-ribbing': { sortOrder: 13, difficulty: 'beginner' },
  'color-changes': { sortOrder: 14, difficulty: 'beginner' },
  'joining-granny-squares': { sortOrder: 15, difficulty: 'beginner' },
  'invisible-decrease-for-amigurumi': { sortOrder: 16, difficulty: 'beginner' },
  'treble-crochet': { sortOrder: 17, difficulty: 'beginner' },
  'front-post-and-back-post': { sortOrder: 18, difficulty: 'beginner' },
  'shell-stitch': { sortOrder: 19, difficulty: 'beginner' },
  'reading-pattern-abbreviations': { sortOrder: 20, difficulty: 'beginner' },
  'gauge-basics': { sortOrder: 21, difficulty: 'beginner' },
  'blocking-basics': { sortOrder: 22, difficulty: 'beginner' },
  'seaming-and-assembly-basics': { sortOrder: 23, difficulty: 'beginner' },
  'borders-and-edgings': { sortOrder: 24, difficulty: 'beginner' },
  'crochet-cords-and-straps': { sortOrder: 25, difficulty: 'beginner' },
  'buttonholes-and-simple-closures': { sortOrder: 26, difficulty: 'beginner' },
};

const patternMetadata = {
  'minimalist-coaster': { difficulty: 'beginner', category: 'home', coverImageKey: 'minimalist-coaster', estimatedMinutes: 20 },
  'simple-dishcloth': { difficulty: 'beginner', category: 'home', coverImageKey: 'simple-dishcloth', estimatedMinutes: 45 },
  'beginner-scarf': { difficulty: 'beginner', category: 'wearable', coverImageKey: 'beginner-scarf', estimatedMinutes: 120 },
  'basic-granny-square': { difficulty: 'beginner', category: 'motif', coverImageKey: 'basic-granny-square', estimatedMinutes: 35 },
  'mini-granny-square-join': { difficulty: 'beginner', category: 'motif', coverImageKey: 'mini-granny-square-join', estimatedMinutes: 75 },
  'cotton-face-scrubbies': { difficulty: 'beginner', category: 'home', coverImageKey: 'cotton-face-scrubbies', estimatedMinutes: 25 },
  'cozy-mug-sleeve': { difficulty: 'beginner', category: 'home', coverImageKey: 'cozy-mug-sleeve', estimatedMinutes: 40 },
  'ribbed-scrunchie': { difficulty: 'beginner', category: 'wearable', coverImageKey: 'ribbed-scrunchie', estimatedMinutes: 35 },
  'slim-bookmark': { difficulty: 'beginner', category: 'gift', coverImageKey: 'slim-bookmark', estimatedMinutes: 30 },
  'tiny-heart-applique': { difficulty: 'beginner', category: 'gift', coverImageKey: 'tiny-heart-applique', estimatedMinutes: 20 },
  'simple-flower-applique': { difficulty: 'beginner', category: 'gift', coverImageKey: 'simple-flower-applique', estimatedMinutes: 25 },
  'chunky-storage-basket': { difficulty: 'intermediate', category: 'home', coverImageKey: 'chunky-storage-basket', estimatedMinutes: 90 },
  'easy-ribbed-beanie': { difficulty: 'intermediate', category: 'wearable', coverImageKey: 'easy-ribbed-beanie', estimatedMinutes: 110 },
  'round-trivet': { difficulty: 'beginner', category: 'home', coverImageKey: 'round-trivet', estimatedMinutes: 35 },
  'granny-stripe-scarf': { difficulty: 'beginner', category: 'wearable', coverImageKey: 'granny-stripe-scarf', estimatedMinutes: 135 },
  'ribbed-washcloth': { difficulty: 'beginner', category: 'home', coverImageKey: 'ribbed-washcloth', estimatedMinutes: 40 },
  'basic-amigurumi-ball': { difficulty: 'beginner', category: 'toy', coverImageKey: 'basic-amigurumi-ball', estimatedMinutes: 55 },
  'ribbed-headband': { difficulty: 'beginner', category: 'wearable', coverImageKey: 'ribbed-headband', estimatedMinutes: 65 },
  'simple-drawstring-pouch': { difficulty: 'beginner', category: 'gift', coverImageKey: 'simple-drawstring-pouch', estimatedMinutes: 80 },
  'granny-square-tote': { difficulty: 'intermediate', category: 'wearable', coverImageKey: 'granny-square-tote', estimatedMinutes: 150 },
  'mesh-market-bag': { difficulty: 'beginner', category: 'wearable', coverImageKey: 'mesh-market-bag', estimatedMinutes: 90 },
  'basic-baby-blanket': { difficulty: 'beginner', category: 'home', coverImageKey: 'basic-baby-blanket', estimatedMinutes: 180 },
  'amigurumi-whale': { difficulty: 'intermediate', category: 'toy', coverImageKey: 'amigurumi-whale', estimatedMinutes: 75 },
  'granny-square-bag': { difficulty: 'intermediate', category: 'wearable', coverImageKey: 'granny-square-bag', estimatedMinutes: 120 },
  'striped-placemat': { difficulty: 'beginner', category: 'home', coverImageKey: 'striped-placemat', estimatedMinutes: 60 },
  'mini-cactus': { difficulty: 'beginner', category: 'toy', coverImageKey: 'mini-cactus', estimatedMinutes: 45 },
  'ear-warmer': { difficulty: 'beginner', category: 'wearable', coverImageKey: 'ear-warmer', estimatedMinutes: 40 },
  'keychain-wristlet': { difficulty: 'beginner', category: 'gift', coverImageKey: 'keychain-wristlet', estimatedMinutes: 15 },
  'phone-pouch': { difficulty: 'beginner', category: 'wearable', coverImageKey: 'phone-pouch', estimatedMinutes: 35 },
  'bobble-stitch-coaster': { difficulty: 'beginner', category: 'home', coverImageKey: 'bobble-stitch-coaster', estimatedMinutes: 30 },
  'mini-pumpkin': { difficulty: 'beginner', category: 'toy', coverImageKey: 'mini-pumpkin', estimatedMinutes: 40 },
  'chunky-infinity-scarf': { difficulty: 'beginner', category: 'wearable', coverImageKey: 'chunky-infinity-scarf', estimatedMinutes: 90 },
  'crochet-headband': { difficulty: 'beginner', category: 'wearable', coverImageKey: 'crochet-headband', estimatedMinutes: 30 },
  'hexagon-motif-blanket': { difficulty: 'intermediate', category: 'home', coverImageKey: 'hexagon-motif-blanket', estimatedMinutes: 240 },
  'simple-cup-cozy': { difficulty: 'beginner', category: 'home', coverImageKey: 'simple-cup-cozy', estimatedMinutes: 25 },
  'star-applique': { difficulty: 'beginner', category: 'gift', coverImageKey: 'star-applique', estimatedMinutes: 20 },
  'chevron-washcloth': { difficulty: 'beginner', category: 'home', coverImageKey: 'chevron-washcloth', estimatedMinutes: 45 },
  'envelope-pouch': { difficulty: 'beginner', category: 'gift', coverImageKey: 'envelope-pouch', estimatedMinutes: 50 },
  'bucket-hat': { difficulty: 'beginner', category: 'wearable', coverImageKey: 'easy-ribbed-beanie', estimatedMinutes: 105 },
  'crochet-bunny': { difficulty: 'intermediate', category: 'toy', coverImageKey: 'amigurumi-whale', estimatedMinutes: 120 },
  'shell-stitch-scarf': { difficulty: 'beginner', category: 'wearable', coverImageKey: 'granny-stripe-scarf', estimatedMinutes: 150 },
  'simple-market-bag': { difficulty: 'beginner', category: 'wearable', coverImageKey: 'mesh-market-bag', estimatedMinutes: 95 },
  'tunisian-potholder': { difficulty: 'intermediate', category: 'home', coverImageKey: 'ribbed-washcloth', estimatedMinutes: 70 },
  'crochet-mouse': { difficulty: 'beginner', category: 'toy', coverImageKey: 'basic-amigurumi-ball', estimatedMinutes: 80 },
  'flower-granny-square': { difficulty: 'beginner', category: 'motif', coverImageKey: 'basic-granny-square', estimatedMinutes: 35 },
  'simple-beanie': { difficulty: 'beginner', category: 'wearable', coverImageKey: 'easy-ribbed-beanie', estimatedMinutes: 90 },
  'wave-stitch-blanket': { difficulty: 'intermediate', category: 'home', coverImageKey: 'basic-baby-blanket', estimatedMinutes: 240 },
  'mesh-beach-bag': { difficulty: 'beginner', category: 'wearable', coverImageKey: 'mesh-market-bag', estimatedMinutes: 105 },
  'simple-crochet-vest': { difficulty: 'intermediate', category: 'wearable', coverImageKey: 'simple-crochet-vest', estimatedMinutes: 180 },
  'baby-booties': { difficulty: 'beginner', category: 'wearable', coverImageKey: 'baby-booties', estimatedMinutes: 70 },
  'bandana-headscarf': { difficulty: 'beginner', category: 'wearable', coverImageKey: 'bandana-headscarf', estimatedMinutes: 75 },
  'crochet-laptop-sleeve': { difficulty: 'beginner', category: 'gift', coverImageKey: 'crochet-laptop-sleeve', estimatedMinutes: 150 },
  'water-bottle-holder': { difficulty: 'beginner', category: 'wearable', coverImageKey: 'water-bottle-holder', estimatedMinutes: 60 },
  'glasses-case': { difficulty: 'beginner', category: 'gift', coverImageKey: 'glasses-case', estimatedMinutes: 45 },
};

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, 'utf-8'));
}

const patternVideoIds = existsSync(PATTERN_VIDEOS_PATH) ? readJson(PATTERN_VIDEOS_PATH) : {};
const lessonVideoUrls = existsSync(LESSON_VIDEOS_PATH) ? readJson(LESSON_VIDEOS_PATH) : {};

async function seedLessons() {
  console.log('Seeding lessons...');

  const enContentMap = {};
  const localizedLessonContent = new Map();

  for (const locale of LOCALES) {
    const dir = join(CONTENT_DIR, 'lessons', locale);
    if (!existsSync(dir)) continue;

    const files = readdirSync(dir).filter((f) => f.endsWith('.json'));
    for (const file of files) {
      const slug = file.replace('.json', '');
      const content = readJson(join(dir, file));
      if (locale === 'en') enContentMap[slug] = content;
      localizedLessonContent.set(`${locale}:${slug}`, content);
    }
  }

  for (const [slug, content] of Object.entries(enContentMap)) {
    const meta = lessonMetadata[slug];
    if (!meta) {
      console.warn(`  Skipping unknown lesson slug: ${slug}`);
      continue;
    }

    const { error } = await supabase.from('lessons').upsert(
      {
        slug,
        title: content.title,
        description: content.description ?? null,
        sort_order: meta.sortOrder,
        difficulty: meta.difficulty,
        video_url: lessonVideoUrls[slug] ?? null,
        content: content.content ?? {},
        is_published: true,
      },
      { onConflict: 'slug' },
    );

    if (error) {
      console.error(`  Error upserting lesson ${slug}:`, error.message);
    } else {
      console.log(`  OK lesson: ${slug}`);
    }
  }

  const { data: lessonRows, error: fetchErr } = await supabase
    .from('lessons')
    .select('id, slug');

  if (fetchErr) {
    console.error('  Error fetching lesson IDs:', fetchErr.message);
    return;
  }

  const idBySlug = new Map(lessonRows.map((l) => [l.slug, l.id]));

  for (const locale of LOCALES) {
    if (locale === 'en') continue;
    for (const slug of Object.keys(enContentMap)) {
      const lessonId = idBySlug.get(slug);
      if (!lessonId) continue;
      const content =
        localizedLessonContent.get(`${locale}:${slug}`) ??
        enContentMap[slug];

      const { error } = await supabase.from('lesson_translations').upsert(
        {
          lesson_id: lessonId,
          locale,
          title: content.title,
          description: content.description ?? null,
          content_json: content.content ?? {},
        },
        { onConflict: 'lesson_id, locale' },
      );

      if (error) {
        console.error(`  Error upserting lesson translation ${slug}/${locale}:`, error.message);
      } else {
        console.log(`  OK lesson translation: ${slug}/${locale}`);
      }
    }
  }
}

async function seedPatterns() {
  console.log('Seeding patterns...');

  const enContentMap = {};
  const localizedPatternContent = new Map();

  for (const locale of LOCALES) {
    const dir = join(CONTENT_DIR, 'patterns', locale);
    if (!existsSync(dir)) continue;

    const files = readdirSync(dir).filter((f) => f.endsWith('.json'));
    for (const file of files) {
      const slug = file.replace('.json', '');
      const content = readJson(join(dir, file));
      if (locale === 'en') enContentMap[slug] = content;
      localizedPatternContent.set(`${locale}:${slug}`, content);
    }
  }

  for (const [slug, content] of Object.entries(enContentMap)) {
    const meta = patternMetadata[slug];
    if (!meta) {
      console.warn(`  Skipping unknown pattern slug: ${slug}`);
      continue;
    }

    const { error } = await supabase.from('patterns').upsert(
      {
        slug,
        title: content.title,
        description: content.description ?? null,
        difficulty: meta.difficulty,
        category: meta.category,
        cover_image_key: meta.coverImageKey,
        youtube_video_id: patternVideoIds[slug] ?? null,
        estimated_minutes: meta.estimatedMinutes,
        materials_text: content.materials?.join(', ') ?? null,
        skills_text: content.skills?.join(', ') ?? null,
        expectation_text: content.expectationText ?? null,
        steps_json: content.steps ?? [],
        is_published: true,
      },
      { onConflict: 'slug' },
    );

    if (error) {
      console.error(`  Error upserting pattern ${slug}:`, error.message);
    } else {
      console.log(`  OK pattern: ${slug}`);
    }
  }

  const { data: patternRows, error: fetchErr } = await supabase
    .from('patterns')
    .select('id, slug');

  if (fetchErr) {
    console.error('  Error fetching pattern IDs:', fetchErr.message);
    return;
  }

  const idBySlug = new Map(patternRows.map((p) => [p.slug, p.id]));

  for (const locale of LOCALES) {
    if (locale === 'en') continue;
    for (const slug of Object.keys(enContentMap)) {
      const patternId = idBySlug.get(slug);
      if (!patternId) continue;
      const content =
        localizedPatternContent.get(`${locale}:${slug}`) ??
        enContentMap[slug];

      const { error } = await supabase
        .from('pattern_translations')
        .upsert(
          {
            pattern_id: patternId,
            locale,
            title: content.title,
            description: content.description ?? null,
            materials_json: content.materials ?? [],
            skills_json: content.skills ?? [],
            expectation_text: content.expectationText ?? null,
            steps_json: content.steps ?? [],
          },
          { onConflict: 'pattern_id, locale' },
        );

      if (error) {
        console.error(`  Error upserting pattern translation ${slug}/${locale}:`, error.message);
      } else {
        console.log(`  OK pattern translation: ${slug}/${locale}`);
      }
    }
  }
}

async function main() {
  console.log('Starting Supabase seed...\n');
  await seedLessons();
  console.log();
  await seedPatterns();
  console.log('\nDone.');
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
