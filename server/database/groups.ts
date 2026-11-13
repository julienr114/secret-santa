import type { GroupRow } from './schema';
import { generateSalt, hashSecret } from '#server/utils/crypto';
import type { Secrets } from '#server/http/context';

/** Salt + hash for a guardian password, with the server pepper. */
export const guardianCredentials = async (
  secrets: Secrets,
  password: string,
) => {
  const salt = generateSalt();
  const hash = await hashSecret(password, {
    salt,
    pepper: secrets.pinPepper,
    iterations: secrets.pbkdf2Iterations,
  });
  return { guardianPasswordHash: hash, guardianPasswordSalt: salt };
};

export type PublicGroup = {
  id: string;
  slug: string;
  name: string;
  createdAt: string;
  hasGuardianPassword: boolean;
  emailSending: boolean;
};

/** What the admin API exposes about a group: never a hash or a salt. */
export const publicGroup = (group: GroupRow): PublicGroup => ({
  id: group.id,
  slug: group.slug,
  name: group.name,
  createdAt: group.createdAt,
  hasGuardianPassword: Boolean(group.guardianPasswordHash),
  emailSending: group.emailSending,
});
