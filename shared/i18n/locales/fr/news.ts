// « Quoi de neuf » (ticket 120, V3QuoiDeNeuf). Never who asks for ideas.
export default {
  count: { one: '{count} nouveauté', other: '{count} nouveautés' },
  forget: 'Tout s’efface au bout de trente jours',
  empty: 'Rien de neuf pour l’instant.',
  today: 'Aujourd’hui, {time}',
  yesterday: 'Hier, {time}',
  close: 'Fermer',
  // The word of the switch to the V3 (ticket 113): at the top of « Quoi de
  // neuf », and in the email of the day after. It names the old word on
  // purpose (scripts/controle.exceptions.json).
  note: {
    v3: 'Under the Tree a changé. Tes groupes s’appellent maintenant des événements, et on y trouve au même endroit le Secret Santa et les listes de cadeaux. Tes pistes de cadeaux sont devenues ta liste : seul celui qui t’a tiré la voit, comme avant. Rien n’est perdu, et ton tirage n’a pas bougé.',
    v3Link: 'Ta liste est toujours ouverte à ceux qui ont son lien.',
    subject: 'Under the Tree a changé',
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
    list_shared: '{name} a partagé sa liste avec toi',
  },
};
