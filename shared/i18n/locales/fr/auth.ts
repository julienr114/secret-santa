// Accounts: login by a magic link, sessions (README 22.5).
export default {
  login: {
    emailLabel: 'Adresse email',
    emailInvalid: 'Adresse email invalide',
    submit: 'Recevoir un lien de connexion',
    sentTitle: 'Regarde ta boîte mail',
    sent: 'Si cette adresse est connue, un lien de connexion vient d’être envoyé. Il est valable 15 minutes et ne sert qu’une fois.',
    spamHint: 'Pense à regarder dans les indésirables.',
    again: 'Utiliser une autre adresse',
    devLink: 'Mode développement : ouvrir le lien de connexion',
  },
  landing: {
    tagline: 'Connecte-toi pour retrouver tes tirages ou en organiser un.',
    personalLink:
      'Tu as reçu un lien personnel ? Ouvre-le directement, il marche sans compte.',
  },
  home: {
    title: 'Accueil',
    draws: 'Mes tirages',
    drawsEmpty:
      'Aucun tirage pour l’instant. Dès qu’un organisateur t’ajoute à un tirage avec cette adresse, il apparaît ici.',
    groups: 'Mes groupes',
    allGroups: 'Tous les groupes',
    groupsEmpty: 'Aucun groupe pour l’instant.',
    newGroup: 'Nouveau groupe',
    admin: 'Administration',
  },
  confirm: {
    title: 'Connexion',
    body: 'Confirme pour te connecter sur cet appareil.',
    action: 'Se connecter',
    newLink: 'Demander un nouveau lien',
  },
  account: {
    title: 'Mon compte',
    superAdmin: 'Super-admin',
    devices: 'Mes appareils',
    devicesHint:
      'Les appareils sur lesquels ce compte est connecté. Une session dure 30 jours.',
    current: 'Cet appareil',
    unknownDevice: 'Appareil inconnu',
    lastSeen: 'Vu le {date}',
    revokeAll: 'Déconnecter partout',
    revokeAllHint: 'Ferme toutes les sessions, y compris celle-ci',
    revokeAllConfirm: 'Déconnecter tous les appareils ?',
  },
  email: {
    subject: 'Ton lien de connexion à Under the Tree',
    intro: 'Voici ton lien de connexion à Under the Tree :',
    validity: 'Il est valable 15 minutes et ne sert qu’une fois.',
    ignore:
      'Si tu n’as rien demandé, ignore ce message : personne ne peut se connecter sans ce lien.',
  },
};
