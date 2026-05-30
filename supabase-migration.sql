-- Run this in the Supabase SQL Editor to set up the content tables and storage.
-- This mirrors the local SQLite schema for fetching patterns, lessons, and translations.
--
-- STORAGE SETUP (for pattern cover images):
--   1. In Supabase Dashboard > Storage, create a PUBLIC bucket named "pattern-images"
--   2. Upload all pattern PNGs to that bucket (e.g. minimalist-coaster.png)
--   3. The app builds URLs as:
--      {SUPABASE_URL}/storage/v1/object/public/pattern-images/{cover_image_key}.png

-- Patterns (base table, English is the default content)
CREATE TABLE IF NOT EXISTS patterns (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  difficulty TEXT NOT NULL DEFAULT 'beginner',
  category TEXT,
  cover_image_key TEXT NOT NULL,
  estimated_minutes INTEGER,
  materials_text TEXT,
  skills_text TEXT,
  expectation_text TEXT,
  steps_json JSONB NOT NULL DEFAULT '[]',
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Pattern translations (one row per pattern per locale)
CREATE TABLE IF NOT EXISTS pattern_translations (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  pattern_id BIGINT NOT NULL REFERENCES patterns(id) ON DELETE CASCADE,
  locale TEXT NOT NULL CHECK (locale IN ('en', 'de', 'fr', 'es', 'nl')),
  title TEXT NOT NULL,
  description TEXT,
  materials_json JSONB,
  skills_json JSONB,
  expectation_text TEXT,
  steps_json JSONB NOT NULL DEFAULT '[]',
  UNIQUE (pattern_id, locale)
);

-- Lessons (base table)
CREATE TABLE IF NOT EXISTS lessons (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL,
  difficulty TEXT NOT NULL DEFAULT 'beginner',
  content JSONB,
  video_url TEXT,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Lesson translations
CREATE TABLE IF NOT EXISTS lesson_translations (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  lesson_id BIGINT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  locale TEXT NOT NULL CHECK (locale IN ('en', 'de', 'fr', 'es', 'nl')),
  title TEXT NOT NULL,
  description TEXT,
  content_json JSONB NOT NULL DEFAULT '{}',
  UNIQUE (lesson_id, locale)
);

-- Enable RLS but allow public read (no auth needed for content)
ALTER TABLE patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE pattern_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_translations ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Allow public read on patterns"
  ON patterns FOR SELECT USING (is_published = TRUE);

CREATE POLICY "Allow public read on pattern_translations"
  ON pattern_translations FOR SELECT USING (TRUE);

CREATE POLICY "Allow public read on lessons"
  ON lessons FOR SELECT USING (is_published = TRUE);

CREATE POLICY "Allow public read on lesson_translations"
  ON lesson_translations FOR SELECT USING (TRUE);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_patterns_slug ON patterns(slug);
CREATE INDEX IF NOT EXISTS idx_patterns_category ON patterns(category);
CREATE INDEX IF NOT EXISTS idx_patterns_difficulty ON patterns(difficulty);
CREATE INDEX IF NOT EXISTS idx_pattern_translations_pattern ON pattern_translations(pattern_id);
CREATE INDEX IF NOT EXISTS idx_pattern_translations_locale ON pattern_translations(pattern_id, locale);
CREATE INDEX IF NOT EXISTS idx_lessons_slug ON lessons(slug);
CREATE INDEX IF NOT EXISTS idx_lessons_sort_order ON lessons(sort_order);
CREATE INDEX IF NOT EXISTS idx_lesson_translations_lesson ON lesson_translations(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_translations_locale ON lesson_translations(lesson_id, locale);
