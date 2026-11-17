-- « Devine qui » (lot 19, README 22.17): the game's settings on the
-- edition, when a participant watched the results, and the guesses.
CREATE TABLE `guesses` (
	`id` text PRIMARY KEY NOT NULL,
	`edition_id` text NOT NULL,
	`guesser_person_id` text NOT NULL,
	`recipient_person_id` text NOT NULL,
	`giver_person_id` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`edition_id`) REFERENCES `editions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`guesser_person_id`) REFERENCES `persons`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`recipient_person_id`) REFERENCES `persons`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`giver_person_id`) REFERENCES `persons`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `guesses_edition_guesser_recipient_idx` ON `guesses` (`edition_id`,`guesser_person_id`,`recipient_person_id`);--> statement-breakpoint
ALTER TABLE `editions` ADD `guess_mode` text DEFAULT 'none' NOT NULL;--> statement-breakpoint
ALTER TABLE `editions` ADD `guess_ends_at` text;--> statement-breakpoint
ALTER TABLE `editions` ADD `guess_time_zone` text;--> statement-breakpoint
ALTER TABLE `editions` ADD `guess_reminder_sent_at` text;--> statement-breakpoint
ALTER TABLE `editions` ADD `guesses_closed_at` text;--> statement-breakpoint
ALTER TABLE `editions` ADD `guess_results_sent_at` text;--> statement-breakpoint
ALTER TABLE `participations` ADD `guess_results_seen_at` text;