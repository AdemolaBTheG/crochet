import {
  patternFolderItems,
  patternFolders,
  type NewPatternFolder,
  type PatternFolder,
} from '@/db/schema';
import { and, desc, eq } from 'drizzle-orm';
import type { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import * as schema from '@/db/schema';

type AppDb = ExpoSQLiteDatabase<typeof schema>;

export type PatternFolderWithCount = PatternFolder & {
  patternCount: number;
};

export type CreatePatternFolderInput = {
  name: string;
  icon: string;
  color: string;
};

async function attachPatternCounts(
  db: AppDb,
  folders: PatternFolder[],
): Promise<PatternFolderWithCount[]> {
  if (folders.length === 0) return [];

  const items = await db.select().from(patternFolderItems);
  const counts = items.reduce<Record<number, number>>((acc, item) => {
    acc[item.folderId] = (acc[item.folderId] ?? 0) + 1;
    return acc;
  }, {});

  return folders.map((folder) => ({
    ...folder,
    patternCount: counts[folder.id] ?? 0,
  }));
}

export async function getPatternFolders(db: AppDb): Promise<PatternFolderWithCount[]> {
  const folders = await db
    .select()
    .from(patternFolders)
    .orderBy(desc(patternFolders.updatedAt), patternFolders.sortOrder);

  return attachPatternCounts(db, folders);
}

export async function getRecentPatternFolders(
  db: AppDb,
  limit = 5,
): Promise<PatternFolderWithCount[]> {
  const folders = await db
    .select()
    .from(patternFolders)
    .orderBy(desc(patternFolders.updatedAt), patternFolders.sortOrder)
    .limit(limit);

  return attachPatternCounts(db, folders);
}

export async function getPatternFolderById(
  db: AppDb,
  id: number,
): Promise<PatternFolderWithCount | null> {
  const [folder] = await db
    .select()
    .from(patternFolders)
    .where(eq(patternFolders.id, id))
    .limit(1);

  if (!folder) return null;

  const [withCount] = await attachPatternCounts(db, [folder]);
  return withCount ?? null;
}

export async function getPatternIdsForFolder(
  db: AppDb,
  folderId: number,
): Promise<number[]> {
  const items = await db
    .select({ patternId: patternFolderItems.patternId })
    .from(patternFolderItems)
    .where(eq(patternFolderItems.folderId, folderId));

  return items.map((item) => item.patternId);
}

export async function createPatternFolder(
  db: AppDb,
  input: CreatePatternFolderInput,
): Promise<PatternFolder> {
  const now = new Date();
  const values: NewPatternFolder = {
    name: input.name.trim(),
    icon: input.icon,
    color: input.color,
    createdAt: now,
    updatedAt: now,
  };

  const [folder] = await db.insert(patternFolders).values(values).returning();
  if (!folder) {
    throw new Error('Failed to create folder');
  }

  return folder;
}

export async function addPatternToFolder(
  db: AppDb,
  folderId: number,
  patternId: number,
): Promise<void> {
  await db
    .insert(patternFolderItems)
    .values({
      folderId,
      patternId,
      createdAt: new Date(),
    })
    .onConflictDoNothing();

  await db
    .update(patternFolders)
    .set({ updatedAt: new Date() })
    .where(eq(patternFolders.id, folderId));
}

export async function removePatternFromFolder(
  db: AppDb,
  folderId: number,
  patternId: number,
): Promise<void> {
  await db
    .delete(patternFolderItems)
    .where(
      and(
        eq(patternFolderItems.folderId, folderId),
        eq(patternFolderItems.patternId, patternId),
      ),
    );

  await db
    .update(patternFolders)
    .set({ updatedAt: new Date() })
    .where(eq(patternFolders.id, folderId));
}
