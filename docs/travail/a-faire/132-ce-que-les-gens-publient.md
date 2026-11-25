# 132 — Ce que les gens publient : signaler, retirer, les règles d'usage

- **Dépend de** : 106, 130, 131
- **Migration** : oui (les signalements, le journal de modération)
- **Maquettes** : `Signaler`, `SignalerEnvoye`, `AdminSignalements`, `AdminSignalement`, `ModerationEmail`, `ListePartageSuspendu`, `Regles`, `CompteCreerRegles`

## Objectif

Une liste publique, un mot d'organisateur, un prénom sont du contenu écrit par des inconnus et hébergé par l'application. N'importe qui peut le signaler, le super-admin peut le rendre inaccessible, et celui qui l'a écrit sait pourquoi. **Les textes sont à faire relire** : ce ticket n'est pas un avis juridique.

## À lire d'abord

- L'archive `docs/refonte/PLAN.md`, section 8.5
- `docs/spec/v3/listes.md` (le partage par stades : ce qu'un signalement arrête)
- `docs/spec/v3/administration.md`

## À faire

- [ ] **« Signaler »**, en bas de toute page ouverte par un lien sans être membre (une liste publique, une page de participant, une invitation) et dans le pied des emails (même file que le ticket 130). Sans compte. Un motif à choisir (contenu illégal, harcèlement, données d'un tiers ou d'un enfant, arnaque ou publicité, autre), un mot libre, une adresse facultative pour la réponse. Accusé de réception si une adresse est donnée.
- [ ] **La file du super-admin** (la pastille de l'onglet « Admin ») : le contenu signalé, qui l'a écrit, les signalements précédents du même compte. Trois gestes : classer ; **arrêter le lien public** de la liste (elle reste partagée dans ses événements) ou couper l'envoi d'emails de l'événement ; **suspendre le compte**. Rien n'est effacé sur un simple signalement : le contenu est d'abord rendu inaccessible.
- [ ] **Celui qui tient la liste le voit** (`ListePartageSuspendu`) : « Le lien public de cette liste a été arrêté par l'administrateur », la raison, « Les règles d'usage », « Contester ». « Tout le monde » reste bloqué tant que l'administrateur ne l'a pas rouvert.
- [ ] **Dire pourquoi** : un email (`ModerationEmail`) et la ligne dans l'application, avec le motif, la règle visée et comment contester (répondre à l'adresse de contact). Dire au signaleur ce qui a été décidé.
- [ ] **« Les règles d'usage »** (`Regles`), une page publique courte, en trois langues, liée en bas de chaque page et acceptée à la création d'un compte (`CompteCreerRegles` : une phrase avec un lien, pas une case de plus) : à quoi sert l'application ; ce qu'on n'y met pas ; n'ajouter que des adresses de gens qu'on connaît ; ce qui arrive en cas d'abus ; le service est gratuit, fourni tel quel, et peut s'arrêter ; comment signaler.
- [ ] **Un point de contact unique** (l'adresse du ticket 131), écrit dans les mentions légales, les règles d'usage et `security.txt`.
- [ ] **Le journal de modération** : chaque signalement et chaque décision, avec sa date, gardés un an (validé par Julien le 25 novembre 2026).
- [ ] **Pas de surveillance automatique des contenus** : on agit sur signalement. Seuls garde-fous automatiques : les plafonds et le refus d'une adresse web dans un nom.
- [ ] **Les enfants** : dire dans les règles d'usage on peut créer un compte seul à partir de **15 ans** (décidé par Julien le 25 novembre 2026 : l'âge où un mineur consent seul en France, d'après la CNIL) ; une fiche d'enfant est écrite par un parent.
- [ ] Trois langues, `tests/e2e`.

## Hors périmètre

- Signaler une liste qu'on voit comme membre d'un événement : entre gens qui se connaissent, on en parle à l'organisateur. À rouvrir si le besoin apparaît.

## C'est fini quand

- [ ] Un signalement sans compte arrive dans la file, et la pastille de l'onglet monte.
- [ ] Arrêter le lien public rend l'adresse inaccessible à qui n'est pas membre, et laisse la liste visible dans ses événements (un parcours le vérifie).
- [ ] Les huit maquettes sont reproduites.
- [ ] `/controle` passe.

## Relu le 24 novembre 2026 (conception)

- « Signaler » a un motif, un mot libre et une adresse : c'est **une page**, pas un panneau (`regles-d-ecran.md`).
- `ListePartageSuspendu` date d'avant la barre repliée d'une liste : l'état « arrêté par l'administrateur » se lit dans la barre (repliée : « Lien public arrêté » ; déroulée : la raison, « Les règles d'usage », « Contester », et « Tout le monde » grisé). La maquette est à refaire par la conception avant de coder cette case.

## Compte rendu

À remplir par Claude Code à la fin : ce qui a été fait, ce qui a été décidé seul (et pourquoi), les écarts avec les maquettes, les questions posées, les commits.
