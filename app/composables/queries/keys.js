// Query keys, one place so mutations invalidate the right reads.
export const keys = {
  groups: () => ['groups'],
  dashboard: (slug) => ['group', slug, 'dashboard'],
  people: (slug) => ['group', slug, 'people'],
  rules: (slug) => ['group', slug, 'rules'],
  editions: (slug) => ['group', slug, 'editions'],
  edition: (slug, id) => ['group', slug, 'edition', id],
  group: (slug) => ['group', slug],
};
