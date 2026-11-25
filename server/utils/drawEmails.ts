import type { EmailNews } from '#shared/utils/news';

// Au tirage, l'application prévient chacun (ticket 169,
// docs/spec/v3/secret-santa.md): each participant with an address gets
// the message of the draw from the app; the others get their link from
// the organiser's phone.

/** How a participant gets their link after the draw. */
export type Reach = 'email' | 'noAddress' | 'noEmails';

/**
 * How a participant gets their link: by our email, or by the organiser's
 * phone when they have no address, or when their address refused our
 * emails (ticket 130), or their account wants none.
 * @param person - Their address, whether it is blocked, their account's choice.
 * @param person.email - The address, if any.
 * @param person.blocked - The address refused our emails.
 * @param person.choice - « Par email » of their account, if they have one.
 * @returns How they get it.
 */
export const reachOf = (person: {
  email: string | null;
  blocked: boolean;
  choice: EmailNews | null;
}): Reach => {
  if (!person.email) return 'noAddress';
  if (person.blocked || person.choice === 'none') return 'noEmails';
  return 'email';
};

/**
 * Who the app writes to after a draw: those it reaches by email and has
 * not written to yet; the chosen ones only, when some are given.
 * @param people - The participants, how they are reached, whether written to.
 * @param only - The participations to write to, if not all.
 * @returns Those to write to.
 */
export const drawEmailTargets = <
  P extends {
    participationId: string;
    reach: Reach;
    messageSentAt: string | null;
  },
>(
  people: readonly P[],
  only?: readonly string[],
): P[] =>
  people.filter(
    (person) =>
      person.reach === 'email' &&
      !person.messageSentAt &&
      (!only || only.includes(person.participationId)),
  );

/** Where the draw emails stand, for the follow-up. */
export type DrawEmailsState = 'sent' | 'manual' | 'failed';

/**
 * Where the draw emails stand: someone reached by email who was not
 * written to means the sending failed; else someone left to tell by hand;
 * else everyone has their email.
 * @param people - The participants, how they are reached, whether told, whether they looked.
 * @returns The state.
 */
export const drawEmailsState = (
  people: readonly {
    reach: Reach;
    messageSentAt: string | null;
    viewCount: number;
  }[],
): DrawEmailsState => {
  const untold = people.filter((p) => !p.messageSentAt && p.viewCount === 0);
  if (untold.some((p) => p.reach === 'email')) return 'failed';
  return untold.length > 0 ? 'manual' : 'sent';
};
