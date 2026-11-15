// Emails to the organisers (README 22.2).
export default {
  joined: {
    subject: '{name} a rejoint « {group} »',
    body: '{name} vient de rejoindre le groupe « {group} » avec le lien d’invitation.',
    next: 'Pense à l’ajouter au tirage en cours et à ses exclusions (couple, fratrie).',
  },
  allViewed: {
    subject: 'Tout le monde a découvert son tirage dans « {group} »',
    body: 'Pour {edition} dans « {group} », chaque participant sait maintenant à qui il offre.',
  },
  reminder: {
    subject: 'L’échange approche dans « {group} »',
    body: 'L’échange de {edition} a lieu le {date}.',
    missing: {
      one: '{count} personne n’a pas encore découvert son tirage : {names}.',
      other:
        '{count} personnes n’ont pas encore découvert leur tirage : {names}.',
    },
    next: 'Tu peux leur renvoyer leur lien depuis l’édition.',
  },
};
