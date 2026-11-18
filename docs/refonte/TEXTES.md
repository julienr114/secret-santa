# Relecture des textes — ton et clarté

Demandée par Julien le 18 novembre 2026 : vérifier que chaque texte est compréhensible et utile, et donner à l'application un ton plus détendu et souriant, sans en faire trop. « C'est une fête, après tout. »

Ce document ne liste que les textes qui changent. Une clé absente reste telle quelle. Il s'applique au français ; l'anglais et l'allemand suivent le même esprit, sans traduire mot à mot.

**État** : le français (sections 3 à 12) est entièrement validé par Julien le 18 novembre 2026, avec « mon enveloppe » côté participant et « Enveloppe ouverte » sur le suivi. L'anglais et l'allemand sont en section 14 : mêmes clés, même voix. Une clé citée ici peut avoir bougé depuis la lecture des fichiers (18 novembre, 10 h 40) : appliquer là où le texte existe encore.

## 1. La voix

Celle d'un proche qui organise avec le sourire : complice, jamais animateur.

| Règle | Exemple |
|---|---|
| Une question complice plutôt qu'un constat | « Un trou de mémoire ? » |
| Un objet qui prend vie, discrètement | « Ton enveloppe prend la poussière. » |
| Un mot humain, puis l'action à faire, nette | « Aïe, quelque chose a coincé. Réessaie dans un instant. » |
| Jamais de chute plaquée : si on retire le sourire, la phrase reste complète et utile | pas de « …pour éviter les chaussettes » |
| Pas d'argot, pas de parenthèse qui fait de l'œil, pas de jeu de mots intraduisible | pas de « c'est plié », pas de « (on ne touche pas) » |
| La clarté passe avant : un pronom a toujours son nom juste avant | « Ton enveloppe se referme », pas « Elle se referme » |
| Aucun sourire dans ce qui bloque, prévient ou ne se rattrape pas | secret, suppression, dévoilement, annulation |

## 2. Les mots

| On dit | On ne dit plus, côté participant | Pourquoi |
|---|---|---|
| mon enveloppe | mon résultat | C'est l'image de la page ; « résultat » sonne examen |
| c'est terminé pour cette année | cette édition est clôturée | « Édition » et « clôturée » sont des mots d'organisateur |
| pronostic | pari | Décidé le 17 novembre |
| une surprise (avant la fête) | le palmarès, les prix | Décidé le 18 novembre : les prix restent une surprise |
| ton organisateur te fera signe | te préviendra | Plus chaleureux, aussi clair |

Côté organisateur, « édition », « clôturer » et « résultats » restent : ce sont ses outils.

## 3. `participant.ts`

| Clé | Aujourd'hui | Proposé |
|---|---|---|
| `home.waiting.title` | Le tirage n'a pas encore eu lieu | Encore un peu de patience |
| `home.waiting.body` | Ton organisateur te préviendra. Garde ce lien : c'est ici que tu découvriras à qui tu offres un cadeau. | Le tirage n'est pas encore fait. Ton organisateur te fera signe ; garde ce lien, c'est ici que tout se jouera. |
| `home.waiting.hint` | En attendant, aide la personne qui te tirera au sort. | En attendant, donne un coup de pouce à la personne qui te tirera au sort. |
| `home.ready.body` | Le tirage est fait. Assure-toi que personne ne regarde ton écran avant de l'ouvrir. | Le tirage est fait. Vérifie que personne ne regarde par-dessus ton épaule, puis ouvre-la. |
| `home.ready.bodyHints` | Le tirage est fait, et des pistes de cadeaux t'attendent à l'intérieur. Assure-toi que personne ne regarde ton écran avant de l'ouvrir. | Le tirage est fait, et des pistes de cadeaux t'attendent à l'intérieur. Vérifie que personne ne regarde par-dessus ton épaule, puis ouvre-la. |
| `home.ready.hint` | Ton résultat se referme dès que tu quittes la page. | Ton enveloppe se referme toute seule dès que tu quittes la page. |
| `home.shown.hide` | Cacher mon résultat | Refermer mon enveloppe |
| `home.shown.hint` | Il se referme tout seul quand tu quittes la page. | Sinon, ton enveloppe se referme toute seule quand tu quittes la page. |
| `home.seen.title` | Tu sais déjà à qui tu offres | Un trou de mémoire ? |
| `home.seen.body` | Un trou de mémoire ? Assure-toi que personne ne regarde ton écran. | Ton enveloppe est toujours là. Vérifie que personne ne regarde par-dessus ton épaule. |
| `home.seen.bodyHints` | Ses pistes de cadeaux t'attendent à l'intérieur. Assure-toi que personne ne regarde ton écran. | Ton enveloppe est toujours là, avec ses pistes de cadeaux. Vérifie que personne ne regarde par-dessus ton épaule. |
| `home.seen.newBody` | La personne à qui tu offres en a laissé depuis ta dernière visite. Assure-toi que personne ne regarde ton écran. | La personne à qui tu offres en a laissé depuis ta dernière visite. Vérifie que personne ne regarde par-dessus ton épaule. |
| `home.seen.revealWithHints` | Revoir mon résultat et ses pistes | Revoir à qui j'offre, et ses pistes |
| `home.seen.noHintsYet` | Pas encore de pistes. Tu pourras lui en demander. | Aucune piste pour l'instant. Tu pourras lui en demander, sans te trahir. |
| `home.closed.body` | Cette édition est clôturée. Tu peux encore revoir à qui tu as offert un cadeau. | C'est terminé pour cette année. Tu peux encore revoir à qui tu as offert un cadeau. |
| `home.closed.bodyNotSeen` | Cette édition est clôturée. Tu peux encore découvrir à qui tu offrais un cadeau. | C'est terminé pour cette année. Tu peux encore découvrir à qui tu offrais un cadeau. |
| `revealed.closedBody` | Cette édition est clôturée. Rendez-vous l'an prochain ! | C'est terminé pour cette année. À l'an prochain ? |
| `journal.empty` | Rien à signaler pour l'instant. | Calme plat. C'est bon signe. |
| `answer.card.body` | Le tirage a été fait hors de l'application. Dis-le ici pour voir ses pistes de cadeaux. Assure-toi que personne ne regarde ton écran. | Le tirage a été fait hors de l'application. Dis ici à qui tu offres, pour voir ses pistes de cadeaux. Vérifie que personne ne regarde par-dessus ton épaule. |
| `answer.card.savedTitle` | Réponse enregistrée | C'est noté |
| `answer.saved` | Réponse enregistrée | C'est noté |
| `game.atPartyBody` | Les résultats et le palmarès arrivent quand ton organisateur dévoile le tirage. | Les réponses arrivent quand ton organisateur dévoile le tirage. Avec une surprise. |
| `game.story.noGuessBody` | Tu n'avais pas fait de pronostic. | Tu n'avais pas fait de pronostic. L'an prochain ? |

