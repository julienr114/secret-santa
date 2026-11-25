import {
  sqliteTable,
  text,
  integer,
  uniqueIndex,
  index,
  primaryKey,
} from 'drizzle-orm/sqlite-core';
import { DRAW_MODES } from '../utils/answers';
import { GUESS_MODES } from '../utils/guesses';
import { PARTY_CATEGORIES } from '../../shared/utils/categories';
import { EMAIL_NEWS, NEWS_KINDS, NEWS_TARGETS } from '../../shared/utils/news';
import { COUNTER_NAMES } from '../utils/spend';

// Data model from README section 10, in the shape of the V3
// (docs/spec/v3/modele.md): a party (the group of before), its years, the
// Secret Santas of a year (the editions of before), and the lists put in
// parties. Ids are text (nanoid), dates are ISO 8601 UTC strings, booleans
// are integers. Every query must filter on the party, directly or through
// a join (README 8.5).

export const parties = sqliteTable('parties', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  // docs/spec/v3/categories.md: the starting settings, nothing forbidden.
  category: text('category', { enum: PARTY_CATEGORIES })
    .notNull()
    .default('christmas'),
  // The icon of the party and of its lists; null: its category's.
  iconEmoji: text('icon_emoji'),
  iconColor: text('icon_color'),
  // The usual day, `MM-DD`, and whether it comes back each year.
  usualDate: text('usual_date'),
  recurring: integer('recurring', { mode: 'boolean' }).notNull().default(false),
  // A birthday: the one of my people it is for (ticket 118), or null
  // (« Quelqu'un d'autre », « Personne »). No foreign key: the person may
  // be deleted, the event keeps its name.
  forMemberId: text('for_member_id'),
  // Made for a list kept apart before the V3 (ticket 101): hidden from
  // the screens of a group until the pages of a party come (ticket 104).
  fromList: integer('from_list', { mode: 'boolean' }).notNull().default(false),
  // The party's own settings (notifyJoined), and the starting values of
  // its next Secret Santa.
  rules: text('rules', { mode: 'json' }).notNull().default('{}'),
  // The account that created the party: it counts against its quota.
  createdBy: text('created_by'),
  createdAt: text('created_at').notNull(),
  // The super-admin cut the emails its organisers send (ticket 130).
  emailsOff: integer('emails_off', { mode: 'boolean' })
    .notNull()
    .default(false),
});

