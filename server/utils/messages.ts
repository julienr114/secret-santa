import { ok, fail, type Result } from './result';
import { formatEventDate } from './rules';
import { clockTime, guessEndText } from '#shared/utils/dates';
import {
  DEFAULT_LOCALE,
  santaKey,
  translate,
  translateKey,
  type Locale,
  type MessageKey,
  type Params,
} from '#shared/i18n';

// Messages the guardian shares from the phone share sheet (README 13).
// Pure templates: short, no formatting, the link alone on the last line so
// messaging apps make it clickable. They never contain a result. The texts
// live in shared/i18n and are written in the recipient's language.

export const MESSAGE_TYPES = [
  'invitation',
  'drawn',
  'reminder',
  'redraw',
  // A draw already made elsewhere (README 22.12): ask who they give to,
  // remind, and ask the two whose answers clash to check theirs.
  'answerRequest',
  'answerReminder',
  'answerCheck',
  // « Devine qui » (README 22.17): the one reminder of the organiser.
  'guessReminder',
] as const;
export type MessageType = (typeof MESSAGE_TYPES)[number];

/**
 * The messages that make sense at a given stage: before the draw, only the
 * invitation and its reminder, or, for a draw made elsewhere, the three
 * messages of the answers; "draw done" and "new draw" need a draw.
 * @param status - Status of the edition.
 * @param mode - How it is drawn: by the app, or elsewhere.
 * @returns The messages, in the order of their tabs.
 */
export const messageTypesFor = (
  status: string,
  mode: string = 'app',
): MessageType[] => {
  if (status === 'preparing' && mode === 'elsewhere') {
    return ['answerRequest', 'answerReminder', 'answerCheck'];
  }
  if (status === 'preparing') return ['invitation', 'reminder'];
  if (status === 'drawn') return ['drawn', 'reminder', 'redraw'];
  return [];
};

/**
 * The message offered first when a sheet opens for someone (README 13.2):
 * before the draw, the invitation, then its reminder; after the draw, the
 * draw done, its reminder once sent, and the new draw after a redraw.
 * @param status - Status of the edition.
 * @param sent - Whether this person was already sent a message of this draw.
 * @param redrawn - Whether the draw was cancelled and run again.
 * @param answers - For a draw made elsewhere, whether this person's answer
 *   clashes with another: then « À vérifier », before anything else.
 * @returns The message, or null when the stage has none.
 */
export const defaultMessageType = (
  status: string,
  sent: boolean,
  redrawn: boolean,
  answers?: { mode: string; inConflict: boolean },
): MessageType | null => {
  if (status === 'preparing' && answers?.mode === 'elsewhere') {
    if (answers.inConflict) return 'answerCheck';
    return sent ? 'answerReminder' : 'answerRequest';
  }
  if (status === 'preparing') return sent ? 'reminder' : 'invitation';
  if (status !== 'drawn') return null;
  if (sent) return 'reminder';
  return redrawn ? 'redraw' : 'drawn';
};

export type MessageData = {
  firstName: string;
  groupName: string;
  editionLabel: string;
  link: string;
  budget?: string;
  eventDate?: string;
  /**
   * « Devine qui » is on (README 22.17): when the guesses end, an instant,
   * and the time zone it was chosen in.
   */
  guessEndsAt?: string | null;
  guessTimeZone?: string | null;
  /** The game's mode, for how it is explained. */
  guessMode?: 'none' | 'santa' | 'all';
  /**
   * A Christmas party; elsewhere, never « Père Noël »
   * (docs/spec/v3/vocabulaire.md). Christmas when left out.
   */
  christmas?: boolean;
  /**
   * The first name of the organiser who sends it, for the signature of an
   * email; none when unknown (it then signs with the Secret Santa).
   */
  sender?: string | null;
};

const params = (d: MessageData, locale: Locale): Params => ({
  firstName: d.firstName,
  groupName: d.groupName,
  editionLabel: d.editionLabel,
  sender: d.sender ?? '',
  budget: d.budget ?? '',
  eventDate: formatEventDate(d.eventDate, locale),
  guessEnd: d.guessEndsAt
    ? guessEndText(d.guessEndsAt, locale, d.guessTimeZone ?? undefined)
    : '',
});

