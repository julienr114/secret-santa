import { daysUntil, formatEventDate, isIsoDay } from '#server/utils/rules';

/**
 * The words for the day of a party, on the home: short in a row ("fête
 * dans 14 jours"), long on a card ("Fête le 24 décembre, dans 14 jours").
 * Nothing without a date.
 * @returns The two ways to say it.
 */
export const usePartyText = () => {
  const { t, locale } = useT();
  const today = new Date().toLocaleDateString('sv-SE');
  return {
    /**
     * The party in a few words.
     * @param eventDate - The date of the party, ISO or older free text.
     * @returns The words, or null without a date.
     */
    short: (eventDate: string): string | null => {
      if (!eventDate) return null;
      const days = daysUntil(eventDate, today);
      if (days === 0) return t('auth.home.party.today');
      return days === null
        ? t('auth.home.party.on', {
            date: formatEventDate(eventDate, locale.value),
          })
        : t('auth.home.party.in', { count: days });
    },
    /**
     * The party in a sentence, with its date.
     * @param eventDate - The date of the party, ISO or older free text.
     * @returns The sentence, or null without a date.
     */
    long: (eventDate: string): string | null => {
      if (!eventDate) return null;
      const date = formatEventDate(eventDate, locale.value);
      const days = daysUntil(eventDate, today);
      if (days === 0) return t('auth.home.drawCard.partyToday');
      return days === null || !isIsoDay(eventDate)
        ? t('auth.home.drawCard.partyOn', { date })
        : t('auth.home.drawCard.partyOnIn', { date, count: days });
    },
  };
};
