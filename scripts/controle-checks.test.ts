import { describe, expect, it } from 'vitest';
import {
  flatten,
  forbiddenUses,
  hardCodedTexts,
  missingKeys,
} from './controle-checks';

describe('flatten', () => {
  it('gives every text by dot path, plural forms included', () => {
    expect(
      flatten({ a: { b: 'x', n: { one: '1', other: 'n' } }, c: 'y' }),
    ).toEqual({ 'a.b': 'x', 'a.n.one': '1', 'a.n.other': 'n', c: 'y' });
  });
});

describe('missingKeys', () => {
  it('names the key a single language lacks', () => {
    expect(
      missingKeys({
        fr: { 'common.back': 'Retour', 'common.add': 'Ajouter' },
        en: { 'common.back': 'Back', 'common.add': 'Add' },
        de: { 'common.back': 'Zurück' },
      }),
    ).toEqual([{ locale: 'de', key: 'common.add' }]);
  });

  it('looks in every direction, French included', () => {
    expect(
      missingKeys({ fr: {}, en: { only: 'x' }, de: { only: 'y' } }),
    ).toEqual([{ locale: 'fr', key: 'only' }]);
  });

  it('finds nothing when the keys match', () => {
    expect(missingKeys({ fr: { a: 'x' }, en: { a: 'y' } })).toEqual([]);
  });
});

describe('forbiddenUses', () => {
  const dictionaries = {
    fr: {
      a: 'Les Groupes de Léa',
      b: 'On regroupe tout',
      c: 'Un groupe-cadeau',
    },
    en: { a: 'Group settings' },
  };

  it('matches at the start of a word, whatever the case', () => {
    expect(forbiddenUses(['groupe'], dictionaries)).toEqual([
      { locale: 'fr', key: 'a', word: 'groupe', text: 'Les Groupes de Léa' },
      { locale: 'fr', key: 'c', word: 'groupe', text: 'Un groupe-cadeau' },
    ]);
  });

  it('checks every language and every word', () => {
    expect(
      forbiddenUses(['group'], dictionaries).map(
        ({ locale, key }) => `${locale}.${key}`,
      ),
    ).toEqual(['fr.a', 'fr.c', 'en.a']);
  });

  it('finds nothing with an empty list', () => {
    expect(forbiddenUses([], dictionaries)).toEqual([]);
  });
});

describe('hardCodedTexts', () => {
  const file = (template: string) =>
    `<script setup lang="ts">\nconst a = '<b>no</b>';\n</script>\n\n<template>${template}</template>\n`;

  it('finds a text between tags, with its line', () => {
    expect(hardCodedTexts(file('\n  <p>\n    Bonjour\n  </p>\n'))).toEqual([
      { line: 7, text: 'Bonjour' },
    ]);
  });

  it('finds the static value of a visible attribute', () => {
    expect(
      hardCodedTexts(file('<UButton label="Valider" icon="i-lucide-check" />')),
    ).toEqual([{ line: 5, text: 'Valider' }]);
  });

  it('leaves interpolations, comments, bound attributes and entities alone', () => {
    expect(
      hardCodedTexts(
        file(
          `<!-- a note --><p :title="t('x')" aria-hidden="true">{{ t('a') }}&nbsp;</p><i v-if="a > b">{{ a < b }}</i>`,
        ),
      ),
    ).toEqual([]);
  });

  it('ignores the script and the exceptions', () => {
    expect(
      hardCodedTexts(file('<p>Under the Tree</p>'), ['Under the Tree']),
    ).toEqual([]);
    expect(hardCodedTexts('<script>const a = 1;</script>')).toEqual([]);
  });
});
