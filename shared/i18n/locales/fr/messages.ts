// Messages the guardian shares or emails (README 13). Each template is a
// list of lines; the personal link always follows on its own line.
// They never contain a result.
export default {
  invitation: {
    greeting: 'Salut {firstName} ! 🎁',
    body: 'Tu es de la partie : le Secret Santa de {groupName} ({editionLabel}).',
    cta: 'Ouvre ton lien et laisse quelques pistes de cadeaux :',
    subject: '{firstName}, ton lien pour le Secret Santa ({editionLabel})',
  },
  drawn: {
    greeting: '{firstName}, les jeux sont faits ! 🎁',
    cta: 'Ouvre ton lien pour découvrir à qui tu offres un cadeau :',
    subject: '{firstName}, les jeux sont faits : ton enveloppe t’attend',
  },
  reminder: {
    greeting: '{firstName}, ton enveloppe prend la poussière. Ouvre-la vite !',
    cta: 'Ton lien :',
    subject: '{firstName}, ton enveloppe t’attend toujours',
  },
  redraw: {
    greeting:
      '{firstName}, on rebat les cartes. Un nouveau tirage a eu lieu : oublie l’ancien.',
    cta: 'Ton lien ne change pas :',
    subject: '{firstName}, on rebat les cartes : nouveau tirage',
  },
  answerRequest: {
    greeting: 'Salut {firstName} ! 🎁',
    body: 'Le tirage du Secret Santa de {groupName} ({editionLabel}) a été fait hors de l’application.',
    cta: 'Dis sur ta page à qui tu offres un cadeau, pour voir ses pistes de cadeaux :',
    subject: '{firstName}, à qui offres-tu un cadeau ? ({editionLabel})',
  },
  answerReminder: {
    greeting: '{firstName}, on n’attend plus que toi ! 🎁',
    cta: 'Dis à qui tu offres un cadeau : dès que tout le monde a répondu, chacun voit les pistes de cadeaux de sa personne.',
    subject: '{firstName}, on attend ta réponse pour le Secret Santa',
  },
  answerCheck: {
    greeting: '{firstName}, peux-tu vérifier ta réponse ? 🎁',
    body: 'Il y a un nœud dans le Secret Santa de {groupName} : deux réponses ne vont pas ensemble.',
    cta: 'Vérifie à qui tu offres un cadeau, et corrige-la si besoin :',
    subject: '{firstName}, vérifie ta réponse pour le Secret Santa',
  },
  guessLine:
    '🔍 Devine qui t’offre ton cadeau : tes pronostics jusqu’au {guessEnd}.',
  guessReminder: {
    greeting: 'Salut {firstName} ! 🔍',
    body: 'Devine qui t’offre ton cadeau cette année : tu as jusqu’au {guessEnd} pour faire ton pronostic. Réponse à la fête !',
    subject: '{firstName}, devine qui t’offre ton cadeau',
  },
  guessAuto: {
    subject: 'Plus que {days} jours pour deviner qui t’offre ton cadeau',
    greeting: 'Bonjour {firstName},',
    body: {
      one: 'Pour {editionLabel} ({groupName}), {count} personne sur {total} a déjà fait son pronostic. Et toi, qui t’offre ton cadeau ?',
      other:
        'Pour {editionLabel} ({groupName}), {count} personnes sur {total} ont déjà fait leur pronostic. Et toi, qui t’offre ton cadeau ?',
    },
    nobody:
      'Pour {editionLabel} ({groupName}), personne n’a encore fait de pronostic. Et toi, qui t’offre ton cadeau ?',
    until: 'Tu as jusqu’au {guessEnd}. Réponse à la fête, avec une surprise.',
    cta: 'Faire mon pronostic',
    skipBefore: 'Pas envie de jouer ? ',
    skip: 'Je passe mon tour',
    skipAfter: ', et on ne te le rappellera plus.',
    once: 'C’est le seul rappel automatique que tu recevras.',
    signature: 'Under the Tree',
  },
  guessMore: {
    subject: 'Encore quelques pronostics avant la fin ?',
    greeting: 'Bonjour {firstName},',
    body: 'Tu as fait ton pronostic sur ton Père Noël pour {editionLabel} ({groupName}). Bien joué.',
    more: 'Il te reste {days} jours pour deviner aussi qui offre aux autres. Plus il y a de pronostics, plus la surprise de la fête sera belle.',
    cta: 'Continuer mes pronostics',
  },
  guessPoint: {
    subject: {
      one: 'Devine qui : {count} personne n’a pas encore joué',
      other: 'Devine qui : {count} personnes n’ont pas encore joué',
    },
    greeting: 'Bonjour {firstName},',
    body: 'Pour {editionLabel} ({groupName}), {played} personnes sur {total} ont fait un pronostic.',
    missing: {
      one: '{names} n’a pas encore joué ;',
      other: '{names} n’ont pas encore joué ;',
    },
    noEmail: {
      one: '{noEmail} n’a pas d’adresse email.',
      other: '{noEmail} n’ont pas d’adresse email.',
    },
    closes: 'Les pronostics ferment le {guessEnd}, dans {days} jours.',
    auto: {
      one: 'Un rappel automatique partira demain à ceux qui ont une adresse.',
      other:
        'Un rappel automatique partira dans {count} jours à ceux qui ont une adresse.',
    },
    cta: 'Leur rappeler maintenant',
    off: 'Tu peux couper ces emails dans les réglages du jeu.',
    signature: 'Under the Tree',
  },
  guessEnd: {
    subject: 'Devine qui : les pronostics sont fermés',
    greeting: 'Bonjour {firstName},',
    body: {
      one: 'Pour {editionLabel} ({groupName}), {count} personne sur {total} a joué. Le palmarès est prêt : il se lance dès que tu dévoiles le tirage.',
      other:
        'Pour {editionLabel} ({groupName}), {count} personnes sur {total} ont joué. Le palmarès est prêt : il se lance dès que tu dévoiles le tirage.',
    },
    cta: 'Dévoiler le tirage',
    alone: 'Si tu ne le fais pas, il sera dévoilé tout seul demain à {time}.',
    off: 'Tu peux couper ces emails dans les réglages du jeu.',
    signature: 'Under the Tree',
  },
  guessResults: {
    subject: 'Le palmarès de Devine qui est arrivé',
    greeting: 'Bonjour {firstName},',
    body: 'Le tirage de {editionLabel} ({groupName}) est dévoilé. Tu peux enfin savoir qui t’a offert ton cadeau, et qui avait deviné.',
    giftFirst: 'Si tu n’as pas encore ouvert ton cadeau, fais-le d’abord.',
    cta: 'Découvrir le palmarès',
    once: 'Tu ne recevras ce message qu’une fois.',
    signature: 'Under the Tree',
  },
  budget: 'Budget : {budget}.',
  eventDate: 'Rendez-vous le {eventDate}.',
  email: {
    personal: 'Ce lien n’est qu’à toi : ne le transfère pas.',
    signature: "L'organisateur du Secret Santa de {groupName}",
  },
};
