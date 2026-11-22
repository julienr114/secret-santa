-- Ticket 117: nobody is added to an event itself; one comes in by one of
-- its Secret Santa or by one of its lists
-- (docs/decisions/2026-11-21-on-entre-par-un-secret-santa-ou-par-une-liste.md).
-- Each member keeps by where they came in.
CREATE TABLE `member_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`party_id` text NOT NULL,
	`person_id` text NOT NULL,
	`secret_santa_id` text,
	`list_id` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `member_entries_party_idx` ON `member_entries` (`party_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `member_entries_person_santa_idx` ON `member_entries` (`person_id`,`secret_santa_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `member_entries_person_list_idx` ON `member_entries` (`person_id`,`list_id`);--> statement-breakpoint

-- Every member of today stays one. Those who took part in a Secret Santa
-- came in by it; the others keep nothing under their first name.
INSERT INTO `member_entries` (`id`, `party_id`, `person_id`, `secret_santa_id`, `list_id`, `created_at`)
SELECT 'me-' || p.`id`, s.`party_id`, p.`person_id`, p.`secret_santa_id`, NULL, s.`created_at`
FROM `participations` p
JOIN `secret_santas` s ON s.`id` = p.`secret_santa_id`;
