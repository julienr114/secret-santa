import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryKey,
} from '@tanstack/vue-query';
import type { MaybeRefOrGetter } from 'vue';
import type { NitroFetchOptions } from 'nitropack/types';

/** JSON request helper with cookies, shared by every query and mutation. */
export const api = <T>(path: string, options: NitroFetchOptions<string> = {}) =>
  $fetch<T>(path, { credentials: 'include', ...options });

/**
 * A mutation that invalidates the given keys on success.
 * @param mutationFn the request
 * @param invalidates keys to refetch, computed from the variables
 */
export const useApiMutation = <TData, TVariables = void>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  invalidates: (variables: TVariables) => readonly QueryKey[] = () => [],
) => {
  const queryClient = useQueryClient();
  return useMutation<TData, Error, TVariables>({
    mutationFn,
    onSuccess: async (_data, variables) => {
      await Promise.all(
        invalidates(variables).map((queryKey) =>
          queryClient.invalidateQueries({ queryKey }),
        ),
      );
    },
  });
};

/**
 * GET query that is also fetched during server rendering, so the first
 * paint already has the data. useRequestFetch forwards the session cookie
 * of the incoming request on the server and is plain $fetch in the browser.
 * `enabled` holds it back until what it needs is known.
 */
export const useApiQuery = <T>(
  queryKey: MaybeRefOrGetter<QueryKey>,
  path: MaybeRefOrGetter<string>,
  enabled: MaybeRefOrGetter<boolean> = true,
) => {
  const fetcher = useRequestFetch();
  const query = useQuery({
    queryKey: computed(() => toValue(queryKey)),
    queryFn: () =>
      fetcher<T>(toValue(path), { credentials: 'include' }) as Promise<T>,
    enabled: computed(() => toValue(enabled)),
  });
  onServerPrefetch(async () => {
    if (toValue(enabled)) await query.suspense();
  });
  return query;
};
