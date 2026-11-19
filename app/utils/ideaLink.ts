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
