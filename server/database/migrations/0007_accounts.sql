CREATE TABLE `accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`is_super_admin` integer DEFAULT false NOT NULL,
	`group_quota` integer DEFAULT 0 NOT NULL,
	`language` text DEFAULT 'fr' NOT NULL,
	`created_at` text NOT NULL,
	`last_login_at` text,
	`disabled_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `accounts_email_unique` ON `accounts` (`email`);--> statement-breakpoint
CREATE TABLE `login_links` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`token_hash` text NOT NULL,
	`created_at` text NOT NULL,
	`expires_at` text NOT NULL,
	`used_at` text,
	`ip_hash` text NOT NULL,
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `login_links_token_hash_unique` ON `login_links` (`token_hash`);--> statement-breakpoint
CREATE INDEX `login_links_account_idx` ON `login_links` (`account_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `login_links_ip_idx` ON `login_links` (`ip_hash`,`created_at`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`created_at` text NOT NULL,
	`last_seen_at` text NOT NULL,
	`expires_at` text NOT NULL,
	`revoked_at` text,
	`user_agent` text,
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `sessions_account_idx` ON `sessions` (`account_id`);--> statement-breakpoint
INSERT INTO `accounts` (`id`, `email`, `is_super_admin`, `group_quota`, `language`, `created_at`) VALUES ('acc_default_super_admin', 'julienr114@gmail.com', 1, 0, 'fr', '2026-11-14T00:00:00.000Z');
