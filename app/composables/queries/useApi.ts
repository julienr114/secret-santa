import {
  useMutation,
  useQueryClient,
  type QueryKey,
} from '@tanstack/vue-query';
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
