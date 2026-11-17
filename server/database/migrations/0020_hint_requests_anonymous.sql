-- Who asked for hints is no longer stored (README 6 bis.3): the giver is
-- found again by decrypting the draw when the hints arrive.
ALTER TABLE `hint_requests` DROP COLUMN `requester_enc`;--> statement-breakpoint
ALTER TABLE `hint_requests` DROP COLUMN `requester_iv`;