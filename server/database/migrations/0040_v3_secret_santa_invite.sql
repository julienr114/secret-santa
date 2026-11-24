-- Ticket 116: the invitation link is that of a Secret Santa, no longer of
-- an event (docs/decisions/2026-11-21-le-lien-d-invitation-est-celui-d-un-secret-santa.md,
-- docs/spec/v3/migration.md, « Les liens déjà envoyés »).
ALTER TABLE `secret_santas` ADD `invite_code` text;--> statement-breakpoint
ALTER TABLE `secret_santas` ADD `invite_until` text;--> statement-breakpoint
ALTER TABLE `secret_santas` ADD `invite_places` integer;--> statement-breakpoint
ALTER TABLE `secret_santas` ADD `invite_message` text;--> statement-breakpoint
CREATE UNIQUE INDEX `secret_santas_invite_code_unique` ON `secret_santas` (`invite_code`);--> statement-breakpoint

-- The link of an event, with its places, its last day and its word, goes
-- to the Secret Santa its link used to fill: the newest one not closed,
-- when it is still being prepared. An event without one sees its link
-- closed: its code goes with its columns.
UPDATE `secret_santas` SET
	`invite_code` = (SELECT p.`invite_code` FROM `parties` p WHERE p.`id` = `secret_santas`.`party_id`),
	`invite_until` = (SELECT p.`invite_until` FROM `parties` p WHERE p.`id` = `secret_santas`.`party_id`),
	`invite_places` = (SELECT p.`invite_places` FROM `parties` p WHERE p.`id` = `secret_santas`.`party_id`),
	`invite_message` = (SELECT p.`invite_message` FROM `parties` p WHERE p.`id` = `secret_santas`.`party_id`)
WHERE `status` = 'preparing'
	AND `id` = (
		SELECT s.`id` FROM `secret_santas` s
		JOIN `party_years` y ON y.`id` = s.`year_id`
		WHERE s.`party_id` = `secret_santas`.`party_id` AND s.`status` <> 'closed'
		ORDER BY y.`year` DESC, s.`created_at` DESC
		LIMIT 1
	);--> statement-breakpoint

-- « Quelqu'un s'inscrit par le lien » leaves the settings of the event for
-- those of its Secret Santa: the organiser's choice is kept on each one not
-- closed, and the event forgets it.
UPDATE `secret_santas` SET `rules` = json_set(
	`rules`,
	'$.notifyJoined',
	json(json_type((SELECT p.`rules` FROM `parties` p WHERE p.`id` = `secret_santas`.`party_id`), '$.notifyJoined'))
)
WHERE `status` <> 'closed'
	AND json_type((SELECT p.`rules` FROM `parties` p WHERE p.`id` = `secret_santas`.`party_id`), '$.notifyJoined') IN ('true', 'false');--> statement-breakpoint
UPDATE `parties` SET `rules` = json_remove(`rules`, '$.notifyJoined');--> statement-breakpoint

DROP INDEX `parties_invite_code_unique`;--> statement-breakpoint
ALTER TABLE `parties` DROP COLUMN `invite_code`;--> statement-breakpoint
ALTER TABLE `parties` DROP COLUMN `invite_until`;--> statement-breakpoint
ALTER TABLE `parties` DROP COLUMN `invite_places`;--> statement-breakpoint
ALTER TABLE `parties` DROP COLUMN `invite_message`;
