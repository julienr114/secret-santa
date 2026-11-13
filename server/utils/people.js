import { z } from 'zod';
import { phoneSchema } from './whatsapp.js';

// People, couples and manual exclusions of a group (README 6.6, section 10).

const nameSchema = z.string().trim().min(1).max(60);

export const personInputSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema.nullable().default(null),
  phone: phoneSchema.nullable().default(null),
});

export const personPatchSchema = z
  .object({
    firstName: nameSchema,
    lastName: nameSchema.nullable(),
    phone: phoneSchema.nullable(),
    active: z.boolean(),
  })
  .partial()
  .refine((patch) => Object.keys(patch).length > 0, 'nothing to update');

export const coupleInputSchema = z
  .object({ personAId: z.string().min(1), personBId: z.string().min(1) })
  .refine(
    (c) => c.personAId !== c.personBId,
    'a couple needs two different people',
  );

export const exclusionInputSchema = z
  .object({
    giverId: z.string().min(1),
    receiverId: z.string().min(1),
    reciprocal: z.boolean().default(false),
  })
  .refine((e) => e.giverId !== e.receiverId, 'self exclusion is implicit');

/** The active couple a person belongs to, if any. */
export const activeCoupleOf = (couples, personId) =>
  couples.find(
    (c) => c.active && (c.personAId === personId || c.personBId === personId),
  ) ?? null;

/** Display name: first name, last name only to tell homonyms apart (README 20). */
export const displayName = (person, people = []) => {
  const homonyms = people.filter(
    (p) => p.id !== person.id && p.firstName === person.firstName,
  );
  return homonyms.length > 0 && person.lastName
    ? `${person.firstName} ${person.lastName}`
    : person.firstName;
};

/** What the admin API exposes about a person: never a PIN hash or salt. */
export const publicPerson = (person) => ({
  id: person.id,
  firstName: person.firstName,
  lastName: person.lastName,
  phone: person.phone,
  active: person.active,
  hasPin: Boolean(person.pinHash),
  pinLocked: Boolean(person.pinLockedAt),
  createdAt: person.createdAt,
});
