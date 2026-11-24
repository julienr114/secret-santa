import {
  isLocale,
  localeFromHeader,
  santaKey,
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
 * @param options - `christmas`, on a screen of one party: outside a
 * Christmas party, a text that says « Père Noël » reads its variant
 * (docs/spec/v3/vocabulaire.md).
 * @returns The two, the language and a way to change it.
 */
export const useT = (
  options: { christmas?: MaybeRefOrGetter<boolean> } = {},
) => {
  const { locale, setLocale } = useLocale();
  const keyOf = (key: string) =>
    options.christmas === undefined
      ? key
      : santaKey(key, toValue(options.christmas));
  const t = (key: MessageKey, params?: Params): string =>
    translateKey(locale.value, keyOf(key), params);
  const tk = (key: string, params?: Params): string =>
    translateKey(locale.value, keyOf(key), params);
  return { t, tk, locale, setLocale };
};
