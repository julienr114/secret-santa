import type { PastDeed } from '#shared/utils/years';
import type { PartyCategory } from '#shared/utils/categories';
import type { ForWhom } from '#shared/utils/forWhom';

/**
 * The words of the years over (ticket 108, docs/spec/v3/lignes.md, « Les
 * lignes des événements passés »): what I did there, the name of a year,
 * its day.
 * @returns `deedText`, `yearName`, `dayOf`.
 */
export const usePastText = () => {
  const { t, tk, locale } = useT();
  /**
   * « Tu offrais à Zoé », « Tu as offert 3 cadeaux », « 8 cadeaux offerts »,
   * « 7 cadeaux offerts à Zoé » for a birthday made for someone else than
   * me (ticket 118).
   * @param deed - The case, or null.
   * @param forWhom - Whom the event is for, if known.
   * @returns The text, or '' for nothing to say.
   */
  const deedText = (deed: PastDeed, forWhom?: ForWhom | null): string => {
    if (!deed) return '';
    if (deed.kind === 'offered') {
      return t('party.past.offered', { count: deed.count });
    }
    if (deed.kind === 'received') {
      return forWhom && !forWhom.me
        ? t('party.past.receivedFor', {
            count: deed.count,
            name: forWhom.firstName,
          })
        : t('party.past.received', { count: deed.count });
    }
    const [name = '', ...others] = deed.names;
    return others.length === 0
      ? t('party.past.gaveTo', { name })
      : t('party.past.gaveToTwo', {
          name: [name, ...others.slice(0, -1)].join(', '),
          other: others.at(-1) ?? '',
        });
  };
  /**
   * The name of a year: its category and its number (« Noël 2025 »); for
   * a birthday whose age is known, the age (« Ses 3 ans », ticket 118).
   * @param category - The category of the event.
   * @param year - « 2025 ».
   * @param forWhom - Whom the event is for, with their age that year.
   * @returns The name.
   */
  const yearName = (
    category: PartyCategory,
    year: number,
    forWhom?: ForWhom | null,
  ) =>
    forWhom?.age
      ? t(forWhom.me ? 'party.age.pastMine' : 'party.age.pastTheirs', {
          count: forWhom.age,
        })
      : `${tk(`party.category.${category}`)} ${year}`;
  /**
   * A day of a year over, « 25 décembre », with its year if asked.
   * @param iso - « 2025-12-25 ».
   * @param withYear - « 25 décembre 2025 ».
   * @returns The day in words.
   */
  const dayOf = (iso: string, withYear = false) =>
    new Intl.DateTimeFormat(locale.value, {
      day: 'numeric',
      month: 'long',
      ...(withYear ? { year: 'numeric' as const } : {}),
      timeZone: 'UTC',
    }).format(new Date(`${iso}T12:00:00Z`));
  /**
   * The text of a line of « Les événements passés »: its day, then what I
   * did there, in lower case after the day.
   * @param date - Its day, if known.
   * @param deed - What I did there.
   * @param forWhom - Whom the event is for, if known.
   * @returns « 25 décembre · tu offrais à Zoé ».
   */
  const lineText = (
    date: string | null,
    deed: PastDeed,
    forWhom?: ForWhom | null,
  ) => {
    const text = deedText(deed, forWhom);
    const after = text
      ? `${text.charAt(0).toLocaleLowerCase(locale.value)}${text.slice(1)}`
      : '';
    return [date ? dayOf(date) : '', after].filter(Boolean).join(' · ');
  };
  return { deedText, yearName, dayOf, lineText };
};
