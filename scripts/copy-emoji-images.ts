// Copies the images of the avatars' emojis (Apple's drawings, 64 px) from
// the emoji-datasource-apple package into public/emoji, and only those:
// run it again after changing AVATAR_EMOJIS (lot 15 of the redesign) or
// LIST_EMOJIS (lot 21).
// `pnpm emoji:copy`.
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { AVATAR_EMOJIS } from '../server/utils/avatars.ts';
import { LIST_EMOJIS } from '../server/utils/lists.ts';
import { emojiFileName } from '../shared/utils/emojiImage.ts';

const SOURCE = join(
  'node_modules',
  'emoji-datasource-apple',
  'img',
  'apple',
  '64',
);
const TARGET = join('public', 'emoji');

mkdirSync(TARGET, { recursive: true });
const EMOJIS = [...new Set<string>([...AVATAR_EMOJIS, ...LIST_EMOJIS])];
const missing = EMOJIS.filter((emoji) => {
  const name = emojiFileName(emoji);
  const from = join(SOURCE, name);
  if (!existsSync(from)) return true;
  copyFileSync(from, join(TARGET, name));
  return false;
});
if (missing.length > 0) {
  console.error(`No image for: ${missing.join(' ')}`);
  process.exit(1);
}
console.log(`${EMOJIS.length} images copied to ${TARGET}`);
