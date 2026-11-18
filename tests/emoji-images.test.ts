import { readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { AVATAR_EMOJIS } from '#server/utils/avatars';
import { LIST_EMOJIS } from '#server/utils/lists';
import { emojiFileName } from '#shared/utils/emojiImage';

// The images of the avatars' emojis (lot 15): public/emoji holds one per
// emoji of AVATAR_EMOJIS and LIST_EMOJIS (lot 21), and nothing else. `pnpm emoji:copy` makes it so.
describe('the images of the avatars', () => {
  it('has a file for each of the emojis, and none more', () => {
    const files = readdirSync('public/emoji').filter((name) =>
      name.endsWith('.png'),
    );
    expect(files.toSorted()).toEqual(
      [...new Set<string>([...AVATAR_EMOJIS, ...LIST_EMOJIS])]
        .map(emojiFileName)
        .toSorted(),
    );
  });
});