Laissés tels quels parce qu'ils sont déjà dans le ton : « Ton enveloppe t'attend », « Oups, ce lien ne marche plus », « Garde tes tirages au même endroit », et tous les textes du palmarès (« Du grand art », « Il y a eu des messes basses », « Le hasard aurait fait aussi bien »).

`answer.card.body` corrige aussi un problème de clarté : « Dis-le ici » ne disait pas quoi dire.

## 4. `messages.ts` (les messages envoyés)

| Clé | Aujourd'hui | Proposé |
|---|---|---|
| `invitation.body` | Tu participes au Secret Santa de {groupName} ({editionLabel}). | Tu es de la partie : le Secret Santa de {groupName} ({editionLabel}). |
| `drawn.greeting` | {firstName}, le tirage est fait ! 🎁 | {firstName}, les jeux sont faits ! 🎁 |
| `drawn.subject` | {firstName}, le tirage du Secret Santa est fait | {firstName}, les jeux sont faits : ton enveloppe t'attend |
| `reminder.greeting` | Petit rappel {firstName} : ton lien t'attend, pense à l'ouvrir. | {firstName}, ton enveloppe prend la poussière. Ouvre-la vite ! |
| `reminder.subject` | {firstName}, ton lien du Secret Santa t'attend | {firstName}, ton enveloppe t'attend toujours |
| `redraw.greeting` | {firstName}, un nouveau tirage a eu lieu : ton ancien résultat n'est plus valable. | {firstName}, on rebat les cartes. Un nouveau tirage a eu lieu : oublie l'ancien. |
| `redraw.subject` | {firstName}, nouveau tirage du Secret Santa | {firstName}, on rebat les cartes : nouveau tirage |
| `answerCheck.body` | Deux réponses du Secret Santa de {groupName} ne vont pas ensemble. | Il y a un nœud dans le Secret Santa de {groupName} : deux réponses ne vont pas ensemble. |
| `email.personal` | Ce lien est personnel, ne le transfère pas. | Ce lien n'est qu'à toi : ne le transfère pas. |

Laissés tels quels : « on n'attend plus que toi ! », « Réponse à la fête ! ».

## 5. `errors.ts`

Une erreur dit ce qui s'est passé et quoi faire. Le sourire, quand il y en a un, tient en un mot.

