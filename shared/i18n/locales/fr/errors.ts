// Messages for API failure reasons (statusMessage of createError).
export default {
  unknown: 'Aïe, quelque chose a coincé. Réessaie dans un instant.',
  year_over: 'Cette année est finie : on n’y change plus rien.',
  secret_santa_drawn: 'Ce Secret Santa est tiré : il ne se supprime plus.',
  nothing_to_prepare: 'Il n’y a rien à préparer pour l’instant.',
  other: 'Quelque chose a coincé ({reason}).',
  validation: 'Il manque quelque chose : vérifie les champs.',
  unauthorized: 'Connecte-toi pour continuer.',
  forbidden: 'Tu n’as pas accès à cet événement.',
  too_many_attempts: 'Doucement. Réessaie dans quelques minutes.',
  too_many_requests:
    'Trop de demandes d’un coup. Attends quelques minutes avant de réessayer.',
  web_address:
    'Un nom ne peut pas contenir d’adresse web. Enlève-la, puis réessaie.',
  limit_lists:
    'Tu tiens déjà beaucoup de listes. Supprimes-en une pour en créer une autre.',
  limit_people:
    'Cette liste a déjà beaucoup de monde : on ne peut plus en ajouter.',
  limit_ideas:
    'Cette liste a déjà beaucoup d’idées : on ne peut plus en ajouter.',
  limit_off_list:
    'Tu as déjà annoncé beaucoup de cadeaux hors liste ici. Retires-en un pour en ajouter un autre.',
  limit_family:
    'Tu as déjà beaucoup de proches. Supprimes-en un pour en ajouter un autre.',
  limit_journal:
    'Cet événement a beaucoup bougé aujourd’hui : réessaie demain.',
  list_not_empty:
    'Cette liste a déjà du monde : on ne repart d’une autre liste que dans une liste vide.',
  anonymous_mode:
    'Mode anonyme activé : tu ne peux l’offrir que seul, en anonyme. Désactive-le en haut de la liste pour un autre choix.',
  list_shared:
    'Cette liste est déjà partagée : elle reste sans personne. Arrête le partage pour la ranger par personne.',
  several_people:
    'Il y a plusieurs personnes sur la liste : leurs idées ne peuvent pas être mélangées.',
  list_not_linkable:
    'Cette liste ne peut pas être reliée : elle doit être publiée, et à toi.',
  slug_taken: 'Cet identifiant d’événement est déjà pris.',
  group_not_found:
    'Événement introuvable. Recharge la page : la liste a peut-être changé.',
  person_not_found:
    'Personne introuvable. Recharge la page : la liste a peut-être changé.',
  person_has_participations:
    'Cette personne a déjà participé : désactive-la plutôt.',
  exclusion_not_found:
    'Exclusion introuvable. Recharge la page : la liste a peut-être changé.',
  edition_not_found:
    'Secret Santa introuvable. Recharge la page : la liste a peut-être changé.',
  edition_closed: 'Ce Secret Santa est clôturé.',
  invalid_rules: 'Ces règles ne tiennent pas ensemble. Vérifie-les.',
  results_already_revealed: 'Les résultats sont déjà dévoilés.',
  results_revealed:
    'Les résultats sont dévoilés : le tirage ne peut plus être annulé.',
  party_date_missing:
    'Ajoute d’abord la date pour pouvoir dévoiler les résultats.',
  party_not_reached: 'Le jour J n’est pas encore arrivé.',
  invalid_transition:
    'Trop tôt, ou trop tard : cette action ne se fait pas à cette étape.',
  no_solution:
    'Aucun tirage possible avec ces règles : assouplis une exclusion.',
  too_many_participants:
    'Un Secret Santa ne peut pas dépasser 100 participants.',
  too_few_participants:
    'Il faut être au moins trois : à deux, le secret ne tient pas.',
  participants_locked: 'Le tirage est fait : la liste ne bouge plus.',
  already_participating: 'Cette personne participe déjà.',
  message_not_available:
    'Ce message ne correspond pas à l’étape du Secret Santa.',
  email_not_configured:
    "L'envoi par email n'est pas configuré sur le serveur. Partage les liens depuis ton téléphone.",
  email_failed:
    'Les emails ne sont pas partis. Réessaie, ou partage les liens depuis ton téléphone.',
  email_missing: "Cette personne n'a pas d'adresse email.",
  participation_not_found:
    'Participant introuvable. Recharge la page : la liste a peut-être changé.',
  wrong_confirmation: 'Recopie exactement l’identifiant de l’événement.',
  wrong_sentence: 'Recopie exactement la phrase demandée.',
  results_secret:
    'Les résultats restent secrets tant que le Secret Santa n’est pas clôturé.',
  login_link_invalid:
    "Ce lien de connexion n'est plus valable : demande-en un nouveau.",
  login_code_invalid:
    'Ce code ne marche pas : vérifie les six chiffres, ou demande-en un autre.',
  cannot_remove_self:
    'Tu ne peux pas te retirer toi-même : demande à un autre organisateur.',
  organizer_not_found:
    'Organisateur introuvable. Recharge la page : la liste a peut-être changé.',
  link_invalid:
    "Ce lien n'est plus valable, demande-en un nouveau à ton organisateur.",
  draw_not_done: "Le tirage n'a pas encore eu lieu.",
  result_not_found:
    'Ton enveloppe est introuvable. Préviens ton organisateur : il y a un souci.',
  gift_hints_disabled: 'Ce Secret Santa n’utilise pas les idées de cadeaux.',
  ideas_disabled: 'Ce Secret Santa n’utilise pas les idées précises.',
  invalid_hints: 'Une de tes réponses n’a pas pu être enregistrée.',
  hints_already_requested: 'Tu as déjà demandé des idées pour ce Secret Santa.',
  hints_already_given: 'Des idées sont déjà arrivées.',
  result_not_seen: 'Ouvre d’abord ton enveloppe.',
  no_previous_hints: 'Aucune idée à reprendre.',
  too_many_wishes: "Il y a trop d'idées dans ta liste.",
  invalid_wish:
    'Une idée est invalide : 200 caractères au plus, et un lien qui commence par http:// ou https://.',
  secret_santa_limit_reached:
    'Tu organises déjà 3 Secret Santa : c’est le maximum pour un compte.',
  secret_santa_paused:
    'Les nouveaux Secret Santa sont en pause. Ceux qui existent continuent.',
  // Ticket 129: the emergency switches.
  emails_paused:
    'L’envoi d’emails est en pause pour tout le monde. Envoie à chacun son lien depuis ton téléphone.',
  signups_paused:
    'Les inscriptions sont en pause : pas de nouveau compte ni de nouvel événement pour l’instant. Reviens dans quelques jours.',
  already_member:
    'Cette adresse est déjà celle d’un membre de l’événement : la liste lui est ouverte.',
  list_not_open:
    'Ta liste n’est pas partagée avec tous les membres de son événement.',
  too_many_members: 'L’événement est complet : 30 membres, c’est le maximum.',
  cannot_disable_self: 'Tu ne peux pas désactiver ton propre compte.',
  account_not_found:
    'Compte introuvable. Recharge la page : la liste a peut-être changé.',
  session_current:
    'C’est l’appareil que tu utilises : déconnecte-toi depuis le menu.',
  session_not_found:
    'Session introuvable. Recharge la page : la liste a peut-être changé.',
  person_is_organizer:
    'C’est un organisateur de l’événement : retire-le d’abord des organisateurs.',
  invite_invalid:
    'Ce lien d’invitation n’est plus valable : demande-en un nouveau à l’organisateur.',
  person_has_other_email:
    'Ce Secret Santa est déjà rattaché à une autre adresse.',
  invite_expired:
    'Ce lien d’invitation a expiré : demande-en un nouveau à l’organisateur.',
  invite_drawn:
    'Le tirage a déjà eu lieu : plus personne ne peut s’inscrire par ce lien.',
  invite_full: 'Il n’y a plus de place par ce lien : préviens l’organisateur.',
  collecting_answers:
    'Le tirage a été fait ailleurs : chacun donne sa réponse. Abandonne les réponses pour tirer avec l’application.',
  not_collecting_answers: 'Ce Secret Santa ne recueille pas de réponses.',
  answers_not_ready:
    'Les réponses ne sont pas encore complètes ou ne vont pas ensemble.',
  invalid_answer: 'Choisis une autre personne du Secret Santa.',
  game_needs_four:
    'Le jeu se joue à quatre au moins : à trois, il n’y a rien à deviner.',
  draw_not_revealed: 'Le tirage n’est pas encore dévoilé.',
  already_played: 'Tu as déjà fait un pronostic : retire-le d’abord.',
  email_taken:
    'Cette adresse est déjà celle d’une autre personne de l’événement.',
  idea_claimed: 'Quelqu’un l’offre déjà.',
};
