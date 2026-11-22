CREATE TABLE `gift_giver_claims` (
	`id` text PRIMARY KEY NOT NULL,
	`list_id` text NOT NULL,
	`idea_id` text NOT NULL,
	`giver_id` text NOT NULL,
	`mode` text NOT NULL,
	`note` text,
	`closed` integer DEFAULT false NOT NULL,
	`noted_by` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`list_id`) REFERENCES `gift_lists`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`idea_id`) REFERENCES `gift_list_ideas`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`giver_id`) REFERENCES `gift_list_givers`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`noted_by`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `gift_giver_claims_idea_giver_idx` ON `gift_giver_claims` (`idea_id`,`giver_id`);--> statement-breakpoint
CREATE INDEX `gift_giver_claims_list_idx` ON `gift_giver_claims` (`list_id`);--> statement-breakpoint
CREATE TABLE `gift_list_givers` (
	`id` text PRIMARY KEY NOT NULL,
	`list_id` text NOT NULL,
	`name` text NOT NULL,
	`email` text,
	`added_by` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`list_id`) REFERENCES `gift_lists`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`added_by`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `gift_list_givers_list_idx` ON `gift_list_givers` (`list_id`);--> statement-breakpoint
CREATE INDEX `gift_list_givers_email_idx` ON `gift_list_givers` (`email`);--> statement-breakpoint
ALTER TABLE `gift_claims` ADD `noted_by` text REFERENCES accounts(id);--> statement-breakpoint
ALTER TABLE `gift_claims` ADD `giver_name` text;