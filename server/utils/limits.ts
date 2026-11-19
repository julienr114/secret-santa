// The safety net (lot 38 A, README 8): what an account or a visitor may
// write, at most, and what a text meant to be a name may not carry. Pure:
// the routes count rows and ask here. The figures are wide: nobody meets
// them by using the app; they only stop a script from filling the base.

/** What is capped, and at how many. */
export const CAPS = {
  /** The lists an account holds. */
  lists: 100,
  /** The people on one list. */
  people: 60,
  /** The ideas of one list, everyone together. */
  ideas: 600,
  /** The gifts not on the list one account says, on one list. */
  off_list: 20,
  /** « Mes proches » of one account. */
  family: 200,
  /** The lines written in the journal of one group, in a day. */
  journal: 2000,
  /** The sessions one account keeps open: beyond, the oldest closes. */
  sessions: 20,
} as const;
export type Capped = keyof typeof CAPS;

/**
 * Whether one more may be written.
 * @param what - What is being written.
 * @param count - How many there are already.
 * @returns Null when one more fits, otherwise the code of the refusal
 *   (`limit_lists`, `limit_people`…), which names its text in `errors.*`.
 */
export const capRefusal = (what: Capped, count: number): string | null =>
  count >= CAPS[what] ? `limit_${what}` : null;

/**
 * The sessions to close so that a new one fits: the ones seen longest
 * ago, beyond the cap.
 * @param sessions - The open sessions of the account.
 * @returns The ids to close, oldest first.
 */
export const sessionsToClose = (
  sessions: readonly { id: string; lastSeenAt: string }[],
): string[] =>
  sessions
    .toSorted((a, b) => a.lastSeenAt.localeCompare(b.lastSeenAt))
    .slice(0, Math.max(0, sessions.length - (CAPS.sessions - 1)))
    .map((session) => session.id);

/**
 * What one run of a scheduled task handles, at most (lot 38 A): a run
 * has a bounded number of database queries (50 on the free plan of
 * Workers), and must end rather than fail half-way. What does not fit
 * waits for the next run.
 */
export const SCHEDULED = {
  /** Editions read by the morning reminder, the most recent first. */
  remindersRead: 300,
  /** Reminders sent by one morning run. */
  remindersPerRun: 12,
  /** Games of « Devine qui » one run looks after, the soonest to end first. */
  gamesPerRun: 12,
} as const;

/**
 * The first of some rows that are due, as many as one run handles.
 * @param rows - The rows, in the order they should be served.
 * @param isDue - Whether a row needs work now.
 * @param max - How many one run handles.
 * @returns The rows to handle now.
 */
export const dueBatch = <T>(
  rows: readonly T[],
  isDue: (row: T) => boolean,
  max: number,
): T[] => rows.filter(isDue).slice(0, max);

// A first name, the name of a group or of a list is printed in emails
// sent to others. It is escaped and never made a link, but a mail app
// turns anything that looks like an address into one: a name that
// carries a web address is refused, so that the app cannot be used to
// send someone's link under its own name.
const WEB_ADDRESS =
  /(?:https?:\/\/|www\.)\S|(?<![\p{L}\p{N}@])(?:[\p{L}\p{N}-]+\.)+(?:com|net|org|info|biz|io|co|fr|de|uk|eu|be|ch|es|it|nl|ru|cn|xyz|top|site|online|shop|app|dev|link|click|party|me|tv|ly|gg|to|cc)(?![\p{L}\p{N}])/iu;

/**
 * Whether a text carries a web address: « http://… », « www.… », or a
 * name ending like one (« gain.example.com », « promo.xyz »). An
 * initial with its dot (« J. Martin », « St. Nicolas ») is not one.
 * @param text - The text of a name.
 * @returns True when it does.
 */
export const hasWebAddress = (text: string): boolean => WEB_ADDRESS.test(text);

/** The reason a schema gives when a name carries a web address. */
export const WEB_ADDRESS_REFUSED = 'web_address';
/**
 * The check a schema of a name runs: a first name, the name of a group,
 * of a draw or of a list.
 * @param text - The name.
 * @returns True when it may be kept.
 */
export const isPlainName = (text: string): boolean => !hasWebAddress(text);

// --- The login link (README 8.4) ---------------------------------------

/** What limits the login links: per address, per client, for everyone. */
export const LINK_LIMITS = {
  /** Links one address may be sent in an hour. */
  perEmail: 3,
  /** Links one client address may ask for in an hour. */
  perIp: 20,
  /** Links the whole app sends in a day. */
  perDay: 1000,
} as const;

/** What a request for a login link gets. */
export type LinkVerdict = 'send' | 'silent' | 'refuse';

/**
 * What to do of a request for a login link. A client that asks too much
 * is refused (429): that says nothing of any address. An address that
 * was sent enough links, or a day when the app sent too many, gets the
 * same answer as ever and no email: nobody learns from the answer
 * whether an address has an account, nor can make the app write to it
 * without end.
 * @param recent - How many links were asked: for this address and from
 *   this client within the hour, by everyone within the day.
 * @param limits - The limits (raised for the tests).
 * @returns Send the link, answer the same without sending, or refuse.
 */
export const linkVerdict = (
  recent: { forEmail: number; fromIp: number; today: number },
  limits: { perEmail: number; perIp: number; perDay: number } = LINK_LIMITS,
): LinkVerdict => {
  if (recent.fromIp >= limits.perIp) return 'refuse';
  return recent.forEmail >= limits.perEmail || recent.today >= limits.perDay
    ? 'silent'
    : 'send';
};
