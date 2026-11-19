CREATE TABLE `gift_list_holders` (
	`id` text PRIMARY KEY NOT NULL,
	`list_id` text NOT NULL,
	`account_id` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`list_id`) REFERENCES `gift_lists`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `gift_list_holders_list_account_idx` ON `gift_list_holders` (`list_id`,`account_id`);--> statement-breakpoint
CREATE INDEX `gift_list_holders_account_idx` ON `gift_list_holders` (`account_id`);--> statement-breakpoint
CREATE TABLE `gift_list_invites` (
	`id` text PRIMARY KEY NOT NULL,
	`list_id` text NOT NULL,
	`email` text NOT NULL,
	`invited_by` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`list_id`) REFERENCES `gift_lists`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`invited_by`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `gift_list_invites_list_email_idx` ON `gift_list_invites` (`list_id`,`email`);--> statement-breakpoint
CREATE INDEX `gift_list_invites_email_idx` ON `gift_list_invites` (`email`);--> statement-breakpoint
ALTER TABLE `family_members` ADD `email` text;--> statement-breakpoint
ALTER TABLE `family_members` ADD `linked_account_id` text REFERENCES accounts(id);--> statement-breakpoint
CREATE INDEX `family_members_linked_idx` ON `family_members` (`linked_account_id`);--> statement-breakpoint
CREATE INDEX `family_members_email_idx` ON `family_members` (`email`);--> statement-breakpoint
-- Whoever created a list holds it, like the others to come.
INSERT INTO `gift_list_holders` (`id`, `list_id`, `account_id`, `created_at`)
SELECT lower(hex(randomblob(16))), `id`, `account_id`, `created_at` FROM `gift_lists`;
