import {
  sqliteTable,
  text,
  integer,
  uniqueIndex,
  index,
} from 'drizzle-orm/sqlite-core';
import { DRAW_MODES } from '../utils/answers';
import { GUESS_MODES } from '../utils/guesses';

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
    // When the organiser revealed who gave to whom (README 22.9, lot 13):
    // for good, and before closing.
    revealedAt: text('revealed_at'),
    // Drawn by the app, or already elsewhere: then each participant says
    // who they give to (README 22.12, lot 17).
    drawMode: text('draw_mode', { enum: DRAW_MODES }).notNull().default('app'),
    // « Devine qui » (README 22.17, lot 19): the mode, the end of the
    // guesses as an instant and the time zone it was chosen in (for the
    // messages), the one reminder, the end and the email of the results.
    guessMode: text('guess_mode', { enum: GUESS_MODES })
      .notNull()
      .default('none'),
    guessEndsAt: text('guess_ends_at'),
    guessTimeZone: text('guess_time_zone'),
    guessReminderSentAt: text('guess_reminder_sent_at'),
    guessesClosedAt: text('guesses_closed_at'),
    guessResultsSentAt: text('guess_results_sent_at'),
    // Correction 15 (README 22.17, « Donner envie de jouer, et rappeler »):
    // the automatic reminder (a setting, on by default) and when it went
    // or was settled; when the game was turned on; when the organisers'
    // point (five days before) and end emails went.
    guessAutoReminder: integer('guess_auto_reminder', { mode: 'boolean' })
      .notNull()
      .default(true),
    guessAutoReminderSentAt: text('guess_auto_reminder_sent_at'),
    guessEnabledAt: text('guess_enabled_at'),
    guessPointSentAt: text('guess_point_sent_at'),
    guessEndSentAt: text('guess_end_sent_at'),
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
    // When the participant last opened the journal from their page: the
    // alerts since then are counted on it (lot 12 of the redesign).
    journalSeenAt: text('journal_seen_at'),
    // When the participant last saved hints (question, text, idea, reuse),
    // for their giver's « nouvelles pistes » (lot 16 bis).
    hintsUpdatedAt: text('hints_updated_at'),
    // When their giver was emailed that hints arrived: once per draw.
    hintsAnnouncedAt: text('hints_announced_at'),
    // When they watched the results of « Devine qui » (lot 19).
    guessResultsSeenAt: text('guess_results_seen_at'),
    // « Je passe mon tour » (Correction 15): no reminder, out of the counts.
    guessSkippedAt: text('guess_skipped_at'),
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

// Gift hints (README 22.11): the six answers of « Moi et les cadeaux », as
// fixed values ('first', 'second', 'both'; null without an answer), never
// text, and the three free texts. One row per participation, once written.
// The precise ideas stay in `wishes`.
export const giftPortraits = sqliteTable('gift_portraits', {
  participationId: text('participation_id')
    .primaryKey()
    .references(() => participations.id),
  usefulOrSurprising: text('useful_or_surprising'),
  objectOrMoment: text('object_or_moment'),
  keepOrConsume: text('keep_or_consume'),
  selfOrShared: text('self_or_shared'),
  secondHand: text('second_hand'),
  surprise: text('surprise'),
  lately: text('lately'),
  wouldHelp: text('would_help'),
  avoid: text('avoid'),
  updatedAt: text('updated_at').notNull(),
});

// « Lui demander des pistes »: at most one per receiver and per draw. Who
// asked is not stored: when the hints arrive, the giver is found again by
// decrypting the draw (README 6 bis.3, decided by Julien on 17 November
// 2026).
export const hintRequests = sqliteTable(
  'hint_requests',
  {
    receiverParticipationId: text('receiver_participation_id')
      .primaryKey()
      .references(() => participations.id),
    editionId: text('edition_id')
      .notNull()
      .references(() => editions.id),
    requestedAt: text('requested_at').notNull(),
    // When the hints arrived and the one who asked was told.
    answeredAt: text('answered_at'),
  },
  (t) => [index('hint_requests_edition_idx').on(t.editionId)],
);

