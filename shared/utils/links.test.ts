import { describe, expect, it } from 'vitest';
import { aroundLink } from './links';

const LINK = 'https://under-the-tree.party/p/aIFR42';

describe('aroundLink', () => {
  it('cuts a message ending with its link', () => {
    expect(aroundLink(`Inès, le tirage est fait !\n${LINK}`, LINK)).toEqual({
      before: 'Inès, le tirage est fait !',
      shown: 'under-the-tree.party/p/aIFR42',
      after: '',
    });
  });

  it('keeps a note written below the link', () => {
    expect(aroundLink(`Coucou\n${LINK}\n\nApporte un dessert !`, LINK)).toEqual(
      {
        before: 'Coucou',
        shown: 'under-the-tree.party/p/aIFR42',
        after: 'Apporte un dessert !',
      },
    );
  });

  it('drops a plain http protocol too', () => {
    expect(
      aroundLink('x http://localhost:4000/p/a', 'http://localhost:4000/p/a')
        .shown,
    ).toBe('localhost:4000/p/a');
  });

  it('leaves a text without the link whole', () => {
    expect(aroundLink('Pas de lien ici', LINK)).toEqual({
      before: 'Pas de lien ici',
      shown: '',
      after: '',
    });
  });

  it('leaves the text whole when there is no link', () => {
    expect(aroundLink('Texte', '')).toEqual({
      before: 'Texte',
      shown: '',
      after: '',
    });
  });
});
