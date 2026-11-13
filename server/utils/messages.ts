import { ok, fail, type Result } from './result';
import { formatEventDate } from './rules';
import {
  DEFAULT_LOCALE,
  translate,
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
] as const;
export type MessageType = (typeof MESSAGE_TYPES)[number];

/**
 * The messages that make sense at a given stage: before the draw, only the
 * invitation and its reminder; "draw done" and "new draw" need a draw.
 */
export const messageTypesFor = (status: string): MessageType[] => {
  if (status === 'invitations') return ['invitation', 'reminder'];
  if (status === 'drawn') return ['drawn', 'reminder', 'redraw'];
  return [];
};

export type MessageData = {
  firstName: string;
  groupName: string;
  editionLabel: string;
  link: string;
  budget?: string;
  eventDate?: string;
};

const params = (d: MessageData, locale: Locale): Params => ({
  firstName: d.firstName,
  groupName: d.groupName,
  editionLabel: d.editionLabel,
  budget: d.budget ?? '',
  eventDate: formatEventDate(d.eventDate, locale),
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
    'messages.drawn.cta',
  ],
  reminder: () => ['messages.reminder.greeting', 'messages.reminder.cta'],
  redraw: () => ['messages.redraw.greeting', 'messages.redraw.cta'],
};

const linesOf = (
  type: MessageType,
  data: MessageData,
  locale: Locale,
): string[] =>
  TEMPLATES[type](data).map((key) =>
    translate(locale, key, params(data, locale)),
  );

const isMessageType = (type: string): type is MessageType =>
  (MESSAGE_TYPES as readonly string[]).includes(type);

/** The message to share, in the recipient's language (French by default). */
export const buildMessage = (
  type: string,
  data: MessageData,
  locale: Locale = DEFAULT_LOCALE,
): Result<string> => {
  if (!isMessageType(type)) return fail('unknown_message_type', { type });
  return ok([...linesOf(type, data, locale), data.link].join('\n'));
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

/**
 * The same message as an email: a subject, the text, and a plain HTML
 * twin (no button, no colours: it reads like a personal message). Like
 * every message, it never contains a result.
 */
export const buildEmail = (
  type: string,
  data: MessageData,
  locale: Locale = DEFAULT_LOCALE,
): Result<Email> => {
  if (!isMessageType(type)) return fail('unknown_message_type', { type });
  const lines = linesOf(type, data, locale);
  const closing = [
    translate(locale, 'messages.email.personal'),
    translate(locale, 'messages.email.signature', params(data, locale)),
  ];
  const link = escapeHtml(data.link);
  return ok({
    subject: translate(
      locale,
      `messages.${type}.subject`,
      params(data, locale),
    ),
    text: [...lines, data.link, '', ...closing].join('\n'),
    html: [
      '<div style="font-family:sans-serif;font-size:16px;line-height:1.5">',
      ...lines.map(paragraph),
      `<p style="margin:0 0 20px"><a href="${link}">${link}</a></p>`,
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
