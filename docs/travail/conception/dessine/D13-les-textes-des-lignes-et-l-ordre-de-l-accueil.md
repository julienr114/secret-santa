# D13 — Le texte sous chaque ligne, le nom d'une fête dans une phrase, l'accueil dans l'ordre des dates

- **Débloque** : ticket 112 (les réponses aux questions Q-010 à Q-014 de Claude Code)
- **Maquettes** : `V3AccueilAvantNoel` (nouvelle) ; `V3Accueil`, `V3AccueilJeu`, `V3AccueilAnnee`, `V3Fete`, `V3FeteOrganisateur`, `V3FeteQuitter`, `V3FeteAnneePassee` retouchées
- **Fait le** : 21 novembre 2026

## Ce qui est fait

- `docs/spec/v3/lignes.md` : pour chaque ligne, son titre, ses cas dans l'ordre, le texte de chaque cas, le point rouge.
- Les maquettes disent « aussi : Chez Mamie », « Elle reste dans tes autres fêtes. », « Le Secret Santa » sans l'année, « 4 nouvelles idées » ; « Quitter cette fête » n'a plus de texte dessous.
- `V3AccueilAvantNoel` : une crémaillère du 28 novembre au-dessus de « Noël 2026 ».

## Décidé seul

- **« tu l'organises » ne s'écrit plus** sur l'accueil : ce n'est pas un état. L'organisateur retrouve le suivi par la page de la fête.
- **La ligne d'un Secret Santa ne parle pas pareil selon l'endroit** : au participant sur l'accueil, à l'organisateur sur la page de la fête.
- **Le titre d'une liste dit pour qui elle est** (« La liste de Léo et Zoé »), pas qui la tient ; « Ma liste » quand je la tiens.
- **Une fête d'avant Noël passe au-dessus de Noël, sans titre.** Claude Code avait mis tout ce qui n'est pas Noël sous « Plus tard » en attendant.
- **Jamais de préposition devant le nom d'une fête.**
- « Elle vient de la créer » disparaît (l'application ne connaît pas le genre).

## Contrôlé

`V3AccueilAvantNoel`, `V3Fete`, `V3FeteQuitter` et `V3AccueilAnnee`, en image. Les autres retouches sont des textes, vérifiés par recherche.
