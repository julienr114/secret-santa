-- Ticket 129 (V3Admin, « À traiter et à surveiller », « Les plafonds »):
-- what the app counts by day, for the dashboard and the caps. The two new
-- switches (« Suspendre les emails », « Suspendre les inscriptions ») are
-- rows of `app_switches`, which needs no change.
CREATE TABLE `app_counters` (
	`day` text NOT NULL,
	`name` text NOT NULL,
	`count` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY(`day`, `name`)
);
