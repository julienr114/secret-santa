// Local demo data, created through the API like users would. Usage:
// pnpm dev, then pnpm seed:demo [base URL]. It can be run again: each
// part is skipped when it already exists.
// - "Famille Démo": three past editions (drawn and closed) and an open
//   one with a few gift hints. Julien carries the super-admin's address,
//   so that their home shows draws.
// - Accounts: one with a request pending, one accepted that has not
//   created its group yet, one refused, one with its own group, and one
//   disabled.
// - Camille organises two groups and takes part in both, and in the demo
//   family too: three draws at once, each at a different step.
const BASE = process.argv[2] ?? 'http://localhost:4000';
// A super-admin address: the one created by the migration, or one of
// NUXT_SUPER_ADMIN_EMAILS. The dev server must run with
// NUXT_DEV_LOGIN_LINKS=true, so that the login link comes back here
// instead of being emailed.
const SUPER = process.env.SEED_ADMIN_EMAIL ?? 'julienr114@gmail.com';
const GROUP = {
  slug: 'famille-demo',
  name: 'Famille Démo',
  organizer: 'orga-demo@example.com',
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

type Call = <T>(method: string, path: string, body?: unknown) => Promise<T>;

/**
 * A browser-like client: it keeps the cookies it is given.
 * @returns A function that calls the API as that client.
 */
const client = (): Call => {
  const cookies = new Map<string, string>();
  return async <T>(method: string, path: string, body?: unknown) => {
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
};

/**
 * Logs an address in through its login link.
 * @param email - The address; its account is created if needed.
 * @returns A client holding the session.
 */
const login = async (email: string): Promise<Call> => {
  const as = client();
  const asked = await as<{ devLink?: string }>('POST', '/api/auth/link', {
    email,
  });
  if (!asked.devLink) {
    throw new Error(
      `Pas de lien de connexion pour ${email} : lance le serveur avec NUXT_DEV_LOGIN_LINKS=true.`,
    );
  }
  await as('POST', '/api/auth/confirm', {
    token: new URL(asked.devLink).pathname.split('/').at(-1),
  });
  return as;
};

const call = await login(SUPER);
const CURRENT_YEAR = 2026;
const g = `/api/admin/${GROUP.slug}`;

/** Creates the demo family, its history and this year's edition. */
const seedFamily = async () => {
  await call('POST', '/api/admin/groups', {
    slug: GROUP.slug,
    name: GROUP.name,
    organizers: [GROUP.organizer],
  });
  const ids = new Map<string, string>();
  for (const firstName of PEOPLE) {
    const { person } = await call<{ person: { id: string } }>(
      'POST',
      `${g}/persons`,
      { firstName, ...(firstName === 'Julien' ? { email: SUPER } : {}) },
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
    eventDate: '2026-12-25',
  });

  // Three closed years of history, then this year's edition, invitations open.
  const PAST_YEARS = [2023, 2024, 2025];
  const createEdition = async (year: number): Promise<string> => {
    const { edition } = await call<{ edition: { id: string } }>(
      'POST',
      `${g}/editions`,
      { label: `Noël ${year}`, year, eventDate: `${year}-12-24` },
    );
    return edition.id;
  };
  for (const year of PAST_YEARS) {
    const id = await createEdition(year);
    await call('POST', `${g}/editions/${id}/draw`);
    await call('POST', `${g}/editions/${id}/close`);
  }
  const currentId = await createEdition(CURRENT_YEAR);

  // A few gift hints (README 22.11), saved through the personal links like
  // participants do: precise ideas, and a portrait for Anaïs.
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
  await call('PATCH', `/api${new URL(linkOf('Anaïs')).pathname}/hints`, {
    answers: { usefulOrSurprising: 'first', objectOrMoment: 'second' },
    texts: { lately: 'La course à pied, les BD, la cuisine du dimanche.' },
  });
};

const ACCOUNTS = {
  pending: 'lea-demo@example.com',
  accepted: 'marc-demo@example.com',
  refused: 'nora-demo@example.com',
  owner: 'paul-demo@example.com',
  disabled: 'ancien-demo@example.com',
};
type AdminAccounts = {
  requests: { id: string; email: string }[];
  accounts: {
    id: string;
    email: string;
    groupQuota: number;
    groups: { slug: string }[];
  }[];
};

/**
 * Asks for a group as an address, then answers as the super-admin.
 * @param email - Who asks.
 * @param message - Their words.
 * @param approve - The answer, or undefined to leave the request pending.
 * @returns The client of the asker.
 */
const request = async (
  email: string,
  message: string,
  approve?: boolean,
): Promise<Call> => {
  const as = await login(email);
  await as('POST', '/api/auth/group-requests', { message });
  if (approve === undefined) return as;
  const { requests } = await call<AdminAccounts>('GET', '/api/admin/accounts');
  const id = requests.find((r) => r.email === email)?.id;
  await call('POST', `/api/admin/group-requests/${id}/decide`, { approve });
  return as;
};

/** Creates the demo accounts in their different states. */
const seedAccounts = async () => {
  await request(ACCOUNTS.accepted, 'Le Noël de mon club de lecture.', true);
  await request(ACCOUNTS.refused, 'Un test, pour voir.', false);
  const owner = await request(
    ACCOUNTS.owner,
    'Le Secret Santa de mes amis, une dizaine de personnes.',
    true,
  );
  await owner('PUT', '/api/auth/profile', {
    firstName: 'Paul',
    lastName: 'Démo',
    language: 'fr',
    avatarEmoji: '🎄',
    avatarColor: 'pine',
  });
  await owner('POST', '/api/admin/groups', {
    slug: 'amis-demo',
    name: 'Amis Démo',
  });
  await login(ACCOUNTS.disabled);
  const { accounts } = await call<AdminAccounts>('GET', '/api/admin/accounts');
  const id = accounts.find((a) => a.email === ACCOUNTS.disabled)?.id;
  await call('PATCH', `/api/admin/accounts/${id}`, { disabled: true });
  await request(
    ACCOUNTS.pending,
    'Le Noël de ma famille, nous serons une douzaine. Merci !',
  );
};

const CAMILLE = 'camille-demo@example.com';

/**
 * Creates a group as an organiser, with people and this year's edition.
 * @param as - The organiser's client.
 * @param name - Name of the group; its identifier comes from it.
 * @param people - First names, besides the organiser.
 * @param drawn - Whether the draw is done.
 */
const seedOwnGroup = async (
  as: Call,
  name: string,
  people: string[],
  drawn: boolean,
) => {
  const { group } = await as<{ group: { slug: string } }>(
    'POST',
    '/api/admin/groups',
    { name },
  );
  const base = `/api/admin/${group.slug}`;
  for (const firstName of people) {
    await as('POST', `${base}/persons`, { firstName });
  }
  const { edition } = await as<{ edition: { id: string } }>(
    'POST',
    `${base}/editions`,
    {
      label: `Noël ${CURRENT_YEAR}`,
      year: CURRENT_YEAR,
      eventDate: `${CURRENT_YEAR}-12-25`,
    },
  );
  if (drawn) await as('POST', `${base}/editions/${edition.id}/draw`);
};

/** Camille: two groups of her own, and a seat in the demo family. */
const seedCamille = async () => {
  const camille = await login(CAMILLE);
  const before = await call<AdminAccounts>('GET', '/api/admin/accounts');
  if (!before.accounts.find((a) => a.email === CAMILLE)?.groupQuota) {
    await request(CAMILLE, 'Le Noël de ma famille et celui de mes amis.', true);
  }
  const { accounts } = await call<AdminAccounts>('GET', '/api/admin/accounts');
  const id = accounts.find((a) => a.email === CAMILLE)?.id;
  await call('PATCH', `/api/admin/accounts/${id}`, { groupQuota: 3 });
  await camille('PUT', '/api/auth/profile', {
    firstName: 'Camille',
    lastName: 'Démo',
    language: 'fr',
    avatarEmoji: '🦌',
    avatarColor: 'plum',
  });
  await seedOwnGroup(
    camille,
    'Famille Camille',
    ['Louis', 'Inès', 'Hugo', 'Rose'],
    true,
  );
  await seedOwnGroup(
    camille,
    'Amis de Camille',
    ['Yanis', 'Lou', 'Sacha'],
    false,
  );
  // A guest in the demo family: added to this year's edition.
  const { person } = await call<{ person: { id: string } }>(
    'POST',
    `${g}/persons`,
    { firstName: 'Camille', email: CAMILLE },
  );
  const { currentEditionId } = await call<{ currentEditionId: string }>(
    'GET',
    g,
  );
  await call('POST', `${g}/editions/${currentEditionId}/participants`, {
    personId: person.id,
  });
};

/** Ninety-nine first names: with the organiser, a hundred people. */
const HUNDRED =
  `Adèle Agathe Albane Alexis Ambre Anatole Anna Antoine Apolline Arthur
Augustin Basile Baptiste Bastien Benoît Blanche Capucine Céleste Charles Charlotte
Clara Clément Colette Constance Côme Daniel Diane Edgar Élise Émile Emma Ernest
Esther Étienne Eugénie Félix Fleur Gabriel Gaspard Grégoire Héloïse Henri Hortense
Inès Irène Isaac Jade Jeanne Joseph Jules Julia Juliette Laure Léa Léon Léonie
Lila Lisa Lou Louis Louise Luc Lucie Lucien Madeleine Maël Margaux Marius Martin
Mathilde Maxime Mila Nina Noé Noémie Octave Olivia Oscar Pauline Pierre Quentin
Raphaël Romane Rose Sacha Salomé Samuel Simon Sophie Suzanne Théo Thomas Valentin
Victor Victoire Yanis Yves Zélie Zoé`.split(/\s+/);

/**
 * A group of a hundred people and its edition: to see how the long lists
 * fold (README 23, FOLD_FROM).
 * @param slug - The group's identifier.
 * @param name - The group's name.
 * @param drawn - Draw it, send a third of the links, and reveal a few.
 */
const seedHundred = async (slug: string, name: string, drawn: boolean) => {
  const at = `/api/admin/${slug}`;
  await call('POST', '/api/admin/groups', {
    slug,
    name,
    organizers: [GROUP.organizer],
  });
  for (const firstName of HUNDRED) {
    await call('POST', `${at}/persons`, { firstName });
  }
  const { edition } = await call<{ edition: { id: string } }>(
    'POST',
    `${at}/editions`,
    {
      label: `Noël ${CURRENT_YEAR}`,
      year: CURRENT_YEAR,
      eventDate: `${CURRENT_YEAR}-12-19`,
    },
  );
  if (!drawn) return;
  await call('POST', `${at}/editions/${edition.id}/draw`);
  const { participants } = await call<{
    participants: { firstName: string; participationId: string }[];
  }>('GET', `${at}/editions/${edition.id}`);
  const { messages } = await call<{
    messages: Record<string, { link: string }>;
  }>('GET', `${at}/editions/${edition.id}/messages?type=drawn`);
  const sent = participants.filter((_, index) => index % 3 === 0);
  for (const [index, p] of sent.entries()) {
    await call('POST', `${at}/participations/${p.participationId}/message`, {
      type: 'drawn',
      via: 'copy',
    });
    if (index % 2 === 0) {
      const path = new URL(messages[p.participationId]?.link ?? '').pathname;
      await call('POST', `/api${path}/reveal`);
    }
  }
};

const existing = await call<{ groups: { slug: string }[] }>(
  'GET',
  '/api/admin/groups',
);
if (existing.groups.some((group) => group.slug === GROUP.slug)) {
  console.log(`Le groupe ${GROUP.slug} existe déjà : je le laisse tel quel.`);
  // An older demo family has no address on Julien: give him the
  // super-admin's, so that their home shows draws.
  const { persons } = await call<{
    persons: { id: string; firstName: string; email: string | null }[];
  }>('GET', `${g}/persons`);
  const julien = persons.find((p) => p.firstName === 'Julien' && !p.email);
  if (julien)
    await call('PATCH', `${g}/persons/${julien.id}`, { email: SUPER });
  await call('POST', `${g}/organizers`, { email: GROUP.organizer });
} else {
  await seedFamily();
}
const known = await call<AdminAccounts>('GET', '/api/admin/accounts');
if (known.accounts.some((account) => account.email === ACCOUNTS.pending)) {
  console.log('Les comptes de démonstration existent déjà.');
} else {
  await seedAccounts();
}

const BIG = [
  { slug: 'comite-demo', name: 'Comité d’entreprise', drawn: false },
  { slug: 'grand-tirage-demo', name: 'Grand tirage', drawn: true },
];
for (const big of BIG) {
  if (existing.groups.some((group) => group.slug === big.slug)) {
    console.log(`Le groupe ${big.slug} existe déjà.`);
  } else {
    await seedHundred(big.slug, big.name, big.drawn);
  }
}

if (
  known.accounts.some(
    (account) => account.email === CAMILLE && account.groups.length > 0,
  )
) {
  console.log('Camille existe déjà.');
} else {
  await seedCamille();
}

console.log(
  `Prêt : ${BASE}. Connecte-toi avec ${SUPER} (super-admin) ou ${GROUP.organizer} (organisateur de « ${GROUP.slug} »).`,
);
console.log('Comptes de démonstration :');
console.log(`  ${ACCOUNTS.pending} : demande de groupe en attente`);
console.log(
  `  ${ACCOUNTS.accepted} : demande acceptée, groupe pas encore créé`,
);
console.log(`  ${ACCOUNTS.refused} : demande refusée`);
console.log(`  ${ACCOUNTS.owner} : organise son groupe « amis-demo »`);
console.log(`  ${ACCOUNTS.disabled} : compte désactivé`);
console.log(
  `  ${GROUP.organizer} organise aussi « comite-demo » (100 personnes, à préparer) et « grand-tirage-demo » (100 personnes, tirage fait)`,
);
console.log(
  `  ${CAMILLE} : organise « Famille Camille » (tirage fait) et « Amis de Camille » (invitations), participe aux deux et à « Famille Démo »`,
);
