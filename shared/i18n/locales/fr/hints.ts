// Gift hints (README 22.11): the participant's page, the six questions,
// what the giver reads, the request and its emails.
export default {
  title: 'Mes idées de cadeaux',
  intro:
    'Donne un coup de pouce à la personne qui t’offre un cadeau. Tout est facultatif.',
  whoSees:
    'Seule la personne qui t’offre un cadeau les verra, une fois le tirage fait.',
  requested: {
    title: 'La personne qui t’offre un cadeau cherche l’inspiration.',
    body: 'Six questions à choix suffisent, trente secondes.',
    bodyPortrait: 'Cinq questions à choix suffisent, trente secondes.',
  },
  readOnly: 'Tes idées ne bougent plus : c’est terminé pour cette année.',
  until: 'Tu peux les modifier jusqu’au jour J.',
  start: {
    label: 'Pour commencer',
    title: 'Six questions, trente secondes',
    titlePortrait: 'Cinq questions, trente secondes',
    examples: 'Utile ou surprenant ? Un objet ou un moment ?',
    body: 'Tu réponds d’un doigt, sans rien écrire.',
    action: 'Commencer',
  },
  copy: {
    action: 'Reprendre mes idées de {edition}',
    hint: 'Tu pourras les retoucher',
    done: 'Idées de {edition} reprises',
  },
  me: {
    title: 'Côté cadeaux, je préfère…',
    context: 'Moi et les cadeaux',
  },
  question: {
    context: 'question {index} sur {count}',
    clear: 'Effacer ma réponse',
    later: 'Plus tard',
    both: 'Les deux me vont',
    footer: 'Un appui, et on passe à la suite. Tu pourras changer d’avis.',
    progress: 'Question {index} sur {count}',
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
      firstHelp: 'Quelque chose de concret, que je déballe.',
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
      firstHelp: 'Un plaisir personnel.',
      second: 'À partager',
      secondHelp: 'Un jeu, un repas, quelque chose à plusieurs.',
    },
    secondHand: {
      title: 'Neuf, ou d’occasion ?',
      first: 'D’occasion ou fait main',
      firstHelp: 'Une seconde main, un objet fait maison : j’aime ça.',
      second: 'Neuf',
      secondHelp: 'Un objet neuf, dans son emballage.',
    },
    surprise: {
      title: 'Surprends-moi, ou je préfère savoir ?',
      first: 'Surprends-moi',
      firstHelp: 'Je découvrirai le jour J.',
      second: 'Je préfère savoir',
      secondHelp: 'Je donne une idée précise plus bas.',
    },
  },
  // What the giver reads, one tag per answer.
  // The answers on the participant's own page, ending the sentence of
  // `me.title`, in lower case.
  tags: {
    usefulOrSurprising: {
      first: 'un cadeau utile',
      second: 'un cadeau surprenant',
      both: 'utile ou surprenant, peu importe',
    },
    objectOrMoment: {
      first: 'un objet',
      second: 'un moment',
      both: 'un objet ou un moment',
    },
    keepOrConsume: {
      first: 'quelque chose à garder',
      second: 'quelque chose à consommer',
      both: 'à garder ou à consommer',
    },
    selfOrShared: {
      first: 'un cadeau pour moi',
      second: 'un cadeau à partager',
      both: 'pour moi ou à partager',
    },
    secondHand: {
      first: 'l’occasion ou le fait main',
      second: 'le neuf',
      both: 'neuf ou d’occasion',
    },
    surprise: {
      first: 'la surprise',
      second: 'savoir à l’avance',
      both: 'surprise ou pas',
    },
  },
  // What the giver reads of « Moi et les cadeaux », in sentences.
  giver: {
    prefers: '{name} préfère :',
    choices: {
      usefulOrSurprising: {
        first: 'un cadeau utile plutôt que surprenant',
        second: 'un cadeau surprenant plutôt qu’utile',
      },
      objectOrMoment: {
        first: 'un objet plutôt qu’un moment',
        second: 'un moment plutôt qu’un objet',
      },
      keepOrConsume: {
        first: 'quelque chose à garder plutôt qu’à consommer',
        second: 'quelque chose à consommer plutôt qu’à garder',
      },
      selfOrShared: {
        first: 'un cadeau pour soi plutôt qu’à partager',
        second: 'un cadeau à partager plutôt que pour soi',
      },
    },
    secondHand: {
      first: 'D’occasion ou fait main, volontiers.',
      second: 'Plutôt du neuf que de l’occasion.',
    },
    surprise: {
      first: '{name} aime la surprise.',
      second: '{name} préfère savoir ce qu’on lui offre.',
    },
    // The subject of « {subject} : peu importe. ».
    subjects: {
      usefulOrSurprising: 'Utile ou surprenant',
      objectOrMoment: 'Un objet ou un moment',
      keepOrConsume: 'À garder ou à consommer',
      selfOrShared: 'Pour soi ou à partager',
      secondHand: 'Neuf ou d’occasion',
      surprise: 'Surprise ou pas',
    },
    indifferent: '{subject} : peu importe.',
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
    title: 'Une idée précise, au cas où',
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
  list: {
    title: 'Ma liste de cadeaux',
    help: 'La personne qui t’offre un cadeau verra un lien vers elle. Ce qu’elle y coche est anonyme : personne ne saura que c’est elle, pas même toi.',
    add: 'Relier une liste de cadeaux',
    addHint: 'La personne qui t’offre un cadeau verra un lien vers elle',
    change: 'Changer',
    mine: 'Ta liste, publiée',
    figuring: 'Une liste où tu figures, publiée',
    published: 'Publiée',
    unshared: 'Elle n’est plus publiée : le lien ne s’affiche plus.',
    login: 'Connecte-toi pour relier une de tes listes de cadeaux.',
    loginAction: 'Me connecter',
    sheetTitle: 'Quelle liste ?',
    sheetHelp:
      'Les listes que tu tiens, et celles où tu figures. Seule une liste publiée peut être reliée.',
    rowMine: 'Ta liste · publiée',
    rowFiguring: 'La liste de {name} · tu y figures',
    rowDraft: 'Brouillon : publie-la d’abord',
    none: 'Aucune liste',
    validate: 'Valider',
    untitled: 'Liste sans nom',
    done: 'Liste reliée à tes idées',
    removed: 'Plus de liste reliée à tes idées',
  },
  result: {
    listOf: 'La liste de cadeaux de {name}',
    newIdeas: {
      one: '{count} nouvelle idée depuis ta dernière visite',
      other: '{count} nouvelles idées depuis ta dernière visite',
    },
    nothing: '{name} n’a encore rien écrit.',
    list: 'Sa liste de cadeaux : {title}',
    listHelp: 'Le mode anonyme y sera activé pour toi.',
    title: 'Pour t’aider à choisir',
    isNew: 'Nouveau',
    updatedOn: 'Idées mises à jour le {date}',
    none: '{name} n’a pas encore laissé d’idées.',
    ask: 'Lui demander des idées',
    sentEmailNamed: '{name} vient de recevoir un email.',
    sentPageNamed: '{name} le verra sur sa page d’idées.',
    askHint: 'Sans dire que ça vient de toi.',
    sent: 'Demande envoyée.',
    sentEmail:
      '{name} vient de recevoir un email, sans savoir que ça vient de toi.',
    sentPage:
      '{name} le verra sur sa page d’idées, sans savoir que ça vient de toi.',
    willEmail: 'Tu recevras un email dès que des idées arrivent.',
    willSee: 'Reviens ici : les idées s’afficheront dès qu’elles arrivent.',
  },
  request: {
    title: 'Demander des idées à {name} ?',
    bodyEmail:
      '{name} reçoit un email qui l’invite à noter ses goûts et ce qu’il vaut mieux éviter.',
    bodyPage:
      '{name} le verra sur sa page d’idées, qui l’invite à noter ses goûts et ce qu’il vaut mieux éviter.',
    named: 'Ton nom est donné',
    namedHelp:
      'Le tirage est dévoilé : {name} saura que la demande vient de toi.',
    anonymous: 'Ton nom n’apparaît nulle part',
    anonymousHelp: {
      one: 'Ni dans l’email, ni dans le journal, ni pour l’organisateur.',
      other: 'Ni dans l’email, ni dans le journal, ni pour les organisateurs.',
    },
    once: 'Une seule demande par Secret Santa',
    onceHelp: 'Pas de relance possible : on ne harcèle personne.',
    send: 'Envoyer la demande',
    sending: 'Envoi de la demande…',
    cancel: 'Pas maintenant',
  },
  // Lines that say where someone's hints stand.
  state: {
    hintsLeft: {
      one: '{count} sur {total} a laissé des idées',
      other: '{count} sur {total} ont laissé des idées',
    },
    none: 'Rien pour l’instant',
    filledEditable: 'Remplies · modifiables jusqu’au jour J',
    filledLocked: 'Remplies · plus modifiables',
    left: 'A laissé des idées',
  },
  setting: {
    title: 'Idées de cadeaux',
    help: 'Ce que chacun peut noter pour aider la personne qui lui offre un cadeau.',
    full: 'Portrait et idées précises',
    fullHelp: 'Les six questions, les envies du moment, et des idées d’objets',
    portrait: 'Portrait seulement',
    portraitHelp: 'Sans idée d’objet : la surprise reste entière',
    none: 'Aucune idée',
    noneHelp: 'Chacun se débrouille',
  },
  email: {
    request: {
      subject:
        'Secret Santa de {group} : quelqu’un cherche une idée de cadeau pour toi',
      greeting: 'Bonjour {name},',
      body: 'La personne qui t’offre un cadeau pour {edition} ({group}) ne sait pas quoi choisir. Aide-la : six questions à choix, trente secondes, et quelques mots si tu veux.',
      bodyPortrait:
        'La personne qui t’offre un cadeau pour {edition} ({group}) ne sait pas quoi choisir. Aide-la : cinq questions à choix, trente secondes, et quelques mots si tu veux.',
      subjectFrom:
        'Secret Santa de {group} : {from} cherche une idée de cadeau pour toi',
      bodyFrom:
        '{from} t’offre un cadeau pour {edition} ({group}) et ne sait pas quoi choisir. Un coup de main ? Six questions à choix, trente secondes, et quelques mots si tu veux.',
      bodyPortraitFrom:
        '{from} t’offre un cadeau pour {edition} ({group}) et ne sait pas quoi choisir. Un coup de main ? Cinq questions à choix, trente secondes, et quelques mots si tu veux.',
      cta: 'Donner quelques idées :',
      anonymous: 'On ne te dira pas qui demande : c’est un Secret Santa.',
      once: 'Tu ne recevras ce message qu’une fois.',
    },
    arrived: {
      subject: 'Secret Santa de {group} : des pistes de cadeaux t’attendent',
      greeting: 'Bonjour {name},',
      body: 'La personne à qui tu offres un cadeau pour {edition} ({group}) a laissé des idées. Ouvre ton lien pour les lire :',
    },
  },
};
