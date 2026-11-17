// The avatars' emojis as images, so that every device draws the same
// one (lot 15 of the redesign): Apple's drawings, copied into
// public/emoji by scripts/copy-emoji-images.ts. Changing the set of
// images only means changing that folder. Pure.

/** Where the images are served from. */
export const EMOJI_IMAGE_DIR = '/emoji';

/**
 * The file name of an emoji's image: its code points in lower-case
 * hexadecimal, joined by « - », variation selector included (❄️ is
 * `2744-fe0f.png`), as emoji-datasource names them.
 * @param emoji - The emoji, as stored.
 * @returns The file name.
 */
export const emojiFileName = (emoji: string): string =>
  `${[...emoji].map((char) => char.codePointAt(0)!.toString(16)).join('-')}.png`;

/**
 * Where an emoji's image is served.
 * @param emoji - The emoji, as stored.
 * @returns Its path on the site.
 */
export const emojiImagePath = (emoji: string): string =>
  `${EMOJI_IMAGE_DIR}/${emojiFileName(emoji)}`;
