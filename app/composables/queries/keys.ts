// Query keys, one place so mutations invalidate the right reads.
export const keys = {
  groups: () => ['groups'] as const,
  group: (slug: string) => ['group', slug] as const,
  dashboard: (slug: string) => ['group', slug, 'dashboard'] as const,
  people: (slug: string) => ['group', slug, 'people'] as const,
  rules: (slug: string) => ['group', slug, 'rules'] as const,
  editions: (slug: string) => ['group', slug, 'editions'] as const,
  edition: (slug: string, id: string) =>
    ['group', slug, 'edition', id] as const,
  check: (slug: string, id: string) =>
    ['group', slug, 'edition', id, 'check'] as const,
};
