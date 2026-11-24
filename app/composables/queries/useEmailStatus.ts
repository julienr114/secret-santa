import type { BlockWarning } from '#server/utils/stopEmail';
import { useApiMutation } from './useApi';

/**
 * Whether typed addresses receive nothing (ticket 130): their warning,
 * by address in lower case, for those that are blocked.
 * @returns The mutation, read after a field is written.
 */
export const useEmailStatusMutation = () =>
  useApiMutation<
    { warnings: Record<string, BlockWarning> },
    { emails: string[] }
  >((body) => $fetch('/api/email-status', { method: 'POST', body }));
