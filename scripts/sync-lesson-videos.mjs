import { createClient } from '@supabase/supabase-js';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return;

  const lines = readFileSync(filePath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    if (!line || line.trim().startsWith('#')) continue;
    const index = line.indexOf('=');
    if (index === -1) continue;
    const key = line.slice(0, index).trim();
    const rawValue = line.slice(index + 1).trim();
    if (!key || process.env[key]) continue;
    process.env[key] = rawValue.replace(/^['"]|['"]$/g, '');
  }
}

loadEnvFile(resolve(process.cwd(), '.env'));

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DEFAULT_INPUT = resolve(process.cwd(), 'data/lesson-videos.json');

if (!SUPABASE_URL) {
  console.error('Missing EXPO_PUBLIC_SUPABASE_URL');
  process.exit(1);
}

if (!SERVICE_ROLE_KEY) {
  console.error(
    'Missing SUPABASE_SERVICE_ROLE_KEY\n' +
      'Add it to .env before syncing lesson video URLs to Supabase.',
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

function normalizeYoutubeValue(value) {
  if (!value) return null;
  const trimmed = String(value).trim();
  if (!trimmed) return null;

  const directMatch = trimmed.match(/^[\w-]{11}$/);
  if (directMatch) {
    return `https://www.youtube.com/watch?v=${directMatch[0]}`;
  }

  const urlMatch =
    trimmed.match(/[?&]v=([\w-]{11})/) ??
    trimmed.match(/youtu\.be\/([\w-]{11})/) ??
    trimmed.match(/embed\/([\w-]{11})/);

  if (!urlMatch?.[1]) return trimmed;
  return `https://www.youtube.com/watch?v=${urlMatch[1]}`;
}

async function pushMap(filePath) {
  const inputPath = resolve(process.cwd(), filePath || DEFAULT_INPUT);
  const raw = JSON.parse(readFileSync(inputPath, 'utf8'));
  const entries = Object.entries(raw);

  for (const [slug, value] of entries) {
    const videoUrl = normalizeYoutubeValue(value);
    const { error } = await supabase.from('lessons').update({ video_url: videoUrl }).eq('slug', slug);

    if (error) {
      console.error(`Failed: ${slug} -> ${error.message}`);
      continue;
    }

    console.log(`OK ${slug} -> ${videoUrl}`);
  }
}

async function pullMap(outputPath) {
  const { data, error } = await supabase
    .from('lessons')
    .select('slug,video_url')
    .eq('is_published', true)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error(error.message);
    process.exit(1);
  }

  const payload = Object.fromEntries(
    (data ?? []).filter((row) => row.video_url).map((row) => [row.slug, row.video_url]),
  );

  const json = `${JSON.stringify(payload, null, 2)}\n`;
  const target = outputPath ? resolve(process.cwd(), outputPath) : null;

  if (target) {
    writeFileSync(target, json);
    console.log(`Wrote ${target}`);
    return;
  }

  process.stdout.write(json);
}

const command = process.argv[2] ?? 'push';
const arg = process.argv[3];

if (command === 'push') {
  await pushMap(arg);
} else if (command === 'pull') {
  await pullMap(arg);
} else {
  console.error('Usage: node scripts/sync-lesson-videos.mjs [push|pull] [path]');
  process.exit(1);
}
