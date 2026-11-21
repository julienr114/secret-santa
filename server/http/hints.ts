import type { H3Event } from 'h3';
import { and, count, desc, eq, gt, inArray, or } from 'drizzle-orm';
import type { Db } from '#server/database/client';
import {
  giftListHolders,
  giftListIdeas,
  giftListParties,
  giftListVisits,
  giftLists,
  participations,
  persons,
} from '#server/database/schema';
import {
  giverHelp,
  findHintRequest,
  findPortrait,
  findPreviousHints,
  markHintRequestAnswered,
  markHintsAnnounced,
  participationHasHints,
} from '#server/database/hints';
import {
  findList,
  holdersOfLists,
  listsFiguringOn,
  listsHeldBy,
} from '#server/database/lists';
import type { GiftListRow } from '#server/database/schema';
import { listWishes } from '#server/database/wishes';
import { personalLink } from '#server/database/participations';
import { findGiverParticipationId } from '#server/database/draw';
import { listPathFromDraw } from './anonymous';
import { optionalAccount } from './auth';
import { dataKeyOf } from './context';
import { emailConfigured, sendEmails } from './email';
import type { PersonalContext } from './personal';
import {
  buildHintsArrivedEmail,
  canEditHints,
  canEditIdeas,
  shouldAnnounceHints,
} from '#server/utils/hints';
import type { Email } from '#server/utils/messages';
import { isPortraitEmpty } from '#shared/utils/hints';
import { localeOf, type Locale } from '#shared/i18n';

// The impure side of gift hints (README 22.11): what the hints page reads,
// and the two emails. Nothing here is journaled: a request stays anonymous.

/** A gift list, as the hints name it. */
const listTile = (list: GiftListRow) => ({
  id: list.id,
  title: list.title,
  icon: { emoji: list.iconEmoji, color: list.iconColor },
  shared: list.sharedAt !== null,
});

/**
 * The gift lists an account may link to its hints (lot 27 ter): those it
 * holds, and those it figures on as a person linked to it.
 * @param db - The database.
 * @param accountId - The account.
 * @returns Each list, with whether the account holds it and who does.
 */
export const linkableLists = async (db: Db, accountId: string) => {
  const held = await listsHeldBy(db, accountId);
  const heldIds = new Set(held.map((list) => list.id));
  const figuring = (await listsFiguringOn(db, accountId)).filter(
    (list) => !heldIds.has(list.id),
  );
  const holders = await holdersOfLists(
    db,
    figuring.map((list) => list.id),
  );
  return [
    ...held.map((list) => ({ ...listTile(list), holds: true, holder: '' })),
    ...figuring.map((list) => {
      const first = holders.get(list.id)?.[0];
      return {
        ...listTile(list),
        holds: false,
        holder: first?.firstName ?? first?.email.split('@')[0] ?? '',
      };
    }),
  ];
};

/**
 * « Sa liste de cadeaux », under the result of the one who gives (lot 27
 * ter): the name and the icon of the list the receiver linked to their
 * hints, and where it opens, in anonymous mode. Nothing of what is on the
 * list. None when the group does not keep precise ideas, when no list is
 * linked, or when it is no longer shared.
 * @param event - The request.
 * @param db - The database.
 * @param mode - The setting of the group.
 * @param receiverParticipationId - Who receives.
 * @param giverParticipationId - Who gives, and reads this.
 * @returns The link, or null.
 */
export const receiverList = async (
  event: H3Event,
  db: Db,
  mode: 'full' | 'portrait',
  receiverParticipationId: string,
  giverParticipationId: string,
) => {
  if (mode !== 'full') return null;
  const [row] = await db
    .select({ giftListId: participations.giftListId })
    .from(participations)
    .where(eq(participations.id, receiverParticipationId))
    .limit(1);
  const list = row?.giftListId ? await findList(db, row.giftListId) : null;
  if (!list?.sharedAt || !list.shareToken) return null;
  return {
    title: list.title,
    icon: { emoji: list.iconEmoji, color: list.iconColor },
    path: await listPathFromDraw(event, list.shareToken, giverParticipationId),
  };
};

/**
 * Everything the page « Mes pistes de cadeaux » shows.
 * @param ctx - The participation, from its personal link.
 * @param accountId - The account logged in, if any: « Ma liste de
 *   cadeaux » is chosen among its lists.
 * @returns What the page reads.
 */
