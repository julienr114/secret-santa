# 111 — Après la suppression des maquettes périmées

- **Dépend de** : aucun
- **Migration** : non
- **Maquettes** : aucune

## Objectif

Les maquettes périmées ont été supprimées par la conception le 20 novembre 2026 au soir (88 maquettes, 176 fichiers, dans `docs/refonte/maquettes/` et `docs/refonte/maquettes-sorbet/`). Reste à vérifier que rien, côté code, ne s'appuie encore dessus.

## À lire d'abord

- `docs/spec/v3/maquettes.md` (« Périmées » : la liste, et ce qui remplace chacune)

## À faire

- [x] `docs/refonte/ECARTS-MAQUETTES.md` cite encore `PistesListe`, `PistesListeChoisir` et `ListeNouvelle` : dire ce qui les remplace, ou retirer la ligne.
- [ ] Supprimer, si Julien est d'accord, les neuf fichiers orphelins listés dans `docs/spec/v3/maquettes.md` (dans `maquettes/` et `maquettes-sorbet/`). *En attente de son accord : Q-024.*
- [x] Chercher dans `docs/ARBORESCENCE.md`, les commentaires du code et les tests un nom de la liste des périmées.
- [ ] Quatre fichiers ne sont que dans le dépôt, sans être sur le canevas ni dans l'index : `ListeIdeeBulle`, `ListeIdeeBulleGras`, `ListeSansPersonneA`, `ListeSansPersonneB`. Les supprimer avec les neuf, si Julien est d'accord. *En attente de son accord : Q-024.*

## Hors périmètre

- Les maquettes gardées : elles restent la référence de tout ce que la V3 ne redessine pas.

## C'est fini quand

- [x] Aucun fichier hors de `docs/spec/v3/maquettes.md` ne cite une maquette périmée : vrai pour le code, les tests, `ARBORESCENCE.md` et `ECARTS-MAQUETTES.md`. Le README (récits datés de la V2), `habiller.py` et `generateurs/README.md` en citent encore : Q-025. `PLAN.md`, `docs/decisions/`, `docs/spec/` et les tickets faits ne se touchent pas.
- [x] `docs/refonte/maquettes/` et `docs/refonte/maquettes-sorbet/` ont le même nombre de fichiers (349 chacun).
- [x] `/controle` passe.

## Compte rendu

**Fait** (22 novembre 2026) :

- Recherche des 88 noms de la liste « Périmées » dans tout le dépôt, mot entier (beaucoup de faux amis : « Accueil », « Admin », « Rejoindre » sont aussi des libellés).
- Le code et les tests citaient encore `ListeNouvelle` (`AddSomeone.vue`, `Note.vue`, `listes/[id]/index.vue`, `listes/nouvelle.vue`, `lists-single.spec.ts`) : ils citent `V3ListeNouvelle`. `listes/index.vue` citait `ListesAccueil` et `ListesVide` : il dit que ses maquettes sont parties et que `V3Accueil` prend sa place.
- `ECARTS-MAQUETTES.md` : la section « Les pistes reliées à une liste (lot 27 ter) » est retirée (`PistesListe`, `PistesListeChoisir`, `PistesResultatListe`) : le ticket 107 a supprimé ce bloc, et la phrase « Le mode anonyme y sera activé pour toi. » est conforme à `V3TirageVersListe`. La ligne `ListeNouvelle` devient `V3ListeNouvelle` : le code garde sous les pastilles d'une liste vide la phrase « Pour un mariage ou une crémaillère… », que `V3ListeNouvelle` n'a pas.
- `ARBORESCENCE.md` ne cite aucune maquette périmée.
- Les treize orphelins (neuf + quatre) ne sont cités par aucun code ni test : rien n'en dépend.

**Décidé seul** :

- Ne pas supprimer les treize orphelins : le ticket demande l'accord de Julien, qui n'est écrit nulle part (Q-024). Les deux dossiers ont déjà le même nombre de fichiers.
- Ne pas réécrire les citations du README : ce sont des paragraphes datés qui racontent la V2 ; ni `habiller.py` ni `generateurs/README.md`, qui sont à la conception (Q-025).

**Écarts avec les maquettes** : la ligne `V3ListeNouvelle` ci-dessus (déplacée, pas nouvelle).

**Questions posées** : Q-024 (supprimer les treize orphelins ?), Q-025 (les citations restantes du README, de `habiller.py` et de `generateurs/README.md`).

**Migrations** : aucune.

**Contrôle** : `pnpm controle` passé (trois langues, mots interdits, textes en dur, lint, typecheck, 806 tests Vitest). Sans `--e2e` : le ticket ne change que des commentaires et de la documentation.

**Commits** : `d555c43` docs: ticket 111 started ; `a56661a` docs: point comments and gaps at the mockups that replace the obsolete ones ; `081b413` docs: ask about the orphan mockups and the remaining mentions ; et celui qui range ce ticket.
