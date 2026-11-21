// The participant's side: personal page, journal.
export default {
  myList: {
    title: 'Ton adresse email, pour écrire ta liste',
    label: 'Ton adresse email',
    submit: 'Valider',
    confirm: 'Tu reçois un lien pour la confirmer.',
    sent: 'Lien envoyé à {email} : ouvre-le pour écrire ta liste. Pense à regarder dans les indésirables.',
  },
  revealed: {
    bannerTitle: 'Le tirage n’est plus secret.',
    bannerBy:
      '{name} l’a dévoilé le {date} : tout le monde peut voir qui offre à qui.',
    bannerOrganizer: {
      one: 'Ton organisateur l’a dévoilé le {date} : tout le monde peut voir qui offre à qui.',
      other:
        'L’un de tes organisateurs l’a dévoilé le {date} : tout le monde peut voir qui offre à qui.',
    },
    bannerMe:
      'Tu l’as dévoilé le {date} : tout le monde peut voir qui offre à qui.',
    journal: 'Voir au journal',
    santaTitle: 'Qui m’offre mon cadeau ?',
    santaTitlePast: 'Qui m’a offert mon cadeau ?',
    santaShow: 'Appuie pour le voir, ou garde la surprise',
    santaShowPast: 'Appuie pour le voir',
    santaHide: 'Appuie pour le cacher',
    santaIs: { before: 'C’est', after: 'qui t’offre ton cadeau.' },
    santaIsPast: { before: 'C’est', after: 'qui t’a offert ton cadeau.' },
    all: 'Voir tout le tirage',
    allHint: 'Qui offre à qui, pour tous les participants',
    allHintPast: 'Qui a offert à qui, pour tous les participants',
    gaveTo: 'Tu as offert un cadeau à',
    afterBody:
      'Le jour J est passé. Le tirage est dévoilé : tout le monde peut voir qui a offert à qui.',
    closedBody: 'C’est terminé pour cette année. À l’an prochain ?',
    pageTitle: 'Qui offre à qui',
    pageBody:
      'Le tirage a été dévoilé le {date}. Tous les participants voient cette liste.',
    listTitle: {
      one: 'Le tirage · {count} participant',
      other: 'Le tirage · {count} participants',
    },
    you: 'toi',
    givesTo: 'offre à {name}',
  },
  home: {
    greeting: 'Salut {firstName} !',
    facts: { budget: 'Budget :', party: 'Jour J' },
    note: {
      title: {
        one: "Le mot de l'organisateur",
        other: 'Le mot des organisateurs',
      },
      more: 'Lire la suite',
    },
    changeAvatar: 'Changer mon icône',
    steps: {
      label: 'Étapes du Secret Santa',
      invitation: 'Invitation',
      drawSoon: 'Tirage · bientôt',
      answer: 'Ta réponse',
      drawRevealed: 'Tirage dévoilé',
      drawDone: 'Tirage fait',
      party: 'Jour J',
      partyIn: {
        one: 'Jour J · dans {count} jour',
        other: 'Jour J · dans {count} jours',
      },
      partyToday: 'Jour J · aujourd’hui',
      partyOver: 'Jour J passé',
    },
    waiting: {
      title: 'Encore un peu de patience',
      body: {
        one: 'Le tirage n’est pas encore fait. Ton organisateur te fera signe ; garde ce lien, c’est ici que tout se jouera.',
        other:
          'Le tirage n’est pas encore fait. Tes organisateurs te feront signe ; garde ce lien, c’est ici que tout se jouera.',
      },
      action: 'Laisser mes idées de cadeaux',
      hint: 'En attendant, donne un coup de pouce à la personne qui te tirera au sort.',
    },
    ready: {
      title: "Ton enveloppe t'attend",
      body: 'Le tirage est fait. Vérifie que personne ne regarde par-dessus ton épaule, puis ouvre-la.',
      bodyHints:
        'Le tirage est fait, et des idées de cadeaux t’attendent à l’intérieur. Vérifie que personne ne regarde par-dessus ton épaule, puis ouvre-la.',
      reveal: "Découvrir à qui j'offre un cadeau",
      revealing: 'Ouverture de l’enveloppe…',
      hint: 'Ton enveloppe se referme toute seule dès que tu quittes la page.',
    },
    shown: {
      hide: 'Refermer mon enveloppe',
      hint: 'Sinon, ton enveloppe se referme toute seule quand tu quittes la page.',
    },
    seen: {
      title: 'Un trou de mémoire ?',
      body: 'Ton enveloppe est toujours là. Vérifie que personne ne regarde par-dessus ton épaule.',
      bodyHints:
        'Ton enveloppe est toujours là, avec ses idées de cadeaux. Vérifie que personne ne regarde par-dessus ton épaule.',
      newTitle: 'De nouvelles idées t’attendent',
      newBody:
        'La personne à qui tu offres en a laissé depuis ta dernière visite. Vérifie que personne ne regarde par-dessus ton épaule.',
      revealWithHints: 'Revoir à qui j’offre, et ses idées',
      noHintsYet:
        'Aucune idée pour l’instant. Tu pourras lui en demander, sans te trahir.',
      revealAgain: "Revoir à qui j'offre un cadeau",
    },
    closed: {
      title: 'Le jour J est passé',
      body: 'C’est terminé pour cette année. Tu peux encore revoir à qui tu as offert un cadeau.',
      bodyNotSeen:
        'C’est terminé pour cette année. Tu peux encore découvrir à qui tu offrais un cadeau.',
    },
    tiles: {
      list: {
        none: 'Pas encore écrite',
        draft: 'Brouillon, toi seul la vois',
        giver: 'Vue seulement par celui qui m’a tiré',
        parties: 'Vue par les membres de l’événement',
        public: 'Vue par toute personne qui a le lien',
      },
      hintsTodo: 'À remplir',
      hintsEditable: 'Remplies, modifiables jusqu’au jour J',
      hintsLocked: 'Remplies, plus modifiables',
      hintsShort: 'Remplies',
      hintsShortLocked: 'Plus modifiables',
      game: {
        skipped: 'Tu passes ton tour',
        count: {
          one: '{count} sur {total} a joué',
          other: '{count} sur {total} ont joué',
        },
        days: {
          one: 'Plus qu’un jour',
          other: 'Plus que {count} jours',
        },
        lastDay: 'Dernier jour',
        play: 'Fais ton pronostic',
        played: 'Pronostic fait',
        waiting: 'Réponse le jour J',
        palmares: 'Le palmarès t’attend',
        answers: 'Voir les réponses',
      },
    },
    journal: {
      title: 'Journal de l’événement',
      subtitle: "Tout ce qui s'est passé, à la vue de tous",
      alerts: {
        one: '{count} alerte depuis ta dernière visite',
        other: '{count} alertes depuis ta dernière visite',
      },
    },
  },
  reveal: {
    youGiveTo: 'Tu offres un cadeau à',
    seeLink: 'Voir le lien',
  },
  wishes: {
    openLink: 'Ouvrir le lien de « {label} »',
    sheet: {
      new: 'Nouvelle idée',
      edit: 'Modifier l’idée',
      description: 'Une idée courte, et un lien si tu en as un.',
      idea: 'Idée',
      ideaPlaceholder: 'Un livre, des chaussettes…',
      link: 'Lien (facultatif)',
      linkLabel: 'Lien',
      optional: '(facultatif)',
      linkHelp:
        'Colle l’adresse d’une page : elle s’ouvrira dans un nouvel onglet.',
      remove: 'Supprimer l’idée',
    },
  },
  journal: {
    title: 'Journal de l’événement',
    intro:
      'Tous les membres voient ce journal. Il ne dit jamais qui offre à qui.',
    allEditions: 'Tous les Secret Santa',
    edition: 'Secret Santa',
    empty: 'Calme plat. C’est bon signe.',
  },
  invalid: { title: 'Oups, ce lien ne marche plus' },
  account: {
    title: 'Garde tes Secret Santa au même endroit',
    body: 'Crée un compte avec ton adresse email : tu retrouveras ce Secret Santa, et les suivants, sans chercher le lien.',
    bodyClaim:
      'Ajoute ce Secret Santa à ton compte pour le retrouver depuis ton accueil.',
    create: 'Créer mon compte',
    claim: 'Ajouter à mon compte',
    added: 'Secret Santa ajouté à ton compte',
    sendTo: 'Recevoir mon lien à {email}',
    sent: 'Lien envoyé à {email} : ouvre-le pour créer ton compte. Pense à regarder dans les indésirables.',
  },
  // A draw made elsewhere (README 22.12): saying who they give to.
  answer: {
    card: {
      title: 'À qui offres-tu un cadeau ?',
      body: 'Le tirage a été fait hors de l’application. Dis ici à qui tu offres, pour voir ses idées de cadeaux. Vérifie que personne ne regarde par-dessus ton épaule.',
      action: 'Dire à qui j’offre',
      hint: {
        one: 'Ta réponse reste secrète, même pour l’organisateur.',
        other: 'Ta réponse reste secrète, même pour les organisateurs.',
      },
      savedTitle: 'C’est noté',
      savedBody: {
        one: 'Tu verras les idées de cadeaux de ta personne quand tout le monde aura répondu. {count} réponse sur {total} pour l’instant.',
        other:
          'Tu verras les idées de cadeaux de ta personne quand tout le monde aura répondu. {count} réponses sur {total} pour l’instant.',
      },
      review: 'Revoir ou corriger ma réponse',
      savedHint:
        'Ta réponse reste cachée : elle ne s’affiche que si tu le demandes.',
    },
    choose: {
      title: 'À qui offres-tu un cadeau ?',
      description:
        'La personne que tu as tirée, sur papier ou dans l’autre application.',
      search: 'Chercher un prénom',
      results: {
        one: '{shown} prénom sur {total}',
        other: '{shown} prénoms sur {total}',
      },
    },
    confirm: {
      title: 'Tu offres un cadeau à {name} ?',
      description:
        'Vérifie bien : c’est la personne que tu as tirée, sur papier ou dans l’autre application.',
      note: {
        one: 'Tu pourras corriger ta réponse tant que l’organisateur n’a pas validé le tirage. Personne d’autre ne la voit.',
        other:
          'Tu pourras corriger ta réponse tant que les organisateurs n’ont pas validé le tirage. Personne d’autre ne la voit.',
      },
      yes: 'Oui, c’est {name}',
      other: 'Choisir quelqu’un d’autre',
    },
    saved: 'C’est noté',
  },
  // « Devine qui » (README 22.17, lot 19).
  game: {
    title: 'Devine qui',
    introSanta: 'Un seul pronostic, que tu peux changer jusqu’au {end}.',
    introAll:
      'Qui offre à qui ? Autant de pronostics que tu veux, jusqu’au {end}.',
    closedSince: 'Les pronostics sont fermés depuis le {end}.',
    whoGivesMeCaps: 'Qui t’offre ton cadeau ?',
    whoGivesMe: 'Qui t’offre ton cadeau ?',
    whoGivesMeShort: 'Qui t’offre ?',
    whoGivesTo: 'Qui offre à {name} ?',
    myGuess: 'Mon pronostic',
    surprise: 'Une surprise attend tout le monde le jour J.',
    surpriseMore: 'Plus vous êtes nombreux à jouer, plus elle sera belle.',
    challenge: {
      one: 'L’an dernier, {count} personne sur {total} avait deviné son Père Noël. À battre.',
      other:
        'L’an dernier, {count} personnes sur {total} avaient deviné leur Père Noël. À battre.',
    },
    challengeNeutral: {
      one: 'L’an dernier, {count} personne sur {total} avait deviné qui lui offrait. À battre.',
      other:
        'L’an dernier, {count} personnes sur {total} avaient deviné qui leur offrait. À battre.',
    },
    challengeNone:
      'L’an dernier, personne n’avait deviné son Père Noël. À battre.',
    challengeNoneNeutral:
      'L’an dernier, personne n’avait deviné qui lui offrait. À battre.',
    skip: 'Je passe mon tour',
    skippedTitle: 'Tu passes ton tour',
    skippedBody:
      'On ne te rappellera pas le jeu. Tu verras quand même la surprise le jour J.',
    unskip: 'Finalement, je joue',
    unskipUntil: 'Possible jusqu’au {end}.',
    skipConfirm: 'Passer ton tour ?',
    skipConfirmBody:
      'On ne te rappellera plus le jeu. Tu pourras revenir jusqu’au {end}.',
    skipCancel: 'Finalement non',
    progress: {
      one: '{count} pronostic sur {total}.',
      other: '{count} pronostics sur {total}.',
    },
    progressLeft: {
      one: 'Encore un et tu auras fait le tour : la surprise du jour J n’en sera que plus belle.',
      other:
        'Encore {n} et tu auras fait le tour : la surprise du jour J n’en sera que plus belle.',
    },
    progressDone:
      'Tu as fait le tour : la surprise du jour J n’en sera que plus belle.',
    inviteTitle: 'Et toi, qui t’offre ton cadeau ?',
    inviteCount: {
      one: '{count} sur {total} a déjà fait son pronostic. Réponse le jour J.',
      other:
        '{count} sur {total} ont déjà fait leur pronostic. Réponse le jour J.',
    },
    inviteNone: 'Réponse le jour J.',
    makeGuess: 'Faire mon pronostic',
    changeMind: 'Changer d’avis',
    secret: 'Personne ne voit ton pronostic avant le jour J.',
    mySanta: 'Mon Père Noël',
    mySantaNeutral: 'Celui qui m’offre',
    others: 'Les autres',
    mine: 'Mes pronostics',
    choose: '+ Choisir',
    changeFor: 'Changer le pronostic pour {name}',
    me: 'Moi',
    you: 'toi',
    noGuess: 'Pas de pronostic',
    count: {
      one: '{count} pronostic. Personne ne le voit avant le jour J.',
      other: '{count} pronostics. Personne ne les voit avant le jour J.',
    },
    canChange: 'Tu pourras changer d’avis.',
    oneGift: 'Une personne n’offre qu’un cadeau.',
    movedFrom: 'Ton pronostic pour {name} : le choisir le déplace ici',
    movedFromMe: 'Ton pronostic pour toi : le choisir le déplace ici',
    clear: 'Effacer ce pronostic',
    atParty: 'Réponse le jour J',
    atPartyBody: {
      one: 'Les réponses arrivent quand ton organisateur dévoile le tirage. Avec une surprise.',
      other:
        'Les réponses arrivent quand tes organisateurs dévoilent le tirage. Avec une surprise.',
    },
    answersTitle: 'Devine qui : les réponses',
    answersWaiting: 'Le tirage est dévoilé. Les réponses t’attendent.',
    answersSeen: 'Le tirage est dévoilé. Voici ce que valaient tes pronostics.',
    discover: 'Découvrir le palmarès',
    rewatch: 'Revoir le palmarès',
    palmaresHint: 'Ton Père Noël, le détective, les mieux cachés…',
    palmaresHintNeutral: 'Celui qui t’offre, le détective, les mieux cachés…',
    palmaresHintSmall: 'Ton Père Noël, enfin démasqué',
    palmaresHintSmallNeutral: 'Celui qui t’offre, enfin démasqué',
    mineScore: {
      one: 'Mes pronostics · {right} bon sur {count}',
      other: 'Mes pronostics · {right} bons sur {count}',
    },
    mySantaWas: 'Ton Père Noël : {name}',
    mySantaWasNeutral: 'Celui qui t’offre : {name}',
    theirSantaWas: 'Celui de {name} : {giver}',
    right: 'Bien vu',
    youSaid: 'Tu disais {name}',
    arrived: 'Le palmarès de Devine qui est arrivé',
    arrivedBody: 'Qui offrait à qui, et qui avait deviné ?',
    seeMyResult: 'Revoir à qui j’ai offert un cadeau',
    discoverMyResult: 'Découvrir à qui j’offrais un cadeau',
    awards: {
      crowd: '{count} personnes à égalité',
      unmasked: {
        title: 'Démasqué',
        titleMany: 'Démasqués',
        body: 'A deviné son Père Noël.',
        bodyNeutral: 'A deviné qui lui offrait.',
        bodyMany: 'Ils avaient deviné leur Père Noël.',
        bodyManyNeutral: 'Ils avaient deviné qui leur offrait.',
        share: '{n} sur {m}',
        crowdOf: 'personnes sur {total}',
        shareBody: 'avaient deviné leur Père Noël.',
        shareBodyNeutral: 'avaient deviné qui leur offrait.',
        all: 'Les Pères Noël n’ont rien pu cacher.',
        allNeutral: 'Personne n’a rien pu cacher.',
        most: 'Belle année pour les détectives.',
      },
      detective: {
        title: 'Le détective',
        titleMany: 'Les détectives',
        body: '{right} bons pronostics sur {made}.',
        bodyAlone: {
          one: '{right} bons pronostics sur {made}, dont un que personne d’autre n’avait trouvé.',
          other:
            '{right} bons pronostics sur {made}, dont {n} que personne d’autre n’avait trouvés.',
        },
        bodyMany: '{right} bons pronostics sur {made} chacun.',
      },
      flawless: {
        title: 'Le sans-faute',
        titleMany: 'Les sans-faute',
        body: '{N} pronostics, {n} bons. Rien à redire.',
        bodyMany: '{N} pronostics chacun, tous bons. Rien à redire.',
      },
      transparent: {
        title: 'Le plus transparent',
        titleMany: 'Les plus transparents',
        body: '{N} personnes sur {m} l’ont démasqué. Pas facile, de garder un secret.',
        bodyMany:
          '{N} personnes sur {m} ont démasqué chacun d’eux. Pas facile, de garder un secret.',
      },
      hidden: {
        title: 'Le mieux caché',
        titleMany: 'Les mieux cachés',
        none: '{N} personnes l’ont cherché, aucune ne l’a trouvé. Du grand art.',
        one: '{N} personnes l’ont cherché, une seule l’a trouvé.',
        some: '{N} personnes l’ont cherché, {f} seulement l’ont trouvé.',
        manyNone:
          '{N} personnes ont cherché chacun d’eux, aucune ne les a trouvés. Du grand art.',
        manySome:
          '{N} personnes ont cherché chacun d’eux, peu les ont trouvés.',
      },
      rumour: {
        title: 'La rumeur',
        titleMany: 'La rumeur',
        claim: '{giver} offrait\nà {recipient} ?',
        body: '{N} d’entre vous en étaient sûrs. C’était faux.',
      },
      suspect: {
        title: 'Le suspect idéal',
        titleMany: 'Les suspects idéaux',
        never: 'Cité {count} fois comme Père Noël. À tort, à chaque fois.',
        neverNeutral: 'Cité {count} fois, à tort. À chaque fois.',
        body: 'Cité {count} fois à tort comme Père Noël.',
        bodyNeutral: 'Cité {count} fois, à tort.',
        bodyMany: 'Cités {count} fois à tort chacun comme Père Noël.',
        bodyManyNeutral: 'Cités {count} fois chacun, à tort.',
      },
      twins: {
        title: 'Les jumeaux',
        titleMany: 'Les jumeaux',
        noError:
          '{N} pronostics identiques sur {m}. Vous vous êtes concertés ?',
        oneError:
          '{N} pronostics identiques sur {m}, dont une erreur. Vous vous êtes concertés ?',
        errors:
          '{N} pronostics identiques sur {m}, dont {e} erreurs. Vous vous êtes concertés ?',
      },
      triplets: {
        title: 'Les triplés',
        titleMany: 'Les triplés',
        body: 'Les mêmes pronostics, à trois. Il y a eu des messes basses.',
      },
      lastMinute: {
        title: 'Sur le fil',
        titleMany: 'Sur le fil',
        last: 'A tranché dans la dernière minute des pronostics.',
        body: {
          one: 'A tranché une minute avant la fin des pronostics.',
          other: 'A tranché {n} minutes avant la fin des pronostics.',
        },
      },
      weathervane: {
        title: 'La girouette',
        titleMany: 'Les girouettes',
        body: 'A changé d’avis {n} fois avant de se décider.',
        bodyMany: 'Ont changé d’avis {n} fois chacun avant de se décider.',
      },
      group: {
        title: 'À vous tous',
        titleMany: 'À vous tous',
        score: '{right} sur {total}',
        scoreLabel: 'bons pronostics',
        better: 'Au hasard, vous en auriez eu {chance}. Pas mal du tout.',
        same: 'Au hasard, vous en auriez eu {chance}. Le hasard aurait fait aussi bien.',
        worse:
          'Au hasard, vous en auriez eu {chance}. Les Pères Noël étaient bien cachés.',
        worseNeutral:
          'Au hasard, vous en auriez eu {chance}. Tout le monde était bien caché.',
      },
      closeCall: {
        title: 'Si près du but',
        big: 'Presque !',
        body: 'Tu avais trouvé le Père Noël de {name}… puis tu as changé d’avis. L’instinct avait raison.',
        bodyNeutral:
          'Tu avais trouvé qui offrait à {name}… puis tu as changé d’avis. L’instinct avait raison.',
        bodyMe:
          'Tu avais trouvé ton Père Noël… puis tu as changé d’avis. L’instinct avait raison.',
        bodyMeNeutral:
          'Tu avais trouvé qui t’offrait… puis tu as changé d’avis. L’instinct avait raison.',
      },
    },
    story: {
      header: 'Devine qui · {label}',
      progress: 'Écran {index} sur {count}',
      close: 'Fermer',
      openingEyebrow: 'Les réponses sont là',
      openingTitle: 'Qui offrait\nà qui ?',
      openingBody:
        '{players} joueurs, {guesses} pronostics. Voyons ce qu’ils valaient.',
      mySanta: 'Ton Père Noël',
      mySantaNeutral: 'Celui qui t’offre',
      youSaid: 'Tu avais dit\n{name}…',
      noGuess: 'Et ton Père Noël était…',
      noGuessNeutral: 'Et celui qui t’offre était…',
      soWell: 'Alors, bien vu ?',
      right: 'C’était\nbien {name} !',
      was: 'C’était {name}.',
      rightBody:
        'Démasqué. Tu fais partie des {count} sur {total} qui ont deviné.',
      rightSmall: {
        alone: 'Démasqué. Personne d’autre n’a joué, et tu as vu juste.',
        two: 'Démasqué. Vous étiez deux à jouer, et tu as vu juste.',
        three: 'Démasqué. Vous étiez trois à jouer, et tu as vu juste.',
      },
      wrongBody: 'Raté : tu avais dit {name}.',
      noGuessBody: 'Tu n’avais pas fait de pronostic. L’an prochain ?',
      endEyebrow: 'C’est tout pour cette année',
      endTitle: 'Joyeux Noël,\n{name}',
      endTitleAlone: 'Joyeux Noël !',
      allResults: 'Voir tous les résultats',
      again: 'Revoir depuis le début',
      tapNext: 'Touche pour continuer',
    },
  },
};
