ALTER TABLE `gift_list_holders` ADD `level` text DEFAULT 'manage' NOT NULL;--> statement-breakpoint
ALTER TABLE `gift_list_invites` ADD `level` text DEFAULT 'write' NOT NULL;--> statement-breakpoint
ALTER TABLE `gift_list_invites` ADD `token_hash` text;--> statement-breakpoint
ALTER TABLE `gift_list_invites` ADD `expires_at` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `gift_list_invites` ADD `accepted_at` text;--> statement-breakpoint
ALTER TABLE `gift_list_invites` ADD `declined_at` text;--> statement-breakpoint
CREATE UNIQUE INDEX `gift_list_invites_token_idx` ON `gift_list_invites` (`token_hash`);--> statement-breakpoint
-- The invitations of before were sent between equals, and get their 7 days from the day they were sent.
UPDATE `gift_list_invites` SET `level` = 'manage', `expires_at` = strftime('%Y-%m-%dT%H:%M:%fZ', `created_at`, '+7 days');
