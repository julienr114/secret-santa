import { drawStatements, loadDrawContext } from '#server/database/draw';
import { recordEvent, wasDrawCancelled } from '#server/database/audit';
import { sendDrawEmails } from '#server/http/drawEmails';
import { tellGameOpen, tellParticipants } from '#server/database/newsEvents';
import { requireEdition } from '#server/http/edition';
import { dataKeyOf, newId, nowIso } from '#server/http/context';
import { unwrap } from '#server/http/errors';
import { secureRandomInt } from '#server/utils/crypto';
import { answersAllow } from '#server/utils/answers';
import { draw } from '#server/utils/draw';
import { nextStatus } from '#server/utils/editions';

// The draw (README 6.3): server side only, receivers stored encrypted, the
// response never contains an assignment. Not while waiting for the answers
// of a draw made elsewhere (README 22.12).
export default defineEventHandler(async (event) => {
  const { user, group, db, edition, rules } = await requireEdition(event);
  unwrap(nextStatus(edition.status, 'draw'));
  unwrap(answersAllow(edition, 'draw'));
  const dataKey = await dataKeyOf(event);
  const { input } = await loadDrawContext(
    db,
    group.id,
    edition,
    rules,
    dataKey,
  );
  const { assignments: pairs } = unwrap(
    draw(input, { random: secureRandomInt }),
  );
  const statements = await drawStatements(
    db,
    {
      editionId: edition.id,
      pairs,
      snapshot: { rules, manualExclusions: input.manualExclusions },
      now: nowIso(),
      newId,
    },
    dataKey,
  );
  await db.batch(statements).catch(() => {
    throw createError({
      statusCode: 409,
      statusMessage: 'invalid_transition',
    });
  });
  await recordEvent(db, {
    type: 'draw_done',
    groupId: group.id,
    editionId: edition.id,
    actor: user.role,
    meta: { count: pairs.length },
  });
  // « Ton enveloppe t'attend », in the app (ticket 120); by email, the
  // message of the draw says it (ticket 169).
  await tellParticipants(
    db,
    {
      secretSantaId: edition.id,
      partyId: group.id,
      kind: 'envelope',
      mailable: false,
    },
    nowIso(),
  );
  // « À toi de jouer », when « Devine qui » is on (ticket 142).
  await tellGameOpen(
    db,
    { secretSantaId: edition.id, partyId: group.id },
    nowIso(),
  );
  // Au tirage, l'application prévient chacun (ticket 169): the draw is
  // made whatever the sending does.
  const emails = await sendDrawEmails(event, {
    db,
    group,
    edition,
    rules,
    type: (await wasDrawCancelled(db, group.id, edition.id))
      ? 'redraw'
      : 'drawn',
    accountId: user.accountId,
  }).catch(() => ({ sent: 0, failed: 'email_failed' }));
  return { ok: true, count: pairs.length, emails };
});
