ALTER TABLE `editions` ADD `guess_auto_reminder` integer DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `editions` ADD `guess_auto_reminder_sent_at` text;--> statement-breakpoint
ALTER TABLE `editions` ADD `guess_enabled_at` text;--> statement-breakpoint
ALTER TABLE `editions` ADD `guess_point_sent_at` text;--> statement-breakpoint
ALTER TABLE `editions` ADD `guess_end_sent_at` text;--> statement-breakpoint
ALTER TABLE `group_members` ADD `guess_news` integer DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `participations` ADD `guess_skipped_at` text;