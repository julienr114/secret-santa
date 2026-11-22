// The party (docs/spec/v3/fete.md, ticket 104): what may be created, who
// may be taken from another party, who may leave. Pure.
import { z } from 'zod';
import { PARTY_CATEGORIES, type PartyCategory } from '#shared/utils/categories';
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

/** One of my people, whom a birthday is for (ticket 118). */
const forMemberSchema = z.string().min(1).max(64).nullable();

/**
 * « Pour quelle occasion ? »: nothing on who is in it, since one comes in
 * by a Secret Santa or a list (ticket 117); for a birthday, whom it is for
 * (« Pour qui ? », ticket 118), none for « Quelqu'un d'autre ».
 */
export const partyInputSchema = z.object({
  category: z.enum(PARTY_CATEGORIES),
  name: partyNameSchema,
  date: isoDaySchema,
  recurring: z.boolean(),
  forMemberId: forMemberSchema.optional(),
});
export type PartyInput = z.infer<typeof partyInputSchema>;

/** The settings of the party itself (V3FeteReglages); « Pour », ticket 118. */
export const partyPatchSchema = z
  .object({
    category: z.enum(PARTY_CATEGORIES),
    date: isoDaySchema,
    recurring: z.boolean(),
    forMemberId: forMemberSchema,
  })
  .partial();

/**
 * Whom an event is for once saved: only a birthday is for someone; its
 * category changed to another, it is for nobody any more.
 * @param category - Its category once saved.
 * @param forMemberId - The person asked for, or the one it had.
 * @returns The person, or null.
 */
export const forMemberOf = (
  category: PartyCategory,
  forMemberId: string | null | undefined,
): string | null => (category === 'birthday' ? (forMemberId ?? null) : null);

/**
 * The usual day of a party from one of its dates.
 * @param iso - « 2026-12-25 ».
 * @returns « 12-25 ».
 */
export const usualDateOf = (iso: string): string => iso.slice(5, 10);

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
 * How many more members a party may take: what a link may still offer.
 * @param members - Its active members.
 * @returns The places left before 30, never below zero.
 */
export const membersLeft = (members: number): number =>
  Math.max(0, MAX_PARTY_MEMBERS - members);

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
