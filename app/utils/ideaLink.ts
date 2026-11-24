/**
 * The address written for the link of an idea (README 22.20), as it is
 * saved: an address as pasted, or one typed without « https:// ».
 * @param written - What was pasted or typed.
 * @returns The address, or null when it is not one.
 */
export const asAddress = (written: string): string | null => {
  const text = written.trim();
  if (!text || /\s/.test(text)) return null;
  const candidate = /^https?:\/\//i.test(text) ? text : `https://${text}`;
  if (!URL.canParse(candidate)) return null;
  const url = new URL(candidate);
  return url.hostname.includes('.') ? url.href : null;
};

/**
 * The name of the site a link goes to, for its pill under an idea
 * (Correction 28): « lutin-jouets.fr », without « www. ». Read from the
 * address already saved: nothing is asked of the site.
 * @param url - The address of the link.
 * @returns The name of the site, empty when the address is not one.
 */
export const linkHost = (url: string): string =>
  URL.canParse(url) ? new URL(url).hostname.replace(/^www\./i, '') : '';

/**
 * An address as its field shows it while it is written (Correction 29):
 * whole, without « https:// », which `asAddress` puts back.
 * @param url - The address saved.
 * @returns What the field shows.
 */
export const shownAddress = (url: string): string =>
  url.replace(/^https:\/\//i, '').replace(/^([^/?#]+)\/$/, '$1');

/**
 * What names an idea (ticket 140): its text, or, when it has only a link,
 * the name of its site, as its line shows it in the place of its text.
 * Nothing is saved in the place of the person.
 * @param idea - The idea.
 * @param idea.text - What was written, maybe nothing.
 * @param idea.url - Its link, maybe none.
 * @returns Its name.
 */
export const ideaName = (idea: { text: string; url?: string | null }): string =>
  idea.text || (idea.url ? linkHost(idea.url) : '');
