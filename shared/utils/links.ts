/** A text cut around the link it holds. */
export type AroundLink = {
  /** What comes before the link, without the line break that leads to it. */
  before: string;
  /** The link as shown: without its protocol; empty when not found. */
  shown: string;
  /** What comes after the link, such as a note added below. */
  after: string;
};

/**
 * Cuts a message around its link, so the link can stand on its own line.
 * @param text - The message.
 * @param link - The link it holds.
 * @returns The text before, the link without its protocol, the text after.
 */
export const aroundLink = (text: string, link: string): AroundLink => {
  const at = link ? text.indexOf(link) : -1;
  return at === -1
    ? { before: text, shown: '', after: '' }
    : {
        before: text.slice(0, at).trimEnd(),
        shown: link.replace(/^https?:\/\//, ''),
        after: text.slice(at + link.length).trim(),
      };
};

/**
 * The site of a link, to show it short: « boutique-jeux.example ».
 * @param url - An http or https address.
 * @returns Its host without « www. », or the address itself when it does
 *   not read as one.
 */
export const hostOf = (url: string): string => {
  const match = /^https?:\/\/(?:www\.)?([^/?#:]+)/i.exec(url.trim());
  return match?.[1] ?? url;
};