export const persons = sqliteTable(
  'persons',
  {
    id: text('id').primaryKey(),
    partyId: text('party_id')
      .notNull()
      .references(() => parties.id),
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
  (t) => [index('persons_party_idx').on(t.partyId)],
);

export const manualExclusions = sqliteTable(
  'manual_exclusions',
  {
    id: text('id').primaryKey(),
    partyId: text('party_id')
      .notNull()
      .references(() => parties.id),
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
  (t) => [index('manual_exclusions_party_idx').on(t.partyId)],
);

// The year of a party (« Noël 2026 »), with its real date: what its Secret
// Santas and its lists hang from.
export const partyYears = sqliteTable(
  'party_years',
  {
    id: text('id').primaryKey(),
    partyId: text('party_id')
      .notNull()
      .references(() => parties.id),
    year: integer('year').notNull(),
    // An ISO day; null while nobody gave it.
    date: text('date'),
    createdAt: text('created_at').notNull(),
  },
  (t) => [uniqueIndex('party_years_party_year_idx').on(t.partyId, t.year)],
);

export const SECRET_SANTA_STATUSES = ['preparing', 'drawn', 'closed'] as const;

export const secretSantas = sqliteTable(
  'secret_santas',
  {
    id: text('id').primaryKey(),
    partyId: text('party_id')
      .notNull()
      .references(() => parties.id),
    yearId: text('year_id')
      .notNull()
      .references(() => partyYears.id),
    label: text('label').notNull(),
    status: text('status', { enum: SECRET_SANTA_STATUSES })
      .notNull()
      .default('preparing'),
    // Its draw settings, complete: they no longer depend on the party.
    rules: text('rules', { mode: 'json' }).notNull().default('{}'),
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
    // Its invitation link (ticket 116; an event has none): its code (null
    // when closed), the last day it works (optional), how many may still
    // sign up by it, and the organiser's words on its page.
    inviteCode: text('invite_code').unique(),
    inviteUntil: text('invite_until'),
    invitePlaces: integer('invite_places'),
    inviteMessage: text('invite_message'),
    createdAt: text('created_at').notNull(),
  },
  (t) => [index('secret_santas_party_idx').on(t.partyId)],
);

export const participations = sqliteTable(
  'participations',
  {
    id: text('id').primaryKey(),
    secretSantaId: text('secret_santa_id')
      .notNull()
      .references(() => secretSantas.id),
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
    // « Ma liste de cadeaux », among the hints (lot 27 ter): the gift list
    // the one who gives to me is shown a link to. No foreign key: the
    // list may be deleted meanwhile, and the link then shows nowhere.
    giftListId: text('gift_list_id'),
  },
  (t) => [
    uniqueIndex('participations_secret_santa_person_idx').on(
      t.secretSantaId,
      t.personId,
    ),
  ],
);

// By where each member came into an event (ticket 117, docs/decisions/
// 2026-11-21-on-entre-par-un-secret-santa-ou-par-une-liste.md): one of
// its Secret Santa, or one of its lists. Nobody is added to an event
// itself. One row per way in; a member may have both, or none (those of
// before ticket 117 who never took part). No foreign key: a Secret Santa
// or a list gone since simply says nothing.
export const memberEntries = sqliteTable(
  'member_entries',
  {
    id: text('id').primaryKey(),
    partyId: text('party_id').notNull(),
    personId: text('person_id').notNull(),
    secretSantaId: text('secret_santa_id'),
    listId: text('list_id'),
    createdAt: text('created_at').notNull(),
  },
  (t) => [
    index('member_entries_party_idx').on(t.partyId),
    uniqueIndex('member_entries_person_santa_idx').on(
      t.personId,
      t.secretSantaId,
    ),
    uniqueIndex('member_entries_person_list_idx').on(t.personId, t.listId),
  ],
);

export const assignments = sqliteTable(
  'assignments',
  {
    id: text('id').primaryKey(),
    secretSantaId: text('secret_santa_id')
      .notNull()
      .references(() => secretSantas.id),
    giverPersonId: text('giver_person_id')
      .notNull()
      .references(() => persons.id),
    // The receiver id is stored encrypted (README 8.3).
    receiverEnc: text('receiver_enc').notNull(),
    receiverIv: text('receiver_iv').notNull(),
    createdAt: text('created_at').notNull(),
  },
  (t) => [
    uniqueIndex('assignments_secret_santa_giver_idx').on(
      t.secretSantaId,
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
    secretSantaId: text('secret_santa_id')
      .notNull()
      .references(() => secretSantas.id),
    requestedAt: text('requested_at').notNull(),
    // When the hints arrived and the one who asked was told.
    answeredAt: text('answered_at'),
  },
  (t) => [index('hint_requests_secret_santa_idx').on(t.secretSantaId)],
);

// « Devine qui » (README 22.17): `guesser` thinks `giver` gives to
// `recipient`, by person. Never sent to anyone else before the reveal.
export const guesses = sqliteTable(
  'guesses',
  {
    id: text('id').primaryKey(),
    secretSantaId: text('secret_santa_id')
      .notNull()
      .references(() => secretSantas.id),
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
    uniqueIndex('guesses_secret_santa_guesser_recipient_idx').on(
      t.secretSantaId,
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
    secretSantaId: text('secret_santa_id')
      .notNull()
      .references(() => secretSantas.id),
    receiverEnc: text('receiver_enc').notNull(),
    receiverIv: text('receiver_iv').notNull(),
    answeredAt: text('answered_at').notNull(),
  },
  (t) => [index('draw_answers_secret_santa_idx').on(t.secretSantaId)],
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
    partyId: text('party_id')
      .notNull()
      .references(() => parties.id),
    secretSantaId: text('secret_santa_id').references(() => secretSantas.id),
    type: text('type').notNull(),
    personId: text('person_id').references(() => persons.id),
    actor: text('actor', { enum: AUDIT_ACTORS }).notNull(),
    // Counters, reasons. Never a result (README section 9).
    meta: text('meta', { mode: 'json' }),
    createdAt: text('created_at').notNull(),
  },
  (t) => [index('audit_log_party_created_idx').on(t.partyId, t.createdAt)],
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
  // How many Secret Santa in progress the account may organise at once
  // (docs/spec/v3/modele.md, « Les limites »); a super-admin may change it.
  secretSantaLimit: integer('secret_santa_limit').notNull().default(3),
  language: text('language', { enum: ['fr', 'en', 'de'] })
    .notNull()
    .default('fr'),
  createdAt: text('created_at').notNull(),
  lastLoginAt: text('last_login_at'),
  // A disabled account cannot log in and its sessions stop working.
  disabledAt: text('disabled_at'),
  // The visit of a new list, seen or skipped, on any device (ticket 149):
  // one visit per account, whichever.
  listTourSeen: integer('list_tour_seen', { mode: 'boolean' })
    .notNull()
    .default(false),
  // The note on the first line, once the first person is added to a list
  // made from « Créer » (ticket 149, V3ListeVisiteIdee).
  firstLineNoteSeen: integer('first_line_note_seen', { mode: 'boolean' })
    .notNull()
    .default(false),
  // « Me prévenir », « Par email » (ticket 121, README 22.22): a summary
  // in the morning, at once, or no email but the login ones.
  emailNews: text('email_news', { enum: EMAIL_NEWS })
    .notNull()
    .default('summary'),
  // The day (« 2026-11-24 ») of the last morning summary.
  summarySentOn: text('summary_sent_on'),
});

// The super-admin's emergency switches (docs/spec/v3/administration.md,
// « En cas d'urgence »), one row per switch once it has been touched: off
// without a row. « Suspendre les nouveaux Secret Santa » (ticket 109),
// « Suspendre les emails » and « Suspendre les inscriptions » (ticket 129).
export const appSwitches = sqliteTable('app_switches', {
  name: text('name', {
    enum: ['new_secret_santas', 'emails', 'signups'],
  }).primaryKey(),
  on: integer('on', { mode: 'boolean' }).notNull().default(false),
  updatedAt: text('updated_at').notNull(),
});

// What the app counts by day, for the dashboard (ticket 129, V3Admin):
// emails sent and rejected, requests refused for their rate, failed
// logins, server errors, and the warnings already given. `day` is
// « 2026-11-24 »; the month adds its days up.
export const appCounters = sqliteTable(
  'app_counters',
  {
    day: text('day').notNull(),
    name: text('name', { enum: COUNTER_NAMES }).notNull(),
    count: integer('count').notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.day, t.name] })],
);

