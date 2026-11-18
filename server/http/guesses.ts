import type { H3Event } from 'h3';
import { and, eq, isNull } from 'drizzle-orm';
import type { Db } from '#server/database/client';
import { editions, participations, persons } from '#server/database/schema';
import type { EditionRow } from '#server/database/schema';
import { guessesOf, listGuesses } from '#server/database/guesses';
import { editionPersons } from '#server/database/answers';
import { readPairs } from '#server/database/draw';
import { personalPath } from '#server/database/participations';
import { recordEvent } from '#server/database/audit';
import { appUrl, nowIso } from './context';
import { sendEmails } from './email';
import {
  correctedGuesses,
  guessesOpen,
  palmares,
  type GuessMode,
} from '#server/utils/guesses';
import { avatarOf, type Avatar } from '#server/utils/avatars';
import { byName, displayName } from '#server/utils/people';
import type { PersonalContext } from './personal';
import { buildGuessResultsEmail } from '#server/utils/messages';
import { localeOf } from '#shared/i18n';
import type { Actor } from '#server/utils/audit';

// The impure side of « Devine qui » (README 22.17): the end of the
// guesses, and what follows the reveal of the draw (the journal and the
// one email of the results). Used by the routes and by the scheduled task.

type Context = { db: Db; event?: H3Event; dataKey: CryptoKey };
type Group = { id: string; name: string };

/**
 * Writes « les pronostics sont fermés » in the journal, once.
 * @param ctx - The database.
 * @param edition - The edition.
 * @param groupId - Its group.
 * @param actor - Who closed: the organiser by revealing, or the system.
 * @returns Once done.
 */
export const closeGuesses = async (
  ctx: { db: Db },
  edition: Pick<EditionRow, 'id' | 'guessMode' | 'guessesClosedAt'>,
  groupId: string,
  actor: Actor,
) => {
  if (edition.guessMode === 'none' || edition.guessesClosedAt) return;
  const done = await ctx.db
    .update(editions)
    .set({ guessesClosedAt: nowIso() })
    .where(and(eq(editions.id, edition.id), isNull(editions.guessesClosedAt)))
    .returning({ id: editions.id });
  if (done.length === 0) return;
  await recordEvent(ctx.db, {
    type: 'guesses_closed',
    groupId,
    editionId: edition.id,
    actor,
  });
};

/**
 * What follows the reveal of a draw with « Devine qui » on: the guesses
 * close, and, with one player at least, « le palmarès est arrivé » in
 * the journal and its email, once, to every participant with an address,
 * players or not, without any name. Never twice.
 * @param ctx - The database, the request when there is one, the key.
 * @param edition - The edition just revealed.
 * @param group - Its group.
 * @param actor - Who revealed.
 * @returns Once done.
 */
export const afterReveal = async (
  ctx: Context,
  edition: EditionRow,
  group: Group,
  actor: Actor,
) => {
  if (edition.guessMode === 'none') return;
  await closeGuesses(ctx, edition, group.id, actor);
  const claimed = await ctx.db
    .update(editions)
    .set({ guessResultsSentAt: nowIso() })
    .where(
      and(eq(editions.id, edition.id), isNull(editions.guessResultsSentAt)),
    )
    .returning({ id: editions.id });
  if (claimed.length === 0) return;
  const [guesses, pairs] = await Promise.all([
    listGuesses(ctx.db, edition.id),
    readPairs(ctx.db, edition.id, ctx.dataKey),
  ]);
  if (
    palmares(guesses, pairs, edition.guessMode as GuessMode).size === 'none'
  ) {
    return;
  }
  await recordEvent(ctx.db, {
    type: 'guess_results_ready',
    groupId: group.id,
    editionId: edition.id,
    actor: 'system',
  });
  const rows = await ctx.db
    .select({ participation: participations, person: persons })
    .from(participations)
    .innerJoin(persons, eq(persons.id, participations.personId))
    .where(eq(participations.editionId, edition.id));
  const emails = await Promise.all(
    rows
      .filter(({ person }) => person.email)
      .map(async ({ participation, person }) => ({
        ...buildGuessResultsEmail(
          {
            firstName: person.firstName,
            groupName: group.name,
            editionLabel: edition.label,
            link: appUrl(
              ctx.event,
              `${await personalPath(participation, ctx.dataKey)}/devine`,
            ),
          },
          localeOf(person.language),
        ),
        to: person.email!,
      })),
  );
  // A failed send changes nothing: the results are on the pages anyway.
  if (emails.length > 0) await sendEmails(ctx.event, emails);
};

/** A person as the game shows them: a name and an icon. */
export type GamePerson = { id: string; name: string; avatar: Avatar };

/**
 * Everything the game shows on one participant's pages (README 22.17):
 * the people, their own guesses, and, once the draw is revealed, the
 * palmarès with names and their own guesses corrected. Never anyone
 * else's guess before the reveal.
 * @param ctx - The personal link's context.
 * @param dataKey - The server key.
 * @returns The game, or null when it is off or the draw not made.
 */
export const gamePayload = async (
  ctx: Pick<PersonalContext, 'db' | 'edition' | 'person' | 'participation'> & {
    group: { name: string };
    rules: { eventDate: string };
  },
  dataKey: CryptoKey,
) => {
  const { db, edition, person, participation, rules } = ctx;
  if (edition.guessMode === 'none' || edition.status === 'preparing') {
    return null;
  }
  const rows = await editionPersons(db, edition.id);
  const people: GamePerson[] = rows.toSorted(byName).map((p) => ({
    id: p.id,
    name: displayName(p, rows),
    avatar: avatarOf(p),
  }));
  const revealed = Boolean(edition.revealedAt) || edition.status === 'closed';
  const mine = await guessesOf(db, edition.id, person.id);
  const base = {
    // The language of the page, like every read of a personal link.
    language: localeOf(person.language),
    groupName: ctx.group.name,
    firstName: person.firstName,
    editionLabel: edition.label,
    mode: edition.guessMode as GuessMode,
    open: guessesOpen(edition, nowIso()),
    endsAt: edition.guessEndsAt,
    eventDate: rules.eventDate,
    me: person.id,
    people,
    mine: mine.map(({ recipientId, giverId }) => ({ recipientId, giverId })),
    revealed,
  };
  if (!revealed) return { ...base, results: null };
  const [guesses, pairs] = await Promise.all([
    listGuesses(db, edition.id),
    readPairs(db, edition.id, dataKey),
  ]);
  const mode = edition.guessMode as GuessMode;
  const result = palmares(guesses, pairs, mode);
  const santa = pairs.find((p) => p.receiverId === person.id)?.giverId ?? null;
  return {
    ...base,
    results: {
      ...result,
      seen: Boolean(participation.guessResultsSeenAt),
      corrected: correctedGuesses(person.id, guesses, pairs, mode),
      santa: santa
        ? {
            actualId: santa,
            guessedId:
              mine.find((g) => g.recipientId === person.id)?.giverId ?? null,
          }
        : null,
      // How many guessed their own Santa, for « Tu fais partie des 3 sur 6 ».
      unmasked: result.awards.find((a) => a.kind === 'unmasked')?.count ?? 0,
    },
  };
};
