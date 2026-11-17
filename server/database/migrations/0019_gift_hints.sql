-- Gift hints (README 22.11), in place of the wish list: the portrait of a
-- participation, and the anonymous requests for hints.
CREATE TABLE `gift_portraits` (
	`participation_id` text PRIMARY KEY NOT NULL,
	`useful_or_surprising` text,
	`object_or_moment` text,
	`keep_or_consume` text,
	`self_or_shared` text,
	`second_hand` text,
	`surprise` text,
	`lately` text,
	`would_help` text,
	`avoid` text,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`participation_id`) REFERENCES `participations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `hint_requests` (
	`receiver_participation_id` text PRIMARY KEY NOT NULL,
	`edition_id` text NOT NULL,
	`requester_enc` text NOT NULL,
	`requester_iv` text NOT NULL,
	`requested_at` text NOT NULL,
	`answered_at` text,
	FOREIGN KEY (`receiver_participation_id`) REFERENCES `participations`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`edition_id`) REFERENCES `editions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `hint_requests_edition_idx` ON `hint_requests` (`edition_id`);--> statement-breakpoint
-- The wishlist switch becomes the setting with three values (README 22.11):
-- on gives the portrait and the precise ideas, off no hint at all.
UPDATE `groups` SET `rules` = json_set(json_remove(`rules`, '$.wishlist'), '$.giftHints', CASE WHEN json_extract(`rules`, '$.wishlist') THEN 'full' ELSE 'none' END) WHERE json_valid(`rules`) AND json_type(`rules`, '$.wishlist') IS NOT NULL;
--> statement-breakpoint
UPDATE `editions` SET `rules_override` = json_set(json_remove(`rules_override`, '$.wishlist'), '$.giftHints', CASE WHEN json_extract(`rules_override`, '$.wishlist') THEN 'full' ELSE 'none' END) WHERE json_valid(`rules_override`) AND json_type(`rules_override`, '$.wishlist') IS NOT NULL;