const details = (d: MessageData): MessageKey[] => [
  ...(d.budget ? (['messages.budget'] as const) : []),
  ...(d.eventDate ? (['messages.eventDate'] as const) : []),
];

// The lines of each message, as dictionary keys (shared/i18n, `messages`).
const TEMPLATES: Record<MessageType, (d: MessageData) => MessageKey[]> = {
  invitation: () => [
    'messages.invitation.greeting',
    'messages.invitation.body',
    'messages.invitation.cta',
  ],
  drawn: (d) => [
    'messages.drawn.greeting',
    ...details(d),
    ...(d.guessEndsAt ? (['messages.guessLine'] as const) : []),
    'messages.drawn.cta',
  ],
  reminder: () => ['messages.reminder.greeting', 'messages.reminder.cta'],
  redraw: () => ['messages.redraw.greeting', 'messages.redraw.cta'],
  // The draw was made elsewhere (README 22.12): the principle, the hints
  // that open once everyone answered, the party, and the game if it is on.
  answerRequest: (d) => [
    'messages.answerRequest.greeting',
    'messages.answerRequest.body',
    'messages.answerRequest.how',
    'messages.answerRequest.hints',
    ...details(d),
    ...(d.guessEndsAt ? (['messages.answerRequest.game'] as const) : []),
    'messages.answerRequest.cta',
  ],
  answerReminder: () => [
    'messages.answerReminder.greeting',
    'messages.answerReminder.cta',
  ],
  // « Devine qui » presented (Correction 17): what it is, how it plays in
  // this edition's mode, until when, and that it stays secret.
  guessReminder: (d) => [
    'messages.guessReminder.greeting',
    'messages.guessReminder.body',
    d.guessMode === 'santa'
      ? 'messages.guessReminder.howSanta'
      : 'messages.guessReminder.howAll',
    'messages.guessReminder.secret',
    'messages.guessReminder.cta',
  ],
  answerCheck: () => [
    'messages.answerCheck.greeting',
    'messages.answerCheck.body',
    'messages.answerCheck.cta',
  ],
};

const linesOf = (
  type: MessageType,
  data: MessageData,
  locale: Locale,
): string[] =>
  TEMPLATES[type](data).map((key) =>
    translateKey(
      locale,
      santaKey(key, data.christmas ?? true),
      params(data, locale),
    ),
  );

const isMessageType = (type: string): type is MessageType =>
  (MESSAGE_TYPES as readonly string[]).includes(type);

export const NOTE_MAX = 500;

/** The organiser's own words, as lines; nothing when there are none. */
const noteLines = (note: string | null | undefined): string[] =>
  (note ?? '')
    .slice(0, NOTE_MAX)
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line !== '');

export const NOTE_POSITIONS = ['before', 'after'] as const;
export type NotePosition = (typeof NOTE_POSITIONS)[number];

/**
 * Adds the organiser's note to a message already built, set apart by an
 * empty line: above the standard text, or below it (after the link, so
 * that the sentence leading to the link is not cut). The note is sent as
 * written, in whatever language it was typed.
 */
export const addNote = (
  text: string,
  note: string | null | undefined,
  position: NotePosition = 'after',
) => {
  const extra = noteLines(note);
  if (extra.length === 0) return text;
  return (
    position === 'before' ? [...extra, '', text] : [text, '', ...extra]
  ).join('\n');
};

/** The message to share, in the recipient's language (French by default). */
export const buildMessage = (
  type: string,
  data: MessageData,
  locale: Locale = DEFAULT_LOCALE,
  note?: string | null,
  position: NotePosition = 'after',
): Result<string> => {
  if (!isMessageType(type)) return fail('unknown_message_type', { type });
  return ok(
    addNote(
      [...linesOf(type, data, locale), data.link].join('\n'),
      note,
      position,
    ),
  );
};

// --- Emails (bulk sending, optional per group) ---------------------------

export type Email = { subject: string; text: string; html: string };

const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};
export const escapeHtml = (value: string): string =>
  value.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char] ?? char);

const paragraph = (line: string) =>
  `<p style="margin:0 0 12px">${escapeHtml(line)}</p>`;
