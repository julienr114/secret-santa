// Messages for API failure reasons (statusMessage of createError).
export default {
  unknown: 'Une erreur est survenue.',
  other: 'Erreur : {reason}',
  validation: 'Vérifie les champs du formulaire.',
  unauthorized: 'Connecte-toi pour continuer.',
  forbidden: "Tu n'as pas accès à ce groupe.",
  invalid_credentials: 'Mot de passe incorrect.',
  too_many_attempts: 'Trop de tentatives, réessaie dans quelques minutes.',
  slug_taken: 'Cet identifiant de groupe est déjà pris.',
  group_not_found: 'Groupe introuvable.',
  person_not_found: 'Personne introuvable.',
  person_has_participations:
    'Cette personne a déjà participé : désactive-la plutôt.',
  exclusion_not_found: 'Exclusion introuvable.',
  edition_not_found: 'Édition introuvable.',
  edition_in_progress: "Clôture d'abord l'édition en cours.",
  edition_closed: 'Cette édition est clôturée.',
  invalid_rules: 'Règles invalides.',
  invalid_transition:
    "Cette action n'est pas possible à ce stade de l'édition.",
  no_solution:
    'Aucun tirage possible avec ces règles : assouplis une exclusion.',
  too_many_participants: 'Une édition ne peut pas dépasser 100 participants.',
  too_few_participants: 'Il faut au moins deux participants.',
  participants_locked: 'La liste est verrouillée après le tirage.',
  already_participating: 'Cette personne participe déjà.',
  links_not_open: "Ouvre d'abord les invitations.",
  message_not_available: "Ce message ne correspond pas à l'étape de l'édition.",
  email_disabled: "L'envoi par email n'est pas activé pour ce groupe.",
  email_not_configured:
    "L'envoi par email n'est pas configuré sur le serveur. Partage les liens depuis ton téléphone.",
  email_failed:
    'Les emails ne sont pas partis. Réessaie, ou partage les liens depuis ton téléphone.',
  email_missing: "Cette personne n'a pas d'adresse email.",
  participation_not_found: 'Participant introuvable.',
  wrong_confirmation: 'Recopie exactement l’identifiant du groupe.',
  wrong_sentence: 'Recopie exactement la phrase demandée.',
  results_secret:
    "Les résultats restent secrets tant que l'édition n'est pas clôturée.",
  link_invalid:
    "Ce lien n'est plus valable, demande-en un nouveau à ton organisateur.",
  draw_not_done: "Le tirage n'a pas encore eu lieu.",
  result_not_found:
    "Ton résultat est introuvable, préviens ton organisateur qu'il y a un souci.",
  wishlist_disabled: "Ce groupe n'utilise pas les listes de souhaits.",
  too_many_wishes: "Il y a trop d'idées dans ta liste.",
  invalid_wish:
    'Une idée est invalide : 200 caractères au plus, et un lien qui commence par http:// ou https://.',
};
