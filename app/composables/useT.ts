import {
  isLocale,
  localeFromHeader,
  translate,
  translateKey,
  type Locale,
  type MessageKey,
  type Params,
} from '#shared/i18n';

// The language of the interface (plan v7). On the admin side it is the
// visitor's choice, kept in a cookie, or the browser's language the first
// time. On a personal page it follows the participant's preferred
// language (see usePersonal). Texts live in shared/i18n.

const ONE_YEAR = 60 * 60 * 24 * 365;

export const useLocale = () => {
  const cookie = useCookie<string | null>('locale', {
    maxAge: ONE_YEAR,
    sameSite: 'lax',
  });
  const locale = useState<Locale>('locale', () =>
    isLocale(cookie.value)
      ? cookie.value
      : localeFromHeader(
          useRequestHeaders(['accept-language'])['accept-language'],
        ),
  );
  /** Changes the language and remembers it on this device. */
  const setLocale = (next: Locale) => {
    locale.value = next;
    cookie.value = next;
  };
  return { locale, setLocale };
};

/**
 * `t` for keys known at compile time (checked against the dictionaries),
 * `tk` for keys built at run time (`common.status.${status}`).
 */
export const useT = () => {
  const { locale, setLocale } = useLocale();
  const t = (key: MessageKey, params?: Params): string =>
    translate(locale.value, key, params);
  const tk = (key: string, params?: Params): string =>
    translateKey(locale.value, key, params);
  return { t, tk, locale, setLocale };
};
