// French labels for codes used by the API.
export const STATUS_LABELS: Record<string, string> = {
  draft: 'Brouillon',
  invitations: 'Invitations',
  drawn: 'Tirée',
  closed: 'Clôturée',
};

export const BADGE_LABELS: Record<string, string> = {
  sent: 'envoyé',
  wishes: 'souhaits',
  viewed: 'consulté',
};

export const RULE_LABELS = {
  excludeSpouse: 'Exclure le conjoint',
  excludePreviousYears: "Nombre d'années précédentes à exclure",
  budget: 'Budget (texte libre)',
  eventDate: 'Date de la fête',
  guardianMessage: 'Petit mot du gardien',
  wishlist: 'Activer les listes de souhaits',
  maxWishes: "Nombre maximal d'idées par liste",
} as const;

export const formatDate = (iso: string | null | undefined): string =>
  iso
    ? new Intl.DateTimeFormat('fr-FR', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(iso))
    : '';

export const plural = (n: number, word: string) =>
  `${n} ${word}${n > 1 ? 's' : ''}`;

export const MESSAGE_LABELS: Record<string, string> = {
  invitation: 'Invitation',
  drawn: 'Tirage fait',
  reminder: 'Relance',
  redraw: 'Nouveau tirage',
};

/** The message that fits the edition status by default. */
export const defaultMessageType = (status: string) =>
  status === 'drawn' ? 'drawn' : 'invitation';
