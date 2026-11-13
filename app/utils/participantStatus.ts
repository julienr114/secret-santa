import type { Participant } from '#server/database/editions';

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
): ParticipantStatusLine | null => {
  if (p.viewCount > 0) {
    return {
      label:
        p.viewCount > 1
          ? `Résultat consulté · ${p.viewCount}×`
          : 'Résultat consulté',
      icon: 'i-lucide-circle-check',
      tone: 'text-success',
    };
  }
  if (editionStatus !== 'drawn') {
    return p.messageSentAt
      ? {
          label: 'Invitation envoyée',
          icon: 'i-lucide-check',
          tone: 'text-dimmed',
        }
      : null;
  }
  if (!p.messageSentAt) {
    return {
      label: 'Pas encore envoyé',
      icon: 'i-lucide-circle-dashed',
      tone: 'text-dimmed',
    };
  }
  return {
    label: 'Envoyé, pas encore consulté',
    icon: 'i-lucide-clock-3',
    tone: 'text-warning',
  };
};
