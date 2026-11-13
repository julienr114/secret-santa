import type { Locale } from '#shared/i18n';

// Formatting helpers. Labels themselves live in shared/i18n
// (`common.status.*`, `common.badge.*`, `common.messageType.*`,
// `common.count.*`).

export const formatDate = (
  iso: string | null | undefined,
  locale: Locale,
): string =>
  iso
    ? new Intl.DateTimeFormat(locale, {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(iso))
    : '';

/** The message that fits the edition status by default. */
export const defaultMessageType = (status: string) =>
  status === 'drawn' ? 'drawn' : 'invitation';
