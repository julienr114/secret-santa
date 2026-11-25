-- Ticket 124 (README 22.22, « Les notifications du téléphone »): the
-- phones that asked for notifications, and when a news went to them.
CREATE TABLE `push_subscriptions` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`endpoint` text NOT NULL,
	`p256dh` text NOT NULL,
	`auth` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `push_subscriptions_endpoint_unique` ON `push_subscriptions` (`endpoint`);--> statement-breakpoint
CREATE INDEX `push_subscriptions_account_idx` ON `push_subscriptions` (`account_id`);--> statement-breakpoint
ALTER TABLE `news` ADD `pushed_at` text;--> statement-breakpoint
-- The news of before never go to a phone.
UPDATE `news` SET `pushed_at` = strftime('%Y-%m-%dT%H:%M:%fZ', 'now');
