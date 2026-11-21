# 107 — V3 : les pistes de cadeaux deviennent la liste

- **Dépend de** : 105, 106
- **Migration** : oui
- **Maquettes** : `V3TirageVersListe`, `V3ListeSurligne`, `V3ListeQuiSecret`, `V3ListeSecret`, `V3ListeCompteCree`, `V3ListeAdresse`, `V3TirageNouvelles`, `PistesResultatVide`, `PistesDemander`, `PistesResultatDemande`, `PistesEmail`

## Objectif

Il n'y a plus qu'un endroit où écrire ses goûts et ses idées. Celui qui m'a tiré au sort les voit, et je peux ne les montrer qu'à lui.

## À lire d'abord

- `docs/spec/v3/listes.md` (« La fin des pistes de cadeaux »)
- `docs/spec/v3/secret-santa.md` (« Le résultat », « Du résultat à la liste »)
- `docs/spec/v3/migration.md` (« Les pistes de cadeaux »)
- `docs/decisions/2026-11-20-pistes-et-listes-fusionnent.md`

## À faire

- [ ] « Celui qui m'a tiré » dans « Qui verra ta liste ? », avec son choix par défaut selon d'où l'on vient.
- [ ] Une liste réservée à celui qui m'a tiré : lui seul la lit, elle n'apparaît pas dans la fête.
- [ ] La carte du résultat : mes goûts viennent de la fiche « Moi », une ligne mène à la liste ; « Lui demander des idées ».
- [ ] L'arrivée sur la liste : la liste entière, calée sur la partie de la personne tirée, mode anonyme activé.
- [ ] Le compte créé à la première chose écrite, et son message.
- [ ] L'adresse demandée à celui qui n'en a pas, confirmée par un lien.
- [ ] La migration : `giftPortraits` vers la fiche « Moi », `wishes` vers les idées d'une liste réservée à celui qui a tiré.
- [ ] Le suivi de l'organisateur : « a écrit sa liste ».
- [ ] Suppression de la page « Mes pistes », du réglage « Pistes de cadeaux » et de leurs textes.
- [ ] « Lui demander des idées » : l'email invite à écrire sa liste ; la demande s'affiche toujours sans prénom (« Quelqu'un te demande des idées »).
- [ ] La ligne de la liste dit quand elle a de nouvelles idées depuis ma dernière visite (`V3TirageNouvelles`).
- [ ] « Celui qui m'a tiré » est un stade du partage (`docs/spec/v3/listes.md`, « Le partage d'une liste, par stades ») : choisi d'avance en arrivant de mon Secret Santa, sans brouillon entre les deux.

## Hors périmètre

- Le dessin d'une liste.
- Les pistes des années passées d'une personne sans compte : elles restent en lecture seule, rien n'est créé à sa place.

## C'est fini quand

- [ ] Après la migration, personne ne voit une idée qu'il ne voyait pas avant (un test le vérifie sur des données d'essai).
- [ ] Un participant arrivé par son lien écrit une idée, voit le message du compte créé, et retrouve sa liste en se connectant.
- [ ] Les six maquettes sont reproduites.
- [ ] `/controle` passe.

## Compte rendu

À remplir par Claude Code à la fin : ce qui a été fait, ce qui a été décidé seul (et pourquoi), les écarts avec les maquettes, les questions posées, les commits.
