import { deadlineOf } from '#server/utils/nudges';
import type { GuessSummary } from '~/composables/queries/useGroup';

/**
 * The message « Au groupe » of « Rappeler le jeu » (README 22.17,
 * DevineRappelGroupe): the deadline, the principle of the game in the
 * edition's mode, the count, the word added if any, then how to find the
 * game. It names nobody and holds no
 * personal link. The deadline is read in this browser's zone, once the
 * page is mounted.
 * @returns A function giving the message for a game and a word.
 */
export const useGroupReminder = () => {
  const { t } = useT();
  const endText = useGuessEnd();
  const zone = ref<string | null>(null);
  onMounted(() => {
    zone.value = Intl.DateTimeFormat().resolvedOptions().timeZone;
  });
  return (guess: GuessSummary | undefined, note: string) => {
    if (!guess) return '';
    const { endsAt, players, total } = guess;
    const deadline =
      endsAt && zone.value
        ? deadlineOf(endsAt, new Date().toISOString(), zone.value)
        : null;
    const opening =
      deadline?.kind === 'lastDay'
        ? t('adminEdition.game.group.lastDay')
        : deadline
          ? t('adminEdition.game.group.days', { count: deadline.days })
          : t('adminEdition.game.group.until', {
              end: endsAt ? endText(endsAt) : '',
            });
    const count =
      players === 0
        ? t('adminEdition.game.group.nobody')
        : t('adminEdition.game.group.count', { count: players, total });
    // Opening, then the principle in this edition's mode, then the count.
    const how =
      guess.mode === 'santa'
        ? t('adminEdition.game.group.howSanta')
        : t('adminEdition.game.group.howAll');
    return [
      opening,
      how,
      [count, t('adminEdition.game.group.tail')].join(' '),
      note.trim(),
      t('adminEdition.game.group.personal'),
    ]
      .filter(Boolean)
      .join('\n\n');
  };
};