| Clé | Aujourd'hui | Proposé |
|---|---|---|
| `unknown` | Une erreur est survenue. | Aïe, quelque chose a coincé. Réessaie dans un instant. |
| `other` | Erreur : {reason} | Quelque chose a coincé ({reason}). |
| `validation` | Vérifie les champs du formulaire. | Il manque quelque chose : vérifie les champs. |
| `too_many_attempts` | Trop de tentatives, réessaie dans quelques minutes. | Doucement. Réessaie dans quelques minutes. |
| `invalid_rules` | Règles invalides. | Ces règles ne tiennent pas ensemble. Vérifie-les. |
| `invalid_transition` | Cette action n'est pas possible à ce stade de l'édition. | Trop tôt, ou trop tard : cette action ne se fait pas à cette étape. |
| `too_few_participants` | Il faut au moins trois participants. | Il faut être au moins trois : à deux, le secret ne tient pas. |
| `participants_locked` | La liste est verrouillée après le tirage. | Le tirage est fait : la liste ne bouge plus. |
| `result_not_found` | Ton résultat est introuvable, préviens ton organisateur qu'il y a un souci. | Ton enveloppe est introuvable. Préviens ton organisateur : il y a un souci. |
| `result_not_seen` | Découvre d'abord à qui tu offres un cadeau. | Ouvre d'abord ton enveloppe. |
| `group_request_pending` | Tu as déjà une demande en attente. | Tu as déjà une demande en attente. On te répond bientôt. |
| `game_needs_four` | Le jeu demande au moins quatre participants. | Le jeu se joue à quatre au moins : à trois, il n'y a rien à deviner. |
| `group_not_found`, `person_not_found`, `exclusion_not_found`, `edition_not_found`, `participation_not_found`, `organizer_not_found`, `account_not_found`, `request_not_found`, `session_not_found` | … introuvable. | Même phrase, suivie de : « Recharge la page : la liste a peut-être changé. » |

Laissées telles quelles, parce qu'elles disent déjà quoi faire : `no_solution`, `email_failed`, `login_link_invalid`, `link_invalid`, `wrong_sentence`, `cannot_remove_self`, `invite_full`.

## 6. `common.ts` et `notify.ts`

| Clé | Aujourd'hui | Proposé |
|---|---|---|
| `common.status.drawn` | Tirée | Tirage fait |
| `notify.allViewed.subject` | Tout le monde a découvert son tirage dans « {group} » | Toutes les enveloppes sont ouvertes dans « {group} » |
| `notify.allViewed.body` | Pour {edition} dans « {group} », chaque participant sait maintenant à qui il offre. | Pour {edition} dans « {group} », chacun sait maintenant à qui il offre. Il ne reste plus qu'à trouver les cadeaux. |
| `notify.reminder.subject` | L'échange approche dans « {group} » | La fête approche dans « {group} » |
| `notify.reminder.body` | L'échange de {edition} a lieu le {date}. | La fête de {edition} a lieu le {date}. |
| `notify.reminder.missing` | {count} personne(s) n'a pas encore découvert son tirage : {names}. | {count} personne(s) n'a pas encore ouvert son enveloppe : {names}. |

« Échange » et « fête » désignaient la même chose : on garde « fête » partout.

## 7. `journal.ts`

Le journal est lu par tout le groupe : il parle comme le côté participant. Les explications des alertes (accès de dernier recours, dévoilement, annulation) restent neutres : c'est du sérieux.

| Clé | Aujourd'hui | Proposé |
|---|---|---|
| `events.participant_added` | {name} rejoint l'édition | {name} est de la partie |
| `own.participant_added` | Tu rejoins l'édition | Tu es de la partie |
| `grouped.participant_added` | {strong} rejoignent l'édition | {strong} sont de la partie |
| `events.participant_removed` | {name} quitte l'édition | {name} ne participe plus |
| `own.participant_removed` | Tu quittes l'édition | Tu ne participes plus |
| `events.draw_done` | Le tirage a été effectué pour {count} participant(s) | Le tirage est fait, pour {count} participant(s) |
| `events.result_viewed` | {name} a découvert son résultat | {name} a ouvert son enveloppe |
| `own.result_viewed` | Tu as découvert ton résultat | Tu as ouvert ton enveloppe |
| `grouped.result_viewed` | {strong} ont découvert leur résultat | {strong} ont ouvert leur enveloppe |
| `screen.meNote` | Tout ce qui touche ton lien et ton résultat. … | Tout ce qui touche ton lien et ton enveloppe. … |
| `alert.result_revealed.forOthers` | Rien : ton résultat et ta liste n'ont pas été vus. | Rien : ton enveloppe et tes pistes n'ont pas été vues. |
| `alert.results_revealed.happened` | L'organisateur a vu qui offre à qui, avant la fête. | L'organisateur a dévoilé qui offre à qui, avant la fête. |

Deux corrections de fond, pas de ton : « ta liste » datait des listes de souhaits, et depuis la Correction 13 le dévoilement montre le tirage à tout le groupe, pas au seul organisateur.

Laissé tel quel : « À garder le tirage honnête. Tricher reste possible, mais ça se voit. » C'est exactement la voix cherchée.

## 8. `hints.ts`

| Clé | Aujourd'hui | Proposé |
|---|---|---|
| `intro` | Aide la personne qui t'offre un cadeau. Tout est facultatif. | Donne un coup de pouce à la personne qui t'offre un cadeau. Tout est facultatif. |
| `readOnly` | Tes pistes ne sont plus modifiables pour cette édition. | Tes pistes ne bougent plus : c'est terminé pour cette année. |
| `ideas.title` | Une idée précise, si tu sèches | Une idée précise, au cas où |
| `request.onceHelp` | Pas de relance possible : personne n'est harcelé. | Pas de relance possible : on ne harcèle personne. |

