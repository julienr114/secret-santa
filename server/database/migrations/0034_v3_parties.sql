-- V3 (ticket 101, docs/spec/v3/migration.md): the group becomes the party,
-- the edition its Secret Santa within a year of the party, and every list
-- is in at least one party. Written by hand: drizzle-kit asks about each
-- rename. The data follow in the same file, so applying the migrations is
-- the only step.
PRAGMA defer_foreign_keys = on;
--> statement-breakpoint

-- 1. Renames. SQLite rewrites the foreign keys that point at a renamed
-- table; indexes cannot be renamed, so they are made again.
ALTER TABLE `groups` RENAME TO `parties`;--> statement-breakpoint
ALTER TABLE `editions` RENAME TO `secret_santas`;--> statement-breakpoint
ALTER TABLE `group_members` RENAME TO `party_organisers`;--> statement-breakpoint
ALTER TABLE `persons` RENAME COLUMN `group_id` TO `party_id`;--> statement-breakpoint
ALTER TABLE `manual_exclusions` RENAME COLUMN `group_id` TO `party_id`;--> statement-breakpoint
ALTER TABLE `party_organisers` RENAME COLUMN `group_id` TO `party_id`;--> statement-breakpoint
ALTER TABLE `secret_santas` RENAME COLUMN `group_id` TO `party_id`;--> statement-breakpoint
ALTER TABLE `audit_log` RENAME COLUMN `group_id` TO `party_id`;--> statement-breakpoint
ALTER TABLE `audit_log` RENAME COLUMN `edition_id` TO `secret_santa_id`;--> statement-breakpoint
ALTER TABLE `participations` RENAME COLUMN `edition_id` TO `secret_santa_id`;--> statement-breakpoint
ALTER TABLE `assignments` RENAME COLUMN `edition_id` TO `secret_santa_id`;--> statement-breakpoint
ALTER TABLE `hint_requests` RENAME COLUMN `edition_id` TO `secret_santa_id`;--> statement-breakpoint
ALTER TABLE `guesses` RENAME COLUMN `edition_id` TO `secret_santa_id`;--> statement-breakpoint
ALTER TABLE `draw_answers` RENAME COLUMN `edition_id` TO `secret_santa_id`;--> statement-breakpoint
DROP INDEX `groups_slug_unique`;--> statement-breakpoint
CREATE UNIQUE INDEX `parties_slug_unique` ON `parties` (`slug`);--> statement-breakpoint
DROP INDEX `groups_invite_code_unique`;--> statement-breakpoint
CREATE UNIQUE INDEX `parties_invite_code_unique` ON `parties` (`invite_code`);--> statement-breakpoint
DROP INDEX `persons_group_idx`;--> statement-breakpoint
CREATE INDEX `persons_party_idx` ON `persons` (`party_id`);--> statement-breakpoint
DROP INDEX `manual_exclusions_group_idx`;--> statement-breakpoint
CREATE INDEX `manual_exclusions_party_idx` ON `manual_exclusions` (`party_id`);--> statement-breakpoint
DROP INDEX `group_members_pair_idx`;--> statement-breakpoint
CREATE UNIQUE INDEX `party_organisers_pair_idx` ON `party_organisers` (`party_id`,`account_id`);--> statement-breakpoint
DROP INDEX `group_members_account_idx`;--> statement-breakpoint
CREATE INDEX `party_organisers_account_idx` ON `party_organisers` (`account_id`);--> statement-breakpoint
DROP INDEX `audit_log_group_created_idx`;--> statement-breakpoint
CREATE INDEX `audit_log_party_created_idx` ON `audit_log` (`party_id`,`created_at`);--> statement-breakpoint
DROP INDEX `participations_edition_person_idx`;--> statement-breakpoint
CREATE UNIQUE INDEX `participations_secret_santa_person_idx` ON `participations` (`secret_santa_id`,`person_id`);--> statement-breakpoint
DROP INDEX `assignments_edition_giver_idx`;--> statement-breakpoint
CREATE UNIQUE INDEX `assignments_secret_santa_giver_idx` ON `assignments` (`secret_santa_id`,`giver_person_id`);--> statement-breakpoint
DROP INDEX `hint_requests_edition_idx`;--> statement-breakpoint
CREATE INDEX `hint_requests_secret_santa_idx` ON `hint_requests` (`secret_santa_id`);--> statement-breakpoint
DROP INDEX `guesses_edition_guesser_recipient_idx`;--> statement-breakpoint
CREATE UNIQUE INDEX `guesses_secret_santa_guesser_recipient_idx` ON `guesses` (`secret_santa_id`,`guesser_person_id`,`recipient_person_id`);--> statement-breakpoint
DROP INDEX `draw_answers_edition_idx`;--> statement-breakpoint
CREATE INDEX `draw_answers_secret_santa_idx` ON `draw_answers` (`secret_santa_id`);--> statement-breakpoint

