// Emails to the organisers (README 22.2).
export default {
  joined: {
    subject: '{name} a rejoint l’événement',
    body: '{name} vient de rejoindre l’événement « {group} » avec le lien d’invitation.',
    next: 'Pense à l’ajouter au Secret Santa en cours et à ses exclusions (couple, fratrie).',
  },
  allViewed: {
    subject: 'toutes les enveloppes sont ouvertes',
    body: 'Pour {edition} dans « {group} », chacun sait maintenant à qui il offre. Il ne reste plus qu’à trouver les cadeaux.',
  },
  reminder: {
    subject: 'le jour J approche',
    body: '{edition}, c’est le {date}.',
    missing: {
      one: '{count} personne n’a pas encore ouvert son enveloppe : {names}.',
      other:
        '{count} personnes n’ont pas encore ouvert leur enveloppe : {names}.',
    },
    next: 'Tu peux leur renvoyer leur lien depuis le Secret Santa.',
  },
};
