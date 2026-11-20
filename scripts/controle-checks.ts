// The checks of `pnpm controle` that read text and need no process: the
// three languages, the forbidden words, the texts written in a template
// instead of a dictionary. Pure functions, tested in controle-checks.test.ts;
// scripts/controle.ts reads the files and prints.

export type Tree = { readonly [key: string]: Tree | string };
export type Texts = Readonly<Record<string, string>>;

/** Every text of a dictionary by dot path, plural forms included. */
export const flatten = (node: Tree, prefix = ''): Texts =>
  Object.entries(node).reduce<Texts>(
    (acc, [key, value]) => ({
      ...acc,
      ...(typeof value === 'string'
        ? { [`${prefix}${key}`]: value }
        : flatten(value, `${prefix}${key}.`)),
    }),
    {},
  );

export type MissingKey = { locale: string; key: string };

/**
 * The keys one language lacks while another has them, in every direction:
 * French is not trusted more than the others here.
 */
export const missingKeys = (
  dictionaries: Readonly<Record<string, Texts>>,
): readonly MissingKey[] => {
  const all = [
    ...new Set(Object.values(dictionaries).flatMap((d) => Object.keys(d))),
  ].toSorted();
  return Object.entries(dictionaries).flatMap(([locale, texts]) =>
    all.filter((key) => !(key in texts)).map((key) => ({ locale, key })),
  );
};

export type ForbiddenUse = {
  locale: string;
  key: string;
  word: string;
  text: string;
};

/**
 * A word matches at the start of a word, whatever the case: « groupe »
 * catches « Groupes » and « groupe-cadeau », not « regroupé ».
 */
const wordPattern = (word: string) =>
  new RegExp(
    `(?<![\\p{L}\\p{N}])${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
    'iu',
  );

/** The texts of the dictionaries that still say a word the V3 removed. */
export const forbiddenUses = (
  words: readonly string[],
  dictionaries: Readonly<Record<string, Texts>>,
): readonly ForbiddenUse[] =>
  words.flatMap((word) => {
    const pattern = wordPattern(word);
    return Object.entries(dictionaries).flatMap(([locale, texts]) =>
      Object.entries(texts)
        .filter(([, text]) => pattern.test(text))
        .map(([key, text]) => ({ locale, key, word, text })),
    );
  });

export type HardCodedText = { line: number; text: string };

/** Attributes whose static value is read or heard by the person. */
const VISIBLE_ATTRIBUTES = [
  'label',
  'placeholder',
  'title',
  'aria-label',
  'alt',
  'description',
];

/** Blank everything but the newlines, so offsets keep their line. */
const blank = (text: string) => text.replace(/[^\n]/g, ' ');

const TEMPLATE = /<template>([\s\S]*)<\/template>/;
const COMMENT_OR_INTERPOLATION = /<!--[\s\S]*?-->|\{\{[\s\S]*?\}\}/g;
const TAG_OR_TEXT = /<(?:"[^"]*"|'[^']*'|[^'">])*>|[^<]+/g;
const STATIC_ATTRIBUTE = new RegExp(
  `(?<=\\s)(?:${VISIBLE_ATTRIBUTES.join('|')})="([^"]*)"`,
  'g',
);
const HAS_LETTER = /\p{L}/u;
const ENTITY = /&(?:\w+|#\d+);/g;

const lineAt = (source: string, offset: number) =>
  source.slice(0, offset).split('\n').length;

/**
 * The visible texts written in the template of a Vue file instead of a
 * dictionary: text between tags, and the static value of an attribute
 * that is shown or read aloud. Interpolations, comments and bound
 * attributes (`:label`) are left alone. A heuristic: `exceptions` lists
 * the texts that may stay (a brand, a sample in the style guide).
 */
export const hardCodedTexts = (
  source: string,
  exceptions: readonly string[] = [],
): readonly HardCodedText[] => {
  const template = TEMPLATE.exec(source);
  if (!template) return [];
  const start = template.index + '<template>'.length;
  const body = template[1]!.replace(COMMENT_OR_INTERPOLATION, blank);
  const found = [...body.matchAll(TAG_OR_TEXT)].flatMap((match) =>
    match[0].startsWith('<')
      ? [...match[0].matchAll(STATIC_ATTRIBUTE)].map((attribute) => ({
          offset: match.index + attribute.index,
          text: attribute[1]!.trim(),
        }))
      : [
          {
            offset: match.index + match[0].length - match[0].trimStart().length,
            text: match[0].trim(),
          },
        ],
  );
  return found
    .filter(
      ({ text }) =>
        HAS_LETTER.test(text.replace(ENTITY, '')) && !exceptions.includes(text),
    )
    .map(({ offset, text }) => ({
      line: lineAt(source, start + offset),
      text: text.replace(/\s+/g, ' '),
    }));
};
