import { describe, expect, it } from 'vitest';
import { emojiFileName, emojiImagePath } from './emojiImage';

describe('emojiFileName', () => {
  it('names an emoji by its code points', () => {
    expect(emojiFileName('🎅')).toBe('1f385.png');
    expect(emojiFileName('⛄')).toBe('26c4.png');
  });

  it('keeps the variation selector', () => {
    expect(emojiFileName('❄️')).toBe('2744-fe0f.png');
    expect(emojiFileName('⛸️')).toBe('26f8-fe0f.png');
  });

  it('serves it from the images folder', () => {
    expect(emojiImagePath('🦌')).toBe('/emoji/1f98c.png');
  });
});
