-- Ticket 165 (docs/spec/v3/migration.md, « Les pistes de cadeaux »): a
-- person without an account, but whose address we have, who wrote hints
-- or a portrait, gets their account, with that address and their first
-- name; then the same as 0038 for the others: their « Moi » card with
-- their portrait, and for a Secret Santa not closed, a list of theirs in
-- the draw's event, with their ideas, kept for the one who drew them.
-- Two persons of the same address: one account. Whoever wrote nothing
-- has none; a person without an address keeps their hints, read by the
-- one who drew them. Nobody is told: the lists keep the date of the
-- hints, so that they never read as new ideas.

-- The addresses that wrote something and have no account, each once,
-- with the first name, the language and the face of its first person.
CREATE TABLE `_v3_new_accounts` AS
SELECT
	lower(hex(randomblob(10))) AS `account_id`,
	m.`email`,
	(SELECT ps.`first_name` FROM `persons` ps WHERE lower(ps.`email`) = m.`email` ORDER BY ps.`created_at` LIMIT 1) AS `first_name`,
	(SELECT ps.`language` FROM `persons` ps WHERE lower(ps.`email`) = m.`email` ORDER BY ps.`created_at` LIMIT 1) AS `language`,
	(SELECT ps.`avatar_emoji` FROM `persons` ps WHERE lower(ps.`email`) = m.`email` ORDER BY ps.`created_at` LIMIT 1) AS `avatar_emoji`,
	(SELECT ps.`avatar_color` FROM `persons` ps WHERE lower(ps.`email`) = m.`email` ORDER BY ps.`created_at` LIMIT 1) AS `avatar_color`
FROM (
	SELECT DISTINCT lower(ps.`email`) AS `email`
	FROM `participations` p
	JOIN `persons` ps ON ps.`id` = p.`person_id`
	WHERE ps.`email` IS NOT NULL
		AND trim(ps.`email`) != ''
		AND (
			p.`id` IN (SELECT `participation_id` FROM `wishes`)
			OR p.`id` IN (SELECT `participation_id` FROM `gift_portraits`)
		)
		AND NOT EXISTS (SELECT 1 FROM `accounts` a WHERE a.`email` = lower(ps.`email`))
) m;--> statement-breakpoint

INSERT INTO `accounts` (`id`, `email`, `first_name`, `avatar_emoji`, `avatar_color`, `language`, `created_at`)
SELECT
	n.`account_id`,
	n.`email`,
	n.`first_name`,
	n.`avatar_emoji`,
	n.`avatar_color`,
	COALESCE(n.`language`, 'fr'),
	strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
FROM `_v3_new_accounts` n;--> statement-breakpoint

-- Their participations, as 0038 reads them, with the date of their hints.
CREATE TABLE `_v3_new_owners` AS
SELECT
	p.`id` AS `participation_id`,
	n.`account_id` AS `account_id`,
	ps.`first_name` AS `first_name`,
	s.`party_id` AS `party_id`,
	s.`status` AS `status`,
	y.`date` AS `date`,
	p.`gift_list_id` AS `gift_list_id`,
	COALESCE(p.`hints_updated_at`, strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) AS `hints_at`
FROM `participations` p
JOIN `persons` ps ON ps.`id` = p.`person_id`
JOIN `_v3_new_accounts` n ON n.`email` = lower(ps.`email`)
JOIN `secret_santas` s ON s.`id` = p.`secret_santa_id`
JOIN `party_years` y ON y.`id` = s.`year_id`;--> statement-breakpoint

-- Their « Moi » card.
INSERT INTO `family_members` (`id`, `account_id`, `first_name`, `avatar_emoji`, `avatar_color`, `is_self`, `created_at`)
SELECT
	lower(hex(randomblob(10))),
	n.`account_id`,
	n.`first_name`,
	COALESCE(n.`avatar_emoji`, '🎁'),
	COALESCE(n.`avatar_color`, 'pine'),
	true,
	strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
FROM `_v3_new_accounts` n;--> statement-breakpoint

