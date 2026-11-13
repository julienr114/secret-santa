// French labels for codes used by the API.
export const STATUS_LABELS: Record<string, string> = {
  draft: 'Brouillon',
  invitations: 'Invitations',
  drawn: 'Tirée',
  closed: 'Clôturée',
};

export const BADGE_LABELS: Record<string, string> = {
  sent: 'envoyé',
  pin_set: 'code choisi',
  wishes: 'souhaits',
  viewed: 'consulté',
  locked: 'bloqué',
};

export const RULE_LABELS = {
  excludeSpouse: 'Exclure le conjoint',
  excludePreviousYears: "Nombre d'années précédentes à exclure",
  registrationRequired:
    'Tirage possible seulement quand tout le monde a choisi son code',
  budget: 'Budget (texte libre)',
  eventDate: 'Date de la fête',
  guardianMessage: 'Petit mot du gardien',
  maxPinAttempts: 'Codes erronés avant blocage',
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
