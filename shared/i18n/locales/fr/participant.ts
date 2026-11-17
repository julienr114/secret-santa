// The participant's side: personal page, wish list, journal.
export default {
  home: {
    greeting: 'Salut {firstName} !',
    changeAvatar: 'Changer mon icône',
    steps: {
      label: 'Étapes du tirage',
      invitation: 'Invitation',
      drawSoon: 'Tirage · bientôt',
      drawDone: 'Tirage fait',
      party: 'Fête',
      partyIn: {
        one: 'Fête · dans {count} jour',
        other: 'Fête · dans {count} jours',
      },
      partyToday: "Fête · aujourd'hui",
      partyOver: 'Fête passée',
    },
    waiting: {
      title: "Le tirage n'a pas encore eu lieu",
      body: "Ton organisateur te préviendra. Garde ce lien : c'est ici que tu découvriras à qui tu offres un cadeau.",
      action: 'Noter mes idées de cadeaux',
      hint: 'En attendant, aide la personne qui te tirera au sort.',
    },
    ready: {
      title: "Ton enveloppe t'attend",
      body: "Le tirage est fait. Assure-toi que personne ne regarde ton écran avant de l'ouvrir.",
      reveal: "Découvrir à qui j'offre un cadeau",
      revealing: 'Ouverture de l’enveloppe…',
      hint: 'Ton résultat se referme dès que tu quittes la page.',
    },
    shown: {
      hide: 'Cacher mon résultat',
      hint: 'Il se referme tout seul quand tu quittes la page.',
    },
    seen: {
      title: 'Tu sais déjà à qui tu offres',
      body: 'Un trou de mémoire ? Assure-toi que personne ne regarde ton écran.',
      revealAgain: "Revoir à qui j'offre un cadeau",
      ideasWaiting: {
        one: 'Sa liste contient {count} idée de cadeau.',
        other: 'Sa liste contient {count} idées de cadeaux.',
      },
    },
    closed: {
      title: 'La fête est passée',
      body: 'Cette édition est clôturée. Tu peux encore revoir à qui tu as offert un cadeau.',
      bodyNotSeen:
        'Cette édition est clôturée. Tu peux encore découvrir à qui tu offrais un cadeau.',
    },
    wishes: {
      title: 'Ma liste de souhaits',
      help: 'Aide la personne qui t’a tiré·e au sort',
      none: 'Aucune idée',
      editable: {
        one: "{count} idée · modifiable jusqu'à la fête",
        other: "{count} idées · modifiables jusqu'à la fête",
      },
      locked: {
        one: '{count} idée · plus modifiable',
        other: '{count} idées · plus modifiables',
      },
    },
    journal: {
      title: 'Journal du groupe',
      subtitle: "Tout ce qui s'est passé, à la vue de tous",
      alerts: {
        one: '{count} alerte depuis ta dernière visite',
        other: '{count} alertes depuis ta dernière visite',
      },
    },
  },
  reveal: {
    youGiveTo: 'Tu offres un cadeau à',
    budget: 'Budget',
    date: 'Date',
    guardianMessage: "Le mot de l'organisateur",
    ideas: 'Ses idées de cadeaux',
    noIdeas: "{name} n'a pas encore donné d'idée.",
    seeLink: 'Voir le lien',
  },
  wishes: {
    title: 'Ma liste de souhaits',
    intro:
      "Quelques idées pour aider la personne qui t'offre un cadeau. Elle seule les verra.",
    readOnly: "La liste n'est plus modifiable pour cette édition.",
    max: '{count} idées au plus.',
    empty: 'Aucune idée pour l’instant.',
    emptyReadOnly: "Tu n'avais noté aucune idée.",
    openLink: 'Ouvrir le lien de « {label} »',
    add: 'Ajouter une idée',
    sheet: {
      new: 'Nouvelle idée',
      edit: 'Modifier l’idée',
      description: 'Une idée courte, et un lien si tu en as un.',
      idea: 'Idée',
      ideaPlaceholder: 'Un livre, des chaussettes…',
      link: 'Lien (facultatif)',
      remove: 'Supprimer l’idée',
    },
  },
  journal: {
    title: 'Journal du groupe',
    intro: 'Tout le groupe voit ce journal. Il ne dit jamais qui offre à qui.',
    allEditions: 'Toutes les éditions',
    edition: 'Édition',
    empty: "Rien à signaler pour l'instant.",
  },
  invalid: { title: 'Oups, ce lien ne marche plus' },
  account: {
    title: 'Garde tes tirages au même endroit',
    body: 'Crée un compte avec ton adresse email : tu retrouveras ce tirage, et les suivants, sans chercher le lien.',
    bodyClaim:
      'Ajoute ce tirage à ton compte pour le retrouver depuis ton accueil.',
    create: 'Créer mon compte',
    claim: 'Ajouter à mon compte',
    added: 'Tirage ajouté à ton compte',
    sendTo: 'Recevoir mon lien à {email}',
    sent: 'Lien envoyé à {email} : ouvre-le pour créer ton compte. Pense à regarder dans les indésirables.',
  },
};
