-- Ticket 121 (README 22.22, « Me prévenir »): the emails of an account
-- follow its choice, « Un résumé le matin » for every account to begin
-- with. A news may go by email, once; those of before never go (nobody
-- receives thirty days of news at once), and the kinds that have an
-- email of their own, or none yet (new ideas, ticket 122), never go as a
-- news.
ALTER TABLE `accounts` ADD `email_news` text DEFAULT 'summary' NOT NULL;--> statement-breakpoint
ALTER TABLE `accounts` ADD `summary_sent_on` text;--> statement-breakpoint
ALTER TABLE `news` ADD `mailable` integer DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `news` ADD `emailed_at` text;--> statement-breakpoint
CREATE INDEX `news_mail_idx` ON `news` (`emailed_at`,`seen_at`);--> statement-breakpoint
UPDATE `news` SET `emailed_at` = strftime('%Y-%m-%dT%H:%M:%fZ', 'now');--> statement-breakpoint
UPDATE `news` SET `mailable` = false
WHERE `kind` IN ('hint_request', 'list_invite', 'reminder', 'new_ideas', 'receiver_ideas');
