// Query keys, one place so mutations invalidate the right reads.
export const keys = {
  home: () => ['home'] as const,
  adminAccounts: () => ['admin', 'accounts'] as const,
  adminGroups: () => ['admin', 'groups'] as const,
  group: (slug: string) => ['group', slug] as const,
  dashboard: (slug: string) => ['group', slug, 'dashboard'] as const,
  people: (slug: string) => ['group', slug, 'people'] as const,
  rules: (slug: string) => ['group', slug, 'rules'] as const,
  editions: (slug: string) => ['group', slug, 'editions'] as const,
  edition: (slug: string, id: string) =>
    ['group', slug, 'edition', id] as const,
  check: (slug: string, id: string) =>
    ['group', slug, 'edition', id, 'check'] as const,
  account: () => ['account'] as const,
  // Personal link: everything under the token is refetched together.
  personal: (token: string) => ['p', token] as const,
  wishes: (token: string) => ['p', token, 'wishes'] as const,
  hints: (token: string) => ['p', token, 'hints'] as const,
  journal: (token: string) => ['p', token, 'journal'] as const,
  game: (token: string) => ['p', token, 'game'] as const,
};
