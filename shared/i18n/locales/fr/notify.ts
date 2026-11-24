// Emails: the reminder to the organisers (README 22.2), and the emails of
// the news of an account, one by one or in the morning summary (ticket
// 121, NotifEmailResume). Never who asks for ideas, never a result.
export default {
  reminder: {
    subject: 'le jour J approche',
    body: '{edition}, c’est le {date}.',
    missing: {
      one: '{count} personne n’a pas encore ouvert son enveloppe : {names}.',
      other:
        '{count} personnes n’ont pas encore ouvert leur enveloppe : {names}.',
    },
    next: 'Tu peux leur renvoyer leur lien depuis le Secret Santa.',
  },
  hello: 'Bonjour {firstName},',
  helloNoName: 'Bonjour,',
  settings: 'Changer ce réglage',
  // The foot of every email (ticket 130, StopEmail).
  foot: {
    first:
      'Ce que l’application sait de toi : ton prénom et cette adresse. Rien d’autre.',
    firstBy:
      'Ce que l’application sait de toi : ton prénom et cette adresse, donnés par {name}. Rien d’autre.',
    stopAsk: 'Tu ne veux pas de ces emails ?',
    stop: 'Ne plus recevoir d’emails d’Under the Tree',
    reportAsk: 'Cet envoi te semble anormal ?',
    reportAskBy: 'Tu ne connais pas {name} ?',
    report: 'Signaler cet envoi',
  },
  // To the super-admins, at 70 % of a cap of the emails (ticket 129).
  capWarning: {
    subject: {
      day: 'Under the Tree : 70 % des emails du jour',
      month: 'Under the Tree : 70 % des emails du mois',
    },
    body: {
      day: '{used} emails envoyés aujourd’hui, sur {cap}.',
      month: '{used} emails envoyés ce mois-ci, sur {cap}.',
    },
    next: 'À 100 % du mois, les emails se suspendent tout seuls, sauf les liens de connexion.',
  },
  unfollow: 'Ne plus suivre une liste',
  news: {
    subject: {
      envelope: 'ton enveloppe t’attend',
      ticked: {
        one: '{count} cadeau a été coché sur ta liste',
        other: '{count} cadeaux ont été cochés sur ta liste',
      },
      joined_gift: '{name} se joint à ton cadeau à plusieurs',
      revealed: 'le tirage est dévoilé',
      palmares: 'le palmarès de Devine qui est là',
      joined: '{name} s’inscrit par le lien',
      all_viewed: 'tout le monde a découvert son tirage',
      santa_added: '{name} t’ajoute au Secret Santa',
      list_shared: '{name} a partagé sa liste avec toi',
      game_open: 'à toi de jouer à Devine qui',
      followed_ideas: {
        one: '{count} nouvelle idée pour {name}',
        other: '{count} nouvelles idées pour {name}',
      },
      followed_ideasList: {
        one: '{count} nouvelle idée sur la liste',
        other: '{count} nouvelles idées sur la liste',
      },
      followed_person: '{name} est sur la liste',
    },
    footer: 'Un email à chaque nouveauté.',
  },
  summary: {
    subject: {
      one: 'Under the Tree : {count} nouveauté depuis hier',
      other: 'Under the Tree : {count} nouveautés depuis hier',
    },
    intro: 'Voici ce qui t’attend.',
    openParty: 'Ouvrir l’événement',
    openList: 'Ouvrir la liste',
    footer: 'Un seul résumé par jour, et seulement s’il y a du nouveau.',
  },
};
