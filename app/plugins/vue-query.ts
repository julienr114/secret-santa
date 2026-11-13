import {
  VueQueryPlugin,
  QueryClient,
  dehydrate,
  hydrate,
  type DehydratedState,
} from '@tanstack/vue-query';

// Server state lives in TanStack Query (README section 7). The server
// dehydrates the cache after rendering into Nuxt's payload, and the client
// hydrates from it. hydrate() throws on a null state (pages rendered on the
// client only), hence the guard.
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
      vueQueryState.value = dehydrate(queryClient);
    });
  }

  if (import.meta.client && vueQueryState.value) {
    hydrate(queryClient, vueQueryState.value);
  }
});
