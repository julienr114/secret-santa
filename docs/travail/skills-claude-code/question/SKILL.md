---
name: question
description: Écrire une question pour Julien ou pour la conception dans docs/travail/questions.md, au lieu d'inventer. À utiliser quand la spec se tait ou se contredit, quand une maquette montre une donnée que rien ne fournit, ou quand un choix n'est pas le tien.
---

# Poser une question

On ne devine pas une règle, on ne tranche pas un choix de produit. On l'écrit, et on avance sur le reste.

## Où

Dans `docs/travail/questions.md`, sous « Ouvertes », à la suite.

## Comment

```
### Q-NNN — La question en une phrase (ticket NNN)

- **Pour** : Julien, ou la conception
- **Ce qui bloque** : ce qu'on ne peut pas coder sans la réponse, et ce qu'on a fait en attendant
- **Ce qu'on a trouvé** : le fichier et la phrase de la spec, la maquette, le code
- **Les choix** : A, B (avec ce que chacun entraîne)
- **Ce que je ferais** : A, parce que...
```

- Numéroter à la suite de la dernière question du fichier.
- « Pour Julien » : un choix de produit, une donnée, un arbitrage. « Pour la conception » : une maquette qui manque ou qui contredit la spec, un état qu'elle ne montre pas.
- Dire ce qu'on ferait : une question avec une proposition se tranche en un mot.

## Ensuite

- Noter la question dans le compte rendu du ticket.
- Ne pas coder le choix qu'on propose, sauf s'il est sans conséquence et facile à défaire ; dans ce cas l'écrire dans « Ce qui bloque ».
- La réponse arrivera sous « Réponses », et dans la spec.