`ideas.title` est un problème de clarté : sur ma propre page, « si tu sèches » ne dit pas qui sèche. Le libellé du côté de celui qui offre (`ideas.giver`, « Si tu sèches ») reste.

Laissés tels quels : « cherche l'inspiration », « Tu réponds d'un doigt, sans rien écrire », « Chacun se débrouille », « On ne te dira pas qui demande : c'est un Secret Santa. »

## 9. `auth.ts` (connexion, accueil, invitation)

| Clé | Aujourd'hui | Proposé |
|---|---|---|
| `login.emailInvalid` | Adresse email invalide | Cette adresse a l'air incomplète |
| `home.action.discover.title` | Le tirage est fait ! | Les jeux sont faits ! |
| `home.action.discover.body` | Ton enveloppe t'attend. Assure-toi que personne ne regarde ton écran. | Ton enveloppe t'attend. Vérifie que personne ne regarde par-dessus ton épaule. |
| `home.action.palmares.body`, `home.drawCard.palmaresBody` | Qui offrait à qui, et qui avait deviné ? Assure-toi d'avoir ouvert ton cadeau avant. | Qui offrait à qui, et qui avait deviné ? Ouvre ton cadeau d'abord. |
| `home.drawCard.seeAgain` | Tu sais déjà à qui tu offres | Un trou de mémoire ? |
| `home.drawCard.answerGiven` | Réponse enregistrée | C'est noté |
| `home.step.discover.state` | Le tirage a eu lieu | Ton enveloppe t'attend |
| `home.step.seeAgain.state` | Tu sais à qui tu offres | Enveloppe ouverte |
| `home.step.answerGiven.state` | Réponse enregistrée | C'est noté |
| `home.step.closed.state` | Échange passé | Fête passée |
| `invite.party` | échange le {date} | fête le {date} |
| `invite.notDrawnYet` | Le tirage n'a pas encore eu lieu : ton organisateur te préviendra. | Le tirage n'est pas encore fait : ton organisateur te fera signe. |
| `invite.nextDraw` | Tu fais partie du groupe. Ton organisateur te préviendra du prochain tirage. | Tu fais partie du groupe. Ton organisateur te fera signe pour le prochain tirage. |

Laissés tels quels : « Regarde ta boîte mail », « Rien reçu ? Regarde dans les indésirables. », « Dis-nous comment tu t'appelles », « Ta demande est partie », « ça prend dix secondes ».

## 10. `adminGroup.ts` (organisateur : le groupe)

Côté organisateur, la passe est plus légère : ce sont des outils, la clarté prime. Quelques sourires dans les confirmations, aucun dans ce qui supprime.

| Clé | Aujourd'hui | Proposé |
|---|---|---|
| `dashboard.viewedOf` | {count} sur {total} a consulté son résultat | {count} sur {total} a ouvert son enveloppe |
| `dashboard.viewedLabel` | Résultats consultés | Enveloppes ouvertes |
| `newPerson.added` | {name} ajouté·e | Bienvenue à {name} |
| `exclusions.empty` | Aucune exclusion. | Aucune exclusion. Tout le monde peut tirer tout le monde. |
| `rules.notifyAllViewed` | Tout le monde a découvert son tirage | Toutes les enveloppes sont ouvertes |

`newPerson.added` évite aussi le point médian.

## 11. `adminEdition.ts` (organisateur : l'édition)

| Clé | Aujourd'hui | Proposé |
|---|---|---|
| `cockpit.drawDone` | Tirage effectué | Les jeux sont faits |
| `cancelDraw.dangerTitle` | Tout le monde devra redécouvrir | Tout le monde recevra un nouveau résultat |
| `screen.lists.series.notOpened`, `screen.follow.state.notOpened` | Envoyé, pas encore consulté | Envoyé, pas encore ouvert |
| `screen.lists.series.viewed` | Résultat consulté | Enveloppe ouverte |
| `screen.follow.state.viewed` | Résultat consulté · {count}× | Enveloppe ouverte · {count}× |
| `screen.sheet.sentOn` | Envoyé le {date}, pas encore consulté | Envoyé le {date}, pas encore ouvert |
| `screen.follow.titleDone` | Chacun a reçu son lien | Tout le monde est prévenu |
| `screen.follow.noResults` | Personne, organisateur compris, ne voit les résultats ici. | Personne ne voit les résultats ici. Pas même toi. |
| `answers.secret` | Personne, organisateur compris, ne voit qui offre à qui. | Personne ne voit qui offre à qui. Pas même toi. |
| `screen.follow.cancelHint` | Désistement, oubli… journalisé | Désistement, oubli… inscrit au journal |
| `answers.abandonHint` | Les réponses sont effacées · journalisé | Les réponses sont effacées · inscrit au journal |
| `trouble.cancelHint` | Désistement, erreur… tout le monde retire | Désistement, erreur… tout le monde tire à nouveau |
| `screen.reveal.viewed` | {count} sur {total} ont consulté leur résultat | {count} sur {total} ont ouvert leur enveloppe |
| `screen.reveal.viewedLabel` | Résultats consultés | Enveloppes ouvertes |
| `screen.reveal.notViewedOne` | {name} n'a pas consulté son résultat | {name} n'a pas ouvert son enveloppe |
| `screen.reveal.notViewedMany` | {count} personnes n'ont pas consulté leur résultat | {count} personnes n'ont pas ouvert leur enveloppe |
| `screen.reveal.allViewed` | Chacun a consulté son résultat | Toutes les enveloppes sont ouvertes |
| `answers.card.oneMissingBody` | … il ne reste qu'une personne que nul n'a nommée. | … il ne reste qu'une personne que personne n'a nommée. |

