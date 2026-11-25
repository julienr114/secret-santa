import { desc, eq } from 'drizzle-orm';
import type { Db } from './client';
import type { Locale } from '#shared/i18n';
import { accounts, auditLog, partyOrganisers } from './schema';
import { listPeople } from './people';
import { listEditions } from './editions';
import { displayName } from '#server/utils/people';
import { avatarOf, type Avatar } from '#server/utils/avatars';
import {
  journalEntries,
  type JournalEntry,
  type Meta,
} from '#server/utils/audit';

const JOURNAL_LIMIT = 300;

/** Someone the journal speaks of, as the filter and the folded lines show them. */
export type JournalPersonCard = { id: string; name: string; avatar: Avatar };

export type Journal = {
  entries: JournalEntry[];
  editions: { id: string; label: string }[];
  /** The people its lines are about, by first name. */
  people: JournalPersonCard[];
};

/**
 * The public journal of a group (README section 9), newest first. `me`,
 * the participant reading it, gets the lines about them in the second
 * person too.
 */
export const loadJournal = async (
  db: Db,
  groupId: string,
  locale: Locale,
  me: string | null = null,
): Promise<Journal> => {
  const [rows, people, editions, organisers] = await Promise.all([
    db
      .select()
      .from(auditLog)
      .where(eq(auditLog.partyId, groupId))
      .orderBy(desc(auditLog.createdAt))
      .limit(JOURNAL_LIMIT),
    listPeople(db, groupId),
    listEditions(db, groupId),
    db
      .select({ id: accounts.id, firstName: accounts.firstName })
      .from(partyOrganisers)
      .innerJoin(accounts, eq(accounts.id, partyOrganisers.accountId))
      .where(eq(partyOrganisers.partyId, groupId)),
  ]);
  // Who sent, said only when the event has more than one organiser
  // (ticket 170).
  const senders =
    organisers.length > 1
      ? Object.fromEntries(
          organisers.flatMap((one) =>
            one.firstName ? [[one.id, one.firstName]] : [],
          ),
        )
      : {};
  const entries = journalEntries(
    rows.map(({ partyId, secretSantaId, ...row }) => ({
      ...row,
      groupId: partyId,
      editionId: secretSantaId,
      meta: row.meta as Meta | null,
    })),
    people,
    locale,
    me,
    senders,
  );
  const named = new Set(entries.map((entry) => entry.personId));
  return {
    entries,
    people: people
      .filter((person) => named.has(person.id) || person.id === me)
      .map((person) => ({
        id: person.id,
        name: displayName(person, people),
        avatar: avatarOf(person),
      })),
    editions: editions
      .toReversed()
      .map((edition) => ({ id: edition.id, label: edition.label })),
  };
};
