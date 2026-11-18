import type fr from '../fr/participant';
import type { Dict } from '../../types';

export default {
  revealed: {
    bannerTitle: 'The draw is no longer secret.',
    bannerBy:
      '{name} revealed it on {date}: everyone can see who gives to whom.',
    bannerOrganizer: {
      one: 'Your organizer revealed it on {date}: everyone can see who gives to whom.',
      other:
        'One of your organizers revealed it on {date}: everyone can see who gives to whom.',
    },
    bannerMe: 'You revealed it on {date}: everyone can see who gives to whom.',
    journal: 'See the journal',
    santaTitle: 'Who gives me my present?',
    santaTitlePast: 'Who gave me my present?',
    santaShow: 'Tap to see, or keep the surprise',
    santaShowPast: 'Tap to see',
    santaHide: 'Tap to hide',
    santaIs: { before: 'It’s', after: 'who gives you your present.' },
    santaIsPast: { before: 'It was', after: 'who gave you your present.' },
    all: 'See the whole draw',
    allHint: 'Who gives to whom, for the whole group',
    allHintPast: 'Who gave to whom, in the whole group',
    gaveTo: 'You gave a present to',
    afterBody:
      'The party is over. The draw is revealed: everyone can see who gave to whom.',
    closedBody: 'That’s a wrap for this year. Same time next year?',
    pageTitle: 'Who gives to whom',
    pageBody:
      'The draw was revealed on {date}. All participants see this list.',
    listTitle: {
      one: 'The draw · {count} participant',
      other: 'The draw · {count} participants',
    },
    you: 'you',
    givesTo: 'gives to {name}',
  },
  home: {
    greeting: 'Hi {firstName}!',
    facts: { budget: 'Budget:', party: 'Party on' },
    note: {
      title: { one: "The organizer's note", other: 'The organizers’ note' },
      more: 'Read more',
    },
    changeAvatar: 'Change my icon',
    steps: {
      label: 'Steps of the draw',
      invitation: 'Invitation',
      drawSoon: 'Draw · soon',
      answer: 'Your answer',
      drawRevealed: 'Draw revealed',
      drawDone: 'Draw done',
      party: 'Party',
      partyIn: {
        one: 'Party · in {count} day',
        other: 'Party · in {count} days',
      },
      partyToday: 'Party · today',
      partyOver: 'Party over',
    },
    waiting: {
      title: 'Just a little longer',
      body: {
        one: 'The draw hasn’t happened yet. Your organizer will give you a shout; keep this link, this is where it all happens.',
        other:
          'The draw hasn’t happened yet. Your organizers will give you a shout; keep this link, this is where it all happens.',
      },
      action: 'Leave my gift hints',
      hint: 'In the meantime, give a hand to whoever draws your name.',
    },
    ready: {
      title: 'Your envelope is waiting',
      body: 'The draw is done. Check nobody’s reading over your shoulder, then open it.',
      bodyHints:
        'The draw is done, and gift hints are waiting inside. Check nobody’s reading over your shoulder, then open it.',
      reveal: 'Find out who I am giving a gift to',
      revealing: 'Opening the envelope…',
      hint: 'Your envelope closes by itself as soon as you leave the page.',
    },
    shown: {
      hide: 'Close my envelope',
      hint: 'Otherwise, your envelope closes by itself when you leave the page.',
    },
    seen: {
      title: 'Slipped your mind?',
      body: 'Your envelope is still here. Check nobody’s reading over your shoulder.',
      bodyHints:
        'Your envelope is still here, with their gift hints. Check nobody’s reading over your shoulder.',
      newTitle: 'New hints are waiting for you',
      newBody:
        'The person you’re giving to has left some since your last visit. Check nobody’s reading over your shoulder.',
      revealWithHints: 'See who I’m giving to, and their hints',
      noHintsYet:
        'No hints yet. You can ask for some, without giving yourself away.',
      revealAgain: 'See who I am giving to again',
    },
    closed: {
      title: 'The party is over',
      body: 'That’s a wrap for this year. You can still see who you gave a gift to.',
      bodyNotSeen:
        'That’s a wrap for this year. You can still find out who you were giving a gift to.',
    },
    tiles: {
      hintsTodo: 'To fill in',
      hintsEditable: 'Filled in, can be changed until the party',
      hintsLocked: 'Filled in, can no longer be changed',
      hintsShort: 'Filled in',
      hintsShortLocked: 'No longer editable',
      game: {
        skipped: 'Sitting this one out',
        count: {
          one: '{count} out of {total} played',
          other: '{count} out of {total} played',
        },
        days: {
          one: 'One day left',
          other: 'Only {count} days left',
        },
        lastDay: 'Last day',
        play: 'Make your guess',
        played: 'Guess made',
        waiting: 'Answer at the party',
        palmares: 'The palmarès is waiting',
        answers: 'See the answers',
      },
    },
    journal: {
      title: 'Group journal',
      subtitle: 'Everything that happened, for all to see',
      alerts: {
        one: '{count} alert since your last visit',
        other: '{count} alerts since your last visit',
      },
    },
  },
  reveal: {
    youGiveTo: 'You are giving a gift to',
    seeLink: 'See the link',
  },
  wishes: {
    openLink: 'Open the link of "{label}"',
    sheet: {
      new: 'New idea',
      edit: 'Edit the idea',
      description: 'A short idea, and a link if you have one.',
      idea: 'Idea',
      ideaPlaceholder: 'A book, some socks…',
      link: 'Link (optional)',
      linkLabel: 'Link',
      optional: '(optional)',
      linkHelp: 'Paste the address of a page: it will open in a new tab.',
      remove: 'Delete the idea',
    },
  },
  journal: {
    title: 'Group journal',
    intro: 'Everyone can see this journal. It never says who gives to whom.',
    allEditions: 'All editions',
    edition: 'Edition',
    empty: 'All quiet. That’s a good sign.',
  },
  invalid: { title: 'Oops, this link no longer works' },
  account: {
    title: 'Keep your draws in one place',
    body: 'Create an account with your email address: you will find this draw, and the next ones, without looking for the link.',
    bodyClaim: 'Add this draw to your account to find it from your home page.',
    create: 'Create my account',
    claim: 'Add to my account',
    added: 'Draw added to your account',
    sendTo: 'Get my link at {email}',
    sent: 'Link sent to {email}: open it to create your account. Remember to look in your spam folder.',
  },
  answer: {
    card: {
      title: 'Who are you giving a gift to?',
      body: 'The draw was made outside the app. Say here who you’re giving to, to see their gift hints. Check nobody’s reading over your shoulder.',
      action: "Say who I'm giving to",
      hint: {
        one: 'Your answer stays secret, even from the organizer.',
        other: 'Your answer stays secret, even from the organizers.',
      },
      savedTitle: 'Got it',
      savedBody: {
        one: "You'll see your person's gift hints once everyone has answered. {count} answer out of {total} so far.",
        other:
          "You'll see your person's gift hints once everyone has answered. {count} answers out of {total} so far.",
      },
      review: 'See or correct my answer',
      savedHint: 'Your answer stays hidden: it only shows if you ask for it.',
    },
    choose: {
      title: 'Who are you giving a gift to?',
      description: 'The person you drew, on paper or in the other app.',
      search: 'Search a first name',
      results: {
        one: '{shown} name out of {total}',
        other: '{shown} names out of {total}',
      },
    },
    confirm: {
      title: 'You are giving a gift to {name}?',
      description:
        "Check carefully: it's the person you drew, on paper or in the other app.",
      note: {
        one: 'You can correct your answer until the organizer validates the draw. Nobody else sees it.',
        other:
          'You can correct your answer until the organizers validate the draw. Nobody else sees it.',
      },
      yes: "Yes, it's {name}",
      other: 'Choose someone else',
    },
    saved: 'Got it',
  },
  game: {
    title: 'Devine qui',
    introSanta: 'One guess, which you can change until {end}.',
    introAll: 'Who gives to whom? As many guesses as you like, until {end}.',
    closedSince: 'The guesses have been closed since {end}.',
    whoGivesMeCaps: "Who's giving you a gift?",
    whoGivesMe: "Who's giving you a gift?",
    whoGivesMeShort: 'Who gives to you?',
    whoGivesTo: 'Who gives to {name}?',
    myGuess: 'My guess',
    surprise: 'A surprise awaits the group at the party.',
    surpriseMore: 'The more of you play, the better it will be.',
    challenge: {
      one: 'Last year, {count} person out of {total} guessed their Secret Santa. Beat that.',
      other:
        'Last year, {count} people out of {total} guessed their Secret Santa. Beat that.',
    },
    challengeNone: 'Last year, nobody guessed their Secret Santa. Beat that.',
    skip: 'I’ll sit this one out',
    skippedTitle: 'You’re sitting this one out',
    skippedBody:
      'We won’t remind you of the game. You’ll still see the surprise at the party.',
    unskip: 'Actually, I’ll play',
    unskipUntil: 'Possible until {end}.',
    skipConfirm: 'Sit this one out?',
    skipConfirmBody:
      'We won’t remind you of the game again. You can come back until {end}.',
    skipCancel: 'Actually, no',
    progress: {
      one: '{count} guess out of {total}.',
      other: '{count} guesses out of {total}.',
    },
    progressLeft: {
      one: 'One more and you’ll have done the round: the surprise at the party will be all the better.',
      other:
        '{n} more and you’ll have done the round: the surprise at the party will be all the better.',
    },
    progressDone:
      'You’ve done the round: the surprise at the party will be all the better.',
    inviteTitle: 'And you, who gives you your present?',
    inviteCount: {
      one: '{count} out of {total} has already made a guess. Answer at the party.',
      other:
        '{count} out of {total} have already made a guess. Answer at the party.',
    },
    inviteNone: 'Answer at the party.',
    makeGuess: 'Make my guess',
    changeMind: 'Change my mind',
    secret: 'Nobody sees your guess before the party.',
    mySanta: 'My Secret Santa',
    others: 'The others',
    mine: 'My guesses',
    choose: '+ Choose',
    changeFor: 'Change the guess for {name}',
    me: 'Me',
    you: 'you',
    noGuess: 'No guess',
    count: {
      one: '{count} guess. Nobody sees it before the party.',
      other: '{count} guesses. Nobody sees them before the party.',
    },
    canChange: 'You can change your mind.',
    oneGift: 'A person gives only one gift.',
    movedFrom: 'Your guess for {name}: choosing it moves it here',
    movedFromMe: 'Your guess for you: choosing it moves it here',
    clear: 'Delete this guess',
    atParty: 'Answer at the party',
    atPartyBody: {
      one: 'The answers come when your organizer reveals the draw. With a surprise.',
      other:
        'The answers come when your organizers reveal the draw. With a surprise.',
    },
    answersTitle: 'Devine qui: the answers',
    answersWaiting: 'The draw is revealed. The answers are waiting for you.',
    answersSeen: 'The draw is revealed. Here is what your guesses were worth.',
    discover: 'Discover the palmarès',
    rewatch: 'Watch the palmarès again',
    palmaresHint: 'Your Secret Santa, the detective, the best hidden…',
    palmaresHintSmall: 'Your Secret Santa, unmasked at last',
    mineScore: {
      one: 'My guesses · {right} right out of {count}',
      other: 'My guesses · {right} right out of {count}',
    },
    mySantaWas: 'Your Secret Santa: {name}',
    theirSantaWas: "{name}'s: {giver}",
    right: 'Well spotted',
    youSaid: 'You said {name}',
    arrived: 'The Devine qui palmarès is here',
    arrivedBody: 'Who gave to whom, and who had guessed?',
    seeMyResult: 'See again who I gave a gift to',
    discoverMyResult: 'Discover who I was giving a gift to',
    awards: {
      crowd: '{count} people tied',
      unmasked: {
        title: 'Unmasked',
        titleMany: 'Unmasked',
        body: 'Guessed their Secret Santa.',
        bodyMany: 'They guessed their Secret Santa.',
        share: '{n} out of {m}',
        crowdOf: 'people out of {total}',
        shareBody: 'guessed their Secret Santa.',
        all: 'The Santas couldn’t hide a thing.',
        most: 'A great year for detectives.',
      },
      detective: {
        title: 'The detective',
        titleMany: 'The detectives',
        body: '{right} right guesses out of {made}.',
        bodyAlone: {
          one: '{right} right guesses out of {made}, one that nobody else found.',
          other:
            '{right} right guesses out of {made}, {n} that nobody else found.',
        },
        bodyMany: '{right} right guesses out of {made} each.',
      },
      flawless: {
        title: 'Flawless',
        titleMany: 'Flawless',
        body: '{N} guesses, {n} right. Nothing to add.',
        bodyMany: '{N} guesses each, all right. Nothing to add.',
      },
      transparent: {
        title: 'The most transparent',
        titleMany: 'The most transparent',
        body: '{N} people out of {m} unmasked them. Keeping a secret isn’t easy.',
        bodyMany:
          '{N} people out of {m} unmasked each of them. Keeping a secret isn’t easy.',
      },
      hidden: {
        title: 'The best hidden',
        titleMany: 'The best hidden',
        none: '{N} people looked for them, none found them. A masterpiece.',
        one: '{N} people looked for them, only one found them.',
        some: '{N} people looked for them, only {f} found them.',
        manyNone:
          '{N} people looked for each of them, none found them. A masterpiece.',
        manySome: '{N} people looked for each of them, few found them.',
      },
      rumour: {
        title: 'The rumour',
        titleMany: 'The rumour',
        claim: '{giver} gave\nto {recipient}?',
        body: '{N} of you were sure of it. It was wrong.',
      },
      suspect: {
        title: 'The ideal suspect',
        titleMany: 'The ideal suspects',
        never: 'Named {count} times as Secret Santa. Wrongly, every time.',
        body: 'Named wrongly {count} times as Secret Santa.',
        bodyMany: 'Each named wrongly {count} times as Secret Santa.',
      },
      twins: {
        title: 'The twins',
        titleMany: 'The twins',
        noError: '{N} identical guesses out of {m}. Did you plan this?',
        oneError:
          '{N} identical guesses out of {m}, one of them wrong. Did you plan this?',
        errors:
          '{N} identical guesses out of {m}, {e} of them wrong. Did you plan this?',
      },
      triplets: {
        title: 'The triplets',
        titleMany: 'The triplets',
        body: 'The same guesses, the three of you. There was whispering.',
      },
      lastMinute: {
        title: 'Down to the wire',
        titleMany: 'Down to the wire',
        last: 'Decided in the very last minute of the guesses.',
        body: {
          one: 'Decided one minute before the guesses ended.',
          other: 'Decided {n} minutes before the guesses ended.',
        },
      },
      weathervane: {
        title: 'The weathervane',
        titleMany: 'The weathervanes',
        body: 'Changed their mind {n} times before deciding.',
        bodyMany: 'Each changed their mind {n} times before deciding.',
      },
      group: {
        title: 'All of you',
        titleMany: 'All of you',
        score: '{right} out of {total}',
        scoreLabel: 'right guesses',
        better: 'By chance, you would have had {chance}. Not bad at all.',
        same: 'By chance, you would have had {chance}. Chance would have done as well.',
        worse:
          'By chance, you would have had {chance}. The Santas were well hidden.',
      },
      closeCall: {
        title: 'So close',
        big: 'Almost!',
        body: 'You had found {name}’s Secret Santa… then you changed your mind. Your instinct was right.',
        bodyMe:
          'You had found your Secret Santa… then you changed your mind. Your instinct was right.',
      },
    },
    story: {
      header: 'Devine qui · {label}',
      progress: 'Screen {index} of {count}',
      close: 'Close',
      openingEyebrow: 'The answers are here',
      openingTitle: 'Who gave\nto whom?',
      openingBody:
        "{players} players, {guesses} guesses. Let's see what they were worth.",
      mySanta: 'Your Secret Santa',
      youSaid: 'You said\n{name}…',
      noGuess: 'And your Secret Santa was…',
      soWell: 'So, well spotted?',
      right: 'It was\n{name} indeed!',
      was: 'It was {name}.',
      rightBody:
        "Unmasked. You're one of the {count} out of {total} who guessed.",
      rightSmall: {
        alone: 'Unmasked. Nobody else played, and you got it right.',
        two: 'Unmasked. Two of you played, and you got it right.',
        three: 'Unmasked. Three of you played, and you got it right.',
      },
      wrongBody: 'Missed: you said {name}.',
      noGuessBody: 'You hadn’t made a guess. Next year?',
      endEyebrow: "That's all for this year",
      endTitle: 'Merry Christmas,\n{name}',
      endTitleAlone: 'Merry Christmas!',
      allResults: 'See every result',
      again: 'Watch again from the start',
      tapNext: 'Tap to continue',
    },
  },
} satisfies Dict<typeof fr>;
