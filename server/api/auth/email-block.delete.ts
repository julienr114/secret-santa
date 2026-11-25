import { useDb } from '#server/database/client';
import { findAccountById } from '#server/database/accounts';
import { unblockAddress } from '#server/database/emailBlocks';
import { requireAccount } from '#server/http/auth';
import { secretsOf } from '#server/http/context';
import { emailPrint } from '#server/utils/emailPrint';

// « Recevoir à nouveau les emails », in « Me prévenir » (ticket 130):
// the person lifts the block of their own address. « Par email » stays
// as it is: they choose it on the same page.
export default defineEventHandler(async (event) => {
  const user = await requireAccount(event);
  const db = useDb(event);
  const account = await findAccountById(db, user.accountId);
  if (account) {
    await unblockAddress(
      db,
      await emailPrint(account.email, secretsOf(event).printKey),
    );
  }
  return { ok: true };
});
