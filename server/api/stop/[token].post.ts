import { eq } from 'drizzle-orm';
import { blockAddress } from '#server/database/emailBlocks';
import { accounts } from '#server/database/schema';
import { nowIso } from '#server/http/context';
import { stopOf } from '#server/http/stop';

// « Oui, ne plus m'écrire » (ticket 130, StopDemande), and the one-click
// unsubscribe of the mail apps (RFC 8058, the same address): the address
// receives nothing any more, but the login link it asks for. With an
// account, « Par email » goes to « Aucun email » too: one refusal, not
// two settings.
export default defineEventHandler(async (event) => {
  const { db, print, accountId } = await stopOf(event);
  await blockAddress(db, print, 'person', nowIso());
  if (accountId) {
    await db
      .update(accounts)
      .set({ emailNews: 'none' })
      .where(eq(accounts.id, accountId));
  }
  return { ok: true };
});
