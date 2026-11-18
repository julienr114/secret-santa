// Messages the guardian shares or emails (README 13). Each template is a
// list of lines; the personal link always follows on its own line.
// They never contain a result.
export default {
  invitation: {
    greeting: 'Salut {firstName} ! 🎁',
    body: 'Tu es de la partie : le Secret Santa de {groupName} ({editionLabel}).',
    cta: 'Ouvre ton lien et laisse quelques pistes de cadeaux :',
    subject: 'Secret Santa de {groupName} : ton lien, {firstName}',
  },
  drawn: {
    greeting:
      '{firstName}, les jeux sont faits pour le Secret Santa de {groupName} ! 🎁',
    cta: 'Ouvre ton lien pour découvrir à qui tu offres un cadeau :',
    subject:
      'Secret Santa de {groupName} : {firstName}, les jeux sont faits, ton enveloppe t’attend',
  },
  reminder: {
    greeting:
      '{firstName}, ton enveloppe du Secret Santa de {groupName} prend la poussière. Ouvre-la vite !',
    cta: 'Ton lien :',
    subject:
      'Secret Santa de {groupName} : {firstName}, ton enveloppe t’attend toujours',
  },
  redraw: {
    greeting:
      '{firstName}, on rebat les cartes dans le Secret Santa de {groupName}. Un nouveau tirage a eu lieu : oublie l’ancien.',
    cta: 'Ton lien ne change pas :',
    subject:
      'Secret Santa de {groupName} : {firstName}, on rebat les cartes, nouveau tirage',
  },
  answerRequest: {
    greeting: 'Salut {firstName} ! 🎁',
    body: 'Le tirage du Secret Santa de {groupName} ({editionLabel}) a été fait hors de l’application.',
    cta: 'Dis sur ta page à qui tu offres un cadeau, pour voir ses pistes de cadeaux :',
    subject:
      'Secret Santa de {groupName} : à qui offres-tu un cadeau, {firstName} ?',
  },
  answerReminder: {
    greeting:
      '{firstName}, le Secret Santa de {groupName} n’attend plus que toi ! 🎁',
    cta: 'Dis à qui tu offres un cadeau : dès que tout le monde a répondu, chacun voit les pistes de cadeaux de sa personne.',
    subject: 'Secret Santa de {groupName} : on attend ta réponse, {firstName}',
  },
  answerCheck: {
    greeting: '{firstName}, peux-tu vérifier ta réponse ? 🎁',
    body: 'Il y a un nœud dans le Secret Santa de {groupName} : deux réponses ne vont pas ensemble.',
    cta: 'Vérifie à qui tu offres un cadeau, et corrige-la si besoin :',
    subject:
      'Secret Santa de {groupName} : peux-tu vérifier ta réponse, {firstName} ?',
  },
  guessLine:
    '🔍 Devine qui, le jeu de pronostics du Secret Santa : qui t’offre ton cadeau ? Tes pronostics jusqu’au {guessEnd}.',
  guessReminder: {
    greeting: 'Salut {firstName} ! 🔍',
    body: 'Devine qui, le jeu de pronostics du Secret Santa de {groupName} : qui t’offre ton cadeau cette année ? Tu as jusqu’au {guessEnd} pour faire ton pronostic. Réponse à la fête !',
    subject:
      'Secret Santa de {groupName} : devine qui t’offre ton cadeau, {firstName}',
  },
  guessAuto: {
    subject:
      'Secret Santa de {groupName} : plus que {days} jours pour deviner qui t’offre ton cadeau',
    greeting: 'Bonjour {firstName},',
    body: {
      one: 'Au Secret Santa de {groupName} ({editionLabel}), on joue à Devine qui : deviner qui offre à qui. {count} personne sur {total} a déjà fait son pronostic. Et toi, qui t’offre ton cadeau ?',
      other:
        'Au Secret Santa de {groupName} ({editionLabel}), on joue à Devine qui : deviner qui offre à qui. {count} personnes sur {total} ont déjà fait leur pronostic. Et toi, qui t’offre ton cadeau ?',
    },
    nobody:
      'Au Secret Santa de {groupName} ({editionLabel}), on joue à Devine qui : deviner qui offre à qui. Personne n’a encore fait de pronostic. Et toi, qui t’offre ton cadeau ?',
    until: 'Tu as jusqu’au {guessEnd}. Réponse à la fête, avec une surprise.',
    cta: 'Faire mon pronostic',
    skipBefore: 'Pas envie de jouer ? ',
    skip: 'Je passe mon tour',
    skipAfter: ', et on ne te le rappellera plus.',
    once: 'C’est le seul rappel automatique que tu recevras.',
    signature: 'Le Secret Santa de {groupName}',
  },
  guessMore: {
    subject:
      'Secret Santa de {groupName} : encore quelques pronostics avant la fin ?',
    greeting: 'Bonjour {firstName},',
    body: 'Tu as fait ton pronostic sur ton Père Noël à Devine qui, le jeu du Secret Santa de {groupName} ({editionLabel}). Bien joué.',
    more: 'Il te reste {days} jours pour deviner aussi qui offre aux autres. Plus il y a de pronostics, plus la surprise de la fête sera belle.',
    cta: 'Continuer mes pronostics',
  },
  guessPoint: {
    subject: {
      one: 'Devine qui, {groupName} : {count} personne n’a pas encore joué',
      other:
        'Devine qui, {groupName} : {count} personnes n’ont pas encore joué',
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
    signature: 'Under the Tree, l’application de votre Secret Santa',
  },
  guessEnd: {
    subject: 'Devine qui, {groupName} : les pronostics sont fermés',
    greeting: 'Bonjour {firstName},',
    body: {
      one: 'Pour {editionLabel} ({groupName}), {count} personne sur {total} a joué. Le palmarès est prêt : il se lance dès que tu dévoiles le tirage.',
      other:
        'Pour {editionLabel} ({groupName}), {count} personnes sur {total} ont joué. Le palmarès est prêt : il se lance dès que tu dévoiles le tirage.',
    },
    cta: 'Dévoiler le tirage',
    alone: 'Si tu ne le fais pas, il sera dévoilé tout seul demain à {time}.',
    off: 'Tu peux couper ces emails dans les réglages du jeu.',
    signature: 'Under the Tree, l’application de votre Secret Santa',
  },
  guessResults: {
    subject:
      'Secret Santa de {groupName} : le palmarès de Devine qui est arrivé',
    greeting: 'Bonjour {firstName},',
    body: 'Le tirage du Secret Santa de {groupName} ({editionLabel}) est dévoilé, et Devine qui, le jeu de pronostics, a son palmarès. Tu peux enfin savoir qui t’a offert ton cadeau, et qui avait deviné.',
    giftFirst: 'Si tu n’as pas encore ouvert ton cadeau, fais-le d’abord.',
    cta: 'Découvrir le palmarès',
    once: 'Tu ne recevras ce message qu’une fois.',
    signature: 'Le Secret Santa de {groupName}',
  },
  budget: 'Budget : {budget}.',
  eventDate: 'Rendez-vous le {eventDate}.',
  email: {
    signatureFrom: '{sender}, pour le Secret Santa de {groupName}',
    personal: 'Ce lien n’est qu’à toi : ne le transfère pas.',
    signature: 'Le Secret Santa de {groupName}',
  },
};
