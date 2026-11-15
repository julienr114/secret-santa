-- Draft and invitations become one step, "preparing" (README 22.8).
-- The column's default changes in the schema too, but the table is not
-- rebuilt for it: every insert gives a status, and rebuilding `editions`
-- on D1 would touch every table that references it.
UPDATE `editions` SET `status` = 'preparing' WHERE `status` IN ('draft', 'invitations');
