// The devices an account is logged in on, as « Mon compte » shows them.
// Pure.

/** Systems of a phone or a tablet, as `deviceLabel` names them. */
const HANDHELD = /iPhone|iPad|Android/;

/**
 * The icon of a device, from its label.
 * @param label - « iPhone · Safari », « Mac · Chrome »… or null.
 * @returns A phone for a phone or a tablet, a laptop otherwise.
 */
export const deviceIcon = (label: string | null): string =>
  label && HANDHELD.test(label) ? 'i-lucide-smartphone' : 'i-lucide-laptop';
