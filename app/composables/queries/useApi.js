import { useMutation, useQueryClient } from '@tanstack/vue-query';

/** JSON request helper with cookies, shared by every query and mutation. */
export const api = (path, options = {}) =>
  $fetch(path, { credentials: 'include', ...options });

/**
 * A mutation that invalidates the given keys on success.
 * @param {(variables: any) => Promise<any>} mutationFn
 * @param {(variables: any) => unknown[][]} invalidates keys to refetch
 */
export const useApiMutation = (mutationFn, invalidates = () => []) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: (_data, variables) =>
      Promise.all(
        invalidates(variables).map((queryKey) =>
          queryClient.invalidateQueries({ queryKey }),
        ),
      ),
  });
};
