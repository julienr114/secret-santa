import { generateSalt, hashSecret } from '../utils/crypto.js';

/** Salt + hash for a guardian password, with the server pepper. */
export const guardianCredentials = async (secrets, password) => {
  const salt = generateSalt();
  const hash = await hashSecret(password, {
    salt,
    pepper: secrets.pinPepper,
    iterations: secrets.pbkdf2Iterations,
  });
  return { guardianPasswordHash: hash, guardianPasswordSalt: salt };
};

/** What the admin API exposes about a group: never a hash or a salt. */
export const publicGroup = (group) => ({
  id: group.id,
  slug: group.slug,
  name: group.name,
  createdAt: group.createdAt,
  hasGuardianPassword: Boolean(group.guardianPasswordHash),
});
