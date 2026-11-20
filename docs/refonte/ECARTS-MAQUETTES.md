# Écarts entre le code et les maquettes

Pour qui tient les maquettes à jour (`docs/refonte/maquettes/` et `docs/refonte/maquettes-sorbet/`). Chaque ligne dit ce que le code fait **autrement que la maquette**, ou un état que la maquette ne montre pas, avec qui l'a décidé et quand. Le README reste l'autorité ; ce fichier sert seulement à retrouver vite quoi redessiner.

Règle : une ligne s'ajoute ici dès qu'un écran codé s'écarte d'une maquette. Elle s'enlève quand la maquette est remise d'accord (ou quand le code revient à la maquette).

« Julien » : décidé par Julien. « Seul » : tranché par Claude Code en codant, à valider ; le détail est en section 6 du `PLAN.md`, sous le nom du lot.

## Le mode anonyme (lot 27 ter)

| Maquette | Ce que fait le code | Décidé par |
|---|---|---|
| `ListeVisiteurTirage` | **Le voile derrière la note couvre toute la page**, barre du haut et onglets compris, comme derrière un panneau. Il est uni (aubergine `#5b3a55` à 35 %), plus de dégradé qui s'arrête à la colonne de la liste. Seules la barre « Mode anonyme » et la note restent en pleine lumière. | Julien, 20 novembre 2026 (« un peu comme une modale ») |
| `ListeVisiteurTirage` | Le voile laisse passer les touchers : la liste reste utilisable dessous. Seuls « Compris » ou l'interrupteur le retirent. | Seul |
| `ListeVisiteurAnonyme` | **L'explication dépliée, mode activé, perd sa dernière phrase** « Le réglage vaut pour toute cette liste. » Elle dit : « Activé : quand tu coches un cadeau, personne ne voit ton prénom, pas même ceux qui tiennent la liste. Ils voient « Anonyme ». » | Julien, 20 novembre 2026 (« assez évident et bien visible ») |
| `ListeVisiteurTirage`, `ListeVisiteurAnonyme`, `ListeVisiteurMes` | La phrase sous le mot d'accueil reste « La liste de Camille. … » : un seul prénom, celui du premier qui tient la liste, pas « La liste de Camille et Hugo ». | Seul |
| `ListeConnexion` | Sous le champ du prénom, une ligne : « Sans prénom, tu coches en anonyme. » | Plan, lot 27 ter |

## Les pistes reliées à une liste (lot 27 ter)

| Maquette | Ce que fait le code | Décidé par |
|---|---|---|
| `PistesListe` | **Trois états que la maquette ne montre pas.** Aucune liste reliée : une ligne à tuile en pointillés avec un « + », « Relier une liste de cadeaux », et dessous « La personne qui t'offre un cadeau verra un lien vers elle ». Pas connecté : « Connecte-toi pour relier une de tes listes de cadeaux. » et un bouton « Me connecter ». Liste reliée mais plus publiée : sous son nom, « Elle n'est plus publiée : le lien ne s'affiche plus. » | Seul |
| `PistesListe` | Sous le nom de la liste reliée : « Ta liste, publiée » si je la tiens, « Une liste où tu figures, publiée » sinon. | Seul |
| `PistesListeChoisir` | Les listes publiées d'abord, les brouillons grisés après (la maquette met le brouillon en dernier, c'est le même ordre ; il est maintenant garanti). | Seul |
| `PistesResultatListe` | Conforme. La phrase est celle de la maquette, « Le mode anonyme y sera activé pour toi. », et non celle du plan. | Seul |

## Une liste sans personne (lot 27 bis)

