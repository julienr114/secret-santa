CREATE TABLE `gift_claims` (
	`id` text PRIMARY KEY NOT NULL,
	`list_id` text NOT NULL,
	`idea_id` text NOT NULL,
	`account_id` text NOT NULL,
	`mode` text NOT NULL,
	`anonymous` integer DEFAULT false NOT NULL,
	`note` text,
	`closed` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`list_id`) REFERENCES `gift_lists`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`idea_id`) REFERENCES `gift_list_ideas`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `gift_claims_idea_account_idx` ON `gift_claims` (`idea_id`,`account_id`);--> statement-breakpoint
CREATE INDEX `gift_claims_list_idx` ON `gift_claims` (`list_id`);--> statement-breakpoint
CREATE TABLE `gift_list_visits` (
	`list_id` text NOT NULL,
	`account_id` text NOT NULL,
	`last_seen_at` text NOT NULL,
	FOREIGN KEY (`list_id`) REFERENCES `gift_lists`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `gift_list_visits_list_account_idx` ON `gift_list_visits` (`list_id`,`account_id`);--> statement-breakpoint
CREATE INDEX `gift_list_visits_account_idx` ON `gift_list_visits` (`account_id`);--> statement-breakpoint
CREATE TABLE `gift_off_list` (
	`id` text PRIMARY KEY NOT NULL,
	`list_id` text NOT NULL,
	`list_person_id` text NOT NULL,
	`account_id` text NOT NULL,
	`text` text NOT NULL,
	`anonymous` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`list_id`) REFERENCES `gift_lists`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`list_person_id`) REFERENCES `gift_list_people`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `gift_off_list_list_idx` ON `gift_off_list` (`list_id`);