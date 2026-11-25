import type { H3Event } from 'h3';
import type { Db } from '#server/database/client';
import { blockedOf } from '#server/database/emailBlocks';
import { secretsOf } from './context';
import {
  emailPrint,
  plainAddress,
  type BlockCause,
} from '#server/utils/stopEmail';

/**
 * Which of some addresses receive nothing, and why (ticket 130): read by
 * their print, never kept in clear.
 * @param event - The request, if any.
 * @param db - The database.
 * @param emails - The addresses, any case.
 * @returns The cause of each blocked address, by its plain form.
 */
export const blockedAddresses = async (
  event: H3Event | undefined,
  db: Db,
  emails: readonly (string | null)[],
): Promise<Map<string, BlockCause>> => {
  const secret = secretsOf(event).dataKey;
  const plain = [
    ...new Set(emails.flatMap((email) => (email ? [plainAddress(email)] : []))),
  ];
  const printed = await Promise.all(
    plain.map(async (email) => ({
      email,
      print: await emailPrint(email, secret),
    })),
  );
  const blocked = await blockedOf(
    db,
    printed.map((one) => one.print),
  );
  return new Map(
    printed.flatMap(({ email, print }) => {
      const cause = blocked.get(print);
      return cause ? [[email, cause] as const] : [];
    }),
  );
};
