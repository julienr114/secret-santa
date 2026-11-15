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
  rules: text('rules', { mode: 'json' }).notNull().default('{}'),
  // Invitation link to join the group: its code (null when closed), the
  // last day it works (optional), how many may still join by it, and the
  // organiser's words on its page.
  inviteCode: text('invite_code').unique(),
  inviteUntil: text('invite_until'),
  invitePlaces: integer('invite_places'),
  // Words of the organiser, shown on the invitation page.
  inviteMessage: text('invite_message'),
  // The account that created the group: it counts against its quota.
  createdBy: text('created_by'),
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
    // Optional: where their link is emailed, and the address they log in
    // with to find their draws.
    email: text('email'),
    // Preferred language: their personal page, messages and emails.
    language: text('language', { enum: ['fr', 'en', 'de'] })
      .notNull()
      .default('fr'),
    // Christmas emoji and palette colour, see server/utils/avatars.ts.
    avatarEmoji: text('avatar_emoji'),
    avatarColor: text('avatar_color'),
    active: integer('active', { mode: 'boolean' }).notNull().default(true),
    createdAt: text('created_at').notNull(),
  },
  (t) => [index('persons_group_idx').on(t.groupId)],
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

export const EDITION_STATUSES = ['preparing', 'drawn', 'closed'] as const;

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
      .default('preparing'),
    rulesOverride: text('rules_override', { mode: 'json' }),
    rulesSnapshot: text('rules_snapshot', { mode: 'json' }),
    // Previous-year pairs the guardian allowed again for this edition.
    historyWaivers: text('history_waivers', { mode: 'json' }),
    // When the organisers were reminded that the exchange is near.
    reminderSentAt: text('reminder_sent_at'),
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

// --- Accounts (plan v2, README 22.5) ---------------------------------------
// A person who logs in: by a magic link sent to their email, never a
// password. A super-admin is an account like the others, with a flag.

export const accounts = sqliteTable('accounts', {
  id: text('id').primaryKey(),
  // Lower case, unique.
  email: text('email').notNull().unique(),
  // The profile: defaults for the person created when the account
  // creates a group. Changing that person never changes the profile.
  firstName: text('first_name'),
  lastName: text('last_name'),
  avatarEmoji: text('avatar_emoji'),
  avatarColor: text('avatar_color'),
  isSuperAdmin: integer('is_super_admin', { mode: 'boolean' })
    .notNull()
    .default(false),
  // How many groups the account may create; nobody may by default.
  groupQuota: integer('group_quota').notNull().default(0),
  language: text('language', { enum: ['fr', 'en', 'de'] })
    .notNull()
    .default('fr'),
  createdAt: text('created_at').notNull(),
  lastLoginAt: text('last_login_at'),
  // A disabled account cannot log in and its sessions stop working.
  disabledAt: text('disabled_at'),
});

export const loginLinks = sqliteTable(
  'login_links',
  {
    id: text('id').primaryKey(),
    accountId: text('account_id')
      .notNull()
      .references(() => accounts.id),
    // SHA-256 of the token: the token itself only exists in the email.
    tokenHash: text('token_hash').notNull().unique(),
    createdAt: text('created_at').notNull(),
    expiresAt: text('expires_at').notNull(),
    usedAt: text('used_at'),
    // Who asked, hashed, for throttling.
    ipHash: text('ip_hash').notNull(),
  },
  (t) => [
    index('login_links_account_idx').on(t.accountId, t.createdAt),
    index('login_links_ip_idx').on(t.ipHash, t.createdAt),
  ],
);

export const sessions = sqliteTable(
  'sessions',
  {
    id: text('id').primaryKey(),
    accountId: text('account_id')
      .notNull()
      .references(() => accounts.id),
    createdAt: text('created_at').notNull(),
    lastSeenAt: text('last_seen_at').notNull(),
    expiresAt: text('expires_at').notNull(),
    revokedAt: text('revoked_at'),
    // Shown on "my devices" so that the owner recognises a session.
    userAgent: text('user_agent'),
  },
  (t) => [index('sessions_account_idx').on(t.accountId)],
);

// The organisers of a group: accounts that may manage it. Super-admins
// manage every group without being listed here.
export const groupMembers = sqliteTable(
  'group_members',
  {
    groupId: text('group_id')
      .notNull()
      .references(() => groups.id),
    accountId: text('account_id')
      .notNull()
      .references(() => accounts.id),
    createdAt: text('created_at').notNull(),
  },
  (t) => [
    uniqueIndex('group_members_pair_idx').on(t.groupId, t.accountId),
    index('group_members_account_idx').on(t.accountId),
  ],
);

export const GROUP_REQUEST_STATUSES = [
  'pending',
  'approved',
  'refused',
] as const;

// An account asks for the right to create a group (README 22.2): a
// super-admin approves it by raising the account's quota, or refuses.
export const groupRequests = sqliteTable(
  'group_requests',
  {
    id: text('id').primaryKey(),
    accountId: text('account_id')
      .notNull()
      .references(() => accounts.id),
    // What the group is for, in the asker's words.
    message: text('message').notNull(),
    status: text('status', { enum: GROUP_REQUEST_STATUSES })
      .notNull()
      .default('pending'),
    createdAt: text('created_at').notNull(),
    decidedAt: text('decided_at'),
    decidedBy: text('decided_by').references(() => accounts.id),
  },
  (t) => [
    index('group_requests_account_idx').on(t.accountId, t.createdAt),
    index('group_requests_status_idx').on(t.status),
  ],
);

export type GroupRequestRow = typeof groupRequests.$inferSelect;
export type AccountRow = typeof accounts.$inferSelect;
export type LoginLinkRow = typeof loginLinks.$inferSelect;
export type SessionRow = typeof sessions.$inferSelect;
export type GroupRow = typeof groups.$inferSelect;
export type PersonRow = typeof persons.$inferSelect;
export type ExclusionRow = typeof manualExclusions.$inferSelect;
export type EditionRow = typeof editions.$inferSelect;
export type ParticipationRow = typeof participations.$inferSelect;
export type AuditRowInsert = typeof auditLog.$inferInsert;
