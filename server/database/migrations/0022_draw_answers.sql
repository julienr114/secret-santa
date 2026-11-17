-- A draw already made elsewhere (lot 17, README 22.12): the mode of the
-- edition, and who each participant says they give to, encrypted.
CREATE TABLE `draw_answers` (
	`participation_id` text PRIMARY KEY NOT NULL,
	`edition_id` text NOT NULL,
	`receiver_enc` text NOT NULL,
	`receiver_iv` text NOT NULL,
	`answered_at` text NOT NULL,
	FOREIGN KEY (`participation_id`) REFERENCES `participations`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`edition_id`) REFERENCES `editions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `draw_answers_edition_idx` ON `draw_answers` (`edition_id`);--> statement-breakpoint
ALTER TABLE `editions` ADD `draw_mode` text DEFAULT 'app' NOT NULL;