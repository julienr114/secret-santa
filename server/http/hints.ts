import type { H3Event } from 'h3';
import { eq } from 'drizzle-orm';
import type { Db } from '#server/database/client';
import { participations, persons } from '#server/database/schema';
import {
  findHintRequest,
  findPortrait,
  findPreviousHints,
  markHintRequestAnswered,
  participationHasHints,
} from '#server/database/hints';
import { listWishes } from '#server/database/wishes';
import { personalLink } from '#server/database/participations';
import { findGiverParticipationId } from '#server/database/draw';
import { dataKeyOf } from './context';
import { emailConfigured, sendEmails } from './email';
import type { PersonalContext } from './personal';
import {
  buildHintsArrivedEmail,
  canEditHints,
  canEditIdeas,
  shouldTellRequester,
} from '#server/utils/hints';
import type { Email } from '#server/utils/messages';
import { isPortraitEmpty } from '#shared/utils/hints';
import { localeOf, type Locale } from '#shared/i18n';

// The impure side of gift hints (README 22.11): what the hints page reads,
// and the two emails. Nothing here is journaled: a request stays anonymous.

/** Everything the page « Mes pistes de cadeaux » shows. */
export const hintsPayload = async (ctx: PersonalContext) => {
  const { db, participation, edition, person, group, rules } = ctx;
  const mode = rules.giftHints;
  const [portrait, ideas, request] = await Promise.all([
    findPortrait(db, participation.id),
    mode === 'full' ? listWishes(db, participation.id) : [],
    findHintRequest(db, participation.id),
  ]);
  const empty = isPortraitEmpty(portrait) && ideas.length === 0;
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
 * After a participant saved hints: if someone asked and these are the
 * first, the one who asked gets an email, once. Who asked is not stored:
 * the giver is found again by decrypting the draw, here only, and never
 * returned (README 6 bis.3).
 */
export const tellRequesterIfAsked = async (
  event: H3Event,
  ctx: PersonalContext,
): Promise<void> => {
  const { db, participation, edition, person, group } = ctx;
  const request = await findHintRequest(db, participation.id);
  if (
    !shouldTellRequester(
      request,
      await participationHasHints(db, participation.id),
    )
  ) {
    return;
  }
  const [answered] = await markHintRequestAnswered(db, participation.id);
  if (!answered) return;
  const giver = await findGiverParticipationId(
    db,
    edition.id,
    person.id,
    await dataKeyOf(event),
  );
  if (!giver) return;
  await emailParticipant(event, db, giver, (data, locale) =>
    buildHintsArrivedEmail(
      { ...data, editionLabel: edition.label, groupName: group.name },
      locale,
    ),
  );
};
