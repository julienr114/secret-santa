# 124 — L'application installée et les notifications du téléphone

- **Dépend de** : 120, 121, 123
- **Migration** : oui (les abonnements des appareils)
- **Maquettes** : `Installer`, `NotifAutoriser`, `NotifReglage`

## Objectif

Under the Tree s'installe sur l'écran d'accueil du téléphone, sur iPhone comme sur Android, et prévient par une notification quand quelque chose presse. À vérifier sur de vrais téléphones.

## À lire d'abord

- `README.md`, section 22.22
- `docs/spec/v3/lignes.md` (ce qu'un texte ne doit jamais dire)

## À faire

- [ ] **Installable** : le manifeste, les icônes, les couleurs ; un service worker réduit à ce qu'il faut pour les notifications. Pas de mode hors connexion.
- [ ] **Proposer l'installation** : le panneau des trois gestes sur iPhone, le bouton « Installer » sur Android ; dans « Me prévenir » et une fois sur l'accueil ; jamais dans l'application installée.
- [ ] **S'abonner** : le panneau `NotifAutoriser` puis la question du téléphone, après un geste ; un abonnement par appareil, retiré quand il ne répond plus ; l'interrupteur « Notifications » de « Me prévenir ».
- [ ] **Envoyer** : une notification du téléphone par nouveauté qui presse, depuis le Worker, sans service tiers ; la toucher ouvre l'écran concerné ; **rien dans son texte que le verrouillage du téléphone ne devrait pas montrer** : jamais à qui j'offre, jamais qui demande des idées.
- [ ] **La pastille sur l'icône** : le nombre de nouveautés pas encore vues.
- [ ] L'attente de dix minutes du ticket 121 s'applique dès qu'un appareil est abonné.
- [ ] Trois langues, tests. README 22.22 marqué fait.

## Hors périmètre

- Le mode hors connexion.

## C'est fini quand

- [ ] Vérifié à la main sur un iPhone et un Android : installer, s'abonner, recevoir, toucher, se désabonner.
- [ ] Les trois maquettes sont reproduites.
- [ ] Un test vérifie qu'aucun texte de notification ne contient un prénom tiré ni celui de qui demande des idées.
- [ ] `/controle` passe.

## Compte rendu

À remplir par Claude Code à la fin : ce qui a été fait, ce qui a été décidé seul (et pourquoi), les écarts avec les maquettes, les questions posées, les commits.
