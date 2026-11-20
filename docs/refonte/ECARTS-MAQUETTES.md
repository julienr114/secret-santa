# Écarts entre le code et les maquettes

Pour qui tient les maquettes à jour (`docs/refonte/maquettes/` et `docs/refonte/maquettes-sorbet/`). Chaque ligne dit ce que le code fait **autrement que la maquette**, ou un état que la maquette ne montre pas, avec qui l'a décidé et quand. Le README reste l'autorité ; ce fichier sert seulement à retrouver vite quoi redessiner.

Règle : une ligne s'ajoute ici dès qu'un écran codé s'écarte d'une maquette. Elle s'enlève quand la maquette est remise d'accord (ou quand le code revient à la maquette).

« Julien » : décidé par Julien. « Seul » : tranché par Claude Code en codant, à valider ; le détail est en section 6 du `PLAN.md`, sous le nom du lot.

## L'accueil, la barre du bas et « Créer » (V3, ticket 103)

| Maquette | Ce que fait le code | Décidé par |
|---|---|---|
| `MenuAvatarOuvert` | Le menu n'a pas de ligne « Quoi de neuf » (c'est un onglet ; la spec ne la met pas dans le menu). « Langue » ouvre un panneau du bas avec les trois langues : un menu à côté du menu ne tient pas sur un téléphone. | Seul |
| `V3AccueilPlusOuvert` | Jusqu'aux tickets 105 et 106, « Un Secret Santa » et « Une liste » ouvrent la création d'une fête, puis l'écran d'aujourd'hui (création d'une édition, nouvelle liste). | Julien, 20 novembre 2026 |
| `V3Accueil` | « Quoi de neuf » ouvre une page vide jusqu'au ticket 120, sans pastille de nombre. | Julien, 20 novembre 2026 |

## La fête (V3, ticket 104)

