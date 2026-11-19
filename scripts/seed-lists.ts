// Local demo data for the gift lists, created through the API like users
// would. Usage: pnpm dev (with NUXT_DEV_LOGIN_LINKS=true), then
// pnpm seed:lists [base URL]. It can be run again: it stops when its
// lists are already there.
// For the account of SEED_ADMIN_EMAIL (the super-admin by default):
// - « Noël 2026 (démo) », shared: three people with their details, ideas
//   with and without a link, one given by Mamie, one given anonymously,
//   one given by several, a gift off the list; held with Hugo, who
//   « aide à écrire »; an invitation waiting and one refused; Tonton
//   linked to his own account.
// - « Noël 2025 (démo) », past: to try « Reprendre cette liste ».
// - « Les 7 ans de Léo (démo) », a draft never shared.
// - « L'anniversaire de Camille (démo) », held by someone else: opened
//   by its link, with one idea ticked.
const BASE = process.argv[2] ?? 'http://localhost:4000';
const ME = process.env.SEED_ADMIN_EMAIL ?? 'julienr114@gmail.com';
const MAMIE = 'mamie-listes-demo@example.com';
const TONTON = 'tonton-listes-demo@example.com';
const CAMILLE = 'camille-listes-demo@example.com';
const HUGO = 'hugo-listes-demo@example.com';
const MARK = '(démo)';

type Call = <T>(method: string, path: string, body?: unknown) => Promise<T>;
const wait = (ms: number) => new Promise((done) => setTimeout(done, ms));

/**
 * A browser-like client: it keeps the cookies it is given, and waits
 * when the server says it is called too fast.
 * @returns A function that calls the API as that client.
 */
