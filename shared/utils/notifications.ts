// The notifications of the phone follow « Quoi de neuf » (ticket 175):
// each carries the news it says as its tag, and a notification whose
// news is seen, or that the app no longer knows, is taken away.

/** The most news ids a notification carries of those still waiting. */
export const KEPT_MAX = 30;

/**
 * The tag of the notification of a news.
 * @param newsId - The news.
 * @returns Its tag.
 */
export const newsTag = (newsId: string): string => `news-${newsId}`;

/**
 * The notifications to take away: all but those of the news still
 * waiting.
 * @param shown - The tags of the notifications on the phone.
 * @param waiting - The ids of the news sent to the phone and not seen.
 * @returns The tags to take away.
 */
export const staleNotifications = (
  shown: readonly string[],
  waiting: readonly string[],
): string[] => {
  const kept = new Set(waiting.map(newsTag));
  return shown.filter((tag) => !kept.has(tag));
};
