-- Ticket 122 (README 22.22, « Suivre une liste, ou une seule personne »):
-- what an account follows on a list it may open without holding it, the
-- whole list (no person) or one person of it.
CREATE TABLE `gift_list_follows` (
	`id` text PRIMARY KEY NOT NULL,
	`list_id` text NOT NULL,
	`account_id` text NOT NULL,
	`list_person_id` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`list_id`) REFERENCES `gift_lists`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`list_person_id`) REFERENCES `gift_list_people`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `gift_list_follows_list_idx` ON `gift_list_follows` (`list_id`);--> statement-breakpoint
CREATE INDEX `gift_list_follows_account_idx` ON `gift_list_follows` (`account_id`);
