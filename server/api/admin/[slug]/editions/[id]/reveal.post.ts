import { z } from 'zod';
import { and, eq, isNull } from 'drizzle-orm';
import { secretSantas, persons } from '#server/database/schema';
import { findAccountById } from '#server/database/accounts';
import { recordEvent } from '#server/database/audit';
import { requireEdition } from '#server/http/edition';
import { dataKeyOf, nowIso } from '#server/http/context';
import { afterReveal } from '#server/http/guesses';
import { unwrap } from '#server/http/errors';
import { validatedBody } from '#server/http/validate';
import { canRevealDraw } from '#server/utils/editions';
import { mergeRules } from '#server/utils/rules';

// « Dévoiler les résultats » (README 22.9, lot 13): the organiser sees who
// gave to whom, for good. From the day of the party; before it, only with
// `early`, which the screen asks for after a stern warning. Written in
// the journal for everyone, never saying who gave to whom: from the day
// of the party a milestone (`draw_revealed`); before it an alert
// (`results_revealed`, README 22.15), since the secret ends early. The pairs are
// then read with GET …/results; the edition stays open until closed. Once
// revealed, the draw is visible to the whole group (README 22.18): the
// event keeps the person of the group who revealed, for « Camille l'a
// dévoilé », never a result.
const bodySchema = z.object({ early: z.boolean().default(false) });

export default defineEventHandler(async (event) => {
  const { user, group, db, edition } = await requireEdition(event);
  const { early } = await validatedBody(event, bodySchema);
  const rules = unwrap(mergeRules(edition.rules));
  const today = nowIso().slice(0, 10);
  const allowed = unwrap(canRevealDraw(edition, rules.eventDate, today, early));
  // Only once: two organisers cannot both reveal.
  const revealed = await db
    .update(secretSantas)
    .set({ revealedAt: nowIso() })
    .where(
      and(eq(secretSantas.id, edition.id), isNull(secretSantas.revealedAt)),
    )
    .returning({ id: secretSantas.id });
  if (revealed.length === 0) {
    throw createError({
      statusCode: 409,
      statusMessage: 'results_already_revealed',
    });
  }
  const account = await findAccountById(db, user.accountId);
  const [by] = account
    ? await db
        .select({ id: persons.id })
        .from(persons)
        .where(
          and(eq(persons.partyId, group.id), eq(persons.email, account.email)),
        )
        .limit(1)
    : [];
  await recordEvent(db, {
    type: allowed.early ? 'results_revealed' : 'draw_revealed',
    groupId: group.id,
    editionId: edition.id,
    actor: user.role,
    ...(by ? { meta: { by: by.id } } : {}),
  });
  // « Devine qui » (README 22.17): the guesses close, the results come.
  await afterReveal(
    { db, event, dataKey: await dataKeyOf(event) },
    edition,
    group,
    user.role,
  );
  return { ok: true };
});