// The organiser's own words stand a little apart from the standard text.
const noteBlock = (lines: string[]) =>
  lines.length === 0
    ? []
    : [`<div style="margin:20px 0">${lines.map(paragraph).join('')}</div>`];

/**
 * The same message as an email: a subject, the text, and a plain HTML
 * twin (no button, no colours: it reads like a personal message). Like
 * every message, it never contains a result.
 */
export const buildEmail = (
  type: string,
  data: MessageData,
  locale: Locale = DEFAULT_LOCALE,
  note?: string | null,
  position: NotePosition = 'after',
): Result<Email> => {
  if (!isMessageType(type)) return fail('unknown_message_type', { type });
  const lines = linesOf(type, data, locale);
  const extra = noteLines(note);
  const above = position === 'before' ? extra : [];
  const below = position === 'after' ? extra : [];
  const closing = [
    translate(locale, 'messages.email.personal'),
    // Signed by the organiser who sends it, or by the Secret Santa.
    translate(
      locale,
      data.sender ? 'messages.email.signatureFrom' : 'messages.email.signature',
      params(data, locale),
    ),
  ];
  const link = escapeHtml(data.link);
  return ok({
    subject: translate(
      locale,
      `messages.${type}.subject`,
      params(data, locale),
    ),
    text: [
      ...(above.length > 0 ? [...above, ''] : []),
      ...lines,
      data.link,
      '',
      ...(below.length > 0 ? [...below, ''] : []),
      ...closing,
    ].join('\n'),
    html: [
      '<div style="font-family:sans-serif;font-size:16px;line-height:1.5">',
      ...noteBlock(above),
      ...lines.map(paragraph),
      `<p style="margin:0 0 20px"><a href="${link}">${link}</a></p>`,
      ...noteBlock(below),
      ...closing.map(paragraph),
      '</div>',
    ].join(''),
  });
};

export const EMAIL_AUDIENCES = ['unsent', 'all'] as const;
export type EmailAudience = (typeof EMAIL_AUDIENCES)[number];

/** One request sends at most this many emails; the rest waits for the next. */
export const EMAIL_BATCH_MAX = 50;

export type EmailCandidate = {
  participationId: string;
  email: string | null;
  messageSentAt: string | null;
};

/**
 * Who a bulk send writes to, among people with an address: the chosen
 * ones when `ids` is given, otherwise all of them or only those not marked
 * as sent yet. Capped to one batch.
 */
export const emailTargets = <P extends EmailCandidate>(
  participants: P[],
  audience: EmailAudience,
  ids?: string[],
): {
  targets: (P & { email: string })[];
  withoutEmail: number;
  left: number;
} => {
  const pool = ids
    ? participants.filter((p) => ids.includes(p.participationId))
    : participants;
  const reachable = pool.filter((p): p is P & { email: string } =>
    Boolean(p.email),
  );
  const wanted = reachable.filter(
    (p) => Boolean(ids) || audience === 'all' || !p.messageSentAt,
  );
  return {
    targets: wanted.slice(0, EMAIL_BATCH_MAX),
    withoutEmail: pool.length - reachable.length,
    left: Math.max(0, wanted.length - EMAIL_BATCH_MAX),
  };
};

/**
 * Lays out a plain email: lines, a link on its own line, more lines.
 * @param parts - Subject, the lines before and after, and the link.
 * @returns Subject, text and HTML.
 */
export const plainEmail = ({
  subject,
  before,
  link,
  after = [],
}: {
  subject: string;
  before: string[];
  link: string;
  after?: string[];
}): Email => {
  const href = escapeHtml(link);
  return {
    subject,
    text: [...before, link, ...(after.length > 0 ? ['', ...after] : [])].join(
      '\n',
    ),
    html: [
      '<div style="font-family:sans-serif;font-size:16px;line-height:1.5">',
      ...before.map(paragraph),
      `<p style="margin:0 0 20px"><a href="${href}">${href}</a></p>`,
      ...after.map(paragraph),
      '</div>',
    ].join(''),
  };
};

/**
 * « Le palmarès de Devine qui est arrivé » (README 22.17), once, to every
 * participant with an address, players or not. No name in it: it only
 * leads to the results, and asks to open one's gift first.
 * @param data - First name, group, edition and the link of the page.
 * @param locale - The recipient's language.
 * @returns The email.
 */
