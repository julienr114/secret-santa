import { count, desc, eq, inArray, sql } from 'drizzle-orm';
import type { Db } from './client';
import { currentEdition, type EditionStatus } from '#server/utils/editions';
import { mergeRules } from '#server/utils/rules';
import {
  partyYears,
  secretSantas,
  parties,
  participations,
  persons,
} from './schema';
import { editionColumns, selectEditions, type Edition } from './editions';

/**
 * The participations of the people registered with an address, in every
 * group, most recent edition first.
 */
export const listParticipationsByEmail = (db: Db, email: string) =>
  db
    .select({
      participation: participations,
      edition: editionColumns,
      person: persons,
      groupName: parties.name,
    })
    .from(participations)
    .innerJoin(persons, eq(persons.id, participations.personId))
    .innerJoin(secretSantas, eq(secretSantas.id, participations.secretSantaId))
    .innerJoin(partyYears, eq(partyYears.id, secretSantas.yearId))
    .innerJoin(parties, eq(parties.id, secretSantas.partyId))
    .where(eq(persons.email, email))
    .orderBy(desc(partyYears.year), desc(secretSantas.createdAt));

/** Where the current edition of a group stands, for its organiser. */
export type EditionSummary = {
  id: string;
  label: string;
  status: EditionStatus;
  participants: number;
  /** Not sent their message yet, and not looked either. */
  toNotify: number;
  /** Sent their message, not opened their page yet. */
  notOpened: number;
  /** Opened their personal page at least once. */
  viewed: number;
  /** The date of the party: an ISO day, or empty. */
  eventDate: string;
};

/** A group with its rules, as the summaries need it. */
type GroupWithRules = { id: string; rules: unknown };

/**
 * The current edition of each group, with its counts and its row, by
 * group id. A group with only closed editions has none.
 */
export const currentEditionSummaries = async (
  db: Db,
  groupList: readonly GroupWithRules[],
): Promise<Record<string, { summary: EditionSummary; edition: Edition }>> => {
  if (groupList.length === 0) return {};
  const rows = await selectEditions(db).where(
    inArray(
      secretSantas.partyId,
      groupList.map((group) => group.id),
    ),
  );
  const current = groupList.flatMap((group) => {
    const edition = currentEdition(rows.filter((e) => e.partyId === group.id));
    return edition ? [{ group, edition }] : [];
  });
  if (current.length === 0) return {};
  const counts = await db
    .select({
      editionId: participations.secretSantaId,
      participants: count(),
      toNotify: sql<number>`sum(case when ${participations.messageSentAt} is null and ${participations.viewCount} = 0 then 1 else 0 end)`,
      notOpened: sql<number>`sum(case when ${participations.messageSentAt} is not null and ${participations.viewCount} = 0 then 1 else 0 end)`,
      viewed: sql<number>`sum(case when ${participations.viewCount} > 0 then 1 else 0 end)`,
    })
    .from(participations)
    .where(
      inArray(
        participations.secretSantaId,
        current.map(({ edition }) => edition.id),
      ),
    )
    .groupBy(participations.secretSantaId);
  return Object.fromEntries(
    current.map(({ group, edition }) => {
      const row = counts.find((c) => c.editionId === edition.id);
      const rules = mergeRules(edition.rules);
      return [
        group.id,
        {
          edition,
          summary: {
            id: edition.id,
            label: edition.label,
            status: edition.status,
            participants: row?.participants ?? 0,
            toNotify: Number(row?.toNotify ?? 0),
            notOpened: Number(row?.notOpened ?? 0),
            viewed: Number(row?.viewed ?? 0),
            eventDate: rules.ok ? rules.value.eventDate : '',
          },
        },
      ];
    }),
  );
};
