ALTER TABLE `groups` ADD `invite_code` text;--> statement-breakpoint
ALTER TABLE `groups` ADD `invite_until` text;--> statement-breakpoint
ALTER TABLE `groups` ADD `invite_places` integer;--> statement-breakpoint
ALTER TABLE `groups` ADD `invite_message` text;--> statement-breakpoint
CREATE UNIQUE INDEX `groups_invite_code_unique` ON `groups` (`invite_code`);