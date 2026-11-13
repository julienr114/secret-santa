import { z } from 'zod';
import { phoneSchema } from './whatsapp';

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

export type CoupleLike = {
  personAId: string;
  personBId: string;
  active: boolean;
};

/** The active couple a person belongs to, if any. */
export const activeCoupleOf = <C extends CoupleLike>(
  couples: C[],
  personId: string,
): C | null =>
  couples.find(
    (c) => c.active && (c.personAId === personId || c.personBId === personId),
  ) ?? null;

export type Named = { id: string; firstName: string; lastName?: string | null };

/** Display name: first name, last name only to tell homonyms apart (README 20). */
export const displayName = (person: Named, people: Named[] = []): string => {
  const homonyms = people.filter(
    (p) => p.id !== person.id && p.firstName === person.firstName,
  );
  return homonyms.length > 0 && person.lastName
    ? `${person.firstName} ${person.lastName}`
    : person.firstName;
};

export type PersonRow = Named & {
  phone: string | null;
  active: boolean;
  pinHash: string | null;
  pinSalt?: string | null;
  pinLockedAt: string | null;
  createdAt: string;
};

export type PublicPerson = {
  id: string;
  firstName: string;
  lastName: string | null;
  phone: string | null;
  active: boolean;
  hasPin: boolean;
  pinLocked: boolean;
  createdAt: string;
};

/** What the admin API exposes about a person: never a PIN hash or salt. */
export const publicPerson = (person: PersonRow): PublicPerson => ({
  id: person.id,
  firstName: person.firstName,
  lastName: person.lastName ?? null,
  phone: person.phone,
  active: person.active,
  hasPin: Boolean(person.pinHash),
  pinLocked: Boolean(person.pinLockedAt),
  createdAt: person.createdAt,
});
