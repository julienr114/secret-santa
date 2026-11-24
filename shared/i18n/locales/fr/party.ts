// The party (V3, ticket 104). « fête » is written here only, in keys easy
// to change (Q-001).
export default {
  category: {
    christmas: 'Noël',
    birthday: 'Anniversaire',
    birth: 'Naissance',
    wedding: 'Mariage',
    housewarming: 'Crémaillère',
    other: 'Autre',
  },
  everyYear: 'tous les ans',
  inDays: { one: 'dans {count} jour', other: 'dans {count} jours' },
  today: 'aujourd’hui',
  // A birthday made for one of my people (ticket 118): their age.
  age: {
    theirs: { one: 'ses {count} an', other: 'ses {count} ans' },
    mine: { one: 'tes {count} an', other: 'tes {count} ans' },
    pastTheirs: { one: 'Ses {count} an', other: 'Ses {count} ans' },
    pastMine: { one: 'Tes {count} an', other: 'Tes {count} ans' },
  },
  members: { one: '{count} membre', other: '{count} membres' },
  settings: 'Réglages de l’événement',
  secretSantaTitle: { one: 'Le Secret Santa', other: 'Les Secret Santa' },
  full: {
    count: '{count} sur {max}',
    title: 'L’événement est complet',
    text: '{max} membres, c’est le maximum',
    paused: 'En pause · l’événement est complet',
  },
  secretSanta: {
    row: 'Le Secret Santa {year}',
    another: 'Un autre Secret Santa',
    organise: 'Créer un Secret Santa',
    context: 'Secret Santa {year}',
    settings: 'Réglages',
    drawSection: 'Le tirage au sort',
    guessRow: 'Pronostics',
    messagesSection: 'Les messages',
    joined: 'Quelqu’un s’inscrit par le lien',
    allViewed: 'Tout le monde a découvert son tirage',
    whichParty: 'L’événement du Secret Santa',
    otherOccasion: 'Une autre occasion',
    already: 'déjà un Secret Santa cette année',
    paused: {
      title: 'Les nouveaux Secret Santa sont en pause',
      text: 'Ceux qui existent continuent. Reviens dans quelques jours.',
    },
    limit: {
      title: 'Tu organises déjà {count} Secret Santa',
      text: 'C’est le maximum pour un compte.',
      drawn: 'tirage fait',
      preparing: 'pas encore tiré',
    },
  },
  lists: {
    title: 'Les listes',
    titleSomeone: 'Sa liste',
    none: 'Personne n’a encore mis de liste dans cet événement.',
    new: 'Créer une liste de cadeaux',
    resume: 'Reprendre ma liste de l’an dernier',
  },
  // The years over (ticket 108, V3FetesPassees, V3FeteAnneePassee).
  past: {
    years: 'Les années passées',
    empty: 'Aucun événement passé pour l’instant.',
    gaveTo: 'Tu offrais à {name}',
    gaveToTwo: 'Tu offrais à {name} et à {other}',
    offered: {
      one: 'Tu as offert {count} cadeau',
      other: 'Tu as offert {count} cadeaux',
    },
    received: {
      one: '{count} cadeau offert',
      other: '{count} cadeaux offerts',
    },
    receivedFor: {
      one: '{count} cadeau offert à {name}',
      other: '{count} cadeaux offerts à {name}',
    },
    game: 'Devine qui',
    palmares: 'Le palmarès',
  },
  leave: {
    row: 'Quitter cet événement',
    title: 'Quitter « {name} » ?',
    listsElsewhere: {
      one: 'Ta liste sortira de cet événement. Elle reste dans tes autres événements.',
      other:
        'Tes listes sortiront de cet événement. Elles restent dans tes autres événements.',
    },
    listsAlone: {
      one: 'Ta liste sortira de cet événement. Toi seul la verras, tant que tu ne l’as pas mise ailleurs.',
      other:
        'Tes listes sortiront de cet événement. Toi seul les verras, tant que tu ne les as pas mises ailleurs.',
    },
    ticks: 'Les cadeaux que tu as cochés restent prévus.',
    secretSanta: 'Tu ne participeras plus à son Secret Santa l’an prochain.',
    confirm: 'Quitter l’événement',
    stay: 'Rester',
    done: 'Tu as quitté « {name} »',
  },
  create: {
    title: 'Pour quelle occasion ?',
    forWhom: 'Pour qui ?',
    me: 'Moi',
    someoneElse: 'Quelqu’un d’autre',
    name: 'Son nom',
    date: 'Sa date',
    recurring: 'Elle revient chaque année',
    continue: 'Continuer',
    birthdayOf: 'L’anniversaire de {name}',
    myBirthday: 'Mon anniversaire',
  },
  // « Qui reprendre ? » (V3FeteMembresReprendre, ticket 117): for a Secret
  // Santa or a list, never for the event alone.
  take: {
    row: 'Reprendre ceux d’un autre événement',
    rowHint: 'Tu coches qui',
    title: 'Qui reprendre ?',
    from: 'Ceux de',
    noEmail: 'Pas d’adresse email',
    choose: 'Reprendre {name}',
    submit: {
      one: 'Ajouter · {count} personne',
      other: 'Ajouter · {count} personnes',
    },
    done: {
      one: '{count} personne ajoutée',
      other: '{count} personnes ajoutées',
    },
    none: 'Personne de nouveau à ajouter',
  },
  reglages: {
    party: 'L’événement',
    category: 'Catégorie',
    forWhom: 'Pour',
    nobody: 'Personne',
    date: 'Date',
    dateValue: 'Le {date} · proposée chaque année',
    dateValueOnce: 'Le {date}',
    recurring: 'Revient chaque année',
    short: 'Réglages',
  },
};
