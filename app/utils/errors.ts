// French messages for API failure reasons (statusMessage of createError).
const MESSAGES: Record<string, string> = {
  unauthorized: 'Connecte-toi pour continuer.',
  forbidden: "Tu n'as pas accès à ce groupe.",
  invalid_credentials: 'Mot de passe incorrect.',
  too_many_attempts: 'Trop de tentatives, réessaie dans quelques minutes.',
  slug_taken: 'Cet identifiant de groupe est déjà pris.',
  group_not_found: 'Groupe introuvable.',
  person_not_found: 'Personne introuvable.',
  person_has_participations:
    'Cette personne a déjà participé : désactive-la plutôt.',
  already_in_couple: "L'une de ces deux personnes est déjà en couple.",
  couple_not_found: 'Couple introuvable.',
  exclusion_not_found: 'Exclusion introuvable.',
  edition_not_found: 'Édition introuvable.',
  edition_in_progress: "Clôture d'abord l'édition en cours.",
  edition_closed: 'Cette édition est clôturée.',
  invalid_rules: 'Règles invalides.',
  invalid_transition:
    "Cette action n'est pas possible à ce stade de l'édition.",
  no_solution:
    'Aucun tirage possible avec ces règles : assouplis une exclusion.',
  too_few_participants: 'Il faut au moins deux participants.',
  participants_locked: 'La liste est verrouillée après le tirage.',
  already_participating: 'Cette personne participe déjà.',
  links_not_open: "Ouvre d'abord les invitations.",
  participation_not_found: 'Participant introuvable.',
  'Validation Error': 'Vérifie les champs du formulaire.',
};

type ApiError = {
  data?: { statusMessage?: string };
  statusMessage?: string;
  message?: string;
};

/** Message to show for a $fetch error, or any error. */
export const errorMessage = (error: unknown): string => {
  const e = (error ?? {}) as ApiError;
  const reason = e.data?.statusMessage ?? e.statusMessage ?? e.message;
  return (
    MESSAGES[reason ?? ''] ??
    (reason ? `Erreur : ${reason}` : 'Une erreur est survenue.')
  );
};
