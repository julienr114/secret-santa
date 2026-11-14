// Messages the guardian shares or emails (README 13). Each template is a
// list of lines; the personal link always follows on its own line.
// They never contain a result.
export default {
  invitation: {
    greeting: 'Salut {firstName} ! 🎁',
    body: 'Tu participes au Secret Santa de {groupName} ({editionLabel}).',
    cta: 'Ouvre ton lien et note quelques idées de cadeaux :',
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
  budget: 'Budget : {budget}.',
  eventDate: 'Rendez-vous le {eventDate}.',
  email: {
    personal: 'Ce lien est personnel, ne le transfère pas.',
    signature: "L'organisateur du Secret Santa de {groupName}",
  },
};
