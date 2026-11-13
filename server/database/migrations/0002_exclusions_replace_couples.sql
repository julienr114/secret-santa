-- Couples become reciprocal exclusions, the single generic mechanism (v5).
INSERT INTO `manual_exclusions` (`id`, `group_id`, `giver_id`, `receiver_id`, `reciprocal`)
SELECT lower(hex(randomblob(12))), c.`group_id`, c.`person_a_id`, c.`person_b_id`, 1
FROM `couples` c
WHERE c.`active` = 1
  AND NOT EXISTS (
    SELECT 1 FROM `manual_exclusions` e
    WHERE e.`group_id` = c.`group_id`
      AND ((e.`giver_id` = c.`person_a_id` AND e.`receiver_id` = c.`person_b_id`)
        OR (e.`giver_id` = c.`person_b_id` AND e.`receiver_id` = c.`person_a_id`))
  );--> statement-breakpoint
UPDATE `audit_log` SET `type` = 'rules_changed', `meta` = NULL WHERE `type` = 'couple_changed';--> statement-breakpoint
DROP TABLE `couples`;
