// The participant's side: personal page, wish list, journal.
export default {
  home: {
    greeting: 'Salut {firstName} !',
    changeAvatar: 'Changer mon icône',
    waiting: {
      title: "Le tirage n'a pas encore eu lieu",
      body: "Ton organisateur te préviendra. Garde ce lien : c'est ici que tu découvriras à qui tu offres un cadeau.",
      wishes:
        'En attendant, note quelques idées de cadeaux pour la personne qui te tirera au sort.',
    },
    ready: {
      title: 'Le tirage est fait !',
      body: 'Assure-toi que personne ne regarde ton écran.',
      revealAgain: "Revoir à qui j'offre un cadeau",
      ideasWaiting: {
        one: 'Sa liste contient {count} idée de cadeau.',
        other: 'Sa liste contient {count} idées de cadeaux.',
      },
      reveal: "Découvrir à qui j'offre un cadeau",
      hide: 'Cacher mon résultat',
    },
    closed: 'Cette édition est clôturée.',
    wishes: {
      title: 'Ma liste de souhaits',
      help: 'Aide la personne qui t’a tiré·e au sort',
      none: 'Aucune idée',
    },
    journal: {
      title: 'Journal du groupe',
      subtitle: "Tout ce qui s'est passé, à la vue de tous",
    },
    avatar: {
      title: 'Mon icône',
      description: 'Choisis ton emoji et ta couleur.',
    },
  },
  reveal: {
    youGiveTo: 'Tu offres un cadeau à',
    budget: 'Budget',
    date: 'Date',
    ideas: 'Ses idées de cadeaux',
    noIdeas: "{name} n'a pas encore donné d'idée.",
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
    intro: 'Tout le monde voit ce journal. Il ne dit jamais qui offre à qui.',
    allEditions: 'Toutes les éditions',
    edition: 'Édition',
    empty: "Rien à signaler pour l'instant.",
  },
  invalid: { title: 'Oups' },
};
