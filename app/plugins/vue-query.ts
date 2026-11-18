import {
  VueQueryPlugin,
  QueryClient,
  defaultShouldDehydrateQuery,
  dehydrate,
  hydrate,
  type DehydratedState,
} from '@tanstack/vue-query';

// Server state lives in TanStack Query (README section 7). The server
// dehydrates the cache after rendering into Nuxt's payload, and the client
// hydrates from it. hydrate() throws on a null state (pages rendered on the
// client only), hence the guard. A failed read is passed on too, as a
// plain error (its code and reason): a refused link must show « Ce lien
// ne marche plus » at once, not the page's skeleton while the browser
// asks again (and the page would not match what the server sent).
export default defineNuxtPlugin((nuxtApp) => {
  const vueQueryState = useState<DehydratedState | null>(
    'vue-query',
    () => null,
  );
  const queryClient = new QueryClient({
    defaultOptions: { queries: { staleTime: 5_000, retry: 1 } },
  });

  nuxtApp.vueApp.use(VueQueryPlugin, { queryClient });

  if (import.meta.server) {
    nuxtApp.hooks.hook('app:rendered', () => {
      const state = dehydrate(queryClient, {
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) || query.state.status === 'error',
        shouldRedactErrors: () => false,
      });
      vueQueryState.value = {
        ...state,
        queries: state.queries.map((query) => ({
          ...query,
          state: {
            ...query.state,
            // A plain object in place of the error: an Error does not go
            // through the payload.
            error: plainError(query.state.error) as Error | null,
            fetchFailureReason: plainError(
              query.state.fetchFailureReason,
            ) as Error | null,
          },
        })),
      };
    });
  }

  if (import.meta.client && vueQueryState.value) {
    hydrate(queryClient, vueQueryState.value);
  }
});

/**
 * An error as the payload can carry it: its code and reason only.
 * @param error - The error of a read, if any.
 * @returns A plain object, or null.
 */
const plainError = (error: unknown) => {
  if (!error) return null;
  const e = error as {
    statusCode?: number;
    statusMessage?: string;
    message?: string;
    data?: { statusMessage?: string };
  };
  return {
    statusCode: e.statusCode,
    statusMessage: e.data?.statusMessage ?? e.statusMessage,
    message: e.message,
  };
};
