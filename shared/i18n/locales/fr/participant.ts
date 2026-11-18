// The participant's side: personal page, journal.
export default {
  revealed: {
    bannerTitle: 'Le tirage n’est plus secret.',
    bannerBy:
      '{name} l’a dévoilé le {date} : tout le monde peut voir qui offre à qui.',
    bannerOrganizer:
      'Ton organisateur l’a dévoilé le {date} : tout le monde peut voir qui offre à qui.',
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
    allHint: 'Qui offre à qui, pour tout le groupe',
    allHintPast: 'Qui a offert à qui, dans tout le groupe',
    gaveTo: 'Tu as offert un cadeau à',
    afterBody:
      'La fête est passée. Le tirage est dévoilé : tout le monde peut voir qui a offert à qui.',
    closedBody: 'Cette édition est clôturée. Rendez-vous l’an prochain !',
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
    facts: { budget: 'Budget :', party: 'Fête le' },
    note: { title: "Le mot de l'organisateur", more: 'Lire la suite' },
    changeAvatar: 'Changer mon icône',
    steps: {
      label: 'Étapes du tirage',
      invitation: 'Invitation',
      drawSoon: 'Tirage · bientôt',
      answer: 'Ta réponse',
      drawRevealed: 'Tirage dévoilé',
      drawDone: 'Tirage fait',
      party: 'Fête',
      partyIn: {
        one: 'Fête · dans {count} jour',
        other: 'Fête · dans {count} jours',
      },
      partyToday: "Fête · aujourd'hui",
      partyOver: 'Fête passée',
    },
    waiting: {
      title: "Le tirage n'a pas encore eu lieu",
      body: "Ton organisateur te préviendra. Garde ce lien : c'est ici que tu découvriras à qui tu offres un cadeau.",
      action: 'Laisser mes pistes de cadeaux',
      hint: 'En attendant, aide la personne qui te tirera au sort.',
    },
    ready: {
      title: "Ton enveloppe t'attend",
      body: "Le tirage est fait. Assure-toi que personne ne regarde ton écran avant de l'ouvrir.",
      bodyHints:
        'Le tirage est fait, et des pistes de cadeaux t’attendent à l’intérieur. Assure-toi que personne ne regarde ton écran avant de l’ouvrir.',
      reveal: "Découvrir à qui j'offre un cadeau",
      revealing: 'Ouverture de l’enveloppe…',
      hint: 'Ton résultat se referme dès que tu quittes la page.',
    },
    shown: {
      hide: 'Cacher mon résultat',
      hint: 'Il se referme tout seul quand tu quittes la page.',
    },
    seen: {
      title: 'Tu sais déjà à qui tu offres',
      body: 'Un trou de mémoire ? Assure-toi que personne ne regarde ton écran.',
      bodyHints:
        'Ses pistes de cadeaux t’attendent à l’intérieur. Assure-toi que personne ne regarde ton écran.',
      newTitle: 'De nouvelles pistes t’attendent',
      newBody:
        'La personne à qui tu offres en a laissé depuis ta dernière visite. Assure-toi que personne ne regarde ton écran.',
      revealWithHints: 'Revoir mon résultat et ses pistes',
      noHintsYet: 'Pas encore de pistes. Tu pourras lui en demander.',
      revealAgain: "Revoir à qui j'offre un cadeau",
    },
    closed: {
      title: 'La fête est passée',
      body: 'Cette édition est clôturée. Tu peux encore revoir à qui tu as offert un cadeau.',
      bodyNotSeen:
        'Cette édition est clôturée. Tu peux encore découvrir à qui tu offrais un cadeau.',
    },
    tiles: {
      hintsTodo: 'À remplir',
      hintsEditable: 'Remplies, modifiables jusqu’à la fête',
      hintsLocked: 'Remplies, plus modifiables',
      hintsShort: 'Remplies',
      hintsShortLocked: 'Plus modifiables',
      game: {
        play: 'Fais ton pronostic',
        played: 'Pronostic fait',
        waiting: 'Réponse à la fête',
        palmares: 'Le palmarès t’attend',
        answers: 'Voir les réponses',
      },
    },
    journal: {
      title: 'Journal du groupe',
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
      remove: 'Supprimer l’idée',
    },
  },
  journal: {
    title: 'Journal du groupe',
    intro: 'Tout le groupe voit ce journal. Il ne dit jamais qui offre à qui.',
    allEditions: 'Toutes les éditions',
    edition: 'Édition',
    empty: "Rien à signaler pour l'instant.",
  },
  invalid: { title: 'Oups, ce lien ne marche plus' },
  account: {
    title: 'Garde tes tirages au même endroit',
    body: 'Crée un compte avec ton adresse email : tu retrouveras ce tirage, et les suivants, sans chercher le lien.',
    bodyClaim:
      'Ajoute ce tirage à ton compte pour le retrouver depuis ton accueil.',
    create: 'Créer mon compte',
    claim: 'Ajouter à mon compte',
    added: 'Tirage ajouté à ton compte',
    sendTo: 'Recevoir mon lien à {email}',
    sent: 'Lien envoyé à {email} : ouvre-le pour créer ton compte. Pense à regarder dans les indésirables.',
  },
  // A draw made elsewhere (README 22.12): saying who they give to.
  answer: {
    card: {
      title: 'À qui offres-tu un cadeau ?',
      body: 'Le tirage a été fait hors de l’application. Dis-le ici pour voir ses pistes de cadeaux. Assure-toi que personne ne regarde ton écran.',
      action: 'Dire à qui j’offre',
      hint: 'Ta réponse reste secrète, même pour l’organisateur.',
      savedTitle: 'Réponse enregistrée',
      savedBody: {
        one: 'Tu verras les pistes de cadeaux de ta personne quand tout le monde aura répondu. {count} réponse sur {total} pour l’instant.',
        other:
          'Tu verras les pistes de cadeaux de ta personne quand tout le monde aura répondu. {count} réponses sur {total} pour l’instant.',
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
      note: 'Tu pourras corriger ta réponse tant que l’organisateur n’a pas validé le tirage. Personne d’autre ne la voit.',
      yes: 'Oui, c’est {name}',
      other: 'Choisir quelqu’un d’autre',
    },
    saved: 'Réponse enregistrée',
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
    makeGuess: 'Faire mon pronostic',
    changeMind: 'Changer d’avis',
    secret: 'Personne ne voit ton pronostic avant la fête.',
    mySanta: 'Mon Père Noël',
    others: 'Les autres',
    mine: 'Mes pronostics',
    choose: '+ Choisir',
    changeFor: 'Changer le pronostic pour {name}',
    me: 'Moi',
    you: 'toi',
    noGuess: 'Pas de pronostic',
    count: {
      one: '{count} pronostic. Personne ne le voit avant la fête.',
      other: '{count} pronostics. Personne ne les voit avant la fête.',
    },
    canChange: 'Tu pourras changer d’avis.',
    oneGift: 'Une personne n’offre qu’un cadeau.',
    movedFrom: 'Ton pronostic pour {name} : le choisir le déplace ici',
    movedFromMe: 'Ton pronostic pour toi : le choisir le déplace ici',
    clear: 'Effacer ce pronostic',
    atParty: 'Réponse à la fête',
    atPartyBody:
      'Les résultats et le palmarès arrivent quand ton organisateur dévoile le tirage.',
    answersTitle: 'Devine qui : les réponses',
    answersWaiting: 'Le tirage est dévoilé. Les réponses t’attendent.',
    answersSeen: 'Le tirage est dévoilé. Voici ce que valaient tes pronostics.',
    discover: 'Découvrir le palmarès',
    rewatch: 'Revoir le palmarès',
    palmaresHint: 'Ton Père Noël, le détective, les mieux cachés…',
    palmaresHintSmall: 'Ton Père Noël, enfin démasqué',
    mineScore: {
      one: 'Mes pronostics · {right} bon sur {count}',
      other: 'Mes pronostics · {right} bons sur {count}',
    },
    mySantaWas: 'Ton Père Noël : {name}',
    theirSantaWas: 'Celui de {name} : {giver}',
    right: 'Bien vu',
    youSaid: 'Tu disais {name}',
    arrived: 'Le palmarès de Devine qui est arrivé',
    arrivedBody: 'Qui offrait à qui, et qui avait deviné ?',
    seeMyResult: 'Revoir à qui j’ai offert un cadeau',
    discoverMyResult: 'Découvrir à qui j’offrais un cadeau',
    awards: {
      unmasked: {
        title: 'Démasqué',
        titleMany: 'Démasqués',
        body: 'A deviné son Père Noël.',
        bodyMany: 'Ont deviné leur Père Noël.',
        crowd: '{count} personnes',
      },
      detective: {
        title: 'Le détective',
        titleMany: 'Les détectives',
        body: {
          one: '{count} bon pronostic sur {total}. Personne n’a fait mieux.',
          other:
            '{count} bons pronostics sur {total}. Personne n’a fait mieux.',
        },
        bodyMany: {
          one: '{count} bon pronostic sur {total}, à égalité.',
          other: '{count} bons pronostics sur {total}, à égalité.',
        },
        crowd: '{count} détectives',
      },
      transparent: {
        title: 'Le plus transparent',
        titleMany: 'Les plus transparents',
        body: {
          one: 'Démasqué par {count} personne.',
          other: 'Démasqué par {count} personnes.',
        },
        bodyMany: {
          one: 'Démasqués par {count} personne chacun.',
          other: 'Démasqués par {count} personnes chacun.',
        },
        crowd: '{count} personnes',
      },
      hidden: {
        title: 'Le mieux caché',
        titleMany: 'Les mieux cachés',
        body: 'Personne ne l’a démasqué. Du grand art.',
        bodyMany: 'Personne ne les a démasqués. Du grand art.',
        crowd: '{count} personnes',
      },
      suspect: {
        title: 'Le suspect idéal',
        titleMany: 'Les suspects idéaux',
        body: 'Cité {count} fois à tort. On se demande pourquoi.',
        bodyMany: 'Cités {count} fois à tort chacun. On se demande pourquoi.',
        crowd: '{count} personnes',
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
      youSaid: 'Tu avais dit\n{name}…',
      noGuess: 'Et ton Père Noël était…',
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
      noGuessBody: 'Tu n’avais pas fait de pronostic.',
      endEyebrow: 'C’est tout pour cette année',
      endTitle: 'Joyeux Noël,\n{name}',
      endTitleAlone: 'Joyeux Noël !',
      allResults: 'Voir tous les résultats',
      again: 'Revoir depuis le début',
      tapNext: 'Touche pour continuer',
    },
  },
};
