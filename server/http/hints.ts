import type { H3Event } from 'h3';
import { and, count, desc, eq, gt, inArray, or } from 'drizzle-orm';
import type { Db } from '#server/database/client';
import {
  accounts,
  familyMembers,
  giftListHolders,
  giftListIdeas,
  giftListParties,
  giftListPeople,
  giftListVisits,
  giftLists,
  participations,
  persons,
} from '#server/database/schema';
import { giverHelp } from '#server/database/hints';

import { personalLink } from '#server/database/participations';

import { listPathFromDraw } from './anonymous';

import { dataKeyOf } from './context';
import { emailConfigured, sendEmails } from './email';
import { emailChoicesOf } from '#server/database/news';
import { ownEmailGoes } from '#server/utils/newsEmail';

import type { Email } from '#server/utils/messages';

import { localeOf, type Locale } from '#shared/i18n';

// The impure side of gift hints (README 22.11): what the hints page reads,
// and the two emails. Nothing here is journaled: a request stays anonymous.

/** A participation of an edition with its person, by id. */
const findWithPerson = async (db: Db, participationId: string) => {
  const [row] = await db
    .select({ participation: participations, person: persons })
    .from(participations)
    .innerJoin(persons, eq(persons.id, participations.personId))
    .where(eq(participations.id, participationId))
    .limit(1);
  return row ?? null;
};

/**
 * Writes one email to a participant of the edition, if they have an
 * address and email is set up. Best effort: the page tells the rest.
 * @returns Whether it left.
 */
export const emailParticipant = async (
  event: H3Event,
  db: Db,
  participationId: string,
  build: (data: { firstName: string; link: string }, locale: Locale) => Email,
  path = '',
): Promise<boolean> => {
  const row = await findWithPerson(db, participationId);
  if (!row?.person.email || !emailConfigured(event)) return false;
  // Never to an account that wants no email (ticket 121).
  const choices = await emailChoicesOf(db, [row.person.email]);
  if (!ownEmailGoes(choices.get(row.person.email.toLowerCase()) ?? null)) {
    return false;
  }
  const link = `${await personalLink(event, row.participation, await dataKeyOf(event))}${path}`;
  const sent = await sendEmails(event, [
    {
      to: row.person.email,
      ...build(
        { firstName: row.person.firstName, link },
        localeOf(row.person.language),
      ),
    },
  ]);
  return sent.ok;
};

/**
 * « La liste de cadeaux d'Inès » under a result (ticket 107, V3TirageVersListe,
 * V3TirageNouvelles): a list the receiver holds that the giver may open,
 * public or shared in the event of the draw (with all its members or with
 * the one who drew), one where they figure first, then the most recently
 * changed; where it opens, anonymous and filtered on the receiver's part
 * when they figure on it (ticket 136); and how many ideas came since the giver
 * last opened it. Nothing of what is on it.
 * @param event - The request.
 * @param db - The database.
 * @param input - Who receives, where, and who reads.
 * @param input.accountId - The receiver's account.
 * @param input.selfMemberId - Their « Moi » card, their part on the list.
 * @param input.partyId - The event of the draw.
 * @param input.giverParticipationId - Who gives, and reads this.
 * @param input.giverAccountId - Their account, if they are logged in.
 * @returns The list's line, or null.
 */