-- 2. The party: each group is a Christmas party that comes back each year.
ALTER TABLE `parties` ADD `category` text DEFAULT 'christmas' NOT NULL;--> statement-breakpoint
ALTER TABLE `parties` ADD `icon_emoji` text;--> statement-breakpoint
ALTER TABLE `parties` ADD `icon_color` text;--> statement-breakpoint
ALTER TABLE `parties` ADD `usual_date` text;--> statement-breakpoint
ALTER TABLE `parties` ADD `recurring` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `parties` ADD `from_list` integer DEFAULT false NOT NULL;--> statement-breakpoint
UPDATE `parties` SET `usual_date` = '12-25', `recurring` = true;--> statement-breakpoint

-- 3. The years: one per party and year of its editions. Its date is the
-- edition's date when it is an ISO day of that year, else 25 December.
CREATE TABLE `party_years` (
	`id` text PRIMARY KEY NOT NULL,
	`party_id` text NOT NULL,
	`year` integer NOT NULL,
	`date` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`party_id`) REFERENCES `parties`(`id`) ON UPDATE no action ON DELETE no action
);--> statement-breakpoint
CREATE UNIQUE INDEX `party_years_party_year_idx` ON `party_years` (`party_id`,`year`);--> statement-breakpoint
INSERT INTO `party_years` (`id`, `party_id`, `year`, `date`, `created_at`)
SELECT
	lower(hex(randomblob(10))),
	e.`party_id`,
	e.`year`,
	COALESCE(
		(
			SELECT d FROM (
				SELECT COALESCE(
					json_extract(e2.`rules_override`, '$.eventDate'),
					json_extract(p.`rules`, '$.eventDate')
				) AS d, e2.`created_at` AS c
				FROM `secret_santas` e2
				JOIN `parties` p ON p.`id` = e2.`party_id`
				WHERE e2.`party_id` = e.`party_id` AND e2.`year` = e.`year`
			)
			WHERE typeof(d) = 'text' AND date(d) = d AND substr(d, 1, 4) = CAST(e.`year` AS text)
			ORDER BY c
			LIMIT 1
		),
		e.`year` || '-12-25'
	),
	MIN(e.`created_at`)
FROM `secret_santas` e
GROUP BY e.`party_id`, e.`year`;--> statement-breakpoint

-- 4. The Secret Santa: in its year, with its own draw settings. They are
-- what the group and the edition gave together (server/utils/rules.ts,
-- mergeRules): nulls dropped (json_patch onto {}), the old `wishlist`
-- switch turned into `giftHints`, then the edition over the group. The
-- defaults stay applied on reading, as before. The table is made again
-- under its own name, after the old one is dropped, so that inserting its
-- rows settles the deferred foreign keys of the rows that hang from it.
CREATE TABLE `__v3_secret_santas` AS
SELECT
	e.`id`,
	e.`party_id`,
	y.`id`,
	e.`label`,
	e.`status`,
	json_patch(g.`rules`, o.`rules`),
	e.`rules_snapshot`,
	e.`history_waivers`,
	e.`reminder_sent_at`,
	e.`drawn_at`,
	e.`closed_at`,
	e.`revealed_at`,
	e.`draw_mode`,
	e.`guess_mode`,
	e.`guess_ends_at`,
	e.`guess_time_zone`,
	e.`guess_reminder_sent_at`,
	e.`guesses_closed_at`,
	e.`guess_results_sent_at`,
	e.`guess_auto_reminder`,
	e.`guess_auto_reminder_sent_at`,
	e.`guess_enabled_at`,
	e.`guess_point_sent_at`,
	e.`guess_end_sent_at`,
	e.`created_at`
