import { useDb } from '#server/database/client';
import { findAccountById } from '#server/database/accounts';
import { listOrganisedParties } from '#server/database/organising';
import {
  listOrganisedSecretSantas,
  quotaAccountOf,
} from '#server/database/quota';
import { requireAccount } from '#server/http/auth';
import { remainingSecretSantas } from '#server/utils/quota';

// What « Créer › Un Secret Santa » needs (ticket 105): the parties I
// organise, to choose one, or, once I organise as many Secret Santa as my
// limit allows, those Secret Santa (V3TirageLimite). Never a result.
export default defineEventHandler(async (event) => {
  const user = await requireAccount(event);
  const db = useDb(event);
  const account = await findAccountById(db, user.accountId);
  if (!account) {
    throw createError({ statusCode: 401, statusMessage: 'unauthorized' });
  }
  const left = remainingSecretSantas(await quotaAccountOf(db, account));
  if (left === 0) {
    return {
      limitReached: true as const,
      parties: [],
      secretSantas: await listOrganisedSecretSantas(db, account.id),
    };
  }
  return {
    limitReached: false as const,
    parties: await listOrganisedParties(db, account.id),
    secretSantas: [],
  };
});
