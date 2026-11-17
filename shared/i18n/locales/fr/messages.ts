// Messages the guardian shares or emails (README 13). Each template is a
// list of lines; the personal link always follows on its own line.
// They never contain a result.
export default {
  invitation: {
    greeting: 'Salut {firstName} ! 🎁',
    body: 'Tu participes au Secret Santa de {groupName} ({editionLabel}).',
    cta: 'Ouvre ton lien et laisse quelques pistes de cadeaux :',
    subject: '{firstName}, ton lien pour le Secret Santa ({editionLabel})',
  },
  drawn: {
    greeting: '{firstName}, le tirage est fait ! 🎁',
    cta: 'Ouvre ton lien pour découvrir à qui tu offres un cadeau :',
    subject: '{firstName}, le tirage du Secret Santa est fait',
  },
  reminder: {
    greeting: "Petit rappel {firstName} : ton lien t'attend, pense à l'ouvrir.",
    cta: 'Ton lien :',
    subject: "{firstName}, ton lien du Secret Santa t'attend",
  },
  redraw: {
    greeting:
      "{firstName}, un nouveau tirage a eu lieu : ton ancien résultat n'est plus valable.",
    cta: 'Ton lien ne change pas :',
    subject: '{firstName}, nouveau tirage du Secret Santa',
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
    body: 'Deux réponses du Secret Santa de {groupName} ne vont pas ensemble.',
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
    personal: 'Ce lien est personnel, ne le transfère pas.',
    signature: "L'organisateur du Secret Santa de {groupName}",
  },
};
