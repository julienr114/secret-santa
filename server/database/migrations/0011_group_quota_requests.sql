CREATE TABLE `group_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`message` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` text NOT NULL,
	`decided_at` text,
	`decided_by` text,
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`decided_by`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `group_requests_account_idx` ON `group_requests` (`account_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `group_requests_status_idx` ON `group_requests` (`status`);--> statement-breakpoint
ALTER TABLE `groups` ADD `created_by` text;