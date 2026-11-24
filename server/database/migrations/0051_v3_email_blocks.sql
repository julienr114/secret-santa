-- Ticket 130 (README 22.25, « Ne plus recevoir d'emails »): the addresses
-- that receive nothing, by their print, never in clear; the addresses
-- already written to, for the first email; the reports of a send; and
-- the switch that cuts the emails of an event.
CREATE TABLE `email_blocks` (
	`email_print` text PRIMARY KEY NOT NULL,
	`cause` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `email_seen` (
	`email_print` text PRIMARY KEY NOT NULL,
	`first_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `email_reports` (
	`id` text PRIMARY KEY NOT NULL,
	`party_id` text NOT NULL,
	`account_id` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `email_reports_party_idx` ON `email_reports` (`party_id`);--> statement-breakpoint
ALTER TABLE `parties` ADD `emails_off` integer DEFAULT false NOT NULL;
