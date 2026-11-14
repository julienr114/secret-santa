CREATE TABLE `group_members` (
	`group_id` text NOT NULL,
	`account_id` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `group_members_pair_idx` ON `group_members` (`group_id`,`account_id`);--> statement-breakpoint
CREATE INDEX `group_members_account_idx` ON `group_members` (`account_id`);