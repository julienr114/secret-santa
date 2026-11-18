// How each kind of journal event looks: its Lucide icon, and whether it is
// a milestone of the edition (a white card on a brick knot) or an alert
// everyone should notice (a mustard card, with what it means).

/** The icon of each kind of event. */
const ICONS: Record<string, string> = {
  edition_created: 'i-lucide-calendar-plus',
  participant_added: 'i-lucide-user-plus',
  participant_removed: 'i-lucide-user-minus',
  rules_changed: 'i-lucide-sliders-horizontal',
  message_sent: 'i-lucide-mail',
  link_copied: 'i-lucide-link',
  link_shared: 'i-lucide-share-2',
  link_regenerated: 'i-lucide-key-round',
  draw_done: 'i-lucide-sparkle',
  draw_cancelled: 'i-lucide-rotate-ccw',
  results_revealed: 'i-lucide-eye',
  result_revealed: 'i-lucide-eye',
  result_viewed: 'i-lucide-mail-open',
  avatar_changed: 'i-lucide-pencil',
  language_changed: 'i-lucide-globe',
  edition_closed: 'i-lucide-archive',
  draw_revealed: 'i-lucide-eye',
  answers_started: 'i-lucide-clipboard-list',
  answer_given: 'i-lucide-check',
  answer_changed: 'i-lucide-pencil',
  answers_validated: 'i-lucide-sparkle',
  answers_abandoned: 'i-lucide-rotate-ccw',
  guesses_enabled: 'i-lucide-search',
  guesses_closed: 'i-lucide-lock',
  guess_results_ready: 'i-lucide-sparkle',
  guess_reminder_sent: 'i-lucide-bell',
  guess_auto_reminder_sent: 'i-lucide-bell',
};

/** Milestones of an edition. */
const MILESTONES = new Set([
  'edition_created',
  'draw_done',
  'answers_validated',
  'draw_revealed',
  'edition_closed',
]);

/** Kinds of event that come with what they mean. */
export const JOURNAL_ALERTS = [
  'result_revealed',
  'results_revealed',
  'draw_cancelled',
] as const;
export type JournalAlert = (typeof JOURNAL_ALERTS)[number];

/**
 * Whether a kind of event is an alert.
 * @param type - The kind of event.
 * @returns True for an access to a result or a cancelled draw.
 */
export const isJournalAlert = (type: string): type is JournalAlert =>
  (JOURNAL_ALERTS as readonly string[]).includes(type);

/**
 * How a kind of event is drawn on the thread.
 * @param type - The kind of event.
 * @returns Its icon, and `alert`, `award` (the palmarès of « Devine qui »,
 *   in pine, README 22.17), `milestone` or `line`.
 */
export const journalLook = (type: string) => ({
  icon: ICONS[type] ?? 'i-lucide-circle',
  level: isJournalAlert(type)
    ? ('alert' as const)
    : type === 'guess_results_ready'
      ? ('award' as const)
      : MILESTONES.has(type)
        ? ('milestone' as const)
        : ('line' as const),
});