-- The portrait goes to the card: the latest one.
UPDATE `family_members`
SET
	`answers` = (
		SELECT json_object(
			'usefulOrSurprising', g.`useful_or_surprising`,
			'objectOrMoment', g.`object_or_moment`,
			'keepOrConsume', g.`keep_or_consume`,
			'selfOrShared', g.`self_or_shared`,
			'secondHand', g.`second_hand`,
			'surprise', g.`surprise`
		)
		FROM `gift_portraits` g
		JOIN `_v3_new_owners` o ON o.`participation_id` = g.`participation_id`
		WHERE o.`account_id` = `family_members`.`account_id`
		ORDER BY g.`updated_at` DESC LIMIT 1
	),
	`texts` = (
		SELECT json_object(
			'lately', g.`lately`,
			'wouldHelp', g.`would_help`,
			'avoid', g.`avoid`
		)
		FROM `gift_portraits` g
		JOIN `_v3_new_owners` o ON o.`participation_id` = g.`participation_id`
		WHERE o.`account_id` = `family_members`.`account_id`
		ORDER BY g.`updated_at` DESC LIMIT 1
	)
WHERE `is_self` = true
	AND `account_id` IN (
		SELECT o.`account_id` FROM `_v3_new_owners` o
		JOIN `gift_portraits` g ON g.`participation_id` = o.`participation_id`
	);--> statement-breakpoint

-- The precise ideas of a Secret Santa not closed: a list of their own in
-- the draw's event, kept for the one who drew them, dated by the hints.
CREATE TABLE `_v3_new_lists` AS
SELECT
	o.`participation_id`,
	o.`account_id`,
	o.`party_id`,
	o.`date`,
	o.`hints_at`,
	lower(hex(randomblob(10))) AS `list_id`,
	lower(hex(randomblob(10))) AS `list_person_id`,
	(SELECT f.`id` FROM `family_members` f WHERE f.`account_id` = o.`account_id` AND f.`is_self` = true LIMIT 1) AS `member_id`
FROM `_v3_new_owners` o
WHERE o.`status` != 'closed'
	AND o.`gift_list_id` IS NULL
	AND o.`participation_id` IN (SELECT `participation_id` FROM `wishes`);--> statement-breakpoint

INSERT INTO `gift_lists` (`id`, `account_id`, `icon_emoji`, `icon_color`, `title`, `event_date`, `share_token`, `party_id`, `created_at`, `updated_at`)
SELECT
	h.`list_id`,
	h.`account_id`,
	'🎁',
	COALESCE(pa.`icon_color`, 'brick'),
	pa.`name`,
	h.`date`,
	lower(hex(randomblob(12))),
	h.`party_id`,
	h.`hints_at`,
	h.`hints_at`
FROM `_v3_new_lists` h
JOIN `parties` pa ON pa.`id` = h.`party_id`;--> statement-breakpoint

INSERT INTO `gift_list_holders` (`id`, `list_id`, `account_id`, `level`, `created_at`)
SELECT lower(hex(randomblob(10))), h.`list_id`, h.`account_id`, 'manage', h.`hints_at`
FROM `_v3_new_lists` h;--> statement-breakpoint

INSERT INTO `gift_list_parties` (`id`, `list_id`, `party_id`, `visibility`, `giver`, `created_at`)
SELECT lower(hex(randomblob(10))), h.`list_id`, h.`party_id`, 'giver', true, h.`hints_at`
FROM `_v3_new_lists` h;--> statement-breakpoint

INSERT INTO `gift_list_people` (`id`, `list_id`, `member_id`, `position`)
SELECT h.`list_person_id`, h.`list_id`, h.`member_id`, 0
FROM `_v3_new_lists` h
WHERE h.`member_id` IS NOT NULL;--> statement-breakpoint

INSERT INTO `gift_list_ideas` (`id`, `list_id`, `list_person_id`, `text`, `url`, `position`, `created_at`)
SELECT lower(hex(randomblob(10))), h.`list_id`, h.`list_person_id`, w.`label`, w.`url`, w.`position`, w.`created_at`
FROM `_v3_new_lists` h
JOIN `wishes` w ON w.`participation_id` = h.`participation_id`
WHERE h.`member_id` IS NOT NULL;--> statement-breakpoint

UPDATE `participations`
SET `gift_list_id` = (SELECT h.`list_id` FROM `_v3_new_lists` h WHERE h.`participation_id` = `participations`.`id`)
WHERE `id` IN (SELECT `participation_id` FROM `_v3_new_lists`);--> statement-breakpoint

DROP TABLE `_v3_new_lists`;--> statement-breakpoint
DROP TABLE `_v3_new_owners`;--> statement-breakpoint
DROP TABLE `_v3_new_accounts`;