export const receiverListOf = async (
  event: H3Event,
  db: Db,
  input: {
    accountId: string;
    selfMemberId: string | null;
    partyId: string;
    giverParticipationId: string;
    giverAccountId: string | null;
  },
) => {
  const lists = await db
    .select({
      id: giftLists.id,
      title: giftLists.title,
      iconEmoji: giftLists.iconEmoji,
      iconColor: giftLists.iconColor,
      shareToken: giftLists.shareToken,
    })
    .from(giftListHolders)
    .innerJoin(giftLists, eq(giftLists.id, giftListHolders.listId))
    .leftJoin(
      giftListParties,
      and(
        eq(giftListParties.listId, giftLists.id),
        eq(giftListParties.partyId, input.partyId),
      ),
    )
    .where(
      and(
        eq(giftListHolders.accountId, input.accountId),
        or(
          inArray(giftListParties.visibility, ['party', 'giver']),
          gt(giftLists.sharedAt, ''),
        ),
      ),
    )
    .orderBy(desc(giftLists.updatedAt));
  // Where the receiver figures (ticket 136): their « Moi », or a person
  // of another family linked to their account. Such a list comes first,
  // and opens filtered on them.
  const figures =
    lists.length === 0
      ? []
      : await db
          .select({
            listId: giftListPeople.listId,
            memberId: giftListPeople.memberId,
          })
          .from(giftListPeople)
          .innerJoin(
            familyMembers,
            eq(familyMembers.id, giftListPeople.memberId),
          )
          .where(
            and(
              inArray(
                giftListPeople.listId,
                lists.map((one) => one.id),
              ),
              or(
                input.selfMemberId
                  ? eq(familyMembers.id, input.selfMemberId)
                  : undefined,
                eq(familyMembers.linkedAccountId, input.accountId),
              ),
            ),
          );
  const list =
    lists.find((one) => figures.some((row) => row.listId === one.id)) ??
    lists[0];
  const part = figures.find((row) => row.listId === list?.id)?.memberId;
  if (!list?.shareToken) return null;
  const [visit] = input.giverAccountId
    ? await db
        .select({ at: giftListVisits.lastSeenAt })
        .from(giftListVisits)
        .where(
          and(
            eq(giftListVisits.listId, list.id),
            eq(giftListVisits.accountId, input.giverAccountId),
          ),
        )
        .limit(1)
    : [];
  const [fresh] = visit
    ? await db
        .select({ n: count() })
        .from(giftListIdeas)
        .where(
          and(
            eq(giftListIdeas.listId, list.id),
            eq(giftListIdeas.isTitle, false),
            gt(giftListIdeas.createdAt, visit.at),
          ),
        )
    : [];
  const path = await listPathFromDraw(
    event,
    list.shareToken,
    input.giverParticipationId,
  );
  return {
    title: list.title,
    icon: { emoji: list.iconEmoji, color: list.iconColor },
    path: part ? `${path}&personne=${part}` : path,
    newIdeas: fresh?.n ?? 0,
  };
};

/**
 * « Pour t'aider à choisir » under a result (ticket 107): the receiver's
 * list as a line, their tastes, the ideas they left before the V3 when
 * they have no account, and whether the giver already asked for ideas.
 * @param event - The request.
 * @param db - The database.
 * @param input - Who receives, where, and who gives.
 * @param input.receiver - Their participation and address.
 * @param input.receiver.participationId - Their participation.
 * @param input.receiver.email - Their address, if any.
 * @param input.partyId - The event of the draw.
 * @param input.giverParticipationId - Who gives, and reads this.
 * @param input.giverEmail - Their address, for their visits of the list.
 * @returns The list's line, and the hints as the card shows them.
 */
export const resultHelp = async (
  event: H3Event,
  db: Db,
  input: {
    receiver: { participationId: string; email: string | null };
    partyId: string;
    giverParticipationId: string;
    giverEmail: string | null;
  },
) => {
  const help = await giverHelp(db, input.receiver);
  // Their visits are those of the giver's account, whoever opens the link.
  const [giver] = input.giverEmail
    ? await db
        .select({ accountId: accounts.id })
        .from(accounts)
        .where(eq(accounts.email, input.giverEmail.toLowerCase()))
        .limit(1)
    : [];
  const list = help.accountId
    ? await receiverListOf(event, db, {
        accountId: help.accountId,
        selfMemberId: help.selfMemberId,
        partyId: input.partyId,
        giverParticipationId: input.giverParticipationId,
        giverAccountId: giver?.accountId ?? null,
      })
    : null;
  return {
    list,
    hints: {
      mode: help.mode,
      portrait: help.portrait,
      ideas: help.ideas,
      requested: help.requested,
      isNew: false,
      updatedAt: null,
    },
  };
};
