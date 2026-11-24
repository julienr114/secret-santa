-- Ticket 139: « Celui qui m'a tiré » and all the members of an event are
-- two lines that may be there together
-- (docs/decisions/2026-11-22-qui-voit-ta-liste-deux-choix.md). A list kept
-- for the one who drew me keeps it.
ALTER TABLE `gift_list_parties` ADD `giver` integer DEFAULT false NOT NULL;--> statement-breakpoint
UPDATE `gift_list_parties` SET `giver` = true WHERE `visibility` = 'giver';
