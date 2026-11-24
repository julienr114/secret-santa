import { blockedOf } from '#server/database/emailBlocks';
import { stopOf } from '#server/http/stop';

// The page of « Ne plus recevoir d'emails » (ticket 130, StopDemande):
// the address of the link, and whether it receives nothing already.
// Reading it blocks nothing: mail apps open links by themselves.
export default defineEventHandler(async (event) => {
  const { db, email, print } = await stopOf(event);
  setResponseHeader(event, 'Cache-Control', 'no-store');
  return { email, blocked: (await blockedOf(db, [print])).has(print) };
});
