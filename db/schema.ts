import { InferInsertModel, InferSelectModel, sql } from "drizzle-orm";
import {
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

const now = sql`(unixepoch() * 1000)`;

export const userProfile = sqliteTable("user_profile", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  skillLevel: text("skill_level"),
  goal: text("goal"),
  handedness: text("handedness"),
  onboardingCompleted: integer("onboarding_completed", { mode: "boolean" })
    .notNull()
    .default(false),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(now),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .default(now),
});

export const lessons = sqliteTable(
  "lessons",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    sortOrder: integer("sort_order").notNull(),
    difficulty: text("difficulty").notNull(),
    content: text("content"),
    videoUrl: text("video_url"),
    isPublished: integer("is_published", { mode: "boolean" })
      .notNull()
      .default(true),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(now),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .default(now),
  },
  (table) => [
    uniqueIndex("lessons_slug_unique").on(table.slug),
    index("lessons_sort_order_idx").on(table.sortOrder),
  ]
);

export const patterns = sqliteTable(
  "patterns",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    difficulty: text("difficulty").notNull(),
    category: text("category"),
    coverImageKey: text("cover_image_key").notNull(),
    estimatedMinutes: integer("estimated_minutes"),
    materialsText: text("materials_text"),
    skillsText: text("skills_text"),
    expectationText: text("expectation_text"),
    stepsJson: text("steps_json").notNull(),
    isPublished: integer("is_published", { mode: "boolean" })
      .notNull()
      .default(true),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(now),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .default(now),
  },
  (table) => [
    uniqueIndex("patterns_slug_unique").on(table.slug),
    index("patterns_category_idx").on(table.category),
    index("patterns_difficulty_idx").on(table.difficulty),
  ]
);

export const projects = sqliteTable(
  "projects",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    patternId: integer("pattern_id")
      .notNull()
      .references(() => patterns.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    status: text("status").notNull().default("active"),
    currentStepIndex: integer("current_step_index").notNull().default(0),
    rowCount: integer("row_count").notNull().default(0),
    roundCount: integer("round_count").notNull().default(0),
    notes: text("notes"),
    startedAt: integer("started_at", { mode: "timestamp_ms" })
      .notNull()
      .default(now),
    completedAt: integer("completed_at", { mode: "timestamp_ms" }),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .default(now),
  },
  (table) => [
    index("projects_pattern_id_idx").on(table.patternId),
    index("projects_status_idx").on(table.status),
    index("projects_updated_at_idx").on(table.updatedAt),
  ]
);

export type UserProfile = InferSelectModel<typeof userProfile>;
export type NewUserProfile = InferInsertModel<typeof userProfile>;

export type Lesson = InferSelectModel<typeof lessons>;
export type NewLesson = InferInsertModel<typeof lessons>;

export type Pattern = InferSelectModel<typeof patterns>;
export type NewPattern = InferInsertModel<typeof patterns>;

export type Project = InferSelectModel<typeof projects>;
export type NewProject = InferInsertModel<typeof projects>;
