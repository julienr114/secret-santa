# Les skills de Claude Code

Les trois procédures de Claude Code pour ce projet : `ticket`, `controle`, `question`.

## Les installer

La conception ne peut pas écrire dans `.claude/` depuis sa session : c'est Julien qui les y pose, une fois, depuis la racine du dépôt.

```
mkdir -p .claude/skills && cp -R docs/travail/skills-claude-code/ticket docs/travail/skills-claude-code/controle docs/travail/skills-claude-code/question .claude/skills/
```

Claude Code les voit aussitôt : `/ticket`, `/controle`, `/question`.

## Les mettre à jour

- Quand la conception change une procédure, elle la change ici, et Julien relance la commande.
- Quand Claude Code change un skill dans `.claude/skills/` (le ticket 100 le demande pour `controle`), il recopie le fichier ici dans le même commit, pour que les deux restent d'accord.
