import {
  sqliteTable,
  text,
  integer,
  uniqueIndex,
  index,
} from 'drizzle-orm/sqlite-core';

// Data model from README section 10. Ids are text (nanoid), dates are ISO
// 8601 UTC strings, booleans are integers. Every query must filter on the
// group, directly or through a join (README 8.5).

export const groups = sqliteTable('groups', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  guardianPasswordHash: text('guardian_password_hash'),
  guardianPasswordSalt: text('guardian_password_salt'),
  rules: text('rules', { mode: 'json' }).notNull().default('{}'),
  createdAt: text('created_at').notNull(),
});

export const persons = sqliteTable(
  'persons',
  {
    id: text('id').primaryKey(),
    groupId: text('group_id')
      .notNull()
      .references(() => groups.id),
    firstName: text('first_name').notNull(),
    lastName: text('last_name'),
    // WhatsApp number in E.164 (+33612345678), used for wa.me links.
    phone: text('phone'),
    pinHash: text('pin_hash'),
    pinSalt: text('pin_salt'),
    pinFailedAttempts: integer('pin_failed_attempts').notNull().default(0),
    pinLockedAt: text('pin_locked_at'),
    active: integer('active', { mode: 'boolean' }).notNull().default(true),
    createdAt: text('created_at').notNull(),
  },
  (t) => [index('persons_group_idx').on(t.groupId)],
);

export const couples = sqliteTable(
  'couples',
  {
    id: text('id').primaryKey(),
    groupId: text('group_id')
      .notNull()
      .references(() => groups.id),
    personAId: text('person_a_id')
      .notNull()
      .references(() => persons.id),
    personBId: text('person_b_id')
      .notNull()
      .references(() => persons.id),
    active: integer('active', { mode: 'boolean' }).notNull().default(true),
    createdAt: text('created_at').notNull(),
    endedAt: text('ended_at'),
  },
  (t) => [index('couples_group_idx').on(t.groupId)],
);

export const manualExclusions = sqliteTable(
  'manual_exclusions',
  {
    id: text('id').primaryKey(),
    groupId: text('group_id')
      .notNull()
      .references(() => groups.id),
    giverId: text('giver_id')
      .notNull()
      .references(() => persons.id),
    receiverId: text('receiver_id')
      .notNull()
      .references(() => persons.id),
    reciprocal: integer('reciprocal', { mode: 'boolean' })
      .notNull()
      .default(false),
  },
  (t) => [index('manual_exclusions_group_idx').on(t.groupId)],
);

export const EDITION_STATUSES = [
  'draft',
  'invitations',
  'drawn',
  'closed',
] as const;

export const editions = sqliteTable(
  'editions',
  {
    id: text('id').primaryKey(),
    groupId: text('group_id')
      .notNull()
      .references(() => groups.id),
    label: text('label').notNull(),
    year: integer('year').notNull(),
    status: text('status', { enum: EDITION_STATUSES })
      .notNull()
      .default('draft'),
    rulesOverride: text('rules_override', { mode: 'json' }),
    rulesSnapshot: text('rules_snapshot', { mode: 'json' }),
    drawnAt: text('drawn_at'),
    closedAt: text('closed_at'),
    createdAt: text('created_at').notNull(),
  },
  (t) => [index('editions_group_idx').on(t.groupId)],
);

export const participations = sqliteTable(
  'participations',
  {
    id: text('id').primaryKey(),
    editionId: text('edition_id')
      .notNull()
      .references(() => editions.id),
    personId: text('person_id')
      .notNull()
      .references(() => persons.id),
    // SHA-256 of the personal token, for lookup.
    tokenHash: text('token_hash').notNull().unique(),
    // The token itself, AES-GCM encrypted, so the guardian can resend it.
    tokenEnc: text('token_enc').notNull(),
    tokenIv: text('token_iv').notNull(),
    // Last time the guardian sent the message (WhatsApp, copy or share).
    messageSentAt: text('message_sent_at'),
    linkCopiedAt: text('link_copied_at'),
    viewCount: integer('view_count').notNull().default(0),
    firstViewedAt: text('first_viewed_at'),
    lastViewedAt: text('last_viewed_at'),
  },
  (t) => [
    uniqueIndex('participations_edition_person_idx').on(
      t.editionId,
      t.personId,
    ),
  ],
);

export const assignments = sqliteTable(
  'assignments',
  {
    id: text('id').primaryKey(),
    editionId: text('edition_id')
      .notNull()
      .references(() => editions.id),
    giverPersonId: text('giver_person_id')
      .notNull()
      .references(() => persons.id),
    // The receiver id is stored encrypted (README 8.3).
    receiverEnc: text('receiver_enc').notNull(),
    receiverIv: text('receiver_iv').notNull(),
    createdAt: text('created_at').notNull(),
  },
  (t) => [
    uniqueIndex('assignments_edition_giver_idx').on(
      t.editionId,
      t.giverPersonId,
    ),
  ],
);

export const wishes = sqliteTable(
  'wishes',
  {
    id: text('id').primaryKey(),
    participationId: text('participation_id')
      .notNull()
      .references(() => participations.id),
    position: integer('position').notNull(),
    label: text('label').notNull(),
    url: text('url'),
    createdAt: text('created_at').notNull(),
  },
  (t) => [index('wishes_participation_idx').on(t.participationId)],
);

export const AUDIT_ACTORS = [
  'participant',
  'guardian',
  'super_admin',
  'system',
] as const;

export const auditLog = sqliteTable(
  'audit_log',
  {
    id: text('id').primaryKey(),
    groupId: text('group_id')
      .notNull()
      .references(() => groups.id),
    editionId: text('edition_id').references(() => editions.id),
    type: text('type').notNull(),
    personId: text('person_id').references(() => persons.id),
    actor: text('actor', { enum: AUDIT_ACTORS }).notNull(),
    // Counters, reasons. Never a result (README section 9).
    meta: text('meta', { mode: 'json' }),
    createdAt: text('created_at').notNull(),
  },
  (t) => [index('audit_log_group_created_idx').on(t.groupId, t.createdAt)],
);

export const loginAttempts = sqliteTable(
  'login_attempts',
  {
    id: text('id').primaryKey(),
    // Group slug or "super".
    scope: text('scope').notNull(),
    ipHash: text('ip_hash').notNull(),
    createdAt: text('created_at').notNull(),
  },
  (t) => [index('login_attempts_scope_idx').on(t.scope, t.createdAt)],
);

export type GroupRow = typeof groups.$inferSelect;
export type PersonRow = typeof persons.$inferSelect;
export type CoupleRow = typeof couples.$inferSelect;
export type ExclusionRow = typeof manualExclusions.$inferSelect;
export type EditionRow = typeof editions.$inferSelect;
export type ParticipationRow = typeof participations.$inferSelect;
export type AuditRowInsert = typeof auditLog.$inferInsert;