// « Devine qui » (README 22.17): `guesser` thinks `giver` gives to
// `recipient`, by person. Never sent to anyone else before the reveal.
export const guesses = sqliteTable(
  'guesses',
  {
    id: text('id').primaryKey(),
    editionId: text('edition_id')
      .notNull()
      .references(() => editions.id),
    guesserPersonId: text('guesser_person_id')
      .notNull()
      .references(() => persons.id),
    recipientPersonId: text('recipient_person_id')
      .notNull()
      .references(() => persons.id),
    giverPersonId: text('giver_person_id')
      .notNull()
      .references(() => persons.id),
    updatedAt: text('updated_at').notNull(),
    // The persons named on this line before the current answer, oldest
    // first (Correction 14): « La girouette » and « Si près du but ». Empty
    // for guesses made before.
    previousGiverIds: text('previous_giver_ids', { mode: 'json' })
      .$type<string[]>()
      .notNull()
      .default([]),
  },
  (t) => [
    uniqueIndex('guesses_edition_guesser_recipient_idx').on(
      t.editionId,
      t.guesserPersonId,
      t.recipientPersonId,
    ),
  ],
);

// Who each participant says they give to, for a draw made elsewhere
// (README 22.12). The receiver is a person, encrypted like a draw's; never
// sent to the organiser. Gone once validated (then a draw) or abandoned.
export const drawAnswers = sqliteTable(
  'draw_answers',
  {
    participationId: text('participation_id')
      .primaryKey()
      .references(() => participations.id),
    editionId: text('edition_id')
      .notNull()
      .references(() => editions.id),
    receiverEnc: text('receiver_enc').notNull(),
    receiverIv: text('receiver_iv').notNull(),
    answeredAt: text('answered_at').notNull(),
  },
  (t) => [index('draw_answers_edition_idx').on(t.editionId)],
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
    // « Me tenir au courant » of « Devine qui » (Correction 15): each
    // organiser sets their own, on by default.
    guessNews: integer('guess_news', { mode: 'boolean' })
      .notNull()
      .default(true),
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
    // The super-admin's words with the answer, in its email and on the
    // asker's home (lot 12 of the redesign).
    decisionNote: text('decision_note'),
  },
  (t) => [
    index('group_requests_account_idx').on(t.accountId, t.createdAt),
    index('group_requests_status_idx').on(t.status),
  ],
);

// Gift lists (README 22.19, lot 21), apart from the groups and the draws:
// every row hangs from the account that holds the list.

// The people of my family, kept from one list to the next on the account.
// A person is not an account.
export const familyMembers = sqliteTable(
  'family_members',
  {
    id: text('id').primaryKey(),
    accountId: text('account_id')
      .notNull()
      .references(() => accounts.id),
    firstName: text('first_name').notNull(),
    avatarEmoji: text('avatar_emoji').notNull(),
    avatarColor: text('avatar_color').notNull(),
    // The holder themself, made from their profile: « Moi ».
    isSelf: integer('is_self', { mode: 'boolean' }).notNull().default(false),
    // Practical details: what the family always asks.
    birthDate: text('birth_date'),
    clothingSize: text('clothing_size'),
    shoeSize: text('shoe_size'),
    // Their tastes: the questions and texts of the gift hints (22.11).
    answers: text('answers', { mode: 'json' }).$type<
      Record<string, string | null>
    >(),
    texts: text('texts', { mode: 'json' }).$type<
      Record<string, string | null>
    >(),
    // Their own account (lot 25): the address I gave for them, lower
    // case, and the account it belongs to once it exists. Linked, they
    // write their own ideas on the lists they are on.
    email: text('email'),
    linkedAccountId: text('linked_account_id').references(() => accounts.id),
    createdAt: text('created_at').notNull(),
  },
  (t) => [
    index('family_members_account_idx').on(t.accountId),
    index('family_members_linked_idx').on(t.linkedAccountId),
    index('family_members_email_idx').on(t.email),
  ],
);

