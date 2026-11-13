import type { Participant } from '#server/database/editions';

// One-line status of a participant on the edition screen, from "not sent"
// to "result viewed", with the icon and colour that go with it.
export type ParticipantStatusLine = {
  label: string;
  icon: string;
  tone: string;
};

export const participantStatusLine = (
  p: Pick<Participant, 'messageSentAt' | 'viewCount'>,
  editionStatus: string,
): ParticipantStatusLine => {
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
  if (!p.messageSentAt) {
    return {
      label: 'Pas encore envoyé',
      icon: 'i-lucide-circle-dashed',
      tone: 'text-dimmed',
    };
  }
  return editionStatus === 'drawn'
    ? {
        label: 'Envoyé, pas encore consulté',
        icon: 'i-lucide-clock-3',
        tone: 'text-warning',
      }
    : { label: 'Lien envoyé', icon: 'i-lucide-send', tone: 'text-info' };
};