Trois corrections de clarté : « journalisé » est du jargon, « tout le monde retire » ne se comprenait pas, et « Tout le monde devra redécouvrir » n'avait pas de complément.

Laissés tels quels, volontairement : tous les avertissements de « Voir un seul résultat », « Dévoiler avant la fête », « Annuler le tirage » et « Supprimer le groupe ». Ils sont nets, et c'est ce qu'on leur demande. « Un dernier coup d'œil avant de tirer au sort » est déjà dans le ton.

## 12. Les mots, complément

| On dit | On ne dit plus | Où |
|---|---|---|
| la fête | l'échange | partout |
| inscrit au journal | journalisé | organisateur |
| ouvrir son enveloppe, enveloppe ouverte | découvrir son tirage, résultat consulté | l'état d'une personne, partout, journal et suivi compris |
| les résultats | (inchangé) | le tirage entier, côté organisateur : « Dévoiler les résultats », « Voir un seul résultat » |
| pas même toi | organisateur compris | organisateur |

## 14. English et Deutsch

Les mêmes clés que les sections 3 à 11, dans la même voix. Ce ne sont pas des traductions mot à mot : « les jeux sont faits » devient « the names are drawn » et « die Lose sind gezogen », « c'est terminé pour cette année » devient « that's a wrap for this year » et « für dieses Jahr ist Schluss ». Une clé absente reste telle quelle dans les deux langues.

### Les mots, dans chaque langue