export const buildGuessResultsEmail = (
  data: {
    firstName: string;
    groupName: string;
    editionLabel: string;
    link: string;
  },
  locale: Locale = DEFAULT_LOCALE,
): Email => {
  const t = (key: MessageKey) =>
    translate(locale, key, {
      firstName: data.firstName,
      groupName: data.groupName,
      editionLabel: data.editionLabel,
    });
  const before = [
    t('messages.guessResults.greeting'),
    t('messages.guessResults.body'),
    t('messages.guessResults.giftFirst'),
  ];
  const after = [
    t('messages.guessResults.once'),
    t('messages.guessResults.signature'),
  ];
  const cta = t('messages.guessResults.cta');
  const href = escapeHtml(data.link);
  return {
    subject: t('messages.guessResults.subject'),
    text: [...before, '', `${cta} : ${data.link}`, '', ...after].join('\n'),
    html: [
      '<div style="font-family:sans-serif;font-size:16px;line-height:1.5">',
      ...before.map(paragraph),
      `<p style="margin:0 0 20px"><a href="${href}">${escapeHtml(cta)}</a></p>`,
      ...after.map(paragraph),
      '</div>',
    ].join(''),
  };
};

/** A line after the button, with a link inside: « {before}{link}{after} ». */
type LinkLine = { before: string; label: string; link: string; after: string };

/**
 * An email with one button, and words before and after it.
 * @param p - Subject, lines before, the button, lines after.
 * @returns The email, in text and in HTML.
 */
const buttonEmail = (p: {
  subject: string;
  before: string[];
  cta: string;
  link: string;
  after: (string | LinkLine)[];
}): Email => ({
  subject: p.subject,
  text: [
    ...p.before,
    '',
    `${p.cta} : ${p.link}`,
    '',
    ...p.after.map((line) =>
      typeof line === 'string'
        ? line
        : `${line.before}${line.label} (${line.link})${line.after}`,
    ),
  ].join('\n'),
  html: [
    '<div style="font-family:sans-serif;font-size:16px;line-height:1.5">',
    ...p.before.map(paragraph),
    `<p style="margin:0 0 20px"><a href="${escapeHtml(p.link)}">${escapeHtml(p.cta)}</a></p>`,
    ...p.after.map((line) =>
      typeof line === 'string'
        ? paragraph(line)
        : `<p style="margin:0 0 12px">${escapeHtml(line.before)}<a href="${escapeHtml(line.link)}">${escapeHtml(line.label)}</a>${escapeHtml(line.after)}</p>`,
    ),
    '</div>',
  ].join(''),
});

/** What every email of « Devine qui » to a participant knows. */
type GameEmailData = {
  firstName: string;
  groupName: string;
  editionLabel: string;
  /** The page of the game, on the personal link. */
  link: string;
  /** A Christmas party; elsewhere, never « Père Noël ». */
  christmas?: boolean;
  guessEndsAt: string;
  guessTimeZone: string | null;
};

/**
 * The automatic reminder (README 22.17, Correction 15): once, two days
 * before the end. `play` to those who did not play, with « Je passe mon
 * tour »; `more` to those who only guessed their own Santa, in « Toutes
 * les paires ». No name.
 * @param data - The person, the edition, the links, the count.
 * @param text - Which text.
 * @param locale - The recipient's language.
 * @returns The email.
 */
