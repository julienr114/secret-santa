-- Ticket 118: a birthday remembers the one of my people it is for
-- (docs/decisions/2026-11-22-un-anniversaire-sait-pour-qui-il-est-fait.md).
-- Empty for every event that exists: its organiser chooses in its settings.
ALTER TABLE `parties` ADD `for_member_id` text;