// « Ne plus recevoir d'emails » (ticket 130, README 22.25): the addresses
// that receive nothing, by their print (with the pepper of the server),
// never in clear; why (the person, an address that does not exist, a
// complaint), and since when.
export const emailBlocks = sqliteTable('email_blocks', {
  emailPrint: text('email_print').primaryKey(),
  cause: text('cause', { enum: ['person', 'bounce', 'complaint'] }).notNull(),
  createdAt: text('created_at').notNull(),
});

// The addresses already written to, by their print: the first email to
// an address says who gave it and what is known of it (ticket 130).
export const emailSeen = sqliteTable('email_seen', {
  emailPrint: text('email_print').primaryKey(),
  firstAt: text('first_at').notNull(),
});

// « Signaler cet envoi » (ticket 130): an email an organiser sent, which
// its reader found wrong; by event and by account, for the super-admin.
export const emailReports = sqliteTable(
  'email_reports',
  {
    id: text('id').primaryKey(),
    partyId: text('party_id').notNull(),
    accountId: text('account_id'),
    createdAt: text('created_at').notNull(),
  },
  (t) => [index('email_reports_party_idx').on(t.partyId)],
);

// The phones that asked for notifications (ticket 124): one row per
// device, its address at its push service and its keys; forgotten when
// the push service no longer knows it.
export const pushSubscriptions = sqliteTable(
  'push_subscriptions',
  {
    id: text('id').primaryKey(),
    accountId: text('account_id')
      .notNull()
      .references(() => accounts.id),
    endpoint: text('endpoint').notNull().unique(),
    p256dh: text('p256dh').notNull(),
    auth: text('auth').notNull(),
    createdAt: text('created_at').notNull(),
  },
  (t) => [index('push_subscriptions_account_idx').on(t.accountId)],
);

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

