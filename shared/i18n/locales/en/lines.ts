// The texts under the lines of the home and of an event
// (docs/spec/v3/lignes.md, ticket 112). No preposition before the name of
// an event: “also: Chez Mamie”.
export default {
  dot: 'new',
  santa: {
    notDrawn: 'Not drawn yet',
    envelope: 'Your envelope is waiting',
    revealedNew: 'Revealed · who gave to whom',
    asked: 'Someone is asking you for ideas',
    receiverNews: 'New ideas are waiting for you',
    revealed: 'Revealed',
    knows: 'You know who you’re giving to',
  },
  organiser: {
    prepare: 'To prepare',
    participants: {
      one: '{count} participant',
      other: '{count} participants',
    },
    done: 'Done',
    someViewed: '{viewed} of {count} have found out',
    allViewed: 'everyone has found out',
    revealed: 'Revealed',
    over: 'Finished',
  },
  game: {
    title: 'Devine qui',
    play: 'Your turn',
    until: 'until {end}',
    played: 'You’ve played',
    answerDay: 'answers on the day',
    waiting: 'Answers on the day',
    palmaresNew: 'The palmarès is here',
    palmares: 'The palmarès',
  },
  list: {
    mine: 'My gift list',
    for: {
      one: 'For {a}',
      two: 'For {a} and {b}',
      three: 'For {a}, {b} and {c}',
      more: {
        one: 'For {a}, {b} and {count} other',
        other: 'For {a}, {b} and {count} others',
      },
      twoMe: 'For {a} and me',
      threeMe: 'For {a}, {b} and me',
    },
    of: {
      one: '{a}’s list',
      two: '{a} and {b}’s list',
      three: '{a}, {b} and {c}’s list',
      more: {
        one: 'The list of {a}, {b} and {count} other',
        other: 'The list of {a}, {b} and {count} others',
      },
    },
    draft: 'Not shared yet',
    empty: 'No ideas yet',
    ideas: { one: '{count} idea', other: '{count} ideas' },
    ticked: { one: '{count} gift ticked', other: '{count} gifts ticked' },
    giverOnly: 'only the one who drew you sees it',
    alsoOne: 'also: {name}',
    alsoMany: {
      one: 'also in {count} other event',
      other: 'also in {count} other events',
    },
    offer: {
      one: 'You’re giving {count} gift',
      other: 'You’re giving {count} gifts',
    },
    newIdeas: { one: '{count} new idea', other: '{count} new ideas' },
  },
};
