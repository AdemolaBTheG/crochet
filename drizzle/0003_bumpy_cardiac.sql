CREATE TABLE IF NOT EXISTS `craft_sessions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` integer,
	`source` text DEFAULT 'project' NOT NULL,
	`started_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`ended_at` integer,
	`duration_seconds` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `craft_sessions_project_id_idx` ON `craft_sessions` (`project_id`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `craft_sessions_started_at_idx` ON `craft_sessions` (`started_at`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `craft_sessions_ended_at_idx` ON `craft_sessions` (`ended_at`);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `pattern_folders` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`icon` text DEFAULT 'folder.fill' NOT NULL,
	`color` text DEFAULT '#2F6B5A' NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `pattern_folders_sort_order_idx` ON `pattern_folders` (`sort_order`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `pattern_folders_updated_at_idx` ON `pattern_folders` (`updated_at`);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `pattern_folder_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`folder_id` integer NOT NULL,
	`pattern_id` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`folder_id`) REFERENCES `pattern_folders`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`pattern_id`) REFERENCES `patterns`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `pattern_folder_items_folder_pattern_unique` ON `pattern_folder_items` (`folder_id`,`pattern_id`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `pattern_folder_items_folder_id_idx` ON `pattern_folder_items` (`folder_id`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `pattern_folder_items_pattern_id_idx` ON `pattern_folder_items` (`pattern_id`);
