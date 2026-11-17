// The participant's side: personal page, journal.
export default {
  home: {
    greeting: 'Salut {firstName} !',
    facts: { budget: 'Budget :', party: 'Fête le' },
    note: { title: "Le mot de l'organisateur", more: 'Lire la suite' },
    changeAvatar: 'Changer mon icône',
    steps: {
      label: 'Étapes du tirage',
      invitation: 'Invitation',
      drawSoon: 'Tirage · bientôt',
      answer: 'Ta réponse',
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
      action: 'Laisser mes pistes de cadeaux',
      hint: 'En attendant, aide la personne qui te tirera au sort.',
    },
    ready: {
      title: "Ton enveloppe t'attend",
      body: "Le tirage est fait. Assure-toi que personne ne regarde ton écran avant de l'ouvrir.",
      bodyHints:
        'Le tirage est fait, et des pistes de cadeaux t’attendent à l’intérieur. Assure-toi que personne ne regarde ton écran avant de l’ouvrir.',
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
      bodyHints:
        'Ses pistes de cadeaux t’attendent à l’intérieur. Assure-toi que personne ne regarde ton écran.',
      newTitle: 'De nouvelles pistes t’attendent',
      newBody:
        'La personne à qui tu offres en a laissé depuis ta dernière visite. Assure-toi que personne ne regarde ton écran.',
      revealWithHints: 'Revoir mon résultat et ses pistes',
      noHintsYet: 'Pas encore de pistes. Tu pourras lui en demander.',
      revealAgain: "Revoir à qui j'offre un cadeau",
    },
    closed: {
      title: 'La fête est passée',
      body: 'Cette édition est clôturée. Tu peux encore revoir à qui tu as offert un cadeau.',
      bodyNotSeen:
        'Cette édition est clôturée. Tu peux encore découvrir à qui tu offrais un cadeau.',
    },
    tiles: {
      hintsTodo: 'À remplir',
      hintsEditable: 'Remplies, modifiables jusqu’à la fête',
      hintsLocked: 'Remplies, plus modifiables',
      hintsShort: 'Remplies',
      hintsNone: 'Rien laissé',
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
    seeLink: 'Voir le lien',
  },
  wishes: {
    openLink: 'Ouvrir le lien de « {label} »',
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
  // A draw made elsewhere (README 22.12): saying who they give to.
  answer: {
    card: {
      title: 'À qui offres-tu un cadeau ?',
      body: 'Le tirage a été fait hors de l’application. Dis-le ici pour voir ses pistes de cadeaux. Assure-toi que personne ne regarde ton écran.',
      action: 'Dire à qui j’offre',
      hint: 'Ta réponse reste secrète, même pour l’organisateur.',
      savedTitle: 'Réponse enregistrée',
      savedBody: {
        one: 'Tu verras les pistes de cadeaux de ta personne quand tout le monde aura répondu. {count} réponse sur {total} pour l’instant.',
        other:
          'Tu verras les pistes de cadeaux de ta personne quand tout le monde aura répondu. {count} réponses sur {total} pour l’instant.',
      },
      review: 'Revoir ou corriger ma réponse',
      savedHint:
        'Ta réponse reste cachée : elle ne s’affiche que si tu le demandes.',
    },
    choose: {
      title: 'À qui offres-tu un cadeau ?',
      description:
        'La personne que tu as tirée, sur papier ou dans l’autre application.',
      search: 'Chercher un prénom',
      results: {
        one: '{shown} prénom sur {total}',
        other: '{shown} prénoms sur {total}',
      },
    },
    confirm: {
      title: 'Tu offres un cadeau à {name} ?',
      description:
        'Vérifie bien : c’est la personne que tu as tirée, sur papier ou dans l’autre application.',
      note: 'Tu pourras corriger ta réponse tant que l’organisateur n’a pas validé le tirage. Personne d’autre ne la voit.',
      yes: 'Oui, c’est {name}',
      other: 'Choisir quelqu’un d’autre',
    },
    saved: 'Réponse enregistrée',
  },
};