export const hintsPayload = async (
  ctx: PersonalContext,
  accountId: string | null = null,
) => {
  const { db, participation, edition, person, group, rules } = ctx;
  const mode = rules.giftHints;
  const [portrait, ideas, request] = await Promise.all([
    findPortrait(db, participation.id),
    mode === 'full' ? listWishes(db, participation.id) : [],
    findHintRequest(db, participation.id),
  ]);
  const empty = isPortraitEmpty(portrait) && ideas.length === 0;
  const linked =
    mode === 'full' && participation.giftListId
      ? await findList(db, participation.giftListId)
      : null;
  const mine = accountId && linked ? await linkableLists(db, accountId) : [];
  const editable = canEditHints(edition.status, mode).ok;
  const previous =
    empty && editable
      ? await findPreviousHints(db, {
          personId: person.id,
          groupId: group.id,
          editionCreatedAt: edition.createdAt,
        })
      : null;
  return {
    mode,
    editable,
    ideasEditable: canEditIdeas(edition.status, mode).ok,
    portrait,
    ideas,
    maxIdeas: rules.maxWishes,
    // Someone asked and nothing arrived since: the banner of the page.
    requested: Boolean(request && !request.answeredAt),
    previousEdition: previous?.editionLabel ?? null,
    // « Ma liste de cadeaux » (lot 27 ter): only where the group keeps
    // precise ideas. Whether I hold the list linked is said to my
    // account only.
    list:
      mode === 'full'
        ? {
            loggedIn: accountId !== null,
            linked: linked
              ? {
                  ...listTile(linked),
                  holds:
                    mine.find((one) => one.id === linked.id)?.holds ?? null,
                }
              : null,
          }
        : null,
    language: localeOf(person.language),
  };
};

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
 * After a participant saved hints. Their banner « quelqu'un demande des
 * pistes » goes once there are hints. Their giver gets « des pistes sont
 * arrivées » the first time hints appear after the giver discovered
 * their result, asked or not; once per draw, never for a change (lot
 * 16 bis). Who gives is found again by decrypting the draw, here only,
 * and never returned (README 6 bis.3).
 * @param hadHints - Whether the participant had hints before this save.
 */
export const announceHints = async (
  event: H3Event,
  ctx: PersonalContext,
  hadHints: boolean,
): Promise<void> => {
  const { db, participation, edition, person, group } = ctx;
  const hasHintsNow = await participationHasHints(db, participation.id);
  if (!hasHintsNow) return;
  await markHintRequestAnswered(db, participation.id);
  // The cheap checks first: the draw is only decrypted when it may count.
  if (
    hadHints ||
    edition.status !== 'drawn' ||
    participation.hintsAnnouncedAt !== null
  ) {
    return;
  }
  const giver = await findGiverParticipationId(
    db,
    edition.id,
    person.id,
    await dataKeyOf(event),
  );
  const [giverRow] = giver
    ? await db
        .select({ viewCount: participations.viewCount })
        .from(participations)
        .where(eq(participations.id, giver))
        .limit(1)
    : [];
  if (
    !giver ||
    !shouldAnnounceHints({
      hadHints,
      hasHintsNow,
      giverRevealed: (giverRow?.viewCount ?? 0) > 0,
      alreadyAnnounced: false,
    }) ||
    !(await markHintsAnnounced(db, participation.id))
  ) {
    return;
  }
  await emailParticipant(event, db, giver, (data, locale) =>
    buildHintsArrivedEmail(
      { ...data, editionLabel: edition.label, groupName: group.name },
      locale,
    ),
  );
};

/**
 * « La liste de cadeaux d'Inès » under a result (ticket 107, V3TirageVersListe,
 * V3TirageNouvelles): a list the receiver holds that the giver may open,
 * public or shared in the event of the draw (with all its members or with
 * the one who drew), the most recently changed; where it opens, anonymous
 * and on the receiver's part; and how many ideas came since the giver
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
  const [list] = await db
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
    .orderBy(desc(giftLists.updatedAt))
    .limit(1);
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
    path: input.selfMemberId ? `${path}&personne=${input.selfMemberId}` : path,
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
 * @returns The list's line, and the hints as the card shows them.
 */
export const resultHelp = async (
  event: H3Event,
  db: Db,
  input: {
    receiver: { participationId: string; email: string | null };
    partyId: string;
    giverParticipationId: string;
  },
) => {
  const help = await giverHelp(db, input.receiver);
  const giver = await optionalAccount(event);
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
