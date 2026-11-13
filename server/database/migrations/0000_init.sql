CREATE TABLE `assignments` (
	`id` text PRIMARY KEY NOT NULL,
	`edition_id` text NOT NULL,
	`giver_person_id` text NOT NULL,
	`receiver_enc` text NOT NULL,
	`receiver_iv` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`edition_id`) REFERENCES `editions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`giver_person_id`) REFERENCES `persons`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `assignments_edition_giver_idx` ON `assignments` (`edition_id`,`giver_person_id`);--> statement-breakpoint
CREATE TABLE `audit_log` (
	`id` text PRIMARY KEY NOT NULL,
	`group_id` text NOT NULL,
	`edition_id` text,
	`type` text NOT NULL,
	`person_id` text,
	`actor` text NOT NULL,
	`meta` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`edition_id`) REFERENCES `editions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`person_id`) REFERENCES `persons`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `audit_log_group_created_idx` ON `audit_log` (`group_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `couples` (
	`id` text PRIMARY KEY NOT NULL,
	`group_id` text NOT NULL,
	`person_a_id` text NOT NULL,
	`person_b_id` text NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` text NOT NULL,
	`ended_at` text,
	FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`person_a_id`) REFERENCES `persons`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`person_b_id`) REFERENCES `persons`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `couples_group_idx` ON `couples` (`group_id`);--> statement-breakpoint
CREATE TABLE `editions` (
	`id` text PRIMARY KEY NOT NULL,
	`group_id` text NOT NULL,
	`label` text NOT NULL,
	`year` integer NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`rules_override` text,
	`rules_snapshot` text,
	`drawn_at` text,
	`closed_at` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `editions_group_idx` ON `editions` (`group_id`);--> statement-breakpoint
CREATE TABLE `groups` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`guardian_password_hash` text,
	`guardian_password_salt` text,
	`rules` text DEFAULT '{}' NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `groups_slug_unique` ON `groups` (`slug`);--> statement-breakpoint
CREATE TABLE `login_attempts` (
	`id` text PRIMARY KEY NOT NULL,
	`scope` text NOT NULL,
	`ip_hash` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `login_attempts_scope_idx` ON `login_attempts` (`scope`,`created_at`);--> statement-breakpoint
CREATE TABLE `manual_exclusions` (
	`id` text PRIMARY KEY NOT NULL,
	`group_id` text NOT NULL,
	`giver_id` text NOT NULL,
	`receiver_id` text NOT NULL,
	`reciprocal` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`giver_id`) REFERENCES `persons`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`receiver_id`) REFERENCES `persons`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `manual_exclusions_group_idx` ON `manual_exclusions` (`group_id`);--> statement-breakpoint
CREATE TABLE `participations` (
	`id` text PRIMARY KEY NOT NULL,
	`edition_id` text NOT NULL,
	`person_id` text NOT NULL,
	`token_hash` text NOT NULL,
	`token_enc` text NOT NULL,
	`token_iv` text NOT NULL,
	`message_sent_at` text,
	`link_copied_at` text,
	`view_count` integer DEFAULT 0 NOT NULL,
	`first_viewed_at` text,
	`last_viewed_at` text,
	FOREIGN KEY (`edition_id`) REFERENCES `editions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`person_id`) REFERENCES `persons`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `participations_token_hash_unique` ON `participations` (`token_hash`);--> statement-breakpoint
CREATE UNIQUE INDEX `participations_edition_person_idx` ON `participations` (`edition_id`,`person_id`);--> statement-breakpoint
CREATE TABLE `persons` (
	`id` text PRIMARY KEY NOT NULL,
	`group_id` text NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text,
	`phone` text,
	`pin_hash` text,
	`pin_salt` text,
	`pin_failed_attempts` integer DEFAULT 0 NOT NULL,
	`pin_locked_at` text,
	`active` integer DEFAULT true NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `persons_group_idx` ON `persons` (`group_id`);--> statement-breakpoint
CREATE TABLE `wishes` (
	`id` text PRIMARY KEY NOT NULL,
	`participation_id` text NOT NULL,
	`position` integer NOT NULL,
	`label` text NOT NULL,
	`url` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`participation_id`) REFERENCES `participations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `wishes_participation_idx` ON `wishes` (`participation_id`);