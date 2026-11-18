CREATE TABLE `family_members` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`first_name` text NOT NULL,
	`avatar_emoji` text NOT NULL,
	`avatar_color` text NOT NULL,
	`birth_date` text,
	`clothing_size` text,
	`shoe_size` text,
	`answers` text,
	`texts` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `family_members_account_idx` ON `family_members` (`account_id`);--> statement-breakpoint
CREATE TABLE `gift_list_ideas` (
	`id` text PRIMARY KEY NOT NULL,
	`list_id` text NOT NULL,
	`list_person_id` text NOT NULL,
	`text` text NOT NULL,
	`url` text,
	`position` integer NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`list_id`) REFERENCES `gift_lists`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`list_person_id`) REFERENCES `gift_list_people`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `gift_list_ideas_list_idx` ON `gift_list_ideas` (`list_id`);--> statement-breakpoint
CREATE TABLE `gift_list_people` (
	`id` text PRIMARY KEY NOT NULL,
	`list_id` text NOT NULL,
	`member_id` text NOT NULL,
	`position` integer NOT NULL,
	FOREIGN KEY (`list_id`) REFERENCES `gift_lists`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`member_id`) REFERENCES `family_members`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `gift_list_people_list_member_idx` ON `gift_list_people` (`list_id`,`member_id`);--> statement-breakpoint
CREATE TABLE `gift_lists` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`icon_emoji` text NOT NULL,
	`icon_color` text NOT NULL,
	`title` text DEFAULT '' NOT NULL,
	`event_date` text,
	`note` text,
	`note_edited` integer DEFAULT false NOT NULL,
	`share_token` text,
	`shared_at` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `gift_lists_share_token_unique` ON `gift_lists` (`share_token`);--> statement-breakpoint
CREATE INDEX `gift_lists_account_idx` ON `gift_lists` (`account_id`);