// The login codes of the installed app (ticket 123): the print of the
// code, bound to the device that asked, never the code; good for 15
// minutes, once, five tries.
export const loginCodes = sqliteTable(
  'login_codes',
  {
    id: text('id').primaryKey(),
    accountId: text('account_id')
      .notNull()
      .references(() => accounts.id),
    codePrint: text('code_print').notNull(),
    createdAt: text('created_at').notNull(),
    expiresAt: text('expires_at').notNull(),
    usedAt: text('used_at'),
    attempts: integer('attempts').notNull().default(0),
    // Who asked, hashed, for throttling, as the links.
    ipHash: text('ip_hash').notNull(),
  },
  (t) => [
    index('login_codes_account_idx').on(t.accountId, t.createdAt),
    index('login_codes_ip_idx').on(t.ipHash, t.createdAt),
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

// The organisers of a party: accounts that may manage it. Super-admins
// manage every party without being listed here. Its members are `persons`.
export const partyOrganisers = sqliteTable(
  'party_organisers',
  {
    partyId: text('party_id')
      .notNull()
      .references(() => parties.id),
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
    uniqueIndex('party_organisers_pair_idx').on(t.partyId, t.accountId),
    index('party_organisers_account_idx').on(t.accountId),
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
    // Nobody: what carries the ideas of « une liste sans personne » (lot
    // 27 bis), one per account, never shown among anyone's people.
    placeholder: integer('placeholder', { mode: 'boolean' })
      .notNull()
      .default(false),
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
    // Its link, from its creation (ticket 106): whoever arrives on it gets
    // in or not by the stage of its sharing. A new one replaces it.
    shareToken: text('share_token').unique(),
    // Public since (« Tout le monde, avec le lien »), or null.
    sharedAt: text('shared_at'),
    // The occasion it was made for (ticket 106): its card shows the list
    // to those who hold it, even as a draft. The events it is shared in
    // are in gift_list_parties. No foreign key: the event may go first.
    partyId: text('party_id'),
    // The list this one was started from (lot 27): its document says it
    // while a draft, the old list's band leads here (ticket 119). No
    // foreign key: the old list may be deleted meanwhile.
    carriedFrom: text('carried_from'),
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
    // « Gère la liste » or « Aide à écrire » (lot 25 bis): the two differ
    // by what they manage, not by what they see.
    level: text('level', { enum: ['manage', 'write'] })
      .notNull()
      .default('manage'),
    createdAt: text('created_at').notNull(),
  },
  (t) => [
    uniqueIndex('gift_list_holders_list_account_idx').on(t.listId, t.accountId),
    index('gift_list_holders_account_idx').on(t.accountId),
  ],
);

// Invitations to hold a list, by address (lower case), one per list and
// address. Each is good for 7 days, with the link of its email, which
// acts once (only the hash of its token is kept): accepted, the account
// holds the list at the level given; refused or expired, the line stays
// 30 days for those who manage the list. An invitation still waiting is
// also accepted by coming, logged in with that address (lot 25).
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
    level: text('level', { enum: ['manage', 'write'] })
      .notNull()
      .default('write'),
    // SHA-256 of the token of the link; null for an invitation of before
    // lot 25 bis, which has no link.
    tokenHash: text('token_hash'),
    expiresAt: text('expires_at').notNull().default(''),
    acceptedAt: text('accepted_at'),
    declinedAt: text('declined_at'),
    createdAt: text('created_at').notNull(),
  },
  (t) => [
    uniqueIndex('gift_list_invites_list_email_idx').on(t.listId, t.email),
    index('gift_list_invites_email_idx').on(t.email),
    uniqueIndex('gift_list_invites_token_idx').on(t.tokenHash),
  ],
);

