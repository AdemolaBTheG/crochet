import * as schema from "@/db/schema";
import { seedDatabase } from "@/db/seed";
import migrations from "@/drizzle/migrations.js";
import type { ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { migrate } from "drizzle-orm/expo-sqlite/migrator";
import { openDatabaseSync } from "expo-sqlite";
import { create } from "zustand";

type ExpoDatabase = ReturnType<typeof openDatabaseSync>;
const LOCAL_DB_NAME = "crova_v2.db";

function tableExists(expoDb: ExpoDatabase, tableName: string) {
    const rows = expoDb.getAllSync<{ name: string }>(
        "SELECT name FROM sqlite_master WHERE type = 'table' AND name = ? LIMIT 1",
        [tableName],
    );
    return rows.length > 0;
}

function getColumnNames(expoDb: ExpoDatabase, tableName: string) {
    if (!tableExists(expoDb, tableName)) return new Set<string>();
    const columns = expoDb.getAllSync<{ name: string }>(`PRAGMA table_info(${tableName})`);
    return new Set(columns.map((column) => column.name));
}

function ensureMigrationState(expoDb: ExpoDatabase) {
    expoDb.execSync(`
        CREATE TABLE IF NOT EXISTS \`__drizzle_migrations\` (
            \`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
            \`hash\` text NOT NULL,
            \`created_at\` numeric
        );
    `);

    const migration0003 = migrations.journal.entries.find((entry) => entry.idx === 3);
    if (!migration0003) return;

    const lastMigration = expoDb.getFirstSync<{ created_at: number }>(
        "SELECT created_at FROM `__drizzle_migrations` ORDER BY created_at DESC LIMIT 1",
    );

    if (lastMigration && Number(lastMigration.created_at) >= migration0003.when) {
        return;
    }

    const hasTables =
        tableExists(expoDb, "craft_sessions")
        && tableExists(expoDb, "lesson_translations")
        && tableExists(expoDb, "pattern_translations")
        && tableExists(expoDb, "pattern_folders")
        && tableExists(expoDb, "pattern_folder_items");

    const patternColumns = getColumnNames(expoDb, "patterns");
    const projectColumns = getColumnNames(expoDb, "projects");

    const hasColumns =
        patternColumns.has("youtube_video_id")
        && patternColumns.has("expectation_text")
        && projectColumns.has("pattern_slug")
        && projectColumns.has("cover_image_key")
        && projectColumns.has("steps_json");

    if (!hasTables || !hasColumns) {
        return;
    }

    expoDb.runSync(
        "INSERT INTO `__drizzle_migrations` (`hash`, `created_at`) VALUES (?, ?)",
        ["", migration0003.when],
    );
}

function ensurePatternContentColumns(expoDb: ExpoDatabase) {
    const columnNames = getColumnNames(expoDb, "patterns");

    if (!columnNames.has("youtube_video_id")) {
        expoDb.execSync("ALTER TABLE `patterns` ADD `youtube_video_id` text;");
    }

    if (!columnNames.has("skills_text")) {
        expoDb.execSync("ALTER TABLE `patterns` ADD `skills_text` text;");
    }

    if (!columnNames.has("expectation_text")) {
        expoDb.execSync("ALTER TABLE `patterns` ADD `expectation_text` text;");
    }
}

function ensureProjectContentColumns(expoDb: ExpoDatabase) {
    const columnNames = getColumnNames(expoDb, "projects");

    if (!columnNames.has("pattern_slug")) {
        expoDb.execSync("ALTER TABLE `projects` ADD `pattern_slug` text;");
    }

    if (!columnNames.has("cover_image_key")) {
        expoDb.execSync("ALTER TABLE `projects` ADD `cover_image_key` text;");
    }

    if (!columnNames.has("steps_json")) {
        expoDb.execSync("ALTER TABLE `projects` ADD `steps_json` text;");
    }
}

function ensureCraftSessionsTable(expoDb: ExpoDatabase) {
    expoDb.execSync(`
        CREATE TABLE IF NOT EXISTS \`craft_sessions\` (
            \`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
            \`project_id\` integer,
            \`source\` text DEFAULT 'project' NOT NULL,
            \`started_at\` integer NOT NULL,
            \`ended_at\` integer,
            \`duration_seconds\` integer DEFAULT 0 NOT NULL,
            FOREIGN KEY (\`project_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE set null
        );
    `);
    expoDb.execSync("CREATE INDEX IF NOT EXISTS `craft_sessions_project_id_idx` ON `craft_sessions` (`project_id`);");
    expoDb.execSync("CREATE INDEX IF NOT EXISTS `craft_sessions_started_at_idx` ON `craft_sessions` (`started_at`);");
    expoDb.execSync("CREATE INDEX IF NOT EXISTS `craft_sessions_ended_at_idx` ON `craft_sessions` (`ended_at`);");
}

function ensurePatternFoldersTables(expoDb: ExpoDatabase) {
    expoDb.execSync(`
        CREATE TABLE IF NOT EXISTS \`pattern_folders\` (
            \`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
            \`name\` text NOT NULL,
            \`icon\` text DEFAULT 'folder.fill' NOT NULL,
            \`color\` text DEFAULT '#2F6B5A' NOT NULL,
            \`sort_order\` integer DEFAULT 0 NOT NULL,
            \`created_at\` integer NOT NULL DEFAULT (unixepoch() * 1000),
            \`updated_at\` integer NOT NULL DEFAULT (unixepoch() * 1000)
        );
    `);
    expoDb.execSync(`
        CREATE TABLE IF NOT EXISTS \`pattern_folder_items\` (
            \`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
            \`folder_id\` integer NOT NULL,
            \`pattern_id\` integer NOT NULL,
            \`created_at\` integer NOT NULL DEFAULT (unixepoch() * 1000),
            FOREIGN KEY (\`folder_id\`) REFERENCES \`pattern_folders\`(\`id\`) ON UPDATE no action ON DELETE cascade,
            FOREIGN KEY (\`pattern_id\`) REFERENCES \`patterns\`(\`id\`) ON UPDATE no action ON DELETE cascade
        );
    `);
    expoDb.execSync("CREATE INDEX IF NOT EXISTS `pattern_folders_sort_order_idx` ON `pattern_folders` (`sort_order`);");
    expoDb.execSync("CREATE INDEX IF NOT EXISTS `pattern_folders_updated_at_idx` ON `pattern_folders` (`updated_at`);");
    expoDb.execSync("CREATE UNIQUE INDEX IF NOT EXISTS `pattern_folder_items_folder_pattern_unique` ON `pattern_folder_items` (`folder_id`, `pattern_id`);");
    expoDb.execSync("CREATE INDEX IF NOT EXISTS `pattern_folder_items_folder_id_idx` ON `pattern_folder_items` (`folder_id`);");
    expoDb.execSync("CREATE INDEX IF NOT EXISTS `pattern_folder_items_pattern_id_idx` ON `pattern_folder_items` (`pattern_id`);");
}

interface DatabaseState {
    expoDb: ExpoDatabase | null;
    db: ExpoSQLiteDatabase<typeof schema> | null;
    isLoading: boolean;

    initializeDb: (options?: {
        name?: string;
        useNewConnection?: boolean;
        enableChangeListener?: boolean;
    }) => Promise<void>;
    setNewDbInstance: (dbName: string) => Promise<void>;

    setExpoDb: (expoDb: ExpoDatabase) => void;
    setDb: (db: ExpoSQLiteDatabase<typeof schema>) => void;
}

export const useDbStore = create<DatabaseState>((set, get) => ({
    expoDb: null,
    db: null,
    isLoading: false,

    initializeDb: async (options = {}) => {
        const {
            name = LOCAL_DB_NAME,
            useNewConnection = false,
            enableChangeListener = true,
        } = options;

        // prevent re-init only if db is a real drizzle client
        const existing = get().db as any;
        if (existing && typeof existing.insert === "function") return;

        set({ isLoading: true });

        try {
            const expoDb = openDatabaseSync(name, {
                useNewConnection,
                enableChangeListener,
            });

            const db = drizzle(expoDb, { schema });
            ensureMigrationState(expoDb);
            await migrate(db, migrations);
            ensurePatternContentColumns(expoDb);
            ensureProjectContentColumns(expoDb);
            ensureCraftSessionsTable(expoDb);
            ensurePatternFoldersTables(expoDb);
            await seedDatabase(db);

            set({ expoDb, db, isLoading: false });
        } catch (e) {
            set({ isLoading: false });
            throw e;
        }
    },

    setNewDbInstance: async (dbName: string) => {
        try {
            const { expoDb } = get();

            await expoDb?.closeAsync();

            set({ expoDb: null, db: null });

            const newExpoDb = openDatabaseSync(dbName, {
                useNewConnection: true,
                enableChangeListener: true,
            });

            if (!newExpoDb) {
                throw new Error("Failed to create new database instance");
            }

            const newDb = drizzle(newExpoDb, { schema });
            ensureMigrationState(newExpoDb);
            await migrate(newDb, migrations);
            ensurePatternContentColumns(newExpoDb);
            ensureProjectContentColumns(newExpoDb);
            ensureCraftSessionsTable(newExpoDb);
            ensurePatternFoldersTables(newExpoDb);
            await seedDatabase(newDb);

            set({ expoDb: newExpoDb, db: newDb });
        } catch (error) {
            console.error("Error setting new database instance", error);
            throw error;
        }
    },

    setExpoDb: (expoDb: ExpoDatabase) => {
        set({ expoDb });
    },

    setDb: (db: ExpoSQLiteDatabase<typeof schema>) => {
        set({ db });
    },
}));
