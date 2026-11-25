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
- À l'écran, le champ est invisible : sur un iPhone, l'appui long qui propose « Coller » n'est pas garanti sur un champ transparent. À vérifier, c'est peut-être la seule cause, ou l'autre, ou les deux.

## À faire

- [ ] **Dans l'email** : le code s'écrit sans espace dans le texte, six chiffres d'un bloc, pour qu'un double appui le prenne en entier. Si l'on veut garder l'écart entre les deux moitiés, il se fait par le style, pas par un caractère. Pareil dans la version texte de l'email. L'objet peut garder son écriture.
- [ ] **À l'écran** : un appui long sur les cases propose « Coller », et coller remplit les six cases et valide. Le collage accepte ce que les gens copient vraiment : « 123456 », « 123 456 », le code suivi d'un point ou d'une espace, ou toute la ligne de l'email.
- [ ] **La proposition du clavier** (le code lu dans l'email, au-dessus du clavier) : la garder si elle marche, ne pas la casser.
- [ ] Pas de bouton en plus à l'écran, sauf si l'appui long ne peut pas marcher autrement : dans ce cas, le dire dans `questions.md` avant de l'ajouter.
- [ ] Tests : le collage dans ses variantes (Playwright) ; le texte de l'email sans espace (Vitest).

## Hors périmètre

- La connexion par lien dans un navigateur : elle ne change pas.

## C'est fini quand

- [ ] Dans l'email, un double appui sélectionne les six chiffres.
- [ ] Dans l'application installée, coller le code remplit les six cases et connecte.
- [ ] **Vérifié par Julien sur son iPhone** : c'est le seul vrai test.
- [ ] `/controle` passe.

## Compte rendu

À remplir par Claude Code à la fin : ce qui a été fait, ce qui a été décidé seul (et pourquoi), les écarts avec les maquettes, les questions posées, les commits.
