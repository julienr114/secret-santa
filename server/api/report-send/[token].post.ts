import { reportSend } from '#server/database/emailBlocks';
import { nowIso, secretsOf } from '#server/http/context';
import { useDb } from '#server/database/client';
import { readWithEither, verifyReport } from '#server/utils/stopEmail';

// « Signaler cet envoi » (ticket 130): the reader of an email an
// organiser sent finds it wrong. Recorded by event and by account, for
// the super-admin, who may cut the emails of the event or disable the
// account. Nothing of the reader is kept.
export default defineEventHandler(async (event) => {
  const { dataKey, dataKeyPrevious } = secretsOf(event);
  const token = getRouterParam(event, 'token') ?? '';
  // The links of emails sent before a change of key still work (Q-043).
  const by = await readWithEither([dataKey, dataKeyPrevious], (secret) =>
    verifyReport(token, secret),
  );
  if (!by) throw createError({ statusCode: 404, statusMessage: 'not_found' });
  await reportSend(useDb(event), by, nowIso());
  return { ok: true };
});
