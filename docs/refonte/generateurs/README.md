# Les générateurs des maquettes

Pour la conception, pas pour le code de l'application : Claude Code n'a rien à faire ici.

Les maquettes ne sont pas dessinées à la main : des scripts Python les écrivent, à partir de morceaux communs (l'en-tête, la barre du bas, les lignes, les cartes). `generateurs.tar.gz` est la copie de ces scripts au 20 novembre 2026, pour qu'une nouvelle session de conception puisse reprendre sans tout réécrire.

## Ce qu'il y a dedans

- `generateurs/*.py` : un script par série de maquettes. `ORDRE.txt` donne l'ordre dans lequel ils ont été lancés. Le dernier, `v3all.py`, écrit toutes les maquettes `V3*`.
- `generateurs/sorbet_all.py` : habille les sources dans le style « Sorbet » pour l'artifact (le dépôt a son propre habilleur, `docs/refonte/sorbet/habiller.py`, qui fait la même chose pour `maquettes-sorbet/`).
- `generateurs/etat/` : `names.json` (les maquettes que traite `sorbet_all.py`), `v3meta.json` (titre, taille et place de chaque maquette V3 sur le canevas), `shot.py` (une image de contrôle de quelques maquettes côte à côte).

## Pour s'en resservir

Les scripts ont des chemins en dur. Dans un espace de travail neuf :

1. Décompresser dans `/home/claude/gen/`.
2. Copier les sources `docs/refonte/maquettes/<Nom>.html` vers `/home/claude/utt/project/<Nom>.dc.html`.
3. Copier `etat/names.json` et `etat/v3meta.json` dans `/tmp/`, `etat/shot.py` dans `/tmp/`.
4. `python3 v3all.py`, puis `python3 sorbet_all.py` : les fichiers habillés sortent dans `/home/claude/s/`, et `/tmp/sorbet_pub.json` liste ceux qui ont changé, à publier dans l'artifact.
5. Copier chaque source modifiée vers `docs/refonte/maquettes/<Nom>.html`, puis relancer `python3 -B docs/refonte/sorbet/habiller.py`.

Si l'archive ne se décompresse plus ou si un script casse, les sources de `docs/refonte/maquettes/` suffisent : une maquette se retouche aussi directement dans son fichier.

## À tenir à jour

À la fin d'une séance de conception qui a changé un générateur, refaire l'archive et la remplacer ici.
