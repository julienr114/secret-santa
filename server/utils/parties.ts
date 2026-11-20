// The party (docs/spec/v3/fete.md, ticket 104): what may be created, who
// may be taken from another party, who may leave. Pure.
import { z } from 'zod';
import { PARTY_CATEGORIES } from '#shared/utils/categories';
import { isPlainName, WEB_ADDRESS_REFUSED } from './limits';
import { isIsoDay } from './rules';
import { fail, ok, type Result } from './result';

/** 30 members a party (docs/spec/v3/modele.md). */
export const MAX_PARTY_MEMBERS = 30;

export const partyNameSchema = z
  .string()
  .trim()
  .min(1)
  .max(100)
  .refine(isPlainName, WEB_ADDRESS_REFUSED);

const isoDaySchema = z.string().refine(isIsoDay, 'iso_day');

/** « Pour quelle occasion ? », then « Qui est de la fête ? ». */
export const partyInputSchema = z.object({
  category: z.enum(PARTY_CATEGORIES),
  name: partyNameSchema,
  date: isoDaySchema,
  recurring: z.boolean(),
  /** People taken from parties I organise. */
  memberIds: z
    .array(z.string().min(1).max(40))
    .max(MAX_PARTY_MEMBERS - 1)
    .default([]),
});
export type PartyInput = z.infer<typeof partyInputSchema>;

/** The settings of the party itself (V3FeteReglages). */
export const partyPatchSchema = z
  .object({
    category: z.enum(PARTY_CATEGORIES),
    date: isoDaySchema,
    recurring: z.boolean(),
  })
  .partial();

/**
 * The usual day of a party from one of its dates.
 * @param iso - « 2026-12-25 ».
 * @returns « 12-25 ».
 */
export const usualDateOf = (iso: string): string => iso.slice(5, 10);

type Candidate = {
  id: string;
  firstName: string;
  email: string | null;
};

/**
 * The people one may take into a new party, once each: the same address
 * in two parties is one person; without an address, each stays.
 * Myself excepted, since I am in it anyway.
 * @param people - The people of the parties I organise, in their order.
 * @param myEmail - My address.
 * @returns The people, the first of each address kept.
 */
export const takenPeople = <P extends Candidate>(
  people: readonly P[],
  myEmail: string,
): P[] =>
  people.filter(
    (person, index) =>
      person.email !== myEmail &&
      (person.email === null ||
        people.findIndex((other) => other.email === person.email) === index),
  );

/**
 * Whether a party may have that many members.
 * @param count - Its members, me included.
 * @returns The count, or `too_many_members`.
 */
export const checkPartySize = (count: number): Result<number> =>
  count > MAX_PARTY_MEMBERS
    ? fail('too_many_members', { max: MAX_PARTY_MEMBERS, count })
    : ok(count);

/**
 * Whether one may leave a party: a member may, an organiser may not
 * (« Pour un membre : Quitter cette fête », fete.md).
 * @param role - My place in the party.
 * @returns Nothing, or `organiser_cannot_leave`.
 */
export const canLeaveParty = (role: 'organiser' | 'member'): Result<null> =>
  role === 'member' ? ok(null) : fail('organiser_cannot_leave');

/**
 * The lists that leave a party with me, and those that would then be in
 * no party at all: these get one of their own, since every list is in at
 * least one (modele.md).
 * @param mine - My lists in this party, with how many parties each is in.
 * @returns The ids to take out, and those left alone.
 */
export const leavingLists = (
  mine: readonly { listId: string; parties: number }[],
): { out: string[]; alone: string[] } => ({
  out: mine.map((list) => list.listId),
  alone: mine.filter((list) => list.parties <= 1).map((list) => list.listId),
});
