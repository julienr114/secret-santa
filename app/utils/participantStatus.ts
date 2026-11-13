import type { Participant } from '#server/database/editions';
import type { Translate } from '#shared/i18n';

// One-line status of a participant on the edition screen, with the icon
// and colour that go with it. Before the draw the screen stays quiet: no
// "not sent yet", only a tick once the invitation went out. Sending is
// tracked from the draw on, from "not sent" to "result viewed".
export type ParticipantStatusLine = {
  label: string;
  icon: string;
  tone: string;
};

export const participantStatusLine = (
  p: Pick<Participant, 'messageSentAt' | 'viewCount'>,
  editionStatus: string,
  t: Translate,
): ParticipantStatusLine | null => {
  if (p.viewCount > 0) {
    return {
      label:
        p.viewCount > 1
          ? t('common.participantStatus.viewedTimes', { count: p.viewCount })
          : t('common.participantStatus.viewed'),
      icon: 'i-lucide-circle-check',
      tone: 'text-success',
    };
  }
  if (editionStatus !== 'drawn') {
    return p.messageSentAt
      ? {
          label: t('common.participantStatus.invitationSent'),
          icon: 'i-lucide-check',
          tone: 'text-dimmed',
        }
      : null;
  }
  if (!p.messageSentAt) {
    return {
      label: t('common.participantStatus.notSent'),
      icon: 'i-lucide-circle-dashed',
      tone: 'text-dimmed',
    };
  }
  return {
    label: t('common.participantStatus.sentNotViewed'),
    icon: 'i-lucide-clock-3',
    tone: 'text-warning',
  };
};
