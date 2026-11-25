# 125 — La page de présentation

- **Décidé par Julien le 25 novembre 2026** : les textes de `Landing` sont validés (« c'est très bien la version mobile ») ; `LandingDesktop` porte les mêmes textes sur un écran large ; le bloc « Le tirage » s'appelle « Le Secret Santa » ; « Des listes de cadeaux, pour Noël ou pour autre chose » ; depuis le ticket 169, « Chacun reçoit son lien par email. Sans adresse, tu le partages par WhatsApp ou SMS. » ; la page sort **après le 131, le 132 et le 126**, sans attendre le 124, dont le bloc s'ajoutera.
- **Vient de** : l'ancien plan, « Lot 32 » ; README 22.23
- **Dépend de** : 126 (le lien « Qui a fait ça, et pourquoi ? ») ; chaque bloc dépend du ticket qui fait ce qu'il promet (voir « Ne montrer que ce qui existe »)
- **Migration** : non
- **Maquettes** : `Landing` (téléphone), `LandingDesktop` (écran large)

## Objectif

Quelqu'un qui arrive sur `/` sans être connecté comprend en un écran ce qu'est Under the Tree, et peut créer un compte ou se connecter. Aujourd'hui il tombe sur la connexion.

## À lire d'abord

- `docs/refonte/PLAN.md`, « Lot 32 » et ses points à relire (section 6)
- `docs/spec/v3/vocabulaire.md`
- les deux maquettes

## À faire

- [ ] **`/` sans session** devient la page de présentation ; avec une session, rien ne change. « Créer un compte » et « Se connecter » mènent aux écrans de connexion, qui gardent leurs adresses.
- [ ] **L'accroche** : « Le Secret Santa et les listes de cadeaux, pour toutes les occasions. », puis « Chacun découvre en secret à qui il offre. Personne ne triche, et personne n'offre deux fois la même chose. ».
- [ ] **L'encadré « Tu as reçu un lien personnel ? »** juste sous les boutons.
- [ ] **Quatre blocs, « Ce qu'on y fait »**, chacun avec sa tuile (44 px à gauche du titre sur téléphone, 52 px au-dessus du texte sur un écran large) : le Secret Santa, les idées, « Devine qui », les listes de cadeaux. Les textes : ceux de la maquette, une fois relus par Julien.
- [ ] **Ne montrer que ce qui existe** : un bloc, ou une ligne de « Et aussi », ne s'affiche que si son ticket est fait. « Tes données » attend le 131 ; « Sur ton téléphone, comme une application » le 124 ; « Prévenu quand il faut » les 121 et 124 ; « un code reçu par email » le 123 ; « Bientôt » (l'assistant) le 133.
- [ ] **Ne rien promettre de faux sur le secret** : la phrase sur l'organisateur dit le dernier recours (« S'il regarde un résultat en dernier recours, tous les membres le savent »), comme le demande le ticket 131.
- [ ] **Sur un écran large** : l'en-tête avec « Se connecter » et « Créer un compte » à droite, le titre à gauche de deux captures, les blocs qui alternent texte et capture, « Et aussi » sur trois colonnes. Une seule page qui s'adapte.
- [ ] **Les captures, sur un écran large seulement** : de vraies captures de la V3, faites par un script à partir des données de démonstration, à 390 px, dans les trois langues, légères et chargées à la demande. Jamais de données réelles. Écrans : l'enveloppe à ouvrir, une liste avec ses titres et ses étoiles, deux écrans du palmarès, une liste par son lien. Sur téléphone, pas de capture : l'icône seule.
- [ ] **Un téléphone dessiné** autour de chaque capture, incliné vers son texte (`docs/refonte/sorbet/capture.py` fait foi).
- [ ] **La fin de page** : « Prêt pour cette année ? », « Un compte suffit, pour tenir une liste comme pour organiser un Secret Santa. », les deux boutons, les trois langues, « Qui a fait ça, et pourquoi ? ».
- [ ] **Pour les moteurs de recherche et le partage du lien** : un titre, une description et une image d'aperçu par langue, rendus côté serveur.
- [ ] Trois langues, tests de parcours (sans session : la page ; connecté : l'accueil), README 11 et 22.23 à jour.

## Hors périmètre

- La page « Qui a fait ça » (ticket 126) et « Tes données, en clair » (ticket 131).

## C'est fini quand

- [ ] Sans session, `/` montre la page ; connecté, l'accueil.
- [ ] Aucun bloc ne promet une chose qui n'est pas encore en ligne.
- [ ] `/controle` passe.

## Compte rendu

À remplir par Claude Code à la fin : ce qui a été fait, ce qui a été décidé seul (et pourquoi), les écarts avec les maquettes, les questions posées, les commits.
