-- Ticket 149: the visit of a new list, once per account, on any device
-- (docs/decisions/2026-11-23-la-visite-d-une-liste-neuve.md), and the note
-- on the first line of a list made from « Créer ».
ALTER TABLE `accounts` ADD `list_tour_seen` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `accounts` ADD `first_line_note_seen` integer DEFAULT false NOT NULL;