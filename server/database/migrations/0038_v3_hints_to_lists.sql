-- Ticket 107 (docs/spec/v3/migration.md, « Les pistes de cadeaux »): the
-- gift hints become the list. For a person with an account: their
-- portrait goes to their « Moi » card, their precise ideas of a Secret
-- Santa not closed go to a list of theirs in the draw's event, kept for
-- the one who drew them. Nobody sees after it an idea they did not see
-- before. A person without an account keeps their hints, read only by
-- the one who drew them; nothing is created for them.

-- Who has an account, by participation.
CREATE TABLE `_v3_hint_owners` AS
SELECT
	p.`id` AS `participation_id`,
	a.`id` AS `account_id`,
	ps.`first_name` AS `first_name`,
	s.`party_id` AS `party_id`,
	s.`status` AS `status`,
	y.`date` AS `date`,
	p.`gift_list_id` AS `gift_list_id`
FROM `participations` p
JOIN `persons` ps ON ps.`id` = p.`person_id`
JOIN `accounts` a ON a.`email` = lower(ps.`email`)
JOIN `secret_santas` s ON s.`id` = p.`secret_santa_id`
JOIN `party_years` y ON y.`id` = s.`year_id`;--> statement-breakpoint

-- A « Moi » card for whoever left hints and has none yet.
INSERT INTO `family_members` (`id`, `account_id`, `first_name`, `avatar_emoji`, `avatar_color`, `is_self`, `created_at`)
SELECT
	lower(hex(randomblob(10))),
	a.`id`,
	COALESCE(a.`first_name`, (SELECT o.`first_name` FROM `_v3_hint_owners` o WHERE o.`account_id` = a.`id` LIMIT 1)),
	COALESCE(a.`avatar_emoji`, '🎁'),
	COALESCE(a.`avatar_color`, 'pine'),
	true,
	strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
FROM `accounts` a
WHERE a.`id` IN (
	SELECT o.`account_id` FROM `_v3_hint_owners` o
	WHERE o.`participation_id` IN (SELECT `participation_id` FROM `gift_portraits`)
		OR o.`participation_id` IN (SELECT `participation_id` FROM `wishes`)
)
AND NOT EXISTS (
	SELECT 1 FROM `family_members` f WHERE f.`account_id` = a.`id` AND f.`is_self` = true
);--> statement-breakpoint

-- The portrait goes to the card: the latest one, on a card where nothing
-- was written yet (the card keeps no date: what was written there wins).
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
		JOIN `_v3_hint_owners` o ON o.`participation_id` = g.`participation_id`
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
		JOIN `_v3_hint_owners` o ON o.`participation_id` = g.`participation_id`
		WHERE o.`account_id` = `family_members`.`account_id`
		ORDER BY g.`updated_at` DESC LIMIT 1
	)
WHERE `is_self` = true
	AND (`answers` IS NULL OR `answers` = '{}')
	AND (`texts` IS NULL OR `texts` = '{}')
	AND `account_id` IN (
		SELECT o.`account_id` FROM `_v3_hint_owners` o
		JOIN `gift_portraits` g ON g.`participation_id` = o.`participation_id`
	);--> statement-breakpoint

-- The precise ideas of a Secret Santa not closed, when no list was linked
-- to the hints: a list of their own in the draw's event, kept for the
-- one who drew them.
CREATE TABLE `_v3_hint_lists` AS
SELECT
	o.`participation_id`,
	o.`account_id`,
	o.`party_id`,
	o.`date`,
	lower(hex(randomblob(10))) AS `list_id`,
	lower(hex(randomblob(10))) AS `list_person_id`,
	(SELECT f.`id` FROM `family_members` f WHERE f.`account_id` = o.`account_id` AND f.`is_self` = true LIMIT 1) AS `member_id`
FROM `_v3_hint_owners` o
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
	strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
	strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
FROM `_v3_hint_lists` h
JOIN `parties` pa ON pa.`id` = h.`party_id`;--> statement-breakpoint

INSERT INTO `gift_list_holders` (`id`, `list_id`, `account_id`, `level`, `created_at`)
SELECT lower(hex(randomblob(10))), h.`list_id`, h.`account_id`, 'manage', strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
FROM `_v3_hint_lists` h;--> statement-breakpoint

INSERT INTO `gift_list_parties` (`id`, `list_id`, `party_id`, `visibility`, `created_at`)
SELECT lower(hex(randomblob(10))), h.`list_id`, h.`party_id`, 'giver', strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
FROM `_v3_hint_lists` h;--> statement-breakpoint

INSERT INTO `gift_list_people` (`id`, `list_id`, `member_id`, `position`)
SELECT h.`list_person_id`, h.`list_id`, h.`member_id`, 0
FROM `_v3_hint_lists` h
WHERE h.`member_id` IS NOT NULL;--> statement-breakpoint

INSERT INTO `gift_list_ideas` (`id`, `list_id`, `list_person_id`, `text`, `url`, `position`, `created_at`)
SELECT lower(hex(randomblob(10))), h.`list_id`, h.`list_person_id`, w.`label`, w.`url`, w.`position`, w.`created_at`
FROM `_v3_hint_lists` h
JOIN `wishes` w ON w.`participation_id` = h.`participation_id`
WHERE h.`member_id` IS NOT NULL;--> statement-breakpoint

UPDATE `participations`
SET `gift_list_id` = (SELECT h.`list_id` FROM `_v3_hint_lists` h WHERE h.`participation_id` = `participations`.`id`)
WHERE `id` IN (SELECT `participation_id` FROM `_v3_hint_lists`);--> statement-breakpoint

DROP TABLE `_v3_hint_lists`;--> statement-breakpoint
DROP TABLE `_v3_hint_owners`;
