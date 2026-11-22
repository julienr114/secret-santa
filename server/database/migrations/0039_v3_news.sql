CREATE TABLE `news` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`kind` text NOT NULL,
	`level` text NOT NULL,
	`target_type` text NOT NULL,
	`target_id` text NOT NULL,
	`party_id` text,
	`name` text,
	`detail` text,
	`count` integer DEFAULT 1 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`seen_at` text,
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `news_account_idx` ON `news` (`account_id`,`seen_at`);--> statement-breakpoint
CREATE INDEX `news_target_idx` ON `news` (`target_type`,`target_id`);--> statement-breakpoint
CREATE TABLE `note_dismissals` (
	`account_id` text NOT NULL,
	`note_id` text NOT NULL,
	`dismissed_at` text NOT NULL,
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `note_dismissals_pair_idx` ON `note_dismissals` (`account_id`,`note_id`);