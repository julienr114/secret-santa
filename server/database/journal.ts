import { desc, eq } from 'drizzle-orm';
import type { Db } from './client';
import type { Locale } from '#shared/i18n';
import { auditLog } from './schema';
import { listPeople } from './people';
import { listEditions } from './editions';
import {
  journalEntries,
  type JournalEntry,
  type Meta,
} from '#server/utils/audit';

const JOURNAL_LIMIT = 300;

export type Journal = {
  entries: JournalEntry[];
  editions: { id: string; label: string }[];
};

/** The public journal of a group (README section 9), newest first. */
export const loadJournal = async (
  db: Db,
  groupId: string,
  locale: Locale,
): Promise<Journal> => {
  const [rows, people, editions] = await Promise.all([
    db
      .select()
      .from(auditLog)
      .where(eq(auditLog.groupId, groupId))
      .orderBy(desc(auditLog.createdAt))
      .limit(JOURNAL_LIMIT),
    listPeople(db, groupId),
    listEditions(db, groupId),
  ]);
  return {
    entries: journalEntries(
      rows.map((row) => ({ ...row, meta: row.meta as Meta | null })),
      people,
      locale,
    ),
    editions: editions
      .toReversed()
      .map((edition) => ({ id: edition.id, label: edition.label })),
  };
};
