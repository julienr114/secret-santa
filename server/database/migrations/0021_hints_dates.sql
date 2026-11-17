-- Gift hints put forward (lot 16 bis): when a participant last saved
-- hints, and when their giver was told they arrived.
ALTER TABLE `participations` ADD `hints_updated_at` text;--> statement-breakpoint
ALTER TABLE `participations` ADD `hints_announced_at` text;--> statement-breakpoint
-- Hints already left date from their last save: the portrait, else the
-- latest precise idea.
UPDATE `participations` SET `hints_updated_at` = coalesce((SELECT `updated_at` FROM `gift_portraits` WHERE `gift_portraits`.`participation_id` = `participations`.`id`), (SELECT max(`created_at`) FROM `wishes` WHERE `wishes`.`participation_id` = `participations`.`id`));
