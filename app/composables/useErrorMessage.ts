import { hasMessage } from '#shared/i18n';

type ApiError = {
  data?: { statusMessage?: string };
  statusMessage?: string;
  message?: string;
};

/**
 * Returns `errorMessage(error)`: the text to show for a $fetch error (or
 * any error), in the current language. API failures carry a reason code
 * (statusMessage of createError) that names a text of `errors.*`.
 */
export const useErrorMessage = () => {
  const { t, tk } = useT();
  return (error: unknown): string => {
    const e = (error ?? {}) as ApiError;
    const reason = e.data?.statusMessage ?? e.statusMessage ?? e.message;
    if (!reason) return t('errors.unknown');
    if (reason === 'Validation Error') return t('errors.validation');
    return hasMessage(`errors.${reason}`)
      ? tk(`errors.${reason}`)
      : t('errors.other', { reason });
  };
};
