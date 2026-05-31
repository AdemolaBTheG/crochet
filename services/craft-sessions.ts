import { craftSessions, type CraftSession } from '@/db/schema';
import type * as schema from '@/db/schema';
import { and, eq, isNull } from 'drizzle-orm';
import type { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';

type Database = ExpoSQLiteDatabase<typeof schema>;

export async function startCraftSession(
  db: Database,
  projectId: number,
  source: string = 'project',
) {
  await endOpenCraftSessions(db);

  const created = await db
    .insert(craftSessions)
    .values({
      projectId,
      source,
      startedAt: new Date(),
    })
    .returning();

  return created[0]?.id ?? null;
}

export async function endCraftSession(db: Database, sessionId: number, endedAt: Date = new Date()) {
  const rows = await db.select().from(craftSessions).where(eq(craftSessions.id, sessionId)).limit(1);
  const session = rows[0];

  if (!session || session.endedAt) return;

  const durationSeconds = Math.max(
    0,
    Math.floor((endedAt.getTime() - session.startedAt.getTime()) / 1000),
  );

  await db
    .update(craftSessions)
    .set({
      endedAt,
      durationSeconds,
    })
    .where(eq(craftSessions.id, sessionId));
}

export async function endOpenCraftSessions(db: Database, endedAt: Date = new Date()) {
  const openSessions = await db.select().from(craftSessions).where(isNull(craftSessions.endedAt));

  await Promise.all(
    openSessions.map((session) => endCraftSession(db, session.id, endedAt)),
  );
}

export async function getTodayCraftSeconds(db: Database, now: Date = new Date()) {
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const rows = await db.select().from(craftSessions);

  return rows.reduce((total, session) => {
    const sessionStartedAt = session.startedAt;
    if (!(sessionStartedAt instanceof Date)) return total;
    if (sessionStartedAt < startOfDay) return total;

    if (session.endedAt instanceof Date) {
      return total + session.durationSeconds;
    }

    return total + Math.max(0, Math.floor((now.getTime() - sessionStartedAt.getTime()) / 1000));
  }, 0);
}

export async function getActiveCraftSessionForProject(db: Database, projectId: number) {
  const rows = await db
    .select()
    .from(craftSessions)
    .where(and(eq(craftSessions.projectId, projectId), isNull(craftSessions.endedAt)))
    .limit(1);

  return rows[0] ?? null;
}

export function getSessionMinutes(session: CraftSession) {
  return Math.floor(session.durationSeconds / 60);
}
