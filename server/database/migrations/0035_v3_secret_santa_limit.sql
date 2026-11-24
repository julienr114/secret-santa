-- V3 (ticket 105, docs/spec/v3/migration.md, « Les demandes »): no more
-- requests to organise. A request still waiting is granted by the change
-- itself, since organising needs nothing any more; the table goes. The
-- group quota becomes the limit of Secret Santa in progress an account
-- organises: 3 for everyone.
DROP TABLE `group_requests`;--> statement-breakpoint
ALTER TABLE `accounts` ADD `secret_santa_limit` integer DEFAULT 3 NOT NULL;--> statement-breakpoint
ALTER TABLE `accounts` DROP COLUMN `group_quota`;