| Maquette | Ce que fait le code | Décidé par |
|---|---|---|
| `V3Fete`, `V3FeteOrganisateur`, `V3FeteAnniversaire` | Les lignes (Secret Santa, listes) n'ont que leur titre : aucun sous-titre d'état tant que leurs textes ne sont pas écrits (question à la conception). | Julien, 20 novembre 2026 |
| `V3Fete`, `V3FeteOrganisateur`, `V3FeteAnniversaire` | Pas de section « Les années passées » avant le ticket 108. | Julien, 20 novembre 2026 |
| `V3FeteAnniversaire` | Pas de « · ses 4 ans » après la date : la fête ne sait pas pour quel proche elle est. | Seul |
| `V3Fete` | Pour un simple membre, la ligne des membres n'ouvre rien (la page des membres est à l'organisateur). | Seul |
| `V3FeteOrganisateur` | « Un autre Secret Santa » (ou « Organiser un Secret Santa ») n'apparaît que si aucun Secret Santa de la fête n'est en cours, et mène à la création d'édition d'aujourd'hui : plusieurs à la fois viennent avec le ticket 105. Le titre de section est au pluriel pour l'organisateur ou dès deux Secret Santa. | Seul |
| `V3Fete` | Une ligne de liste s'ouvre sur la page d'aujourd'hui : la mienne dans son document, celle d'un autre par son lien public ; sans lien public, elle ne s'ouvre pas (règles du ticket 106). | Seul |
| `V3FeteQuitter` | « Elle reste chez Mamie » n'est pas écrit (« chez » ou « dans » : question à la conception). « Tu ne participeras plus à son Secret Santa l'an prochain » ne s'écrit que si la fête a un Secret Santa. Un organisateur ne peut pas quitter la fête. | Seul |
| `V3FeteNouvelle` | Le nom est proposé pour Noël (« Noël ») et pour un anniversaire (« L'anniversaire de Zoé », « Mon anniversaire » pour soi) ; vide pour les autres catégories. La date est remplie pour Noël et pour l'anniversaire d'un proche dont on connaît la date de naissance. | Seul |
| `V3FeteMembresReprendre` | Les pastilles des fêtes se cochent : cocher une fête montre et coche ses membres. Le nombre du bouton me compte. « Inviter d'autres personnes » crée la fête et ouvre « Inviter par lien ». Seules les fêtes que j'organise sont proposées. | Seul |
| `V3FeteNouvelle`, `V3FeteMembresReprendre` | Après « Créer la fête », on arrive sur l'écran d'aujourd'hui de ce qu'on venait créer (création d'une édition, nouvelle liste), sinon sur la fête. | Julien, 20 novembre 2026 |
| `V3FeteReglages` | La catégorie et la date se changent dans un panneau du bas (comme les autres réglages), pas sur une page. « Réglages du Secret Santa » mène, jusqu'au ticket 105, aux réglages du tirage qui sont encore ceux du groupe (éviter la même personne, pistes, mot ajouté aux messages, emails du tirage). | Seul |
| `V3FeteInviter` | « Désactiver le lien » garde sa ligne d'aide (« Plus personne ne pourra s'inscrire »). | Seul |
| `V3FeteRejoindre` | Les états qui suivent (inscrit, lien fermé) gardent leurs écrans d'aujourd'hui, avec « fête » au lieu de « groupe ». | Seul |

## Les dernières retouches de la liste (Correction 30)

| Maquette | Ce que fait le code | Décidé par |
|---|---|---|
| `ListeDecocherCase` | Un cadeau à plusieurs **encore ouvert** garde sa case « + » : la case grise ne décoche qu'une coche seule ou un groupe au complet. | Seul (comme la maquette, mais à confirmer) |
| `ListeDecocherCase` | Le message d'un groupe nomme tout le monde : « Coche de Mamie et Hugo retirée ». | Seul |
| `ListeGroupeFil`, `ListeGroupeFilDeplie` | La phrase « Il commence à lire tout seul. » n'existe pas (aucun champ ne la porte). « Côté cadeaux, il préfère … » se lit « Côté cadeaux, Léo préfère … plutôt que … » (les phrases déjà écrites pour celui qui offre), puis « Léo aime la surprise. » | Seul |
| `ListeGroupeFil` | Dans le document de celui qui tient la liste, 64 px entre deux personnes (Correction 29), pas 44. | Seul |
| `ListeGroupeFil` | Le crayon sur l'icône de 40 px (document) fait 20 px. La case de l'idée qu'un autre écrit n'est plus pâlie, pour couvrir le fil. | Seul |
| `ListeReserverSimple` | Dans le document de celui qui tient la liste, deux choix seulement (pas « en anonyme »), et « Je l'offre seul » dit « Les autres voient seulement que c'est pris. » | Seul |
| `ListeRejoindre` | **Un état que la maquette ne montre pas** : en mode anonyme, le panneau « Se joindre » dit « Mode anonyme activé : te joindre montrerait ton prénom. Désactive-le en haut de la liste pour participer. », en aubergine avec le masque, et « Je participe » est grisé. | Seul |
| `ListeCocheGuide` | La note s'accroche sous la ligne cochée, à 32 px du bord. Elle vient aussi dans le document de celui qui tient la liste, une fois par appareil en tout. | Seul |
| `ListeJOffreAgir` | Le filet de « Tu l'offres en anonyme › » est un aubergine clair (`#a5809c`). | Seul |

## Le mode anonyme (lot 27 ter)

| Maquette | Ce que fait le code | Décidé par |
|---|---|---|
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

## Les retouches de la liste (Corrections 28 et 29)

| Maquette | Ce que fait le code | Décidé par |
|---|---|---|
| `ListeVisiteurToucher`, `ListeTeneur` | **La case verte d'une idée que je donne décoche tout de suite, sans panneau**, par le lien comme dans le document, seul ou à plusieurs. Par le lien, le reste de la ligne ouvre le panneau ; dans le document, c'est la pastille de mon état (« Tu l'offres », « Tu participes »), puisque toucher le texte l'écrit. | Julien, 20 novembre 2026 (la case), seul (la pastille, et le cas à plusieurs) |
| `ListeTeneur` | Dans le document, mon état sous une idée est la même pastille que par le lien (« Tu l'offres », « Tu participes »). | Seul |
| `ListeIdee`, `ListeIdeeLienFait` | L'adresse se lit sans « https:// ». Le champ du lien n'est pas atteint par la touche Tab (elle va d'une ligne à l'autre). Une adresse fausse est marquée en rouge (filet, icône, texte). | Seul |
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
