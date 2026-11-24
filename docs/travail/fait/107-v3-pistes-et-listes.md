# 107 — V3 : les pistes de cadeaux deviennent la liste

- **Dépend de** : 105, 106
- **Migration** : oui, `0037_v3_hints_to_lists`
- **Maquettes** : `V3TirageVersListe`, `V3ListeSurligne`, `V3ListeQuiSecret`, `V3ListeSecret`, `V3ListeCompteCree`, `V3ListeAdresse`, `V3TirageNouvelles`, `PistesResultatVide`, `PistesDemander`, `PistesResultatDemande`, `PistesEmail`

## Objectif

Il n'y a plus qu'un endroit où écrire ses goûts et ses idées. Celui qui m'a tiré au sort les voit, et je peux ne les montrer qu'à lui.

## À lire d'abord

- `docs/spec/v3/listes.md` (« La fin des pistes de cadeaux »)
- `docs/spec/v3/secret-santa.md` (« Le résultat », « Du résultat à la liste »)
- `docs/spec/v3/migration.md` (« Les pistes de cadeaux »)
- `docs/decisions/2026-11-20-pistes-et-listes-fusionnent.md`

## À faire

- [x] « Celui qui m'a tiré » dans « Qui verra ta liste ? », avec son choix par défaut selon d'où l'on vient.
- [x] Une liste réservée à celui qui m'a tiré : lui seul la lit, elle n'apparaît pas dans l'événement.
- [x] La carte du résultat : mes goûts viennent de la fiche « Moi », une ligne mène à la liste ; « Lui demander des idées ».
- [x] L'arrivée sur la liste : la liste entière, calée sur la partie de la personne tirée, mode anonyme activé.
- [x] Le compte créé à la première chose écrite, et son message (Q-018, réponse A de Julien).
- [x] L'adresse demandée à celui qui n'en a pas, confirmée par un lien.
- [x] La migration : `giftPortraits` vers la fiche « Moi », `wishes` vers les idées d'une liste réservée à celui qui a tiré.
- [x] Le suivi de l'organisateur : « a écrit sa liste ».
- [x] Suppression de la page « Mes pistes », du réglage « Pistes de cadeaux » et de leurs textes. Leurs anciennes adresses mènent à la liste (`docs/spec/v3/navigation.md`, « Les anciennes adresses »).
- [x] « Lui demander des idées » : l'email invite à écrire sa liste ; la demande s'affiche toujours sans prénom (« Quelqu'un te demande des idées »).
- [x] La ligne de la liste dit quand elle a de nouvelles idées depuis ma dernière visite (`V3TirageNouvelles`).
- [x] « Celui qui m'a tiré » est un stade du partage (`docs/spec/v3/listes.md`, « Le partage d'une liste, par stades ») : choisi d'avance en arrivant de mon Secret Santa, sans brouillon entre les deux.

## Hors périmètre

- Le dessin d'une liste.
- Les pistes des années passées d'une personne sans compte : elles restent en lecture seule, rien n'est créé à sa place.

## C'est fini quand

- [x] Après la migration, personne ne voit une idée qu'il ne voyait pas avant (un test le vérifie sur des données d'essai).
- [x] Un participant arrivé par son lien écrit une idée, voit le message du compte créé, et retrouve sa liste en se connectant (`first-idea.spec.ts`).
- [x] Les maquettes du ticket sont reproduites.
- [x] `/controle` passe.

## Compte rendu

**Fait.**

- **« Celui qui m'a tiré » est un stade du partage.** Dans « Qui verra ta liste ? », sous un événement où je participe à un Secret Santa pas clôturé, on choisit « Tous les membres » ou « Celui qui m'a tiré ». Celui qui a tiré un des teneurs entre :
  - par son compte, ou par la participation que son lien signe ;
  - le tirage est déchiffré sur le serveur et seul un oui ou non en sort ;
  - la liste n'apparaît pas dans l'événement pour les autres.
- **La carte du résultat** :
  - « La liste de cadeaux d'Inès » s'ouvre en mode anonyme, calée sur sa partie (`?personne=`), et dit « 2 nouvelles idées depuis ta dernière visite » ;
  - ses goûts viennent de sa fiche « Moi » ;
  - sans compte, ses pistes d'avant la V3 restent, en lecture seule ;
  - rien d'écrit : « Inès n'a encore rien écrit. » et « Lui demander des idées », dont l'email invite à écrire sa liste et mène à `/p/…/liste`.
- **« Ma liste de cadeaux »**, depuis mon Secret Santa (`/p/…/liste`) :
  - connecté avec mon adresse, ma liste pour l'événement s'ouvre, créée réservée à celui qui m'a tiré, sans brouillon entre les deux ;
  - avec l'adresse donnée par l'organisateur et sans compte, la première idée écrite crée le compte (avec l'avatar du Secret Santa), ouvre sa session et la liste, puis dit « C'est enregistré » (Q-018) ;
  - une adresse qui a déjà un compte n'est jamais ouverte par le lien : « Ton adresse email, pour écrire ta liste », confirmée par le lien reçu, comme pour qui n'a pas d'adresse.
- **La migration `0037_v3_hints_to_lists`**, appliquée en local seulement, testée sur des données d'essai :
  - le portrait remplit la fiche « Moi » vide (Q-019, confirmé par Julien) ;
  - les idées d'un Secret Santa pas clôturé vont dans une liste de la personne, réservée à celui qui l'a tirée ;
  - sans compte, rien n'est créé.
- **Disparus** :
  - la page « Mes pistes » et ses pages, leurs routes, le réglage « Pistes de cadeaux » et leurs textes ;
  - les anciennes adresses (`/pistes`, `/souhaits`) mènent à `/p/…/liste`.
- **Le suivi de l'organisateur** dit « a écrit sa liste », jamais quoi.
- **Les tests** :
  - Vitest : l'arrivée, la fiche « Moi » en portrait, la redirection, la migration ;
  - Playwright : « Celui qui m'a tiré » (le donneur entre, personne d'autre), les nouvelles idées, l'adresse puis la liste depuis le Secret Santa, « a écrit sa liste », les anciennes adresses ;
  - les pistes d'avant la V3 sont posées directement dans la base de test (`seedSql`), puisqu'aucun écran ne les écrit plus.

**Décidé seul** : voir `ECARTS-MAQUETTES.md`, section « Les pistes deviennent la liste ».

**Questions** :
- Q-018 : le compte créé à la première idée. Réponse de Julien : A, la première idée crée le compte et ouvre sa session ; un compte qui existe déjà n'est jamais ouvert par le lien.
- Q-019 : déplacer le portrait vers la fiche « Moi », lue plus largement. Réponse de Julien : oui, les goûts sont communs à toutes les listes ; la migration reste telle quelle.

**Hors de ce ticket** : « Quelqu'un te demande des idées » sur l'accueil et dans le menu du compte, c'est le texte des lignes (ticket 112) et « Quoi de neuf » (ticket 120).
