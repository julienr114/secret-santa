import { reportSend } from '#server/database/emailBlocks';
import { nowIso, secretsOf } from '#server/http/context';
import { useDb } from '#server/database/client';
import { verifyReport } from '#server/utils/stopEmail';

// « Signaler cet envoi » (ticket 130): the reader of an email an
// organiser sent finds it wrong. Recorded by event and by account, for
// the super-admin, who may cut the emails of the event or disable the
// account. Nothing of the reader is kept.
export default defineEventHandler(async (event) => {
  const by = await verifyReport(
    getRouterParam(event, 'token') ?? '',
    secretsOf(event).dataKey,
  );
  if (!by) throw createError({ statusCode: 404, statusMessage: 'not_found' });
  await reportSend(useDb(event), by, nowIso());
  return { ok: true };
});
