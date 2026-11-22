// The texts under the lines of the home and of an event
// (docs/spec/v3/lignes.md, ticket 112). No preposition before the name of
// an event: « aussi : Chez Mamie ».
export default {
  dot: 'nouveau',
  santa: {
    notDrawn: 'Pas encore tiré',
    envelope: 'Ton enveloppe t’attend',
    revealedNew: 'Dévoilé · qui a offert à qui',
    asked: 'Quelqu’un te demande des idées',
    receiverNews: 'De nouvelles idées t’attendent',
    revealed: 'Dévoilé',
    knows: 'Tu sais à qui tu offres',
  },
  organiser: {
    prepare: 'À préparer',
    participants: {
      one: '{count} participant',
      other: '{count} participants',
    },
    done: 'Fait',
    someViewed: '{viewed} sur {count} ont découvert',
    allViewed: 'tout le monde a découvert',
    revealed: 'Dévoilé',
    over: 'Terminé',
  },
  game: {
    title: 'Devine qui',
    play: 'À toi de jouer',
    until: 'jusqu’au {end}',
    played: 'Tu as joué',
    answerDay: 'réponse le jour J',
    waiting: 'Réponse le jour J',
    palmaresNew: 'Le palmarès est là',
    palmares: 'Le palmarès',
  },
  names: {
    one: '{a}',
    two: '{a} et {b}',
    three: '{a}, {b} et {c}',
    more: {
      one: '{a}, {b} et {count} autre',
      other: '{a}, {b} et {count} autres',
    },
    twoMe: '{a} et moi',
    threeMe: '{a}, {b} et moi',
  },
  list: {
    mine: 'Ma liste',
    of: {
      one: 'La liste de {a}',
      two: 'La liste de {a} et {b}',
      three: 'La liste de {a}, {b} et {c}',
      more: {
        one: 'La liste de {a}, {b} et {count} autre',
        other: 'La liste de {a}, {b} et {count} autres',
      },
    },
    draft: 'Pas encore partagée',
    empty: 'Pas encore d’idées',
    ideas: { one: '{count} idée', other: '{count} idées' },
    ticked: { one: '{count} cadeau coché', other: '{count} cadeaux cochés' },
    giverOnly: 'seul celui qui t’a tiré la voit',
    alsoOne: 'aussi : {name}',
    alsoMany: {
      one: 'aussi dans {count} autre événement',
      other: 'aussi dans {count} autres événements',
    },
    offer: {
      one: 'Tu offres {count} cadeau',
      other: 'Tu offres {count} cadeaux',
    },
    newIdeas: {
      one: '{count} nouvelle idée',
      other: '{count} nouvelles idées',
    },
  },
};
