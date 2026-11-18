import { ok, fail, type Result } from './result';
import { MAX_PARTICIPANTS } from './editions';
import { formatEventDate } from './rules';
import { translate, type Locale } from '#shared/i18n';
import { randomBytes, toBase64Url } from './crypto';

// Joining a group by an invitation link, and linking a draw opened by
// its personal link to an account. Pure, but for the random code.

/** 96 random bits: 16 URL-safe characters. */
export const INVITE_CODE_SHAPE = /^[A-Za-z0-9_-]{16}$/;

/**
 * A new invitation code.
 * @returns 16 URL-safe characters.
 */
export const generateInviteCode = (): string => toBase64Url(randomBytes(12));

/** What decides whether a group's link still lets people in. */
export type InviteLimits = {
  /** Last day the link works (ISO day), or null for no limit. */
  until: string | null;
  /** How many may still join by the link. */
  places: number;
};

/**
 * Whether someone may join the group by its link on `today`.
 * @param limits - The deadline and the places left.
 * @param today - ISO day.
 * @returns Ok, `invite_expired` or `invite_full`.
 */
export const canJoinGroup = (
  limits: InviteLimits,
  today: string,
): Result<true> => {
  if (limits.until && today > limits.until) return fail('invite_expired');
  return limits.places > 0 ? ok(true) : fail('invite_full');
};

/**
 * How many places a new link offers by default: what a draw can still
 * take, given the active people of the group.
 * @param activePeople - Active people in the group.
 * @returns The places left, never below zero.
 */
export const defaultInvitePlaces = (activePeople: number): number =>
  Math.max(0, MAX_PARTICIPANTS - activePeople);

/**
 * Whether a draw opened by its personal link may be linked to an account:
 * the person has no address yet, or already this one.
 * @param personEmail - Address the organiser gave for the person.
 * @param accountEmail - Address of the logged-in account.
 * @returns Ok, or `person_has_other_email`.
 */
export const canClaim = (
  personEmail: string | null,
  accountEmail: string,
): Result<true> =>
  personEmail === null || personEmail === accountEmail
    ? ok(true)
    : fail('person_has_other_email');

/**
 * Where a login may lead back to: an invitation, a personal page, or a
 * gift list, maybe with the idea to tick once back (README 22.19).
 */
const NEXT_SHAPE =
  /^\/(rejoindre|p|l)\/[A-Za-z0-9_-]{16,43}(\?cocher=[A-Za-z0-9_-]{16,43})?$/;

/**
 * The page to go back to after logging in, if it is one of ours.
 * @param next - The path asked for, from a query string.
 * @returns The path, or null when it is missing or not allowed.
 */
export const safeNext = (next: unknown): string | null =>
  typeof next === 'string' && NEXT_SHAPE.test(next) ? next : null;

/** Longest message an organiser may write on the invitation page. */
export const INVITE_MESSAGE_MAX = 500;

/**
 * The message to share with the link, like the messages of a draw: who
 * invites to what, until when, and the link alone on its line.
 * @param invite - Name of the group, link, last day (optional).
 * @param locale - Language of the message.
 * @returns The text, ready to copy or share.
 */
export const buildInviteMessage = (
  invite: { groupName: string; url: string; until: string | null },
  locale: Locale,
): string =>
  [
    translate(locale, 'adminEdition.invite.message.intro', {
      group: invite.groupName,
    }),
    translate(locale, 'adminEdition.invite.message.how'),
    ...(invite.until
      ? [
          translate(locale, 'adminEdition.invite.message.until', {
            date: formatEventDate(invite.until, locale),
          }),
        ]
      : []),
    '',
    invite.url,
  ].join('\n');
