// Local demo data: a "Famille Démo" group with three past editions (drawn
// and closed), an open one with a few wish lists, created through the API like a guardian
// would. Usage: pnpm dev, then pnpm seed:demo [base URL].
const BASE = process.argv[2] ?? 'http://localhost:3000';
const SUPER = process.env.NUXT_SUPER_ADMIN_PASSWORD ?? 'dev-super-password';
const GROUP = {
  slug: 'famille-demo',
  name: 'Famille Démo',
  password: 'demo-gardien-1',
};
const PEOPLE = [
  'Anaïs',
  'Julien',
  'Claire',
  'Jérôme',
  'Chantal',
  'Jean-Marie',
  'Etienne',
  'Mathieu',
];
const PAIRS: Array<[string, string]> = [
  ['Anaïs', 'Julien'],
  ['Claire', 'Jérôme'],
  ['Chantal', 'Jean-Marie'],
];

const cookies = new Map<string, string>();
const call = async <T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> => {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'content-type': 'application/json',
      cookie: [...cookies].map(([k, v]) => `${k}=${v}`).join('; '),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  for (const header of res.headers.getSetCookie()) {
    const [pair] = header.split(';');
    const [name, value] = (pair ?? '').split('=');
    if (name) cookies.set(name, value ?? '');
  }
  if (!res.ok)
    throw new Error(`${method} ${path}: ${res.status} ${await res.text()}`);
  return (await res.json()) as T;
};

await call('POST', '/api/admin/login', { scope: 'super', password: SUPER });
const groups = await call<{ groups: { slug: string }[] }>(
  'GET',
  '/api/admin/groups',
);
if (groups.groups.some((g) => g.slug === GROUP.slug)) {
  console.log(`Le groupe ${GROUP.slug} existe déjà : rien à faire.`);
  process.exit(0);
}
await call('POST', '/api/admin/groups', {
  slug: GROUP.slug,
  name: GROUP.name,
  guardianPassword: GROUP.password,
});
const g = `/api/admin/${GROUP.slug}`;
const ids = new Map<string, string>();
for (const firstName of PEOPLE) {
  const { person } = await call<{ person: { id: string } }>(
    'POST',
    `${g}/persons`,
    { firstName },
  );
  ids.set(firstName, person.id);
}
for (const [a, b] of PAIRS) {
  await call('POST', `${g}/exclusions`, {
    giverId: ids.get(a),
    receiverId: ids.get(b),
    reciprocal: true,
  });
}
await call('PATCH', `${g}/rules`, {
  excludePreviousYears: 3,
  budget: '30 € max',
  eventDate: '25 décembre',
});

// Three closed years of history, then this year's edition, invitations open.
const PAST_YEARS = [2023, 2024, 2025];
const CURRENT_YEAR = 2026;
const createEdition = async (year: number): Promise<string> => {
  const { edition } = await call<{ edition: { id: string } }>(
    'POST',
    `${g}/editions`,
    { label: `Noël ${year}`, year },
  );
  await call('POST', `${g}/editions/${edition.id}/open`);
  return edition.id;
};
for (const year of PAST_YEARS) {
  const id = await createEdition(year);
  await call('POST', `${g}/editions/${id}/draw`);
  await call('POST', `${g}/editions/${id}/close`);
}
const currentId = await createEdition(CURRENT_YEAR);

// A few wish lists, saved through the personal links like participants do.
const WISHES: Record<string, { label: string; url?: string }[]> = {
  Anaïs: [
    { label: 'Un roman policier' },
    { label: 'Une bougie parfumée', url: 'https://example.com/bougie' },
  ],
  Julien: [{ label: 'Un jeu de société pour deux' }],
  Claire: [
    { label: 'Du thé de Noël' },
    { label: 'Des chaussettes en laine' },
    { label: 'Un carnet', url: 'https://example.com/carnet' },
  ],
};
const { participants } = await call<{
  participants: { firstName: string; participationId: string }[];
}>('GET', `${g}/editions/${currentId}`);
const { messages } = await call<{
  messages: Record<string, { link: string }>;
}>('GET', `${g}/editions/${currentId}/messages?type=invitation`);
const linkOf = (firstName: string): string => {
  const person = participants.find((p) => p.firstName === firstName);
  return messages[person?.participationId ?? '']?.link ?? '';
};
for (const [firstName, wishes] of Object.entries(WISHES)) {
  const path = new URL(linkOf(firstName)).pathname;
  await call('PUT', `/api${path}/wishes`, { wishes });
}

console.log(
  `Prêt : ${BASE}/admin, groupe « ${GROUP.slug} », mot de passe « ${GROUP.password} ».`,
);
console.log(
  `Éditions clôturées : ${PAST_YEARS.join(', ')}. En cours : ${CURRENT_YEAR} (invitations).`,
);
console.log("Liens personnels de l'édition en cours :");
for (const { firstName } of participants) {
  console.log(`  ${firstName} : ${BASE}${new URL(linkOf(firstName)).pathname}`);
}
