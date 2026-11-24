# 123 — La connexion par code

- **Dépend de** : 113
- **Migration** : oui (les codes)
- **Maquettes** : `ConnexionCode`, `ConnexionCodeEmail`

## Objectif

Dans l'application installée sur le téléphone, un lien reçu par email s'ouvre dans le navigateur, pas dans l'application. Là, et seulement là, on se connecte avec un code à six chiffres recopié depuis l'email.

## À lire d'abord

- `README.md`, sections 8 (la sécurité des liens de connexion) et 22.22

## À faire

- [x] **Le cœur, en fonctions pures** : créer et vérifier un code (six chiffres, 15 minutes, une fois, cinq essais, lié à l'appareil qui l'a demandé), jamais gardé en clair.
- [x] **Base** : les codes, à côté des liens de connexion ; mêmes limites d'envoi.
- [x] **Savoir si l'application tourne installée**, et seulement alors : l'écran du code après l'adresse, l'email du code sans lien. Dans un navigateur, rien ne change.
- [x] Trois langues, tests, `tests/e2e`.

## Hors périmètre

- Rendre l'application installable (ticket 124).

## C'est fini quand

- [x] Le sixième essai d'un code est refusé, même avec le bon code.
- [x] Un code demandé sur un appareil ne connecte pas un autre appareil.
- [x] Dans un navigateur, la connexion par lien est exactement celle d'aujourd'hui.
- [x] Les deux maquettes sont reproduites.
- [x] `/controle` passe.

## Compte rendu

**Fait.**

- **Le cœur, en fonctions pures** (`server/utils/loginCode.ts`, testé) :
  - six chiffres tirés sans biais (`codeOf`) ;
  - leur forme dans l'email, « 482 913 » ;
  - la lecture des seuls chiffres tapés ;
  - l'état d'un code (`codeState`) : utilisé, hors délai (15 minutes), essais épuisés (cinq ; le sixième est refusé, même juste) ;
  - son empreinte (`codePrint`) : un HMAC avec le secret du serveur, liée à l'appareil. Jamais le code en clair, et une copie de la base ne permet pas d'essayer le million de codes.
- **La base** : migration `0052_v3_login_codes`, à côté des liens. Un nouveau code met fin aux précédents du compte. Les codes comptent avec les liens dans les mêmes limites d'envoi (`recentLinkRequests`), et la route est limitée en débit comme celle du lien.
- **L'appareil** : demander un code pose un cookie à soi (`utt_device`, `httpOnly`) dont l'empreinte lie le code. Un autre appareil n'a pas ce cookie : le code ne le connecte pas.
- **Le serveur** : `POST /api/auth/link` avec `code: true` envoie le code par un email sans lien (`buildCodeEmail`, `ConnexionCodeEmail`) ; `POST /api/auth/code` vérifie le code, compte chaque essai avant de comparer (deux essais simultanés ne passent pas tous les deux) et ouvre la session. Une adresse inconnue, un mauvais code, un autre appareil : le même refus, compté dans « Connexions échouées ».
- **L'application installée seulement** (`useInstalledApp` : `display-mode: standalone`, ou `navigator.standalone` sur iPhone) : le bouton dit « Recevoir un code », puis vient « Tape ton code » (`AuthLoginCode`). Le code est validé au sixième chiffre ; l'écran propose « Renvoyer un code » et « Utiliser une autre adresse ». Dans un navigateur, la connexion par lien ne change pas (un test le vérifie).
- **Tests** : Vitest (`loginCode.test.ts`) ; Playwright (`login-code.spec.ts` : se connecter par le code dans l'application installée, simulée ; dans un navigateur, le lien d'avant ; un autre appareil refusé ; un code ne sert qu'une fois ; le sixième essai refusé).

**Décidé seul, et pourquoi.**

- **Le code passe par la route du lien** (`code: true`) : mêmes limites, mêmes refus, la même réponse que l'adresse ait un compte ou non. En développement, le serveur renvoie le code (`devCode`), comme il renvoie le lien.
- **Un seul champ sous six cases**, pour que le téléphone propose le code reçu et qu'un collage marche.
- **L'application installée n'existe qu'avec le ticket 124** : d'ici là, on ne voit cet écran que si l'on ajoute le site à l'écran d'accueil. Rien ne change pour les autres.

**Écarts avec les maquettes** : section « La connexion par code » de `docs/refonte/ECARTS-MAQUETTES.md`.

**Questions posées** : aucune.

**Migrations** : `0052_v3_login_codes`, appliquée en local seulement, après `0048` à `0051`.

**Contrôle** : `pnpm controle --e2e`, tout est passé : 1 089 tests Vitest et 239 parcours.

**Commit** : un seul, `feat(auth): the installed app logs in with a code of six digits`.
