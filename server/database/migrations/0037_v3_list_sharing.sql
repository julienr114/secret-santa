ALTER TABLE `gift_lists` ADD `party_id` text;--> statement-breakpoint
-- Ticket 106: a list always has its link; who gets in is decided on
-- arrival, by the stage of its sharing. A list shared by link stays
-- public; one never shared, or whose sharing was stopped, becomes a draft.
UPDATE `gift_lists` SET `share_token` = lower(hex(randomblob(12))) WHERE `share_token` IS NULL;--> statement-breakpoint
-- Its occasion: its own event (made by migration 0033), else the event
-- of the draw it was linked to.
UPDATE `gift_lists` SET `party_id` = `id` WHERE `id` IN (SELECT `id` FROM `parties`);--> statement-breakpoint
UPDATE `gift_lists` SET `party_id` = (
	SELECT lp.`party_id` FROM `gift_list_parties` lp
	WHERE lp.`list_id` = `gift_lists`.`id`
	ORDER BY lp.`created_at` LIMIT 1
) WHERE `party_id` IS NULL;--> statement-breakpoint
-- A draft is shared in no event: what the members of an event saw of a
-- list that is not public goes. « Celui qui m'a tiré » stays (ticket 107);
-- its own event holds only its holders and stays too.
DELETE FROM `gift_list_parties`
WHERE `visibility` = 'party'
	AND `party_id` NOT IN (SELECT `id` FROM `parties` WHERE `from_list` = true)
	AND `list_id` IN (SELECT `id` FROM `gift_lists` WHERE `shared_at` IS NULL);
