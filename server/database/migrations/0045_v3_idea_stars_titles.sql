-- Ticket 152: the stars of an idea, 0 to 3, and the titles of a list
-- (docs/decisions/2026-11-23-des-etoiles-et-des-titres-dans-une-liste.md).
ALTER TABLE `gift_list_ideas` ADD `stars` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `gift_list_ideas` ADD `is_title` integer DEFAULT false NOT NULL;