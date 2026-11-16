import type { MessageType } from '#server/utils/messages';

/** What « Personnaliser le message » chose, for one person or for many. */
export type MessageChoice = {
  /** A participation, or `plusieurs` for the email screen. */
  who: string;
  type: MessageType;
  /** A word added to the message, as typed. */
  note: string;
};

/**
 * The message chosen for one sending of an edition, kept while going to
 * « Personnaliser le message » and back, never saved.
 * @param editionId - The edition.
 * @returns A shared ref: the choice, or null when nothing was chosen.
 */
export const useMessageChoice = (editionId: MaybeRefOrGetter<string>) =>
  useState<MessageChoice | null>(`message:${toValue(editionId)}`, () => null);

/**
 * The people ticked on the email screen of an edition, kept while going to
 * « Personnaliser le message » and back.
 * @param editionId - The edition.
 * @returns A shared ref: the participations ticked, or null when untouched.
 */
export const useEmailSelection = (editionId: MaybeRefOrGetter<string>) =>
  useState<string[] | null>(`emails:${toValue(editionId)}`, () => null);