FROM `secret_santas` e
JOIN `party_years` y ON y.`party_id` = e.`party_id` AND y.`year` = e.`year`
JOIN (
	SELECT `id`, CASE
		WHEN json_type(j, '$.giftHints') IS NULL AND json_type(j, '$.wishlist') IN ('true', 'false')
		THEN json_set(json_remove(j, '$.wishlist'), '$.giftHints',
			CASE json_type(j, '$.wishlist') WHEN 'true' THEN 'full' ELSE 'none' END)
		ELSE json_remove(j, '$.wishlist')
	END AS `rules`
	FROM (SELECT `id`, json_patch('{}', COALESCE(`rules`, '{}')) AS j FROM `parties`)
) g ON g.`id` = e.`party_id`
JOIN (
	SELECT `id`, CASE
		WHEN json_type(j, '$.giftHints') IS NULL AND json_type(j, '$.wishlist') IN ('true', 'false')
		THEN json_set(json_remove(j, '$.wishlist'), '$.giftHints',
			CASE json_type(j, '$.wishlist') WHEN 'true' THEN 'full' ELSE 'none' END)
		ELSE json_remove(j, '$.wishlist')
	END AS `rules`
	FROM (SELECT `id`, json_patch('{}', COALESCE(`rules_override`, '{}')) AS j FROM `secret_santas`)
) o ON o.`id` = e.`id`;--> statement-breakpoint
DROP TABLE `secret_santas`;--> statement-breakpoint
CREATE TABLE `secret_santas` (
	`id` text PRIMARY KEY NOT NULL,
	`party_id` text NOT NULL,
	`year_id` text NOT NULL,
	`label` text NOT NULL,
	`status` text DEFAULT 'preparing' NOT NULL,
	`rules` text DEFAULT '{}' NOT NULL,
	`rules_snapshot` text,
	`history_waivers` text,
	`reminder_sent_at` text,
	`drawn_at` text,
	`closed_at` text,
	`revealed_at` text,
	`draw_mode` text DEFAULT 'app' NOT NULL,
	`guess_mode` text DEFAULT 'none' NOT NULL,
	`guess_ends_at` text,
	`guess_time_zone` text,
	`guess_reminder_sent_at` text,
	`guesses_closed_at` text,
	`guess_results_sent_at` text,
	`guess_auto_reminder` integer DEFAULT true NOT NULL,
	`guess_auto_reminder_sent_at` text,
	`guess_enabled_at` text,
	`guess_point_sent_at` text,
	`guess_end_sent_at` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`party_id`) REFERENCES `parties`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`year_id`) REFERENCES `party_years`(`id`) ON UPDATE no action ON DELETE no action
);--> statement-breakpoint
INSERT INTO `secret_santas` SELECT * FROM `__v3_secret_santas`;--> statement-breakpoint
DROP TABLE `__v3_secret_santas`;--> statement-breakpoint
CREATE INDEX `secret_santas_party_idx` ON `secret_santas` (`party_id`);--> statement-breakpoint

-- 5. The lists in parties.
CREATE TABLE `gift_list_parties` (
	`id` text PRIMARY KEY NOT NULL,
	`list_id` text NOT NULL,
	`party_id` text NOT NULL,
	`visibility` text DEFAULT 'party' NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`list_id`) REFERENCES `gift_lists`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`party_id`) REFERENCES `parties`(`id`) ON UPDATE no action ON DELETE no action
);--> statement-breakpoint
CREATE UNIQUE INDEX `gift_list_parties_list_party_idx` ON `gift_list_parties` (`list_id`,`party_id`);--> statement-breakpoint
CREATE INDEX `gift_list_parties_party_idx` ON `gift_list_parties` (`party_id`);--> statement-breakpoint

