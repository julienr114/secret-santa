// « Quoi de neuf » (ticket 120, V3QuoiDeNeuf). Never who asks for ideas.
export default {
  count: { one: '{count} nouveauté', other: '{count} nouveautés' },
  forget: 'Ce que tu as vu s’efface au bout de trente jours',
  empty: 'Rien de neuf pour l’instant.',
  today: 'Aujourd’hui, {time}',
  yesterday: 'Hier, {time}',
  close: 'Fermer',
  // « Me prévenir », in « Mon compte » (ticket 121, NotifReglage).
  settings: {
    title: 'Me prévenir',
    choose: 'Choisir ce qui me prévient',
    byEmail: 'Par email',
    summary: 'Un résumé le matin',
    summaryHint: 'Un seul email, avec ce que tu n’as pas encore vu.',
    instant: 'Tout de suite',
    instantHint: 'Un email à chaque nouveauté.',
    none: 'Aucun email',
    noneHint: 'Sauf pour te connecter.',
    following: 'Ce que je suis',
    wholeList: 'Toute la liste',
    unfollow: 'Ne plus suivre',
    unfollowList: 'Ne plus suivre {title}',
    urgent: 'Ce qui presse',
    urgentText:
      'Ton enveloppe t’attend, une invitation, quelqu’un te demande des idées : avec le résumé, ces emails-là partent quand même tout de suite, sauf si tu as déjà vu la nouveauté.',
  },
  kind: {
    envelope: 'Le tirage est fait : ton enveloppe t’attend',
    hint_request: 'Quelqu’un te demande des idées de cadeaux',
    list_invite: '{name} t’invite à tenir sa liste',
    reminder:
      'Le jour J approche, et tout le monde n’a pas découvert son tirage',
    new_ideas: '{name} a ajouté des idées à sa liste',
    new_ideasCount: {
      one: '{count} idée de plus sur la liste',
      other: '{count} idées de plus sur la liste',
    },
    receiver_ideas: 'De nouvelles idées t’attendent',
    ticked: {
      one: '{count} cadeau a été coché sur ta liste',
      other: '{count} cadeaux ont été cochés sur ta liste',
    },
    joined_gift: '{name} se joint à ton cadeau à plusieurs : {detail}',
    revealed: 'Le tirage est dévoilé : qui a offert à qui',
    palmares: 'Le palmarès de Devine qui est là',
    joined: '{name} s’inscrit par le lien',
    joinedIn: '{name} s’inscrit par le lien ({detail})',
    all_viewed: 'Tout le monde a découvert son tirage',
    santa_added: '{name} t’ajoute au Secret Santa',
    game_open: 'Devine qui : à toi de jouer',
    list_shared: '{name} a partagé sa liste avec toi',
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
};
