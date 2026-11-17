// Messages for API failure reasons (statusMessage of createError).
export default {
  unknown: 'Une erreur est survenue.',
  other: 'Erreur : {reason}',
  validation: 'Vérifie les champs du formulaire.',
  unauthorized: 'Connecte-toi pour continuer.',
  forbidden: "Tu n'as pas accès à ce groupe.",
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
  results_already_revealed: 'Les résultats sont déjà dévoilés.',
  results_revealed:
    'Les résultats sont dévoilés : le tirage ne peut plus être annulé.',
  party_date_missing:
    'Ajoute d’abord la date de la fête pour pouvoir dévoiler les résultats.',
  party_not_reached: 'La fête n’a pas encore eu lieu.',
  invalid_transition:
    "Cette action n'est pas possible à ce stade de l'édition.",
  no_solution:
    'Aucun tirage possible avec ces règles : assouplis une exclusion.',
  too_many_participants: 'Une édition ne peut pas dépasser 100 participants.',
  too_few_participants: 'Il faut au moins trois participants.',
  participants_locked: 'La liste est verrouillée après le tirage.',
  already_participating: 'Cette personne participe déjà.',
  message_not_available: "Ce message ne correspond pas à l'étape de l'édition.",
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
  login_link_invalid:
    "Ce lien de connexion n'est plus valable : demande-en un nouveau.",
  cannot_remove_self:
    'Tu ne peux pas te retirer toi-même : demande à un autre organisateur.',
  organizer_not_found: 'Organisateur introuvable.',
  link_invalid:
    "Ce lien n'est plus valable, demande-en un nouveau à ton organisateur.",
  draw_not_done: "Le tirage n'a pas encore eu lieu.",
  result_not_found:
    "Ton résultat est introuvable, préviens ton organisateur qu'il y a un souci.",
  wishlist_disabled: "Ce groupe n'utilise pas les listes de souhaits.",
  too_many_wishes: "Il y a trop d'idées dans ta liste.",
  invalid_wish:
    'Une idée est invalide : 200 caractères au plus, et un lien qui commence par http:// ou https://.',
  group_quota_reached:
    'Tu ne peux pas créer de groupe pour l’instant : fais-en la demande depuis l’accueil.',
  group_request_pending: 'Tu as déjà une demande en attente.',
  group_request_useless: 'Tu peux déjà créer un groupe.',
  cannot_disable_self: 'Tu ne peux pas désactiver ton propre compte.',
  account_not_found: 'Compte introuvable.',
  request_not_found: 'Demande introuvable.',
  request_decided: 'Cette demande a déjà reçu une réponse.',
  session_current:
    'C’est l’appareil que tu utilises : déconnecte-toi depuis le menu.',
  session_not_found: 'Session introuvable.',
  person_is_organizer:
    'C’est un organisateur du groupe : retire-le d’abord des organisateurs.',
  invite_invalid:
    'Ce lien d’invitation n’est plus valable : demande-en un nouveau à l’organisateur.',
  person_has_other_email: 'Ce tirage est déjà rattaché à une autre adresse.',
  invite_expired:
    'Ce lien d’invitation a expiré : demande-en un nouveau à l’organisateur.',
  invite_full: 'Il n’y a plus de place par ce lien : préviens l’organisateur.',
};