export const giftLists = sqliteTable(
  'gift_lists',
  {
    id: text('id').primaryKey(),
    accountId: text('account_id')
      .notNull()
      .references(() => accounts.id),
    iconEmoji: text('icon_emoji').notNull(),
    iconColor: text('icon_color').notNull(),
    title: text('title').notNull().default(''),
    eventDate: text('event_date'),
    // The word for the family: the starting text while untouched, the
    // holder's own once changed, nothing once erased.
    note: text('note'),
    noteEdited: integer('note_edited', { mode: 'boolean' })
      .notNull()
      .default(false),
    // The public link, made at the first share; a new one replaces it.
    shareToken: text('share_token').unique(),
    sharedAt: text('shared_at'),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (t) => [index('gift_lists_account_idx').on(t.accountId)],
);

// Those who hold a list (lot 25): several accounts, all equal; the one
// who created it is among them like the others. `gift_lists.account_id`
// only says who created it.
export const giftListHolders = sqliteTable(
  'gift_list_holders',
  {
    id: text('id').primaryKey(),
    listId: text('list_id')
      .notNull()
      .references(() => giftLists.id),
    accountId: text('account_id')
      .notNull()
      .references(() => accounts.id),
    createdAt: text('created_at').notNull(),
  },
  (t) => [
    uniqueIndex('gift_list_holders_list_account_idx').on(t.listId, t.accountId),
    index('gift_list_holders_account_idx').on(t.accountId),
  ],
);

// Invitations to hold a list, waiting, by address (lower case): the list
// joins those of the invited account the next time it opens its lists.
export const giftListInvites = sqliteTable(
  'gift_list_invites',
  {
    id: text('id').primaryKey(),
    listId: text('list_id')
      .notNull()
      .references(() => giftLists.id),
    email: text('email').notNull(),
    invitedBy: text('invited_by')
      .notNull()
      .references(() => accounts.id),
    createdAt: text('created_at').notNull(),
  },
  (t) => [
    uniqueIndex('gift_list_invites_list_email_idx').on(t.listId, t.email),
    index('gift_list_invites_email_idx').on(t.email),
  ],
);

// The people on a list, in their order.
export const giftListPeople = sqliteTable(
  'gift_list_people',
  {
    id: text('id').primaryKey(),
    listId: text('list_id')
      .notNull()
      .references(() => giftLists.id),
    memberId: text('member_id')
      .notNull()
      .references(() => familyMembers.id),
    position: integer('position').notNull(),
  },
  (t) => [
    uniqueIndex('gift_list_people_list_member_idx').on(t.listId, t.memberId),
  ],
);

// One idea of a person on a list: a line of text and maybe a link.
export const giftListIdeas = sqliteTable(
  'gift_list_ideas',
  {
    id: text('id').primaryKey(),
    listId: text('list_id')
      .notNull()
      .references(() => giftLists.id),
    listPersonId: text('list_person_id')
      .notNull()
      .references(() => giftListPeople.id),
    text: text('text').notNull(),
    url: text('url'),
    position: integer('position').notNull(),
    createdAt: text('created_at').notNull(),
  },
  (t) => [index('gift_list_ideas_list_idx').on(t.listId)],
);

// Who gives what on a list (lot 22): one row per account and idea, alone
// or with others. The one who proposed a group leads it (the oldest row).
export const giftClaims = sqliteTable(
  'gift_claims',
  {
    id: text('id').primaryKey(),
    listId: text('list_id')
      .notNull()
      .references(() => giftLists.id),
    ideaId: text('idea_id')
      .notNull()
      .references(() => giftListIdeas.id),
    accountId: text('account_id')
      .notNull()
      .references(() => accounts.id),
    mode: text('mode', { enum: ['alone', 'group'] }).notNull(),
    // Hidden from the holder: « Anonyme ».
    anonymous: integer('anonymous', { mode: 'boolean' })
      .notNull()
      .default(false),
    // A word for the others of a group.
    note: text('note'),
    // On the row of the one who leads a group: nobody may join any more.
    closed: integer('closed', { mode: 'boolean' }).notNull().default(false),
    createdAt: text('created_at').notNull(),
  },
  (t) => [
    uniqueIndex('gift_claims_idea_account_idx').on(t.ideaId, t.accountId),
    index('gift_claims_list_idx').on(t.listId),
  ],
);

// « J'offre autre chose à Léo »: a gift not on the list, in two words.
export const giftOffList = sqliteTable(
  'gift_off_list',
  {
    id: text('id').primaryKey(),
    listId: text('list_id')
      .notNull()
      .references(() => giftLists.id),
    listPersonId: text('list_person_id')
      .notNull()
      .references(() => giftListPeople.id),
    accountId: text('account_id')
      .notNull()
      .references(() => accounts.id),
    text: text('text').notNull(),
    anonymous: integer('anonymous', { mode: 'boolean' })
      .notNull()
      .default(false),
    createdAt: text('created_at').notNull(),
  },
  (t) => [index('gift_off_list_list_idx').on(t.listId)],
);

// A list opened while logged in: it shows in the « Listes » tab, with the
// ideas written since the last visit.
export const giftListVisits = sqliteTable(
  'gift_list_visits',
  {
    listId: text('list_id')
      .notNull()
      .references(() => giftLists.id),
    accountId: text('account_id')
      .notNull()
      .references(() => accounts.id),
    lastSeenAt: text('last_seen_at').notNull(),
  },
  (t) => [
    uniqueIndex('gift_list_visits_list_account_idx').on(t.listId, t.accountId),
    index('gift_list_visits_account_idx').on(t.accountId),
  ],
);

export type FamilyMemberRow = typeof familyMembers.$inferSelect;
export type GiftListRow = typeof giftLists.$inferSelect;
export type GiftListIdeaRow = typeof giftListIdeas.$inferSelect;
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
