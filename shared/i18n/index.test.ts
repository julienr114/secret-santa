import { describe, expect, it } from 'vitest';
import fr from './locales/fr';
import en from './locales/en';
import de from './locales/de';
import {
  LOCALES,
  hasMessage,
  localeFromHeader,
  localeOf,
  translate,
  translateKey,
  translator,
} from './index';

type Tree = { [key: string]: Tree | string };

/** Every text of a dictionary, by dot path (plural forms included). */
const flatten = (node: Tree, prefix = ''): Record<string, string> =>
  Object.entries(node).reduce<Record<string, string>>(
    (acc, [key, value]) => ({
      ...acc,
      ...(typeof value === 'string'
        ? { [`${prefix}${key}`]: value }
        : flatten(value, `${prefix}${key}.`)),
    }),
    {},
  );
const placeholders = (text: string) =>
  [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).toSorted();

const reference = flatten(fr as unknown as Tree);
const others = {
  en: flatten(en as unknown as Tree),
  de: flatten(de as unknown as Tree),
};

describe('dictionaries', () => {
  it('have exactly the same keys in every language', () => {
    Object.entries(others).forEach(([locale, texts]) => {
      expect(Object.keys(texts).toSorted(), locale).toEqual(
        Object.keys(reference).toSorted(),
      );
    });
  });

  it('use the same placeholders as the French text', () => {
    Object.entries(others).forEach(([locale, texts]) => {
      Object.entries(reference).forEach(([key, text]) => {
        expect(placeholders(texts[key] ?? ''), `${locale}: ${key}`).toEqual(
          placeholders(text),
        );
      });
    });
  });

  it('leave no text empty', () => {
    [reference, others.en, others.de].forEach((texts) => {
      Object.entries(texts).forEach(([key, text]) => {
        expect(text.trim(), key).not.toBe('');
      });
    });
  });
});

describe('translate', () => {
  it('fills the placeholders', () => {
    expect(
      translate('fr', 'participant.home.greeting', { firstName: 'Léa' }),
    ).toBe('Salut Léa !');
    expect(
      translate('en', 'participant.home.greeting', { firstName: 'Léa' }),
    ).toBe('Hi Léa!');
    expect(
      translate('de', 'participant.home.greeting', { firstName: 'Léa' }),
    ).toBe('Hallo Léa!');
  });

  it('leaves an unknown placeholder visible rather than dropping it', () => {
    expect(translate('fr', 'participant.home.greeting')).toBe(
      'Salut {firstName} !',
    );
  });

  it('picks the plural form of the language: 0 is singular in French only', () => {
    const count = (locale: 'fr' | 'en' | 'de', n: number) =>
      translate(locale, 'common.count.participants', { count: n });
    expect([0, 1, 2].map((n) => count('fr', n))).toEqual([
      '0 participant',
      '1 participant',
      '2 participants',
    ]);
    expect([0, 1, 2].map((n) => count('en', n))).toEqual([
      '0 participants',
      '1 participant',
      '2 participants',
    ]);
    expect([0, 1, 2].map((n) => count('de', n))).toEqual([
      '0 Teilnehmer',
      '1 Teilnehmer',
      '2 Teilnehmer',
    ]);
  });

  it('returns the key itself when nothing matches, never throws', () => {
    expect(translateKey('en', 'no.such.key')).toBe('no.such.key');
    expect(translateKey('en', 'common')).toBe('common');
    expect(hasMessage('no.such.key')).toBe(false);
    expect(hasMessage('common.status.preparing')).toBe(true);
    expect(hasMessage('common.count.participants')).toBe(true);
  });

  it('elides « de » before a name in French only', () => {
    const key = 'adminEdition.cockpit.sendLinkOf';
    expect(translateKey('fr', key, { name: 'Inès' })).toBe(
      "Envoyer le lien d'Inès",
    );
    expect(translateKey('fr', key, { name: 'Louis' })).toBe(
      'Envoyer le lien de Louis',
    );
    expect(translateKey('en', key, { name: 'Inès' })).not.toContain("d'");
    expect(translateKey('de', key, { name: 'Inès' })).not.toContain("d'");
  });

  it('binds a language with translator()', () => {
    expect(translator('de')('common.actions.back')).toBe('Zurück');
  });
});

describe('locales', () => {
  it('falls back to French for anything unsupported', () => {
    expect(LOCALES).toEqual(['fr', 'en', 'de']);
    expect(localeOf('de')).toBe('de');
    expect(localeOf('es')).toBe('fr');
    expect(localeOf(null)).toBe('fr');
  });

  it('reads the first supported language of Accept-Language', () => {
    expect(localeFromHeader('de-CH,de;q=0.9,en;q=0.8')).toBe('de');
    expect(localeFromHeader('es-ES,en-GB;q=0.8')).toBe('en');
    expect(localeFromHeader('ja')).toBe('fr');
    expect(localeFromHeader(undefined)).toBe('fr');
  });
});