| Maquette | Ce que fait le code | Décidé par |
|---|---|---|
| `ListeSansPersonne` | **La maquette montre une liste partagée avec le bloc « Ajouter quelqu'un » : dans le code, le bloc disparaît dès que la liste est partagée** (sa forme ne change plus). Il revient si le partage est arrêté. À redessiner sur un brouillon, ou sans le bloc. | Plan (section 6, « Lots 24 bis et 27 bis », point 9) |
| `ListeSansPersonne` | **Un état que la maquette ne montre pas** : toucher « Une personne » ne mène pas à la saisie d'un prénom, il déplie sur place les pastilles habituelles (mes proches, puis « Quelqu'un d'autre »), avec la phrase « La liste sera alors rangée par personne… » toujours dessous. | Seul |
| `ListeNouvelle` | Sous les pastilles, une seule phrase : « Pour un mariage ou une crémaillère, « Une liste sans personne » : les idées, l'une sous l'autre. » La première phrase de la maquette (« Touche un prénom : il s'ajoute à la liste… ») n'y est pas. | Julien, 19 novembre 2026 (retirée), puis seul |
| `ListeSansPersonneVisiteur` | À côté de la date, pas de « · la liste de Camille et Hugo » ; la phrase dessous reste « La liste de Camille. Tu offres 1 cadeau : personne d'autre que Camille ne sait que c'est toi. » | Seul |
| `ListeNouvelleReprendre` | Une liste sans personne s'y lit « Sans personne · 3 idées pas encore offertes », au lieu de « 1 personne · … ». | Seul |

## Les retouches de la liste (Correction 28, première version)

Le plan rouvre cette correction (lien en ligne sous le texte, tout en pastilles pour le visiteur, plus de « Changer », nouvelles tailles) : les lignes ci-dessous disent l'état du code **avant** cette reprise.

| Maquette | Ce que fait le code | Décidé par |
|---|---|---|
| `ListeTeneur`, `ListeDecocher` | Au bout de la rangée de pastilles d'un cadeau à plusieurs, celui qui tient la liste garde « Se joindre » (lien souligné) ou « Tu participes » (texte vert). Les maquettes ne les montrent pas. | Seul |
| `ListeTeneur` | Un cadeau à plusieurs fermé garde dessous « Offert à plusieurs · au complet ». | Seul |
| `ListeTeneur`, `ListeVisiteur` | Le lien d'une idée est encore la pastille lilas avec le nom du site (deuxième version, refusée depuis). Pendant qu'on écrit l'idée, la ligne garde « : lien » au bout. | Plan, puis à reprendre |
| `ListeAidePartage` | « Activé par Camille » nomme celui qui gère la liste, le premier s'ils sont plusieurs : la base ne retient pas qui a activé le partage. | Seul |
| `ListeAidePartage` | Sur un ordinateur (pas de feuille de partage), le bouton « Partager » copie le lien et dit « Copié » un instant. | Seul |

## En direct (lot 26)

| Maquette | Ce que fait le code | Décidé par |
|---|---|---|
| `ListeLiveTeneur` | On voit l'autre écrire **lettre par lettre**, avec son curseur fin et clignotant à sa couleur, à sa place dans le texte. | Julien, 20 novembre 2026 |
| `ListeLiveTeneur` | Une idée **nouvelle** en cours d'écriture apparaît chez les autres juste au-dessus de « Une autre idée… », teintée, avec « Hugo écrit… ». | Julien, 20 novembre 2026 |
| `ListeLiveTeneur` | Le verrou vaut aussi pour **le nom de la liste, le mot d'accueil et un prénom** écrit sur place, pas seulement pour une idée. | Julien, 20 novembre 2026 |
| `ListeLiveTeneur` | Une ligne verrouillée **n'offre plus aucune action** : ni case active, ni pastille de prénom, ni « Se joindre », ni « Changer ». | Julien, 20 novembre 2026 |
| `ListeLiveTeneur`, `ListeVueReliee` | Une personne reliée qui écrit ses idées par le lien verrouille sa ligne chez ceux qui tiennent la liste (« Papi écrit… »), et voit verrouillée une ligne de sa partie que l'un d'eux écrit. Elle n'apprend rien d'autre (ni qui est là, ni combien). | Julien, 20 novembre 2026, puis seul pour ce qu'elle n'apprend pas |
| `ListeLiveVisiteur` | Un visiteur ne voit jamais qui écrit ni qui est là : seulement la liste qui change. | README |
