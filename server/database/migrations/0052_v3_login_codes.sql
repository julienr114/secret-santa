-- Ticket 123 (README 22.22, « La connexion par code »): the codes of the
-- installed app, by their print bound to the device, never in clear.
CREATE TABLE `login_codes` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`code_print` text NOT NULL,
	`created_at` text NOT NULL,
	`expires_at` text NOT NULL,
	`used_at` text,
	`attempts` integer DEFAULT 0 NOT NULL,
	`ip_hash` text NOT NULL,
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `login_codes_account_idx` ON `login_codes` (`account_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `login_codes_ip_idx` ON `login_codes` (`ip_hash`,`created_at`);
