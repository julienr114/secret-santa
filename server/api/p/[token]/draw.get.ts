import { and, desc, eq, inArray } from 'drizzle-orm';
import { auditLog, persons } from '#server/database/schema';
import { listEditionPeople } from '#server/database/participations';
import { giverHints, receiverHintsOf } from '#server/database/hints';
import { receiverList } from '#server/http/hints';
import { readPairs } from '#server/database/draw';
import { requirePersonalLink } from '#server/http/personal';
import { dataKeyOf } from '#server/http/context';
import { unwrap } from '#server/http/errors';
import { avatarOf } from '#server/utils/avatars';
import { byName, displayName } from '#server/utils/people';
import { openDraw, revealerFor } from '#server/utils/personal';
import { localeOf } from '#shared/i18n';

// A revealed draw, for a participant (README 22.18): once revealed, the
// draw is visible to the whole group. Who they give to, without going
// through « Découvrir » (nothing is counted), with their hints; who gives
// to them; every pair; who revealed. Never before the reveal.
export default defineEventHandler(async (event) => {
  const { db, participation, edition, person, rules } =
    await requirePersonalLink(event);
  if (!edition.revealedAt) {
    throw createError({ statusCode: 409, statusMessage: 'draw_not_revealed' });
  }
  const dataKey = await dataKeyOf(event);
  const [rows, pairs, [revealEvent]] = await Promise.all([
    listEditionPeople(db, edition.id),
    readPairs(db, edition.id, dataKey),
    db
      .select({ meta: auditLog.meta })
      .from(auditLog)
      .where(
        and(
          eq(auditLog.editionId, edition.id),
          inArray(auditLog.type, ['results_revealed', 'draw_revealed']),
        ),
      )
      .orderBy(desc(auditLog.createdAt))
      .limit(1),
  ]);
  const people = rows.map((r) => r.person);
  const sorted = people.toSorted(byName);
  const view = unwrap(
    openDraw(
      pairs,
      person.id,
      sorted.map((p) => p.id),
    ),
  );
  const show = (id: string | null) => {
    const found = people.find((p) => p.id === id);
    return found
      ? {
          id: found.id,
          name: displayName(found, people),
          avatar: avatarOf(found),
        }
      : null;
  };
  const receiver = show(view.receiverId)!;
  const receiverParticipationId = rows.find(
    (r) => r.person.id === view.receiverId,
  )!.participationId;
  const hints =
    rules.giftHints === 'none'
      ? null
      : await giverHints(db, receiverParticipationId, rules.giftHints);
  const news = hints
    ? await receiverHintsOf(
        db,
        {
          editionId: edition.id,
          personId: person.id,
          lastViewedAt: participation.lastViewedAt,
        },
        dataKey,
      )
    : null;
  // The organiser who revealed may not take part: then their first name
  // comes from the group.
  const meta = revealEvent?.meta as { by?: unknown } | null | undefined;
  const by = typeof meta?.by === 'string' ? meta.by : null;
  const names = Object.fromEntries(
    people.map((p) => [p.id, displayName(p, people)]),
  );
  const [outsider] =
    by && !names[by]
      ? await db
          .select({ firstName: persons.firstName })
          .from(persons)
          .where(eq(persons.id, by))
          .limit(1)
      : [];
  return {
    language: localeOf(person.language),
    revealedAt: edition.revealedAt,
    revealedBy: revealerFor(
      by,
      person.id,
      outsider && by ? { ...names, [by]: outsider.firstName } : names,
    ),
    receiver,
    santa: show(view.santaId),
    pairs: view.pairs.map((p) => ({
      giver: show(p.giverId)!,
      receiver: show(p.receiverId)!,
    })),
    // The same shape as « Découvrir », for the card of the result.
    budget: rules.budget,
    eventDate: rules.eventDate,
    guardianMessage: rules.guardianMessage,
    // « Sa liste de cadeaux » (lot 27 ter): a link, nothing of the list.
    list: hints
      ? await receiverList(
          event,
          db,
          hints.mode,
          receiverParticipationId,
          participation.id,
        )
      : null,
    hints: hints && {
      ...hints,
      isNew: false,
      updatedAt: news?.hintsUpdatedAt ?? null,
    },
    receiverHasEmail: Boolean(
      people.find((p) => p.id === view.receiverId)?.email,
    ),
    requesterHasEmail: Boolean(person.email),
    viewCount: participation.viewCount,
  };
});
