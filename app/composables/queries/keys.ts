// Query keys, one place so mutations invalidate the right reads.
export const keys = {
  home: () => ['home'] as const,
  // The home of the V3 (ticket 103), under the home's key.
  homeParties: () => ['home', 'parties'] as const,
  adminAccounts: () => ['admin', 'accounts'] as const,
  adminGroups: () => ['admin', 'groups'] as const,
  group: (slug: string) => ['group', slug] as const,
  dashboard: (slug: string) => ['group', slug, 'dashboard'] as const,
  // The page of a party (V3, ticket 104), under its group's key.
  party: (slug: string) => ['group', slug, 'party'] as const,
  partyCandidates: () => ['parties', 'candidates'] as const,
  // « Créer › Un Secret Santa » (ticket 105), under the home's key: what
  // changes the home changes it.
  newSecretSanta: () => ['home', 'new-secret-santa'] as const,
  // « Les événements passés » (ticket 108), under the home's key.
  pastEvents: () => ['home', 'past'] as const,
  // A year over of a party (ticket 108), under its group's key.
  pastYear: (slug: string, year: number) =>
    ['group', slug, 'year', year] as const,
  people: (slug: string) => ['group', slug, 'people'] as const,
  editions: (slug: string) => ['group', slug, 'editions'] as const,
  edition: (slug: string, id: string) =>
    ['group', slug, 'edition', id] as const,
  check: (slug: string, id: string) =>
    ['group', slug, 'edition', id, 'check'] as const,
  account: () => ['account'] as const,
  // The lists I follow (ticket 122).
  follows: () => ['follows'] as const,
  // Personal link: everything under the token is refetched together.
  personal: (token: string) => ['p', token] as const,
  wishes: (token: string) => ['p', token, 'wishes'] as const,
  hints: (token: string) => ['p', token, 'hints'] as const,
  journal: (token: string) => ['p', token, 'journal'] as const,
  game: (token: string) => ['p', token, 'game'] as const,
  draw: (token: string) => ['p', token, 'draw'] as const,
  // Gift lists (README 22.19).
  lists: () => ['lists'] as const,
  list: (id: string) => ['lists', id] as const,
  holders: (id: string) => ['lists', id, 'holders'] as const,
  sharing: (id: string) => ['lists', id, 'sharing'] as const,
  // « Inviter quelqu'un » (ticket 117).
  listMembers: (id: string) => ['lists', id, 'members'] as const,
  elsewhere: () => ['lists', 'elsewhere'] as const,
  family: () => ['family'] as const,
  member: (id: string) => ['family', id] as const,
  link: (token: string) => ['l', token] as const,
  // « Quoi de neuf » and its count (ticket 120).
  news: () => ['news'] as const,
  newsCount: () => ['news', 'count'] as const,
};
