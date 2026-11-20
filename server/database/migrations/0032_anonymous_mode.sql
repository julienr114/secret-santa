ALTER TABLE `gift_list_visits` ADD `anonymous` integer;--> statement-breakpoint
ALTER TABLE `gift_list_visits` ADD `anonymous_notice` text;--> statement-breakpoint
ALTER TABLE `participations` ADD `gift_list_id` text;