-- A list linked to a draw goes into that draw's party: for the whole
-- party when it is already public, else only for the one who drew its
-- holder (decided by Julien on 20 November 2026).
INSERT INTO `gift_list_parties` (`id`, `list_id`, `party_id`, `visibility`, `created_at`)
SELECT
	lower(hex(randomblob(10))),
	l.`id`,
	s.`party_id`,
	CASE WHEN l.`share_token` IS NULL THEN 'giver' ELSE 'party' END,
	strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
FROM `participations` pa
JOIN `secret_santas` s ON s.`id` = pa.`secret_santa_id`
JOIN `gift_lists` l ON l.`id` = pa.`gift_list_id`
GROUP BY l.`id`, s.`party_id`;--> statement-breakpoint

-- Every other list gets a party of its own, with the list's id: its name,
-- icon and date, a category from its icon, its holders as members and its
-- creator as organiser. Hidden from the screens of a group (`from_list`).
INSERT INTO `parties` (`id`, `slug`, `name`, `category`, `icon_emoji`, `icon_color`, `usual_date`, `recurring`, `from_list`, `rules`, `created_by`, `created_at`)
SELECT
	l.`id`,
	'liste-' || lower(hex(randomblob(6))),
	l.`title`,
	CASE l.`icon_emoji`
		WHEN '🎄' THEN 'christmas'
		WHEN '🎂' THEN 'birthday'
		WHEN '🍼' THEN 'birth'
		WHEN '💍' THEN 'wedding'
		WHEN '🏡' THEN 'housewarming'
		ELSE 'other'
	END,
	l.`icon_emoji`,
	l.`icon_color`,
	NULL,
	false,
	true,
	'{}',
	l.`account_id`,
	l.`created_at`
FROM `gift_lists` l
WHERE l.`id` NOT IN (SELECT `list_id` FROM `gift_list_parties`);--> statement-breakpoint
INSERT INTO `party_years` (`id`, `party_id`, `year`, `date`, `created_at`)
SELECT
	lower(hex(randomblob(10))),
	p.`id`,
	CAST(substr(CASE WHEN date(l.`event_date`) = l.`event_date` THEN l.`event_date` ELSE l.`created_at` END, 1, 4) AS integer),
	CASE WHEN date(l.`event_date`) = l.`event_date` THEN l.`event_date` END,
	l.`created_at`
FROM `parties` p
JOIN `gift_lists` l ON l.`id` = p.`id`
WHERE p.`from_list` = true;--> statement-breakpoint
INSERT INTO `party_organisers` (`party_id`, `account_id`, `created_at`)
SELECT p.`id`, p.`created_by`, p.`created_at`
FROM `parties` p
WHERE p.`from_list` = true;--> statement-breakpoint
INSERT INTO `persons` (`id`, `party_id`, `first_name`, `email`, `language`, `avatar_emoji`, `avatar_color`, `active`, `created_at`)
SELECT
	lower(hex(randomblob(10))),
	p.`id`,
	COALESCE(
		NULLIF(a.`first_name`, ''),
		(SELECT f.`first_name` FROM `family_members` f
			WHERE f.`account_id` = a.`id` AND f.`is_self` = true
			ORDER BY f.`created_at` LIMIT 1),
		''
	),
	a.`email`,
	a.`language`,
	a.`avatar_emoji`,
	a.`avatar_color`,
	true,
	p.`created_at`
FROM `parties` p
JOIN (
	SELECT `list_id`, `account_id` FROM `gift_list_holders`
	UNION
	SELECT `id`, `account_id` FROM `gift_lists`
) h ON h.`list_id` = p.`id`
JOIN `accounts` a ON a.`id` = h.`account_id`
WHERE p.`from_list` = true;--> statement-breakpoint
INSERT INTO `gift_list_parties` (`id`, `list_id`, `party_id`, `visibility`, `created_at`)
SELECT lower(hex(randomblob(10))), p.`id`, p.`id`, 'party', p.`created_at`
FROM `parties` p
WHERE p.`from_list` = true;