// The parties a list is in (docs/spec/v3/modele.md), with the same ticks
// everywhere. In each: seen by the whole party, or only by the one who
// drew its holder. « Everyone with a link » stays on the list
// (`share_token`), on top.
export const LIST_VISIBILITIES = ['party', 'giver'] as const;

export const giftListParties = sqliteTable(
  'gift_list_parties',
  {
    id: text('id').primaryKey(),
    listId: text('list_id')
      .notNull()
      .references(() => giftLists.id),
    partyId: text('party_id')
      .notNull()
      .references(() => parties.id),
    visibility: text('visibility', { enum: LIST_VISIBILITIES })
      .notNull()
      .default('party'),
    // « Celui qui m'a tiré » (ticket 139): my part of the list serves my
    // Secret Santa there, with or without all the members.
    giver: integer('giver', { mode: 'boolean' }).notNull().default(false),
    createdAt: text('created_at').notNull(),
  },
  (t) => [
    uniqueIndex('gift_list_parties_list_party_idx').on(t.listId, t.partyId),
    index('gift_list_parties_party_idx').on(t.partyId),
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

// What an account follows on a list it may open without holding it
// (ticket 122): the whole list (no person), or one person of it.
export const giftListFollows = sqliteTable(
  'gift_list_follows',
  {
    id: text('id').primaryKey(),
    listId: text('list_id')
      .notNull()
      .references(() => giftLists.id),
    accountId: text('account_id')
      .notNull()
      .references(() => accounts.id),
    listPersonId: text('list_person_id').references(() => giftListPeople.id),
    createdAt: text('created_at').notNull(),
  },
  (t) => [
    index('gift_list_follows_list_idx').on(t.listId),
    index('gift_list_follows_account_idx').on(t.accountId),
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
    // The list this idea was taken from (lot 27): a mark for those who
    // hold the list, gone once the idea is changed or the list shared.
    carriedFrom: text('carried_from'),
    // How much it is wanted, 0 to 3 stars (ticket 152); none on a title.
    stars: integer('stars').notNull().default(0),
    // A title over the ideas that follow it (ticket 152): no box, never
    // ticked, not counted as an idea.
    isTitle: integer('is_title', { mode: 'boolean' }).notNull().default(false),
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
    // « Cocher pour quelqu'un » (21 November 2026): the one who holds the
    // list who noted it for this account; null when they ticked it
    // themselves.
    notedBy: text('noted_by').references(() => accounts.id),
    // The first name written for them, kept once a tick noted for an
    // address became theirs: those who hold the list go on reading it.
    giverName: text('giver_name'),
  },
  (t) => [
    uniqueIndex('gift_claims_idea_account_idx').on(t.ideaId, t.accountId),
    index('gift_claims_list_idx').on(t.listId),
  ],
);

// « Cocher pour quelqu'un » (21 November 2026): a first name written by
// one of those who hold a list, with an address or without, for someone
// the app does not know. Offered again on this list. With an address, it
// becomes that account at its first coming, its ticks with it.
export const giftListGivers = sqliteTable(
  'gift_list_givers',
  {
    id: text('id').primaryKey(),
    listId: text('list_id')
      .notNull()
      .references(() => giftLists.id),
    name: text('name').notNull(),
    email: text('email'),
    addedBy: text('added_by')
      .notNull()
      .references(() => accounts.id),
    createdAt: text('created_at').notNull(),
  },
  (t) => [
    index('gift_list_givers_list_idx').on(t.listId),
    index('gift_list_givers_email_idx').on(t.email),
  ],
);

// What a first name written gives: the same as a tick, without an account.
export const giftGiverClaims = sqliteTable(
  'gift_giver_claims',
  {
    id: text('id').primaryKey(),
    listId: text('list_id')
      .notNull()
      .references(() => giftLists.id),
    ideaId: text('idea_id')
      .notNull()
      .references(() => giftListIdeas.id),
    giverId: text('giver_id')
      .notNull()
      .references(() => giftListGivers.id),
    mode: text('mode', { enum: ['alone', 'group'] }).notNull(),
    note: text('note'),
    closed: integer('closed', { mode: 'boolean' }).notNull().default(false),
    notedBy: text('noted_by')
      .notNull()
      .references(() => accounts.id),
    createdAt: text('created_at').notNull(),
  },
  (t) => [
    uniqueIndex('gift_giver_claims_idea_giver_idx').on(t.ideaId, t.giverId),
    index('gift_giver_claims_list_idx').on(t.listId),
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
    // Its place among the ideas of its person, in the same count as
    // theirs (Julien, 24 November 2026); none: after them all.
    position: integer('position'),
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
    // « Mode anonyme » (lot 27 ter): my setting for this list, null until
    // something decides it; and the note « On a activé le mode anonyme
    // pour toi », pending until « Compris ».
    anonymous: integer('anonymous', { mode: 'boolean' }),
    anonymousNotice: text('anonymous_notice', { enum: ['pending', 'seen'] }),
  },
  (t) => [
    uniqueIndex('gift_list_visits_list_account_idx').on(t.listId, t.accountId),
    index('gift_list_visits_account_idx').on(t.accountId),
  ],
);

// The news of an account (« Quoi de neuf » and the red dots, ticket 120;
// README 22.22): what happened, where (the place it points at, and the
// event), when, how many times that day, and whether it was seen, by
// opening that place. Accounts only. Never a result of a draw, never the
// name of whoever asks for ideas: `name` is a first name the text says
// (who invites, who joins a gift, whose list). Gone after thirty days.
export const news = sqliteTable(
  'news',
  {
    id: text('id').primaryKey(),
    accountId: text('account_id')
      .notNull()
      .references(() => accounts.id),
    kind: text('kind', { enum: NEWS_KINDS }).notNull(),
    level: text('level', { enum: ['urgent', 'other'] }).notNull(),
    targetType: text('target_type', { enum: NEWS_TARGETS }).notNull(),
    // No foreign key: the thing may go first, and its news with it.
    targetId: text('target_id').notNull(),
    // The event; null for a list, which finds its own when read.
    partyId: text('party_id'),
    name: text('name'),
    // The gift, for « se joint à ».
    detail: text('detail'),
    count: integer('count').notNull().default(1),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
    seenAt: text('seen_at'),
    // Ticket 121: whether it may go by email (an email of its own goes
    // for some kinds, none for others, the organiser may say no), and
    // when it went; counted again, it may go again.
    mailable: integer('mailable', { mode: 'boolean' }).notNull().default(true),
    emailedAt: text('emailed_at'),
    // Ticket 124: when it went to the phones of the account.
    pushedAt: text('pushed_at'),
  },
  (t) => [
    index('news_account_idx').on(t.accountId, t.seenAt),
    index('news_mail_idx').on(t.emailedAt, t.seenAt),
    index('news_target_idx').on(t.targetType, t.targetId),
  ],
);

// « Le mot de l'application » (ticket 120), closed by an account: it is
// not shown to it again.
export const noteDismissals = sqliteTable(
  'note_dismissals',
  {
    accountId: text('account_id')
      .notNull()
      .references(() => accounts.id),
    noteId: text('note_id').notNull(),
    dismissedAt: text('dismissed_at').notNull(),
  },
  (t) => [uniqueIndex('note_dismissals_pair_idx').on(t.accountId, t.noteId)],
);

export type FamilyMemberRow = typeof familyMembers.$inferSelect;
export type GiftListRow = typeof giftLists.$inferSelect;
export type GiftListIdeaRow = typeof giftListIdeas.$inferSelect;
export type AccountRow = typeof accounts.$inferSelect;
export type NewsRow = typeof news.$inferSelect;
export type LoginLinkRow = typeof loginLinks.$inferSelect;
export type SessionRow = typeof sessions.$inferSelect;
export type PartyRow = typeof parties.$inferSelect;
export type PartyYearRow = typeof partyYears.$inferSelect;
export type PersonRow = typeof persons.$inferSelect;
export type ExclusionRow = typeof manualExclusions.$inferSelect;
export type SecretSantaRow = typeof secretSantas.$inferSelect;
export type ParticipationRow = typeof participations.$inferSelect;
export type AuditRowInsert = typeof auditLog.$inferInsert;
