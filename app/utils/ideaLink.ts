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
