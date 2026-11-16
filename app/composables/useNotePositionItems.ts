import type { NotePosition } from '#server/utils/messages';

/**
 * The two places the organiser's note can take, as radio items in the
 * current language.
 * @returns A computed list of `{ value, label }`, "above" first.
 */
export const useNotePositionItems = () => {
  const { t } = useT();
  return computed<{ value: NotePosition; label: string }[]>(() => [
    { value: 'before', label: t('adminEdition.share.noteBefore') },
    { value: 'after', label: t('adminEdition.share.noteAfter') },
  ]);
};
