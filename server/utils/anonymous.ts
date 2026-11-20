import { toBase64Url } from './crypto';

// « Mode anonyme » on a gift list opened by its link, and the link from a
// draw to a gift list (lot 27 ter, README 22.20). Pure: what the setting
// becomes when a list is opened, whether a draw is still a secret, and
// the signature of the participation a link from a draw carries.

/** What is kept of my mode on one list. */
export type ModeRow = {
  /** My setting; null until something decides it. */
  anonymous: boolean | null;
  /** The note « On a activé le mode anonyme pour toi ». */
  notice: 'pending' | 'seen' | null;
};

/** What is known when I open a list. */
export type ModeSignals = {
  /**
   * In a draw not celebrated yet, I give to someone who holds the list
   * or figures on it with an account. Found by the server alone.
   */
  detected: boolean;
  /** The address asks for it (`?anonyme`). */
  asked: boolean;
  /** My account has a first name to tick under. */
  named: boolean;
};

/**
 * My mode on a list, as I open it. A draw found turns it on once, with
 * its note, whatever I had chosen before: after that the switch is mine,
 * and nothing turns it on again. Without a choice yet, the address may
 * ask for it, and an account without a first name is anonymous. A choice
 * made is never changed by the address.
 * @param row - What is kept.
 * @param signals - What is known now.
 * @returns What to keep.
 */
export const settleMode = (row: ModeRow, signals: ModeSignals): ModeRow => {
  if (signals.detected && row.notice === null) {
    return { anonymous: true, notice: 'pending' };
  }
  if (row.anonymous !== null) return row;
  return signals.asked || !signals.named ? { ...row, anonymous: true } : row;
};

/**
 * My mode after I touched the switch: mine from now on, and the note,
 * which spoke of the switch, is read.
 * @param row - What is kept.
 * @param anonymous - What I chose.
 * @returns What to keep.
 */
export const chooseMode = (row: ModeRow, anonymous: boolean): ModeRow => ({
  anonymous,
  notice: row.notice === 'pending' ? 'seen' : row.notice,
});

/** « Compris »: the note goes for good on this list. */
export const dismissNotice = (row: ModeRow): ModeRow => ({
  ...row,
  notice: row.notice === null ? null : 'seen',
});

/** What the bar of a list shows. */
export type ModeView = { anonymous: boolean; notice: boolean };

/**
 * What the bar shows of my mode.
 * @param row - What is kept.
 * @returns Whether it is on, and whether the note shows.
 */
export const modeView = (row: ModeRow): ModeView => ({
  anonymous: row.anonymous === true,
  notice: row.notice === 'pending' && row.anonymous === true,
});

/**
 * Whether a draw is still a secret worth keeping on a gift list: drawn,
 * not revealed, and its party not past (a draw without a day counts).
 * @param draw - The draw.
 * @param draw.status - Where its edition stands.
 * @param draw.revealedAt - When its results were revealed, or null.
 * @param draw.eventDate - The day of the party (YYYY-MM-DD), or empty.
 * @param today - Today (YYYY-MM-DD).
 * @returns True while who gives to whom must not show.
 */
export const drawStillSecret = (
  draw: { status: string; revealedAt: string | null; eventDate: string },
  today: string,
): boolean =>
  draw.status === 'drawn' &&
  !draw.revealedAt &&
  (!draw.eventDate || draw.eventDate >= today);

/**
 * Whether a list may be linked to my hints: one I hold or figure on,
 * and shared (its link is what the one who gives to me opens).
 * @param list - The list, or undefined when it is not one of mine.
 * @param list.shared - Whether it is shared.
 * @returns True when it may.
 */
export const canLinkList = (list: { shared: boolean } | undefined): boolean =>
  list?.shared === true;

const encoder = new TextEncoder();
const keyOf = (secret: string, usage: 'sign' | 'verify') =>
  crypto.subtle.importKey(
    'raw',
    encoder.encode(`draw-link:${secret}`),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    [usage],
  );
const fromBase64Url = (text: string): Uint8Array<ArrayBuffer> =>
  new Uint8Array(
    [...atob(text.replaceAll('-', '+').replaceAll('_', '/'))].map((c) =>
      c.charCodeAt(0),
    ),
  );

/**
 * The participation a link from a draw to a gift list carries, signed by
 * the app: the list then knows whose draw to look at, even opened with
 * another address. It names a participation, never who it gives to.
 * @param participationId - The participation of the one who gives.
 * @param secret - The secret of the app.
 * @returns What goes in the address.
 */
export const signParticipation = async (
  participationId: string,
  secret: string,
): Promise<string> => {
  const mac = await crypto.subtle.sign(
    'HMAC',
    await keyOf(secret, 'sign'),
    encoder.encode(participationId),
  );
  return `${participationId}.${toBase64Url(new Uint8Array(mac))}`;
};

/**
 * Reads the participation of a link: only one signed by the app.
 * @param text - What the address carries.
 * @param secret - The secret of the app.
 * @returns The participation, or null.
 */
export const verifyParticipation = async (
  text: string | null | undefined,
  secret: string,
): Promise<string | null> => {
  const [id, mac, ...rest] = (text ?? '').split('.');
  if (!id || !mac || rest.length > 0 || !secret) return null;
  try {
    const valid = await crypto.subtle.verify(
      'HMAC',
      await keyOf(secret, 'verify'),
      fromBase64Url(mac),
      encoder.encode(id),
    );
    return valid ? id : null;
  } catch {
    return null;
  }
};
