import { useDb } from '#server/database/client';
import { findAccountById } from '#server/database/accounts';
import { listOrganisedParties } from '#server/database/organising';
import {
  listOrganisedSecretSantas,
  quotaAccountOf,
} from '#server/database/quota';
import { isSwitchOn } from '#server/database/switches';
import { requireAccount } from '#server/http/auth';
import { remainingSecretSantas } from '#server/utils/quota';

// What « Créer › Un Secret Santa » needs (ticket 105): the parties I
// organise, to choose one, or, once I organise as many Secret Santa as my
// limit allows, those Secret Santa (V3TirageLimite); nothing while the
// super-admin pauses new Secret Santa (V3TiragePause). Never a result.
export default defineEventHandler(async (event) => {
  const user = await requireAccount(event);
  const db = useDb(event);
  const account = await findAccountById(db, user.accountId);
  if (!account) {
    throw createError({ statusCode: 401, statusMessage: 'unauthorized' });
  }
  if (await isSwitchOn(db, 'new_secret_santas')) {
    return {
      paused: true as const,
      limitReached: false as const,
      parties: [],
      secretSantas: [],
    };
  }
  const left = remainingSecretSantas(await quotaAccountOf(db, account));
  if (left === 0) {
    return {
      paused: false as const,
      limitReached: true as const,
      parties: [],
      secretSantas: await listOrganisedSecretSantas(db, account.id),
    };
  }
  return {
    paused: false as const,
    limitReached: false as const,
    parties: await listOrganisedParties(db, account.id),
    secretSantas: [],
  };
});
