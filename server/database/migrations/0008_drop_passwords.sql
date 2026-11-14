DROP TABLE `login_attempts`;--> statement-breakpoint
ALTER TABLE `groups` DROP COLUMN `guardian_password_hash`;--> statement-breakpoint
ALTER TABLE `groups` DROP COLUMN `guardian_password_salt`;