// Gift hints (README 22.11): the participant's page, the six questions,
// what the giver reads, the request and its emails.
export default {
  title: 'Mes pistes de cadeaux',
  intro: 'Aide la personne qui t’offre un cadeau. Tout est facultatif.',
  whoSees:
    'Seule la personne qui t’offre un cadeau les verra, une fois le tirage fait.',
  requested:
    'La personne qui t’offre un cadeau cherche l’inspiration. Six questions à choix suffisent, trente secondes.',
  readOnly: 'Tes pistes ne sont plus modifiables pour cette édition.',
  until: 'Tu peux les modifier jusqu’à la fête.',
  start: {
    label: 'Pour commencer',
    title: 'Six questions, trente secondes',
    examples: 'Utile ou surprenant ? Un objet ou un moment ?',
    body: 'Tu réponds d’un doigt, sans rien écrire.',
    action: 'Commencer',
  },
  copy: {
    action: 'Reprendre mes pistes de {edition}',
    hint: 'Tu pourras les retoucher',
    done: 'Pistes de {edition} reprises',
  },
  me: { title: 'Moi et les cadeaux', edit: 'Modifier' },
  question: {
    context: 'question {index} sur 6',
    later: 'Plus tard',
    both: 'Les deux me vont',
    footer: 'Un appui, et on passe à la suite. Tu pourras changer d’avis.',
    progress: 'Question {index} sur 6',
  },
  questions: {
    usefulOrSurprising: {
      title: 'Utile, ou surprenant ?',
      first: 'Utile',
      firstHelp: 'Quelque chose qui servira vraiment.',
      second: 'Surprenant',
      secondHelp: 'Ce que je n’aurais pas pensé à choisir.',
    },
    objectOrMoment: {
      title: 'Un objet, ou un moment ?',
      first: 'Un objet',
      firstHelp: 'Quelque chose à garder ou à utiliser.',
      second: 'Un moment',
      secondHelp: 'Une sortie, un repas, un atelier.',
    },
    keepOrConsume: {
      title: 'À garder, ou à consommer ?',
      first: 'À garder',
      firstHelp: 'Quelque chose qui dure.',
      second: 'À consommer',
      secondHelp: 'À manger, à boire, à utiliser jusqu’au bout.',
    },
    selfOrShared: {
      title: 'Pour moi, ou à partager ?',
      first: 'Pour moi',
      firstHelp: 'Rien que pour moi.',
      second: 'À partager',
      secondHelp: 'Avec mes proches, à plusieurs.',
    },
    secondHand: {
      title: 'D’occasion ou fait main, ça te va ?',
      first: 'Oui, ça me va',
      firstHelp: 'Une seconde main, un objet fait maison.',
      second: 'Plutôt du neuf',
      secondHelp: 'Un objet neuf, dans son emballage.',
    },
    surprise: {
      title: 'Surprends-moi, ou je préfère savoir ?',
      first: 'Surprends-moi',
      firstHelp: 'Je découvrirai le jour de la fête.',
      second: 'Je préfère savoir',
      secondHelp: 'Une idée précise, pas de mauvaise surprise.',
    },
  },
  // What the giver reads, one tag per answer.
  tags: {
    usefulOrSurprising: {
      first: 'Plutôt utile',
      second: 'Plutôt surprenant',
      both: 'Utile ou surprenant',
    },
    objectOrMoment: {
      first: 'Un objet',
      second: 'Un moment',
      both: 'Un objet ou un moment',
    },
    keepOrConsume: {
      first: 'À garder',
      second: 'À consommer',
      both: 'À garder ou à consommer',
    },
    selfOrShared: {
      first: 'Pour soi',
      second: 'À partager',
      both: 'Pour soi ou à partager',
    },
    secondHand: {
      first: 'D’occasion, oui',
      second: 'Plutôt du neuf',
      both: 'Neuf ou d’occasion',
    },
    surprise: {
      first: 'J’aime la surprise',
      second: 'Préfère savoir',
      both: 'Surprise ou pas',
    },
  },
  texts: {
    lately: {
      title: 'En ce moment',
      empty: 'Dire ce qui m’occupe',
      help: 'Ce qui t’occupe ou te fait envie ces temps-ci. Pas besoin d’objets précis.',
      placeholder: 'Un loisir qui démarre, une lecture, un projet…',
      giver: 'En ce moment',
    },
    wouldHelp: {
      title: 'Ce qui me servirait',
      empty: 'Dire ce qui me servirait',
      help: 'Ce qui te rendrait service au quotidien.',
      placeholder: 'Ce que tu utilises tous les jours, ce qui te manque…',
      giver: 'Ce qui lui servirait',
    },
    avoid: {
      title: 'J’évite, ou j’ai déjà',
      empty: 'Dire ce que j’évite',
      help: 'Ce qu’il vaut mieux ne pas t’offrir.',
      placeholder: 'Une allergie, ce que tu as en trop…',
      giver: 'À éviter',
    },
  },
  ideas: {
    title: 'Une idée précise, si tu sèches',
    giver: 'Si tu sèches',
    add: 'Ajouter une idée',
    addHint: 'Un objet, avec un lien si tu veux',
    left: {
      one: 'Encore {count} possible',
      other: 'Encore {count} possibles',
    },
    why: 'Une idée précise ne gâche rien : beaucoup préfèrent offrir à coup sûr.',
  },
  // On the giver's result.
  result: {
    title: 'Pour t’aider à choisir',
    none: '{name} n’a pas encore laissé de pistes.',
    ask: 'Lui demander des pistes',
    askHint: 'Sans dire que ça vient de toi.',
    sent: 'Demande envoyée.',
    sentEmail:
      '{name} vient de recevoir un email, sans savoir que ça vient de toi.',
    sentPage:
      '{name} le verra sur sa page de pistes, sans savoir que ça vient de toi.',
    willEmail: 'Tu recevras un email dès que des pistes arrivent.',
    willSee: 'Reviens ici : les pistes s’afficheront dès qu’elles arrivent.',
    waiting: 'Des pistes de cadeaux t’attendent.',
  },
  request: {
    title: 'Demander des pistes à {name} ?',
    bodyEmail:
      '{name} reçoit un email qui l’invite à noter ses goûts et ce qu’il vaut mieux éviter.',
    bodyPage:
      '{name} le verra sur sa page de pistes, qui l’invite à noter ses goûts et ce qu’il vaut mieux éviter.',
    anonymous: 'Ton nom n’apparaît nulle part',
    anonymousHelp:
      'Ni dans l’email, ni dans le journal, ni pour l’organisateur.',
    once: 'Une seule demande par tirage',
    onceHelp: 'Pas de relance possible : personne n’est harcelé.',
    send: 'Envoyer la demande',
    sending: 'Envoi de la demande…',
    cancel: 'Pas maintenant',
  },
  // Lines that say where someone's hints stand.
  state: {
    none: 'Rien pour l’instant',
    filledEditable: 'Remplies · modifiables jusqu’à la fête',
    filledLocked: 'Remplies · plus modifiables',
    left: 'A laissé des pistes',
  },
  setting: {
    title: 'Pistes de cadeaux',
    help: 'Ce que chacun peut noter pour aider la personne qui lui offre un cadeau.',
    full: 'Portrait et idées précises',
    fullHelp: 'Les six questions, les envies du moment, et des idées d’objets',
    portrait: 'Portrait seulement',
    portraitHelp: 'Sans idée d’objet : la surprise reste entière',
    none: 'Aucune piste',
    noneHelp: 'Chacun se débrouille',
  },
  email: {
    request: {
      subject: 'Quelqu’un cherche une idée de cadeau pour toi',
      greeting: 'Bonjour {name},',
      body: 'La personne qui t’offre un cadeau pour {edition} ({group}) ne sait pas quoi choisir. Aide-la : six questions à choix, trente secondes, et quelques mots si tu veux.',
      cta: 'Donner quelques pistes :',
      anonymous: 'On ne te dira pas qui demande : c’est un Secret Santa.',
      once: 'Tu ne recevras ce message qu’une fois.',
    },
    arrived: {
      subject: 'Des pistes de cadeaux t’attendent',
      greeting: 'Bonjour {name},',
      body: 'La personne à qui tu offres un cadeau pour {edition} ({group}) a laissé des pistes. Ouvre ton lien pour les lire :',
    },
  },
};
