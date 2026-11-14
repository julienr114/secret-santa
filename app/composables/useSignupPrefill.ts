/** What a page already knows about someone about to create an account. */
export type SignupPrefill = { firstName: string; email: string };

/**
 * Carries a first name and an address to the account creation form, for
 * the time of the visit, without putting them in the URL.
 * @returns The shared state, null when nothing is known.
 */
export const useSignupPrefill = () =>
  useState<SignupPrefill | null>('signup-prefill', () => null);
