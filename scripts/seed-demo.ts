// Local demo data: a "Famille Démo" group with two past editions (drawn
// and closed) and an open one, created through the API like a guardian
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
  excludePreviousYears: 2,
  budget: '30 € max',
  eventDate: '25 décembre',
});
for (const year of [2025, 2026, 2027]) {
  const { edition } = await call<{ edition: { id: string } }>(
    'POST',
    `${g}/editions`,
    {
      label: `Noël ${year}`,
      year,
    },
  );
  await call('POST', `${g}/editions/${edition.id}/open`);
  if (year < 2027) {
    await call('POST', `${g}/editions/${edition.id}/draw`);
    await call('POST', `${g}/editions/${edition.id}/close`);
  }
}
console.log(
  `Prêt : ${BASE}/admin, groupe « ${GROUP.slug} », mot de passe « ${GROUP.password} ».`,
);
