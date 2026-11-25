export default {
  appName: 'Under the Tree',
  /** A row written in place was saved (ticket 162). */
  saved: 'Enregistré',
  loading: 'Chargement',
  loadError: {
    title: 'On n’arrive pas à charger cette page',
    body: 'Vérifie ta connexion, puis réessaie. Rien n’a été perdu.',
    retry: 'Réessayer',
    home: 'Revenir à l’accueil',
  },
  status: {
    preparing: 'En préparation',
    drawn: 'Tirage fait',
    closed: 'Clôturée',
  },
  badge: { sent: 'envoyé', hints: 'liste', viewed: 'enveloppe ouverte' },
  messageType: {
    invitation: 'Invitation',
    drawn: 'Tirage fait',
    reminder: 'Relance',
    redraw: 'Nouveau tirage',
    answerRequest: 'Demande',
    answerReminder: 'Relance',
    answerCheck: 'À vérifier',
    guessReminder: 'Rappel du jeu',
  },
  count: {
    participants: { one: '{count} participant', other: '{count} participants' },
  },
  tabs: {
    home: 'Accueil',
    create: 'Créer',
    news: 'Quoi de neuf',
    admin: 'Admin',
    label: 'Sections',
  },
  create: {
    title: 'Créer',
    secretSanta: 'Un Secret Santa',
    list: 'Une liste de cadeaux',
  },
  context: 'Tu es ici',
  actions: {
    back: 'Retour',
    cancel: 'Annuler',
    delete: 'Supprimer',
    validate: 'Valider',
    add: 'Ajouter',
    save: 'Enregistrer',
    saving: 'Enregistrement…',
    logout: 'Se déconnecter',
  },
  languageIn: { fr: 'en français', en: 'en anglais', de: 'en allemand' },
  language: {
    label: 'Langue',
    fr: 'Français',
    en: 'English',
    de: 'Deutsch',
  },
  // Under an address that receives nothing (ticket 130, StopSaisie).
  // A date in one field (ticket 160).
  date: {
    outside: 'Une date entre {from} et {to}.',
    future: 'Une date déjà passée.',
  },
  emailBlock: {
    refused:
      'La personne qui a cette adresse a demandé à ne plus recevoir d’emails d’Under the Tree.',
    refusedNext:
      'Tu peux garder l’adresse, mais aucun email ne lui partira. Envoie-lui son lien autrement.',
    unknown:
      'Cette adresse ne semble pas exister : aucun email ne lui partira.',
    refusedShort: 'A demandé à ne plus recevoir d’emails',
    unknownShort: 'Adresse qui ne semble pas exister',
  },
};
