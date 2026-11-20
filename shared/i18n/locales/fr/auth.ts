// Accounts: login by a magic link, sessions (README 22.5).
export default {
  login: {
    tooMany: 'Trop de demandes d’un coup.',
    tooManyHelp:
      'Attends quelques minutes avant de réessayer. Si tu as déjà demandé un lien, regarde dans tes emails : il est valable 15 minutes.',
    emailLabel: 'Adresse email',
    emailHelp: 'Pas de mot de passe : tu reçois un lien valable 15 minutes.',
    emailInvalid: 'Cette adresse a l’air incomplète',
    submit: 'Recevoir un lien de connexion',
    sentTitle: 'Regarde ta boîte mail',
    again: 'Utiliser une autre adresse',
    devLink: 'Mode développement : ouvrir le lien de connexion',
    tabLogin: 'Se connecter',
    tabSignup: 'Créer un compte',
    signupSubmit: 'Créer mon compte',
    sentTo:
      'Lien envoyé à {email}. Il est valable 15 minutes et ne sert qu’une fois.',
    spamHint: 'Rien reçu ? Regarde dans les indésirables.',
    sameDevice: 'Ouvre le lien sur cet appareil : c’est lui qui sera connecté.',
    submitMine: 'Recevoir mon lien',
    sending: 'Envoi du lien…',
    emailPlaceholder: 'toi@exemple.fr',
  },
  landing: {
    tagline:
      'Le Secret Santa en famille, entre amis ou entre collègues : chacun découvre en secret à qui il offre un cadeau.',
    personalLink:
      'Tu as reçu un lien personnel ? Ouvre-le directement : il fonctionne sans compte.',
  },
  home: {
    party: {
      today: 'fête aujourd’hui',
      in: { one: 'fête demain', other: 'fête dans {count} jours' },
      on: 'fête le {date}',
    },
    drawCard: {
      partyOn: 'Fête le {date}',
      partyOnIn: {
        one: 'Fête le {date}, demain',
        other: 'Fête le {date}, dans {count} jours',
      },
      partyToday: 'Fête aujourd’hui',
    },
    requestWhy:
      'Under the Tree est en bêta : la création de groupes se fait sur demande, le temps de vérifier que tout fonctionne bien.',
    requestAction: 'Organiser un tirage',
    requestDescription: 'Pour qui veux-tu organiser un tirage ?',
    requestWhyTitle: 'Pourquoi une demande ?',
    requestReply: 'Un administrateur te répond par email.',
    requestLabel: 'Ta demande',
    requestPlaceholder: 'Le Noël de ma famille, une douzaine de personnes.',
    requestSend: 'Envoyer ma demande',
    requestSent: 'Demande envoyée',
    past: {
      title: 'Tirages passés',
      empty: 'Aucun tirage passé pour l’instant.',
    },
    journalSignal: {
      lead: 'Du nouveau au journal.',
      row: 'Du nouveau au journal',
      link_regenerated: 'Ton lien a été régénéré le {date}.',
      result_revealed: 'L’organisateur a regardé dans une enveloppe le {date}.',
      results_revealed:
        'Les résultats ont été dévoilés avant la fête, le {date}.',
      draw_cancelled: 'Le tirage a été annulé le {date}.',
      several: '{count} alertes depuis ta dernière visite.',
    },
  },
  admin: {
    accountsTitle: 'Comptes',
    approve: 'Accepter',
    refuse: 'Refuser',
    approved: 'Demande acceptée',
    refused: 'Demande refusée',
    accounts: { one: '{count} compte', other: '{count} comptes' },
    disabled: 'Désactivé',
    neverLoggedIn: 'Aucune connexion',
    quotaLabel: 'Groupes que ce compte peut créer',
    disabledHelp: 'Ce compte ne pourra plus se connecter',
    groupsEmpty: 'Aucun groupe pour l’instant.',
    search: 'Chercher un nom ou une adresse',
    noMatch: 'Aucun compte.',
    groupsCount: { one: '{count} groupe', other: '{count} groupes' },
    seenOn: 'dernière visite le {date}',
    toHandle: 'À traiter',
    requests: {
      one: '{count} demande en attente',
      other: '{count} demandes en attente',
    },
    load: {
      near: 'L’application approche de sa capacité gratuite (environ 50 groupes : 3 000 emails par mois chez Resend).',
      over: 'Un groupe de plus dépasse la capacité gratuite (environ 50 groupes : 3 000 emails par mois chez Resend). Les emails risquent de ne plus partir.',
    },
    quotaLess: 'Un groupe de moins',
    quotaMore: 'Un groupe de plus',
    disable: 'Désactiver le compte',
    disableConfirm:
      'Ce compte ne pourra plus se connecter et ses sessions seront fermées. Désactiver ?',
    restore: 'Réactiver le compte',
    restoreHelp: 'Ce compte pourra de nouveau se connecter',
    disabledDone: 'Compte désactivé',
    restored: 'Compte réactivé',
    requestSent: 'Envoyée le {date}',
    access: 'Accès',
    requestPending: 'Demande en attente',
    requestFrom: 'Demande de {name}',
    ifAccepted: 'Si tu acceptes',
    changeQuota: 'Groupes que ce compte peut créer',
    changeApp: 'Groupes dans l’application',
    loadOk:
      '{count} sur environ {max} groupes couverts par les offres gratuites.',
    title: 'Administration',
    reserved: 'Réservé aux super-admins',
    oneRequest: 'À traiter · 1 demande de groupe',
    onDay: 'le {date}',
    noRequest: 'Aucune demande à traiter',
    capacity: 'Capacité',
    capacityCount: {
      one: '{count} groupe sur {max} environ',
      other: '{count} groupes sur {max} environ',
    },
    capacityHint:
      'Au-delà, les offres gratuites ne suffisent plus (3 000 emails par mois).',
    ifAllAccepted: {
      one: 'Avec cette demande acceptée : {groups}.',
      other: 'Avec ces {count} demandes acceptées : {groups}.',
    },
    seeAll: 'Tout voir',
    groupsShort: 'Groupes',
    disabledCount: { one: '{count} désactivé', other: '{count} désactivés' },
    activeDraws: {
      one: '{count} tirage en cours',
      other: '{count} tirages en cours',
    },
    styleGuide: 'Guide de style',
    styleGuideHint: 'Outil du développeur',
    lastVisit: 'Dernière visite le {date}',
    mayCreate: { one: 'Peut en créer {count}', other: 'Peut en créer {count}' },
    created: { one: '{count} déjà créé', other: '{count} déjà créés' },
    left: { one: 'il lui en reste {count}', other: 'il lui en reste {count}' },
    members: { one: '{count} membre', other: '{count} membres' },
    draw: {
      preparing: 'à préparer',
      drawn: 'tirage fait',
      none: 'pas de tirage en cours',
      viewed: {
        one: '{count} sur {total} a ouvert son enveloppe',
        other: '{count} sur {total} ont ouvert leur enveloppe',
      },
    },
    role: { organizer: 'Organise', participant: 'Participe' },
    requestRefused: 'demande refusée',
    profileOwn:
      'Son profil (prénom, icône, langue) lui appartient : il ne se modifie pas d’ici.',
    activeAccounts: {
      one: '{count} compte actif',
      other: '{count} comptes actifs',
    },
    canCreate: {
      one: 'peut créer {count} groupe',
      other: 'peut créer {count} groupes',
    },
    noGroup: 'aucun groupe',
    requestsFirst:
      'Les demandes à traiter sont en premier, la plus ancienne d’abord.',
    disabledRow: 'Comptes désactivés',
    searchGroups: 'Chercher un groupe ou un organisateur',
    noGroupMatch: 'Aucun groupe.',
    noOrganizer: 'Pas encore d’organisateur',
    createFor: 'Créer un groupe pour quelqu’un',
    createForHint: 'Avec l’adresse de son organisateur',
    oneOf: 'À traiter · 1 sur {count}',
    handle: 'Traiter',
    note: {
      label: 'Un mot en réponse',
      optional: '(facultatif)',
      presets: 'Messages tout prêts',
      welcome: 'Bienvenue',
      welcomeText:
        'Bienvenue ! Tu peux créer ton groupe dès maintenant. Dis-moi si tu bloques quelque part.',
      full: 'C’est complet',
      fullText:
        'Désolé, l’application est complète pour cette année. Retente ta chance l’an prochain !',
      close: 'Entre proches',
      closeText:
        'Désolé, je réserve l’application à mes proches pour l’instant. Bon Noël quand même !',
      placeholder: 'Bienvenue ! Dis-moi si tu bloques.',
      hint: 'Ajouté à l’email qui annonce ta réponse.',
    },
  },
  confirm: {
    title: 'Connexion',
    action: 'Se connecter',
    newLink: 'Demander un nouveau lien',
    question: 'Se connecter sur cet appareil ?',
    bodyWith: 'Tu vas être connecté avec {email} pendant 30 jours.',
    notYours: 'Ce n’est pas ton appareil ? Ferme simplement cette page.',
    connecting: 'Connexion en cours…',
    invalidTitle: 'Ce lien ne marche plus',
    invalidBody:
      'Un lien de connexion est valable 15 minutes et ne sert qu’une fois. Demandes-en un nouveau, ça prend dix secondes.',
  },
  account: {
    profile: 'Mon profil',
    languageHelp: 'La langue de tes emails.',
    title: 'Mon compte',
    superAdmin: 'Super-admin',
    devices: 'Mes appareils',
    devicesHint: 'Une connexion dure 30 jours.',
    current: 'Cet appareil',
    unknownDevice: 'Appareil inconnu',
    lastSeen: 'Vu le {date}',
    revokeAll: 'Déconnecter partout',
    revokeOne: 'Déconnecter {device}',
    revoked: 'Appareil déconnecté',
    revokeAllHint: 'Y compris cet appareil',
    revokeAllConfirm: 'Déconnecter tous les appareils ?',
    firstNameHelp: 'Repris quand tu crées un groupe.',
    lastNameHelp: 'Facultatif. Te distingue d’un homonyme.',
    profileHint:
      'Ton prénom et ton icône sont repris quand tu rejoins ou crées un groupe. La langue est celle de tes emails.',
    language: 'Langue',
    connectedOn: 'Connecté le {date}',
    revokeShort: 'Déconnecter',
    logoutHere: 'Se déconnecter de cet appareil',
  },
  email: {
    subject: 'Ton lien de connexion à Under the Tree',
    intro: 'Voici ton lien de connexion à Under the Tree :',
    validity: 'Il est valable 15 minutes et ne sert qu’une fois.',
    ignore:
      'Tu n’as rien demandé ? Ignore ce message : sans ce lien, personne ne peut se connecter.',
  },
  requestEmail: {
    subject: 'Nouvelle demande de groupe sur Under the Tree',
    intro: '{email} demande à créer un groupe :',
    action: 'Pour répondre à la demande :',
  },
  decisionEmail: {
    approvedSubject: 'Tu peux créer ton groupe sur Under the Tree',
    approved: 'Ta demande a été acceptée : connecte-toi pour créer ton groupe.',
    refusedSubject: 'Ta demande de groupe sur Under the Tree',
    refused:
      'Ta demande de groupe a été refusée. Tu peux en faire une autre depuis l’application.',
    note: "Le mot de l'administrateur :",
  },
  invite: {
    intro: 'Tu es invité à la fête',
    party: 'le {date}',
    nameHelp: 'Le prénom que verront les autres.',
    loginFirst:
      'Connecte-toi avec ton adresse email pour la rejoindre. Pas encore de compte ? Il se crée tout seul.',
    joinGroup: 'Rejoindre la fête',
    signedAs: 'Connecté avec {email}',
    notMe: 'Ce n’est pas moi',
    organiserWord: {
      one: 'Le mot de l’organisateur',
      other: 'Le mot des organisateurs',
    },
    welcome: 'Bienvenue dans {group}',
    inDraw: 'Tu participes à {label}.',
    notDrawnYet: {
      one: 'Le tirage n’est pas encore fait : ton organisateur te fera signe.',
      other:
        'Le tirage n’est pas encore fait : tes organisateurs te feront signe.',
    },
    addLater: {
      one: 'Tu fais partie de la fête. Ton organisateur t’ajoutera au tirage de {label}.',
      other:
        'Tu fais partie de la fête. Tes organisateurs t’ajouteront au tirage de {label}.',
    },
    drawnAlready:
      'Tu fais partie de la fête. Le tirage de {label} est déjà fait : tu seras du prochain.',
    nextDraw: {
      one: 'Tu fais partie de la fête. Ton organisateur te fera signe pour le prochain tirage.',
      other:
        'Tu fais partie de la fête. Tes organisateurs te feront signe pour le prochain tirage.',
    },
    meanwhile: 'En attendant',
    hints: 'Laisser mes pistes de cadeaux',
    seeDraw: 'Voir mon tirage',
    goHome: 'Aller à mon accueil',
    findIt: 'Tu le retrouveras sur ton accueil en te connectant avec {email}.',
    joining: 'Inscription en cours…',
    full: {
      title: 'Il n’y a plus de place par ce lien',
      body: {
        one: 'Préviens l’organisateur de {group} : il peut rouvrir des places ou t’ajouter lui-même.',
        other:
          'Préviens les organisateurs de {group} : ils peuvent rouvrir des places ou t’ajouter eux-mêmes.',
      },
    },
    expired: {
      title: 'Ce lien d’invitation n’est plus valable',
      titleSince: 'Ce lien d’invitation n’est plus valable depuis le {date}',
      body: {
        one: 'Préviens l’organisateur de {group} : il peut le prolonger ou t’ajouter lui-même.',
        other:
          'Préviens les organisateurs de {group} : ils peuvent le prolonger ou t’ajouter eux-mêmes.',
      },
    },
    invalid: {
      title: 'Ce lien d’invitation ne marche plus',
      body: 'Demande un nouveau lien à la personne qui te l’a envoyé.',
    },
  },
};
