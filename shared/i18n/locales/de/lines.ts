// The texts under the lines of the home and of an event
// (docs/spec/v3/lignes.md, ticket 112). No preposition before the name of
// an event: „auch: Chez Mamie“.
export default {
  dot: 'neu',
  santa: {
    notDrawn: 'Noch nicht ausgelost',
    envelope: 'Dein Umschlag wartet',
    revealedNew: 'Aufgedeckt · wer wen beschenkt hat',
    asked: 'Jemand bittet dich um Ideen',
    receiverNews: 'Neue Ideen warten auf dich',
    revealed: 'Aufgedeckt',
    knows: 'Du weißt, wen du beschenkst',
  },
  organiser: {
    prepare: 'Vorzubereiten',
    participants: {
      one: '{count} Teilnehmer',
      other: '{count} Teilnehmende',
    },
    done: 'Erledigt',
    someViewed: '{viewed} von {count} haben es entdeckt',
    allViewed: 'alle haben es entdeckt',
    revealed: 'Aufgedeckt',
    over: 'Beendet',
  },
  game: {
    title: 'Devine qui',
    play: 'Du bist dran',
    until: 'bis {end}',
    played: 'Du hast getippt',
    answerDay: 'Auflösung am großen Tag',
    waiting: 'Auflösung am großen Tag',
    palmaresNew: 'Die Rangliste ist da',
    palmares: 'Die Rangliste',
  },
  names: {
    one: '{a}',
    two: '{a} und {b}',
    three: '{a}, {b} und {c}',
    more: {
      one: '{a}, {b} und {count} weitere Person',
      other: '{a}, {b} und {count} weitere',
    },
    twoMe: '{a} und ich',
    threeMe: '{a}, {b} und ich',
  },
  list: {
    mine: 'Meine Liste',
    of: {
      one: 'Die Liste von {a}',
      two: 'Die Liste von {a} und {b}',
      three: 'Die Liste von {a}, {b} und {c}',
      more: {
        one: 'Die Liste von {a}, {b} und {count} weiteren Person',
        other: 'Die Liste von {a}, {b} und {count} weiteren',
      },
    },
    draft: 'Noch nicht geteilt',
    empty: 'Noch keine Ideen',
    ideas: { one: '{count} Idee', other: '{count} Ideen' },
    ticked: {
      one: '{count} Geschenk abgehakt',
      other: '{count} Geschenke abgehakt',
    },
    giverOnly: 'nur wer dich gezogen hat, sieht sie',
    alsoOne: 'auch: {name}',
    alsoMany: {
      one: 'auch in {count} weiteren Event',
      other: 'auch in {count} weiteren Events',
    },
    offer: {
      one: 'Du schenkst {count} Geschenk',
      other: 'Du schenkst {count} Geschenke',
    },
    newIdeas: { one: '{count} neue Idee', other: '{count} neue Ideen' },
  },
};
