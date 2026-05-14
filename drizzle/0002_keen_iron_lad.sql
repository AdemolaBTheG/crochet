CREATE TABLE `lesson_translations` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `lesson_id` integer NOT NULL REFERENCES `lessons`(`id`) ON DELETE CASCADE,
  `locale` text NOT NULL,
  `title` text NOT NULL,
  `description` text,
  `content_json` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `lesson_translations_lesson_locale_unique` ON `lesson_translations` (`lesson_id`, `locale`);
--> statement-breakpoint
CREATE INDEX `lesson_translations_lesson_id_idx` ON `lesson_translations` (`lesson_id`);
--> statement-breakpoint
CREATE TABLE `pattern_translations` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `pattern_id` integer NOT NULL REFERENCES `patterns`(`id`) ON DELETE CASCADE,
  `locale` text NOT NULL,
  `title` text NOT NULL,
  `description` text,
  `materials_json` text,
  `skills_json` text,
  `expectation_text` text,
  `steps_json` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `pattern_translations_pattern_locale_unique` ON `pattern_translations` (`pattern_id`, `locale`);
--> statement-breakpoint
CREATE INDEX `pattern_translations_pattern_id_idx` ON `pattern_translations` (`pattern_id`);
