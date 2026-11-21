# 110 — V3 : les emails, les notifications et le journal avec les mots et les règles de la V3

- **Dépend de** : 102, 107
- **Migration** : non
- **Maquettes** : `PistesEmail`, `ModerationEmail`, `DevineEmailRappelAuto`, `DevineEmailRappelEncore`, `DevineEmailPalmares`, `DevineEmailOrgaPoint`, `DevineEmailOrgaFin`, `ListeInvitationEmail`, `Journal`

## Objectif

Tout ce qui s'écrit hors des écrans principaux suit la V3 : l'objet d'un email nomme l'événement, une demande d'idées ne nomme jamais personne, l'email qui la porte invite à écrire sa liste.

## À lire d'abord

- `docs/spec/v3/secret-santa.md` (« Le résultat », « Les objets des emails »)
- `docs/spec/v3/vocabulaire.md`
- `docs/spec/v3/accueil-et-creation.md` (« Quoi de neuf » : les règles valent aussi pour le résumé)
- `README.md`, sections 9 et 13

## À faire

- [ ] Les objets : le nom de l'événement d'abord (« Famille Camille : ton enveloppe t'attend ») ; le nom du Secret Santa entre parenthèses seulement s'il y en a plusieurs la même année.
- [ ] L'email de demande d'idées (`PistesEmail`) : « Aide-la : écris ta liste de cadeaux, ou quelques mots sur ce que tu aimes. » · « Écrire ma liste ». Le lien ouvre la liste réservée à celui qui a tiré (ticket 107).
- [ ] La demande d'idées ne nomme personne, nulle part : notifications, résumé, journal. « Quelqu'un te demande des idées de cadeaux ».
- [ ] L'email de modération (`ModerationEmail`) : c'est le lien public qui est arrêté ; la liste reste partagée dans ses événements.
- [ ] Le journal : « Journal de l'événement », et ses lignes sans « groupe », « édition » ni « pistes ».
- [ ] Les emails de « Devine qui » hors d'un événement de catégorie Noël : les variantes sans « Père Noël ».

## Hors périmètre

- La page « Quoi de neuf » et les points rouges (ticket 120), le résumé du matin (121), les notifications du téléphone (124) : ils n'existent pas encore.
- Les lignes de l'accueil (ticket 112).
- Le mot envoyé le jour de la bascule (ticket 113).

## C'est fini quand

- [ ] Un test sur chaque email vérifie son objet, avec un et avec deux Secret Santa dans l'événement.
- [ ] Aucun email, aucune notification, aucune ligne de journal ne contient le prénom de celui qui demande des idées (un test le vérifie).
- [ ] Les maquettes du ticket sont reproduites, dans les trois langues.
- [ ] `/controle` passe.

## Compte rendu

À remplir par Claude Code à la fin : ce qui a été fait, ce qui a été décidé seul (et pourquoi), les écarts avec les maquettes, les questions posées, les commits.
