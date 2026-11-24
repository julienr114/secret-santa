# Les générateurs des maquettes

Pour la conception, pas pour le code de l'application : Claude Code n'a rien à faire ici.

Les maquettes ne sont pas dessinées à la main : des scripts Python les écrivent, à partir de morceaux communs (l'en-tête, la barre du bas, les lignes, les cartes). `generateurs.tar.gz` est la copie de ces scripts au 20 novembre 2026, pour qu'une nouvelle session de conception puisse reprendre sans tout réécrire.

## Ce qu'il y a dedans

- `generateurs/*.py` : un script par série de maquettes. `ORDRE.txt` donne l'ordre dans lequel ils ont été lancés. Les deux derniers comptent :
  - `v3all.py` écrit toutes les maquettes `V3*` ;
  - `v3pass.py` passe les maquettes d'avant aux mots et à l'habillage de la V3 (la liste des périmées est dans `v3perimees.py`).
  - à la fin de `v3all.py`, deux retouches des maquettes d'avant, qui se relancent sans risque : la barre du haut des listes (« LA BARRE DU HAUT DES LISTES D'AVANT ») et les textes que la V3 change sur le fond (« LES TEXTES D'AVANT… »). **L'ordre compte : `v3pass.py`, puis `v3all.py`, puis `sorbet_all.py`.**
- `generateurs/sorbet_all.py` : habille les sources dans le style « Sorbet » pour l'artifact (le dépôt a son propre habilleur, `docs/refonte/sorbet/habiller.py`, qui fait la même chose pour `maquettes-sorbet/`).
- `generateurs/etat/` : `names.json` (les maquettes que traite `sorbet_all.py`), `v3meta.json` (titre, taille et place de chaque maquette V3 sur le canevas), `shot.py` (une image de contrôle de quelques maquettes côte à côte ; `shot2.py` pour les pages longues, `shot3.py` pour les maquettes hors V3).

## Pour s'en resservir

Les scripts ont des chemins en dur. Dans un espace de travail neuf :

1. Décompresser dans `/home/claude/gen/`.
2. Copier les sources `docs/refonte/maquettes/<Nom>.html` vers `/home/claude/utt/project/<Nom>.dc.html`.
3. Copier `etat/names.json` et `etat/v3meta.json` dans `/tmp/`, `etat/shot.py` dans `/tmp/`.
4. `python3 sorbet_all.py` : les fichiers habillés sortent dans `/home/claude/s/`, et `/tmp/sorbet_pub.json` liste ceux qui ont changé, à publier dans l'artifact.
5. Copier chaque source modifiée vers `docs/refonte/maquettes/<Nom>.html`, puis relancer `python3 -B docs/refonte/sorbet/habiller.py`.

**Attention à `v3all.py` et `v3pass.py`** : ils partent des maquettes d'avant le passage (`/home/claude/utt/v2/`), pas de celles d'aujourd'hui. Cette copie n'est pas dans l'archive : elle est dans l'historique Git de `docs/refonte/maquettes/`, au dernier commit d'avant le 20 novembre 2026 au soir. Sans elle, ne pas les relancer : retoucher une maquette directement dans son fichier. Depuis le 20 novembre 2026 au soir, les maquettes périmées ne sont plus dans le dépôt non plus : certaines servent de point de départ à des `V3*` (`GroupeMembres`, `Rejoindre`, `Admin`…), et ne se retrouvent que dans cet historique.

## À tenir à jour

À la fin d'une séance de conception qui a changé un générateur, refaire l'archive et la remplacer ici.