| Français | English | Deutsch |
|---|---|---|
| mon enveloppe (plus « mon résultat ») | my envelope (not “my result”) | mein Umschlag (nicht „mein Ergebnis“) |
| la fête (plus « l'échange ») | the party (not “the exchange”) | die Feier (nicht „die Bescherung“) |
| l'organisateur | **organizer**, partout : les fichiers mélangent aujourd'hui “organizer” et “organiser” | der Organisator |
| inscrit au journal | written in the journal (not “journaled”, “logged”) | im Journal vermerkt (nicht „protokolliert“) |
| pas même toi | not even you | nicht einmal du |
| pronostic | guess | Tipp |
| Secret Santa | Secret Santa | Wichteln |

« Bescherung » est un joli mot, mais il ne vaut que pour Noël : « Feier » marche pour n'importe quelle fête, comme en français.

### `participant.ts`

| Clé | English | Deutsch |
|---|---|---|
| `home.waiting.title` | Just a little longer | Noch ein wenig Geduld |
| `home.waiting.body` | The draw hasn’t happened yet. Your organizer will give you a shout; keep this link, this is where it all happens. | Die Auslosung steht noch aus. Dein Organisator meldet sich; behalte diesen Link, hier spielt sich alles ab. |
| `home.waiting.hint` | In the meantime, give a hand to whoever draws your name. | Greif in der Zwischenzeit der Person unter die Arme, die dich ziehen wird. |
| `home.ready.body` | The draw is done. Check nobody’s reading over your shoulder, then open it. | Die Auslosung ist erfolgt. Schau kurz, ob dir niemand über die Schulter guckt, und öffne ihn dann. |
| `home.ready.bodyHints` | The draw is done, and gift hints are waiting inside. Check nobody’s reading over your shoulder, then open it. | Die Auslosung ist erfolgt, und drinnen warten Geschenk-Hinweise auf dich. Schau kurz, ob dir niemand über die Schulter guckt, und öffne ihn dann. |
| `home.ready.hint` | Your envelope closes by itself as soon as you leave the page. | Dein Umschlag schließt sich von selbst, sobald du die Seite verlässt. |
| `home.shown.hide` | Close my envelope | Meinen Umschlag schließen |
| `home.shown.hint` | Otherwise, your envelope closes by itself when you leave the page. | Sonst schließt sich dein Umschlag von selbst, wenn du die Seite verlässt. |
| `home.seen.title` | Slipped your mind? | Gedächtnislücke? |
| `home.seen.body` | Your envelope is still here. Check nobody’s reading over your shoulder. | Dein Umschlag ist noch da. Schau kurz, ob dir niemand über die Schulter guckt. |
| `home.seen.bodyHints` | Your envelope is still here, with their gift hints. Check nobody’s reading over your shoulder. | Dein Umschlag ist noch da, samt Geschenk-Hinweisen. Schau kurz, ob dir niemand über die Schulter guckt. |
| `home.seen.newBody` | The person you’re giving to has left some since your last visit. Check nobody’s reading over your shoulder. | Die Person, die du beschenkst, hat seit deinem letzten Besuch welche hinterlassen. Schau kurz, ob dir niemand über die Schulter guckt. |
| `home.seen.revealWithHints` | See who I’m giving to, and their hints | Noch einmal sehen, wen ich beschenke, samt Hinweisen |
| `home.seen.noHintsYet` | No hints yet. You can ask for some, without giving yourself away. | Noch keine Hinweise. Du kannst darum bitten, ohne dich zu verraten. |
| `home.closed.body` | That’s a wrap for this year. You can still see who you gave a gift to. | Für dieses Jahr ist Schluss. Du kannst noch sehen, wen du beschenkt hast. |
| `home.closed.bodyNotSeen` | That’s a wrap for this year. You can still find out who you were giving a gift to. | Für dieses Jahr ist Schluss. Du kannst noch erfahren, wen du beschenken solltest. |
| `revealed.closedBody` | That’s a wrap for this year. Same time next year? | Für dieses Jahr ist Schluss. Bis nächstes Jahr? |
| `journal.empty` | All quiet. That’s a good sign. | Alles ruhig. Ein gutes Zeichen. |
| `answer.card.body` | The draw was made outside the app. Say here who you’re giving to, to see their gift hints. Check nobody’s reading over your shoulder. | Die Auslosung fand außerhalb der App statt. Sag hier, wen du beschenkst, um die Geschenk-Hinweise zu sehen. Schau kurz, ob dir niemand über die Schulter guckt. |
| `answer.card.savedTitle`, `answer.saved` | Got it | Ist notiert |
| `game.atPartyBody` | The answers come when your organizer reveals the draw. With a surprise. | Die Antworten kommen, wenn dein Organisator die Auslosung aufdeckt. Mit einer Überraschung. |
| `game.story.noGuessBody` | You hadn’t made a guess. Next year? | Du hattest keinen Tipp abgegeben. Nächstes Jahr? |

### `messages.ts`

| Clé | English | Deutsch |
|---|---|---|
| `invitation.body` | You’re in: the Secret Santa of {groupName} ({editionLabel}). | Du bist dabei: das Wichteln von {groupName} ({editionLabel}). |
| `drawn.greeting` | {firstName}, the names are drawn! 🎁 | {firstName}, die Lose sind gezogen! 🎁 |
| `drawn.subject` | {firstName}, the names are drawn: your envelope is waiting | {firstName}, die Lose sind gezogen: dein Umschlag wartet |
| `reminder.greeting` | {firstName}, your envelope is gathering dust. Open it soon! | {firstName}, dein Umschlag setzt Staub an. Mach ihn schnell auf! |
| `reminder.subject` | {firstName}, your envelope is still waiting | {firstName}, dein Umschlag wartet immer noch |
| `redraw.greeting` | {firstName}, we’re reshuffling. There’s been a new draw: forget the old one. | {firstName}, die Karten werden neu gemischt. Es gab eine neue Auslosung: vergiss die alte. |
| `redraw.subject` | {firstName}, we’re reshuffling: new draw | {firstName}, die Karten werden neu gemischt: neue Auslosung |
| `answerCheck.body` | There’s a knot in the Secret Santa of {groupName}: two answers don’t fit together. | Beim Wichteln von {groupName} hat sich ein Knoten gebildet: zwei Antworten passen nicht zusammen. |
| `email.personal` | This link is yours alone: don’t forward it. | Dieser Link gehört nur dir: leite ihn nicht weiter. |

### `errors.ts`

| Clé | English | Deutsch |
|---|---|---|
| `unknown` | Ouch, something got stuck. Try again in a moment. | Autsch, da hat etwas gehakt. Versuch es gleich noch einmal. |
| `other` | Something got stuck ({reason}). | Da hat etwas gehakt ({reason}). |
| `validation` | Something’s missing: check the fields. | Da fehlt noch etwas: prüfe die Felder. |
| `too_many_attempts` | Easy now. Try again in a few minutes. | Immer mit der Ruhe. Versuch es in ein paar Minuten noch einmal. |
| `invalid_rules` | These rules don’t fit together. Check them. | Diese Regeln passen nicht zusammen. Prüfe sie. |
| `invalid_transition` | Too early, or too late: this can’t be done at this stage. | Zu früh oder zu spät: das geht in dieser Phase nicht. |
| `too_few_participants` | You need at least three: with two, there’s no secret. | Ihr müsst mindestens zu dritt sein: zu zweit hält kein Geheimnis. |
| `participants_locked` | The draw is done: the list is set. | Die Auslosung ist erfolgt: die Liste steht fest. |
| `result_not_found` | Your envelope can’t be found. Tell your organizer: something’s wrong. | Dein Umschlag ist nicht auffindbar. Sag deinem Organisator Bescheid: da stimmt etwas nicht. |
| `result_not_seen` | Open your envelope first. | Öffne zuerst deinen Umschlag. |
| `group_request_pending` | You already have a request pending. We’ll get back to you soon. | Du hast bereits eine offene Anfrage. Wir melden uns bald. |
| `game_needs_four` | The game needs at least four players: with three, there’s nothing to guess. | Das Spiel braucht mindestens vier: zu dritt gibt es nichts zu erraten. |
| `…_not_found` | Same sentence, followed by: “Reload the page: the list may have changed.” | Derselbe Satz, gefolgt von: „Lade die Seite neu: die Liste hat sich vielleicht geändert.“ |

### `common.ts` et `notify.ts`

| Clé | English | Deutsch |
|---|---|---|
| `common.status.drawn` | Draw done | Ausgelost (inchangé) |
| `notify.allViewed.subject` | Every envelope is open in “{group}” | Alle Umschläge in „{group}“ sind geöffnet |
| `notify.allViewed.body` | For {edition} in “{group}”, everyone now knows who they’re giving to. All that’s left is finding the gifts. | Für {edition} in „{group}“ weiß jetzt jeder, wen er beschenkt. Jetzt fehlen nur noch die Geschenke. |
| `notify.reminder.subject` | The party is near in “{group}” | Die Feier in „{group}“ naht |
| `notify.reminder.body` | The party for {edition} is on {date}. | Die Feier von {edition} ist am {date}. |
| `notify.reminder.missing` | {count} people haven’t opened their envelope yet: {names}. (singulier : “{count} person hasn’t opened their envelope yet”) | {count} Personen haben ihren Umschlag noch nicht geöffnet: {names}. (singulier : „{count} Person hat ihren Umschlag noch nicht geöffnet“) |

### `journal.ts`

| Clé | English | Deutsch |
|---|---|---|
| `events.participant_added` | {name} is in | {name} ist dabei |
| `own.participant_added` | You’re in | Du bist dabei |
| `grouped.participant_added` | {strong} are in | {strong} sind dabei |
| `events.participant_removed` | {name} is no longer taking part | {name} macht nicht mehr mit |
| `own.participant_removed` | You’re no longer taking part | Du machst nicht mehr mit |
| `events.draw_done` | The draw is done, for {count} participant(s) | Die Auslosung ist erfolgt, für {count} Teilnehmer |
| `events.result_viewed` | {name} opened their envelope | {name} hat den eigenen Umschlag geöffnet |
| `own.result_viewed` | You opened your envelope | Du hast deinen Umschlag geöffnet |
| `grouped.result_viewed` | {strong} opened their envelope | {strong} haben ihren Umschlag geöffnet |
| `screen.meNote` | Everything about your link and your envelope. … | Alles, was deinen Link und deinen Umschlag betrifft. … |
| `alert.result_revealed.forOthers` | Nothing: your envelope and your hints were not seen. | Nichts: Dein Umschlag und deine Hinweise wurden nicht gesehen. |
| `alert.results_revealed.happened` | The organizer revealed who gives to whom, before the party. | Der Organisator hat aufgedeckt, wer wen beschenkt, noch vor der Feier. |

### `hints.ts`

| Clé | English | Deutsch |
|---|---|---|
| `intro` | Give a hand to the person giving you a gift. Everything is optional. | Greif der Person unter die Arme, die dich beschenkt. Alles ist freiwillig. |
| `readOnly` | Your hints are set: that’s a wrap for this year. | Deine Hinweise stehen fest: für dieses Jahr ist Schluss. |
| `ideas.title` | A specific idea, just in case | Eine genaue Idee, für alle Fälle |
| `request.onceHelp` | No reminders: we don’t pester anyone. | Keine Erinnerung möglich: wir bedrängen niemanden. |

### `auth.ts`

| Clé | English | Deutsch |
|---|---|---|
| `login.emailInvalid` | This address looks incomplete | Diese Adresse sieht unvollständig aus |
| `home.action.discover.title` | The names are drawn! | Die Lose sind gezogen! |
| `home.action.discover.body` | Your envelope is waiting. Check nobody’s reading over your shoulder. | Dein Umschlag wartet. Schau kurz, ob dir niemand über die Schulter guckt. |
| `home.action.palmares.body`, `home.drawCard.palmaresBody` | Who gave to whom, and who had guessed? Open your gift first. | (inchangé : « Öffne zuerst dein Geschenk. ») |
| `home.drawCard.seeAgain` | Slipped your mind? | Gedächtnislücke? |
| `home.drawCard.answerGiven`, `home.step.answerGiven.state` | Got it | Ist notiert |
| `home.step.discover.state` | Your envelope is waiting | Dein Umschlag wartet |
| `home.step.seeAgain.state` | Envelope opened | Umschlag geöffnet |
| `home.step.closed.state` | Party over | Feier vorbei |
| `invite.party` | party on {date} | Feier am {date} |
| `invite.notDrawnYet` | The draw hasn’t happened yet: your organizer will give you a shout. | Die Auslosung steht noch aus: Dein Organisator meldet sich. |
| `invite.nextDraw` | You’re in the group. Your organizer will give you a shout for the next draw. | Du gehörst zur Gruppe. Dein Organisator meldet sich zur nächsten Auslosung. |

### `adminGroup.ts`

| Clé | English | Deutsch |
|---|---|---|
| `dashboard.viewedOf` | {count} of {total} have opened their envelope | {count} von {total} haben ihren Umschlag geöffnet |
| `dashboard.viewedLabel` | Envelopes opened | Geöffnete Umschläge |
| `newPerson.added` | Welcome, {name} | Willkommen, {name} |
| `exclusions.empty` | No exclusions. Anyone can draw anyone. | Kein Ausschluss. Jeder kann jeden ziehen. |
| `rules.notifyAllViewed` | Every envelope is open | Alle Umschläge sind geöffnet |

### `adminEdition.ts`

| Clé | English | Deutsch |
|---|---|---|
| `cockpit.drawDone` | The names are drawn | Die Lose sind gezogen |
| `cancelDraw.dangerTitle` | Everyone will get a new result | Alle bekommen ein neues Ergebnis |
| `screen.lists.series.notOpened`, `screen.follow.state.notOpened` | Sent, not opened yet | Gesendet, noch nicht geöffnet |
| `screen.lists.series.viewed` | Envelope opened | Umschlag geöffnet |
| `screen.follow.state.viewed` | Envelope opened · {count}× | Umschlag geöffnet · {count}× |
| `screen.sheet.sentOn` | Sent on {date}, not opened yet | Gesendet am {date}, noch nicht geöffnet |
| `screen.follow.titleDone` | Everyone’s been told | Alle wissen Bescheid |
| `screen.follow.noResults` | Nobody sees the results here. Not even you. | Niemand sieht hier die Ergebnisse. Nicht einmal du. |
| `answers.secret` | Nobody sees who gives to whom. Not even you. | Niemand sieht, wer wen beschenkt. Nicht einmal du. |
| `screen.follow.cancelHint` | Dropout, someone forgotten… written in the journal | (inchangé : « im Journal vermerkt ») |
| `answers.abandonHint` | The answers are deleted · written in the journal | Die Antworten werden gelöscht · im Journal vermerkt |
| `trouble.cancelHint` | (inchangé : “everyone draws again”) | (inchangé : « alle losen neu ») |
| `screen.reveal.viewed` | {count} of {total} have opened their envelope | {count} von {total} haben ihren Umschlag geöffnet |
| `screen.reveal.viewedLabel` | Envelopes opened | Geöffnete Umschläge |
| `screen.reveal.notViewedOne` | {name} hasn’t opened their envelope | {name} hat den eigenen Umschlag nicht geöffnet |
| `screen.reveal.notViewedMany` | {count} people haven’t opened their envelope | {count} Personen haben ihren Umschlag nicht geöffnet |
| `screen.reveal.allViewed` | Every envelope is open | Alle Umschläge sind geöffnet |

### Ce que cette section ne couvre pas

Elle reprend, clé par clé, les textes modifiés en français. Les quelque 1 400 autres textes anglais et allemands n'ont pas été relus un par un pour leur clarté. Deux écarts de vocabulaire ont été repérés au passage et sont traités dans le tableau des mots ; une relecture complète de chaque langue reste à faire si on la veut.

## 15. Le contexte dans les messages, et plusieurs organisateurs (Correction 17)

Demandé par Julien le 18 novembre 2026 : « Under the Tree » ne dit rien, et « Devine qui » non plus si on ne l'a pas vu.

| Règle | Exemple |
|---|---|
| L'objet de chaque email nomme le groupe | « Secret Santa de Famille Martin : Léa, les jeux sont faits, ton enveloppe t'attend » |
| La première ligne de chaque message dit que c'est le Secret Santa du groupe, messages à partager compris | « Léa, les jeux sont faits pour le Secret Santa de Famille Martin ! 🎁 » |
| « Devine qui » est présenté chaque fois qu'un message en parle | « Devine qui, le jeu de pronostics du Secret Santa : qui t'offre ton cadeau ? » |
| Un email envoyé par un organisateur est signé de son prénom | « Camille, pour le Secret Santa de Famille Martin » |
| Un email que personne n'envoie (rappel automatique, palmarès), ou un organisateur sans prénom, signe sans nom | « Le Secret Santa de Famille Martin » |
| « Under the Tree » ne signe plus que les emails à l'organisateur | « Under the Tree, l'application de votre Secret Santa » |
| Côté participant, « tes organisateurs » au pluriel dès qu'il y en a plusieurs | « Tes organisateurs te feront signe » |

**Le message « À qui offres-tu un cadeau ? »** (tirage fait ailleurs) présente le principe : le tirage est déjà fait, chacun dit sur sa page à qui il offre, la réponse reste secrète ; on peut déjà laisser ses pistes, et chacun lit celles de sa personne quand tout le monde a répondu. Il donne le budget et la date, et présente « Devine qui » quand le jeu est actif.

Les lignes du journal (« L'organisateur a envoyé… ») décrivent l'action d'une personne : elles restent au singulier en attendant de nommer qui a fait quoi (plus tard, Correction 17, point 4).

