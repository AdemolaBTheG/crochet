import * as schema from "@/db/schema";
import { seedDatabase } from "@/db/seed";
import migrations from "@/drizzle/migrations.js";
import type { ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { migrate } from "drizzle-orm/expo-sqlite/migrator";
import { openDatabaseSync } from "expo-sqlite";
import { create } from "zustand";

type ExpoDatabase = ReturnType<typeof openDatabaseSync>;

function ensurePatternContentColumns(expoDb: ExpoDatabase) {
    const columns = expoDb.getAllSync<{ name: string }>("PRAGMA table_info(patterns)");
    const columnNames = new Set(columns.map((column) => column.name));

    if (!columnNames.has("skills_text")) {
        expoDb.execSync("ALTER TABLE `patterns` ADD `skills_text` text;");
    }

    if (!columnNames.has("expectation_text")) {
        expoDb.execSync("ALTER TABLE `patterns` ADD `expectation_text` text;");
    }
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
            name = "mirusiu.db",
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
            await migrate(db, migrations);
            ensurePatternContentColumns(expoDb);
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
            await migrate(newDb, migrations);
            ensurePatternContentColumns(newExpoDb);
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
