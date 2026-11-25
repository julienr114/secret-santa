# 174 — Le code de connexion se copie et se colle en entier

- **Dépend de** : 123 (fait), 124
- **Migration** : non
- **Maquettes** : `ConnexionCode`, `ConnexionCodeEmail` (rien à redessiner : le dessin ne change pas)

## Objectif

Julien, le 25 novembre 2026, sur son iPhone, dans l'application installée : on ne peut pas copier-coller le code en entier, alors que c'est ce que font la plupart des gens. Le code doit se copier d'un geste dans l'email, et se coller d'un geste dans « Tape ton code ».

## À lire d'abord

- `app/components/auth/LoginCode.vue` : un champ invisible (`opacity-0`) posé sur six cases
- `server/utils/loginEmail.ts` (`buildCodeEmail`) et `server/utils/loginCode.ts` (`spacedCode`, `codeDigits`)

## Ce qu'on sait

- Dans l'email, le code est écrit « 123 456 », avec une espace : un double appui ne sélectionne que la moitié.
- **À l'écran, c'est le premier point à régler** (Julien, 25 novembre 2026 : « ça ne me proposait même pas de coller »). Le champ est invisible (`opacity-0`) : sur son iPhone, l'appui long sur les cases n'a proposé aucun « Coller ».

## À faire

- [x] **Dans l'email** : le code s'écrit sans espace dans le texte, six chiffres d'un bloc, pour qu'un double appui le prenne en entier. Si l'on veut garder l'écart entre les deux moitiés, il se fait par le style, pas par un caractère. Pareil dans la version texte de l'email. L'objet peut garder son écriture.
- [x] **À l'écran** : un appui long sur les cases propose « Coller », et coller remplit les six cases et valide. Le collage accepte ce que les gens copient vraiment : « 123456 », « 123 456 », le code suivi d'un point ou d'une espace, ou toute la ligne de l'email.
- [x] **La proposition du clavier** (le code lu dans l'email, au-dessus du clavier) : la garder si elle marche, ne pas la casser.
- [x] Pas de bouton en plus à l'écran, sauf si l'appui long ne peut pas marcher autrement : dans ce cas, le dire dans `questions.md` avant de l'ajouter.
- [x] Tests : le collage dans ses variantes (Playwright) ; le texte de l'email sans espace (Vitest).

## Hors périmètre

- La connexion par lien dans un navigateur : elle ne change pas.

## C'est fini quand

- [x] Dans l'email, un double appui sélectionne les six chiffres.
- [x] Dans l'application installée, coller le code remplit les six cases et connecte.
- [ ] (à Julien, après la publication) **Vérifié par Julien sur son iPhone** : c'est le seul vrai test.
- [x] `/controle` passe.

## Compte rendu

**Fait (25 novembre 2026).**

- **Dans l'email** (`buildCodeEmail`) : le code s'écrit en un seul bloc, « 482913 », dans le texte comme dans la version HTML. Un double appui le prend en entier. L'écart entre les deux moitiés n'est plus un caractère : c'est un espacement des lettres (`letter-spacing`). L'objet garde « 482 913 ».
- **À l'écran** (`LoginCode.vue`) : le champ posé sur les six cases n'est plus caché par son opacité. C'est ce qui empêchait l'iPhone de proposer « Coller ». Il reste là pour le doigt, ses lettres et son curseur transparents, ses chiffres lus dans les cases.
  - Il n'a plus de limite de 12 caractères, qui aurait coupé un long collage.
  - Un collage passe par `codeFromPaste` (`server/utils/loginCode.ts`). Il lit le code dans ce que les gens copient vraiment : « 123456 », « 123 456 » (même avec une espace insécable), le code suivi d'un point ou d'une espace, ou toute la ligne de l'email. Six chiffres d'un bloc, ou trois et trois autour d'une espace, passent avant tout autre chiffre (le « 15 minutes » de l'email). Les six cases se remplissent et le code est validé.
- **La proposition du clavier** (`autocomplete="one-time-code"`) est gardée : elle remplit le champ comme une frappe.
- **Pas de bouton en plus.**
- **Tests** :
  - Vitest : `codeFromPaste` dans ses variantes, et l'email sans espace dans le code ;
  - Playwright : le champ est bien visible pour le doigt (opacité 1), et coller la ligne entière de l'email, le code espacé, connecte.

**Reste** : l'essai de Julien sur son iPhone, après la publication. La simulation ne montre pas le menu de l'appui long d'iOS. Le ticket reste dans `en-cours/` jusque-là.

**Écarts avec les maquettes** : aucun, le dessin ne change pas.

**Questions posées** : aucune.

**Migrations** : aucune.

**Contrôle** : `pnpm controle --e2e`, tout est passé : 1 109 tests Vitest et 247 parcours.

**Commit** : `fix(auth): the login code is copied and pasted whole`. Ni poussé, ni déployé : Julien publie et essaie sur son iPhone.
