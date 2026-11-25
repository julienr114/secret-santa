import { useQueryClient } from '@tanstack/vue-query';
import type { NewsPage } from '#server/database/newsPage';
import { keys } from './keys';
import { api, useApiQuery } from './useApi';

// « Quoi de neuf » and the red dots (ticket 120).

/** My news, by event. */
export const useNewsQuery = () =>
  useApiQuery<NewsPage>(
    () => keys.news(),
    () => '/api/news',
  );

/**
 * How many news wait, for the tab; and those sent to the phones.
 * @param enabled - Only for someone logged in.
 * @returns The query.
 */
export const useNewsCountQuery = (enabled: MaybeRefOrGetter<boolean>) =>
  useApiQuery<{ count: number; pushed: string[] }>(
    () => keys.newsCount(),
    () => '/api/news/count',
    enabled,
  );

/**
 * Marks the news of the thing a page shows as seen, once it is shown: in
 * the browser only, once the page is there (a POST, never on a mere
 * read). The dots and the count are read again.
 * @param what - The place, or null while it is not known.
 * @returns Nothing.
 */
export const useSeen = (
  what: MaybeRefOrGetter<
    | { target: 'follow' | 'list' | 'party'; targetId: string }
    | { token: string; target: 'santa' }
    | null
    | undefined
  >,
) => {
  const queryClient = useQueryClient();
  const { loggedIn } = useUserSession();
  const done = ref('');
  const mark = async () => {
    const place = toValue(what);
    if (!place) return;
    const key = JSON.stringify(place);
    if (done.value === key) return;
    done.value = key;
    if ('token' in place) {
      await api(`/api/p/${place.token}/seen`, {
        method: 'POST',
        body: { target: place.target },
      }).catch(() => undefined);
    } else {
      if (!loggedIn.value) return;
      await api('/api/news/seen', { method: 'POST', body: place }).catch(
        () => undefined,
      );
    }
    await Promise.all(
      [keys.news(), keys.home()].map((queryKey) =>
        queryClient.invalidateQueries({ queryKey }),
      ),
    );
  };
  onMounted(() => {
    void mark();
    watch(() => toValue(what), mark);
  });
};