const client = (): Call => {
  const cookies = new Map<string, string>();
  const send = async <T>(
    method: string,
    path: string,
    body: unknown,
    tries: number,
  ): Promise<T> => {
    const res = await fetch(`${BASE}${path}`, {
      method,
      headers: {
        'content-type': 'application/json',
        origin: new URL(BASE).origin,
        cookie: [...cookies].map(([k, v]) => `${k}=${v}`).join('; '),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    for (const header of res.headers.getSetCookie()) {
      const [pair] = header.split(';');
      const [name, ...value] = (pair ?? '').split('=');
      if (name) cookies.set(name, value.join('='));
    }
    if (res.status === 429 && tries > 0) {
      console.log('  (trop de demandes : j’attends 20 secondes)');
      await wait(20_000);
      return send<T>(method, path, body, tries - 1);
    }
    if (!res.ok)
      throw new Error(`${method} ${path}: ${res.status} ${await res.text()}`);
    return (await res.json()) as T;
  };
  return (method, path, body) => send(method, path, body, 4);
};

/**
 * Logs an address in through its login link, with a first name.
 * @param email - The address; its account is created if needed.
 * @param firstName - Its first name, set when the account has none.
 * @param emoji - Its icon.
 * @returns A client holding the session.
 */
const login = async (
  email: string,
  firstName: string | null,
  emoji = '🦌',
): Promise<Call> => {
  const as = client();
  const asked = await as<{ devLink?: string }>('POST', '/api/auth/link', {
    email,
  });
  if (!asked.devLink) {
    throw new Error(
      `Pas de lien de connexion pour ${email} : lance le serveur avec NUXT_DEV_LOGIN_LINKS=true, ou attends une heure (3 liens par heure et par adresse).`,
    );
  }
  await as('POST', '/api/auth/confirm', {
    token: new URL(asked.devLink).pathname.split('/').at(-1),
  });
  if (firstName) {
    await as('PUT', '/api/auth/profile', {
      firstName,
      lastName: null,
      language: 'fr',
      avatarEmoji: emoji,
      avatarColor: 'plum',
    });
  }
  return as;
};

type Card = { id: string; title: string };
type Person = { id: string; memberId: string };
type Doc = {
  list: { shareToken: string | null };
  people: { id: string; member: { id: string; firstName: string } }[];
  family: { id: string; firstName: string }[];
};

const me = await login(ME, null);
const mine = await me<{ coming: Card[]; past: Card[] }>('GET', '/api/lists');
if ([...mine.coming, ...mine.past].some((list) => list.title.endsWith(MARK))) {
  console.log(
    `Les listes de démonstration existent déjà pour ${ME} : je ne touche à rien.`,
  );
  process.exit(0);
}

/** A list of mine, with its link once shared. */
const makeList = async (
  as: Call,
  icon: { emoji: string; color: string },
  title: string,
  eventDate: string | null,
) => {
  const { id } = await as<{ id: string }>('POST', '/api/lists', {
    icon,
    title: `${title} ${MARK}`,
    eventDate,
  });
  return id;
};
/** Someone on a list: one of my people by name, or someone new. */
const addPerson = async (
  as: Call,
  listId: string,
  firstName: string,
  emoji: string,
  color: string,
): Promise<Person> => {
  const doc = await as<Doc>('GET', `/api/lists/${listId}`);
  const known = doc.family.find((member) => member.firstName === firstName);
  return as<Person>(
    'POST',
    `/api/lists/${listId}/people`,
    known
      ? { memberId: known.id }
      : { newMember: { firstName, avatar: { emoji, color } } },
  );
};
const addIdea = async (
  as: Call,
  listId: string,
  listPersonId: string,
  text: string,
  url: string | null = null,
) =>
  (
    await as<{ id: string }>('POST', `/api/lists/${listId}/ideas`, {
      listPersonId,
      text,
      url,
    })
  ).id;
const share = async (as: Call, listId: string) =>
  (await as<{ token: string }>('POST', `/api/lists/${listId}/share`, {})).token;

console.log('Les comptes de la famille…');
const mamie = await login(MAMIE, 'Mamie', '🧣');
const tonton = await login(TONTON, 'Tonton', '🎸');

console.log('« Noël 2026 »…');
const noel = await makeList(
  me,
  { emoji: '🎄', color: 'pine' },
  'Noël 2026',
  '2026-12-25',
);
await me('PATCH', `/api/lists/${noel}`, {
  note: 'Quelques idées pour vous éviter de chercher. Pas de peluches cette année : il n’y a plus de place !',
});
const leo = await addPerson(me, noel, 'Léo', '🚀', 'frost');
const zoe = await addPerson(me, noel, 'Zoé', '🦄', 'plum');
const tontonPlace = await addPerson(me, noel, 'Tonton', '🎸', 'pine');
await me('PATCH', `/api/family/${leo.memberId}`, {
  birthDate: '2020-03-14',
  clothingSize: '6 ans',
  shoeSize: '30 ou 31',
  texts: {
    lately: 'Les dinosaures, les billes',
    wouldHelp: 'Un cartable pour le CP',
    avoid: 'Les peluches, il en a trop',
  },
});
await me('PATCH', `/api/family/${zoe.memberId}`, {
  birthDate: '2023-06-02',
  clothingSize: '3 ans',
  shoeSize: '25',
});
// Tonton has an account at that address: he is linked to it at once.
await me('PATCH', `/api/family/${tontonPlace.memberId}`, { email: TONTON });
const circuit = await addIdea(
  me,
  noel,
  leo.id,
  'Circuit de billes, le grand modèle',
  'https://example.com/circuit-de-billes',
);
const pompier = await addIdea(
  me,
  noel,
  leo.id,
  'Déguisement de pompier (taille 6 ans)',
);
const velo = await addIdea(me, noel, leo.id, 'Vélo 16 pouces');
await addIdea(
  me,
  noel,
  leo.id,
  'Livres sur les dinosaures (il les a presque tous, demandez-nous)',
);
await addIdea(me, noel, zoe.id, 'Poupée en tissu');
await addIdea(me, noel, zoe.id, 'Des livres cartonnés, toujours');
await addIdea(me, noel, tontonPlace.id, 'Un bon couteau de cuisine');
const token = await share(me, noel);
// Who gives what: under a name, anonymously, with others, off the list.
await mamie('POST', `/api/l/${token}/claims`, { ideaId: circuit });
await tonton('POST', `/api/l/${token}/claims`, {
  ideaId: pompier,
  anonymous: true,
});
await mamie('POST', `/api/l/${token}/claims`, {
  ideaId: velo,
  mode: 'group',
  note: 'Je mets 50 €, qui complète ?',
});
await tonton('POST', `/api/l/${token}/claims`, {
  ideaId: velo,
  mode: 'group',
  note: 'Je complète.',
});
await mamie('POST', `/api/l/${token}/off-list`, {
  listPersonId: zoe.id,
  text: 'un pull tricoté',
});
// Tonton writes one of his own ideas, in his section.
await tonton('POST', `/api/l/${token}/ideas`, {
  listPersonId: tontonPlace.id,
  text: 'Des cordes de guitare',
  after: null,
});

console.log('Ceux qui tiennent la liste…');
const invite = (body: unknown) =>
  me<{ devLink?: string }>('POST', `/api/lists/${noel}/holders`, body);
const tokenOf = (link?: string) =>
  link ? new URL(link).pathname.split('/').at(-1) : '';
// Hugo accepts and creates his account by the link: he « aide à écrire ».
const hugoLink = await invite({ email: HUGO, level: 'write' });
await client()('POST', `/api/invitations/${tokenOf(hugoLink.devLink)}/accept`, {
  firstName: 'Hugo',
  language: 'fr',
});
// One refused, one still waiting.
const papi = await invite({ email: 'papi-listes-demo@example.com' });
await client()('POST', `/api/invitations/${tokenOf(papi.devLink)}/decline`);
await invite({ email: 'paul-listes-demo@example.com', level: 'manage' });

console.log('« Noël 2025 », passée…');
const old = await makeList(
  me,
  { emoji: '❄️', color: 'night' },
  'Noël 2025',
  '2025-12-25',
);
const leoOld = await addPerson(me, old, 'Léo', '🚀', 'frost');
const zoeOld = await addPerson(me, old, 'Zoé', '🦄', 'plum');
const puzzle = await addIdea(
  me,
  old,
  leoOld.id,
  'Puzzle 100 pièces, avec des dinosaures',
);
await addIdea(me, old, leoOld.id, 'Un télescope pour enfant');
await addIdea(me, old, zoeOld.id, 'Un tapis d’éveil');
const oldToken = await share(me, old);
await mamie('POST', `/api/l/${oldToken}/claims`, { ideaId: puzzle });

console.log('« Les 7 ans de Léo », en brouillon…');
const birthday = await makeList(
  me,
  { emoji: '🎂', color: 'plum' },
  'Les 7 ans de Léo',
  '2027-03-14',
);
await addPerson(me, birthday, 'Léo', '🚀', 'frost');

console.log('La liste de Camille, ouverte par son lien…');
const camille = await login(CAMILLE, 'Camille', '🦌');
const hers = await makeList(
  camille,
  { emoji: '🎁', color: 'plum' },
  'L’anniversaire de Camille',
  '2027-01-18',
);
const camillePlace = await addPerson(camille, hers, 'Camille', '🦌', 'plum');
const weekend = await addIdea(
  camille,
  hers,
  camillePlace.id,
  'Une carte cadeau pour un week-end',
);
await addIdea(camille, hers, camillePlace.id, 'Un beau carnet');
const hersToken = await share(camille, hers);
await me('GET', `/api/l/${hersToken}`);
await me('POST', `/api/l/${hersToken}/claims`, { ideaId: weekend });

console.log(`Prêt : ${BASE}/listes, connecté avec ${ME}.`);
console.log('  Noël 2026 (démo)          partagée, tenue avec Hugo');
console.log(`    par son lien            ${BASE}/l/${token}`);
console.log('  Noël 2025 (démo)          passée : « Reprendre cette liste »');
console.log('  Les 7 ans de Léo (démo)   brouillon');
console.log(
  '  L’anniversaire de Camille liste de quelqu’un d’autre, une idée cochée',
);
console.log('Pour voir la liste comme un autre, connecte-toi avec :');
console.log(
  `  ${MAMIE}   a coché, seule et à plusieurs, et annoncé un cadeau hors liste`,
);
console.log(`  ${TONTON}  relié à son compte : il écrit ses propres idées`);
console.log(`  ${HUGO}    tient la liste, « Aide à écrire »`);
console.log(`  ${CAMILLE} tient sa propre liste`);
