# Ce qui est lié à un Secret Santa, c'est moi dans une liste

22 novembre 2026 · décidé par Julien, après avoir essayé les listes de la V3.

## Contexte

Depuis son Secret Santa, chacun écrit une liste pour celui qui l'a tiré. Chaque fois, c'était une liste neuve, vide, où il fallait encore s'ajouter soi-même ; et rien, sur la liste, ne disait qu'elle servait à un Secret Santa. Julien : « c'est peut-être pas la liste qui est liée au Secret Santa, c'est une personne dans une liste ».

## Décision

- **Ce qui est lié à un Secret Santa, c'est moi, dans une liste que je tiens.** Le droit d'ouvrir la liste ne change pas : « Celui qui m'a tiré » reste un stade du partage, et il ouvre la liste entière.
- **Une liste créée depuis mon Secret Santa m'a déjà dedans, en premier.**
- **Si je tiens déjà une liste de cette année où je figure, on me la propose** au lieu d'en créer une : « Quelle liste pour ton Secret Santa ? », mes listes, puis « Une nouvelle liste ».
- **Sous mon prénom, dans la liste, le Secret Santa** : « Secret Santa · Famille Camille ». Seuls ceux qui tiennent la liste le voient.
- **Celui qui m'a tiré ouvre la liste filtrée sur moi** : moi seul, et deux choix en haut, mon prénom et « Toute la liste ». « Toute la liste » montre les autres, moi en premier.

## Écarté

- Ne donner à celui qui m'a tiré que ma partie de la liste, sans pouvoir voir le reste : un droit d'accès à une partie d'une liste, compliqué à tenir et à expliquer (Julien). Le filtre suffit : il cache le reste sans l'interdire.
- Ajouter quelqu'un d'office à une liste où il ne figure pas : on ne propose que les listes où je suis déjà.
- Écrire sur la liste « tu as tiré Inès » : le résultat reste sur la page du Secret Santa.

## Où ça s'applique

`docs/spec/v3/listes.md` (« Depuis mon Secret Santa »), `docs/spec/v3/secret-santa.md` (« Le résultat », « Du résultat à la liste »). Maquettes : `V3TirageQuelleListe`, `V3ListeSecretNouvelle`, `V3ListeSecret`, `V3ListeSurligne`, `V3ListeSurligneTout`. Ticket 136.

## Le 23 novembre 2026 : lier, délier, et le nom

- Le lien se voit et se défait : la pastille sous mon prénom ouvre un panneau, avec « Délier » ; une liste où je figure propose « Lier à mon Secret Santa ». Un Secret Santa n'a qu'une liste.
- La liste créée depuis un Secret Santa s'appelle « Idées pour le Secret Santa ».

Le détail : `docs/spec/v3/listes.md`, « Depuis mon Secret Santa » et « Lier et délier ».