export const buildGuessAutoReminderEmail = (
  data: GameEmailData & {
    skipLink: string;
    played: number;
    total: number;
    days: number;
  },
  text: 'play' | 'more',
  locale: Locale = DEFAULT_LOCALE,
): Email => {
  const params = {
    firstName: data.firstName,
    groupName: data.groupName,
    editionLabel: data.editionLabel,
    guessEnd: guessEndText(
      data.guessEndsAt,
      locale,
      data.guessTimeZone ?? undefined,
    ),
    count: data.played,
    total: data.total,
    days: data.days,
  };
  const t = (key: string) =>
    translateKey(
      locale,
      santaKey(`messages.${key}`, data.christmas ?? true),
      params,
    );
  if (text === 'more') {
    return buttonEmail({
      subject: t('guessMore.subject'),
      before: [
        t('guessMore.greeting'),
        t('guessMore.body'),
        t('guessMore.more'),
      ],
      cta: t('guessMore.cta'),
      link: data.link,
      after: [t('guessAuto.once'), t('guessAuto.signature')],
    });
  }
  return buttonEmail({
    subject: t('guessAuto.subject'),
    before: [
      t('guessAuto.greeting'),
      data.played === 0 ? t('guessAuto.nobody') : t('guessAuto.body'),
      t('guessAuto.until'),
    ],
    cta: t('guessAuto.cta'),
    link: data.link,
    after: [
      {
        before: t('guessAuto.skipBefore'),
        label: t('guessAuto.skip'),
        link: data.skipLink,
        after: t('guessAuto.skipAfter'),
      },
      t('guessAuto.once'),
      t('guessAuto.signature'),
    ],
  });
};

/** What the organisers' emails of « Devine qui » know. */
type OrganizerGameData = {
  firstName: string;
  groupName: string;
  editionLabel: string;
  /** The follow-up of the edition. */
  link: string;
  guessEndsAt: string;
  guessTimeZone: string | null;
  played: number;
  total: number;
};

/**
 * The organiser's point, five days before the end, while someone is left
 * to remind (README 22.17, DevineEmailOrgaPoint): who has not played,
 * who has no address, when the automatic reminder goes.
 * @param data - The organiser, the edition, the counts and the names.
 * @param locale - The organiser's language.
 * @returns The email.
 */
export const buildGuessPointEmail = (
  data: OrganizerGameData & {
    /** Those left to remind, and those of them without an address. */
    missing: string[];
    noEmail: string[];
    days: number;
    /** Days before the automatic reminder; null when it will not go. */
    autoIn: number | null;
  },
  locale: Locale = DEFAULT_LOCALE,
): Email => {
  const list = (names: string[]) =>
    new Intl.ListFormat(locale, { type: 'conjunction' }).format(names);
  const params = {
    firstName: data.firstName,
    groupName: data.groupName,
    editionLabel: data.editionLabel,
    guessEnd: guessEndText(
      data.guessEndsAt,
      locale,
      data.guessTimeZone ?? undefined,
    ),
    played: data.played,
    total: data.total,
    count: data.missing.length,
    names: list(data.missing),
    noEmail: list(data.noEmail),
    noEmailCount: data.noEmail.length,
    days: data.days,
    autoIn: data.autoIn ?? 0,
  };
  const t = (key: string, more: Record<string, string | number> = {}) =>
    translateKey(locale, `messages.guessPoint.${key}`, { ...params, ...more });
  return buttonEmail({
    subject: t('subject'),
    before: [
      t('greeting'),
      [
        t('body'),
        t('missing'),
        data.noEmail.length > 0
          ? t('noEmail', { count: data.noEmail.length })
          : '',
      ]
        .filter(Boolean)
        .join(' '),
      [
        t('closes'),
        data.autoIn === null ? '' : t('auto', { count: data.autoIn }),
      ]
        .filter(Boolean)
        .join(' '),
    ],
    cta: t('cta'),
    link: data.link,
    after: [t('off'), t('signature')],
  });
};

/**
 * The organiser's email at the end of the guesses (DevineEmailOrgaFin):
 * how many played, « Dévoiler le tirage », and that it reveals itself the
 * day after.
 * @param data - The organiser, the edition, the counts.
 * @param locale - The organiser's language.
 * @returns The email.
 */
export const buildGuessEndEmail = (
  data: OrganizerGameData,
  locale: Locale = DEFAULT_LOCALE,
): Email => {
  const t = (key: string) =>
    translateKey(locale, `messages.guessEnd.${key}`, {
      firstName: data.firstName,
      groupName: data.groupName,
      editionLabel: data.editionLabel,
      count: data.played,
      total: data.total,
      time: clockTime(
        data.guessEndsAt,
        locale,
        data.guessTimeZone ?? undefined,
      ),
    });
  return buttonEmail({
    subject: t('subject'),
    before: [t('greeting'), t('body')],
    cta: t('cta'),
    link: data.link,
    after: [t('alone'), t('off'), t('signature')],
  });
};
