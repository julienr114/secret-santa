import { unblockAddress } from '#server/database/emailBlocks';
import { stopOf } from '#server/http/stop';

// « Annuler : je veux bien les emails » (ticket 130, StopConfirme): only
// the one who has the link of the address may lift its block. « Par
// email » stays as it is: they choose it again in « Me prévenir ».
export default defineEventHandler(async (event) => {
  const { db, print } = await stopOf(event);
  await unblockAddress(db, print);
  return { ok: true };
});
