// Local data for a full test of the V3, created through the API like
// people would. It replaces seed:demo, seed:lists and seed:anonymous.
//
// Usage, on a local base (never the real one):
//   NUXT_DEV_LOGIN_LINKS=true NUXT_RESEND_API_KEY= \
//   NUXT_SUPER_ADMIN_EMAILS=admin@example.com pnpm dev
//   pnpm seed:v3 [base URL]
// The login links come back to this script instead of being emailed.
// The empty email key matters: logging in and inviting send an email even
// with the login links on, and with a real key they would leave.
// Every address is @example.com; the super-admin is admin@example.com,
// never a real address. It stops when its world is already there.
//
// The world, one family and its friends, so that every screen of the V3
// has something to show:
// - « Famille Camille, Chez Mamie » (Noël, every year): two closed years,
//   the Secret Santa 2026 drawn, the list of each at another stage (a
//   draft, « Celui qui m'a tiré », all the members, public), ticks of every
//   kind, « Cocher pour quelqu'un », last year's list to take up again.
// - « Les 7 ans de Léo » (a birthday): a list shared with its members.
// - « Mariage de Lou et Sacha »: a public list without people, where
//   Camille ticks without being a member (« Ce que j'offre ailleurs »).
// - « Amis de Camille »: a Secret Santa being prepared.
// - Paul, at his limit of three Secret Santa: a draw done elsewhere with a
//   clash, « Devine qui » under way, a palmarès.
// - « Le grand Noël des cousins »: thirty members, full.
// - An account disabled by the super-admin.
const BASE = process.argv[2] ?? 'http://localhost:4000';
const YEAR = 2026;
const at = (name: string) => `${name}@example.com`;
const ADMIN = at('admin');

type Call = <T>(method: string, path: string, body?: unknown) => Promise<T>;
const wait = (ms: number) => new Promise((done) => setTimeout(done, ms));

/**
 * A browser-like client: it keeps the cookies it is given, and waits when
 * the server says it is called too fast.
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
    if (!res.ok) {
      throw new Error(`${method} ${path}: ${res.status} ${await res.text()}`);
    }
    return (await res.json()) as T;
  };
  return (method, path, body) => send(method, path, body, 4);
};

/**
 * Logs an address in through its login link, with a name and an icon.
 * @param email - The address; its account is created if needed.
 * @param firstName - Its first name.
 * @param avatarEmoji - Its icon.
 * @param avatarColor - The colour of its icon.
 * @returns A client holding the session.
 */
const login = async (
  email: string,
  firstName: string,
  avatarEmoji = '🦌',
  avatarColor = 'plum',
): Promise<Call> => {
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
  await as('PUT', '/api/auth/profile', {
    firstName,
    lastName: null,
    language: 'fr',
    avatarEmoji,
    avatarColor,
  });
  return as;
};

// --- Events and Secret Santa -------------------------------------------

type Category =
  'christmas' | 'birthday' | 'birth' | 'wedding' | 'housewarming' | 'other';

/**
 * An event, made by the one who organises it, who is one of its people.
 * @param as - Who organises it.
 * @param input - Its category, name, day, and whether it comes back.
 * @param input.category - Its category.
 * @param input.name - Its name.
 * @param input.date - Its day (ISO).
 * @param input.recurring - Every year.
 * @returns Its address (slug).
 */
const makeEvent = async (
  as: Call,
  input: { category: Category; name: string; date: string; recurring: boolean },
): Promise<string> =>
  (await as<{ slug: string }>('POST', '/api/parties', input)).slug;

/**
 * Members of an event, with their address when they have an account.
 * @param as - Who organises it.
 * @param slug - The event.
 * @param people - First names, and addresses.
 * @returns Their person ids, by first name.
 */
const addMembers = async (
  as: Call,
  slug: string,
  people: readonly { firstName: string; email?: string }[],
): Promise<Map<string, string>> => {
  const ids = new Map<string, string>();
  for (const person of people) {
    const { person: made } = await as<{ person: { id: string } }>(
      'POST',
      `/api/admin/${slug}/persons`,
      { firstName: person.firstName, email: person.email ?? null },
    );
    ids.set(person.firstName, made.id);
  }
  return ids;
};

type SecretSanta = {
  path: string;
  /** The personal token of a participant, by first name. */
  token: (firstName: string) => string;
};

/**
 * A Secret Santa of an event, with the personal links of its people.
 * @param as - Who organises it.
 * @param slug - The event.
 * @param input - Its name, year, day, and what else the form takes.
 * @returns Its path in the API, and the tokens.
 */
const makeSecretSanta = async (
  as: Call,
  slug: string,
  input: Record<string, unknown> & { year: number },
): Promise<SecretSanta> => {
  const { edition } = await as<{ edition: { id: string } }>(
    'POST',
    `/api/admin/${slug}/editions`,
    input,
  );
  const path = `/api/admin/${slug}/editions/${edition.id}`;
  const { participants } = await as<{
    participants: { firstName: string; participationId: string }[];
  }>('GET', path);
  const { messages } = await as<{
    messages: Record<string, { link: string }>;
  }>('GET', `${path}/messages?type=invitation`);
  return {
    path,
    token: (firstName) => {
      const found = participants.find((p) => p.firstName === firstName);
      const link = found ? messages[found.participationId]?.link : undefined;
      return link ? (new URL(link).pathname.split('/p/')[1] ?? '') : '';
    },
  };
};

/** A participant's own client: the personal link is their only key. */
const asParticipant = (token: string) => {
  const as = client();
  return <T>(method: string, path: string, body?: unknown) =>
    as<T>(method, `/api/p/${token}${path}`, body);
};

// --- Lists ---------------------------------------------------------------

type ListDoc = {
  list: { shareToken: string | null };
  people: { id: string; member: { firstName: string } }[];
  family: { id: string; firstName: string }[];
};

/**
 * A list for one of my events: it takes its name, day and icon.
 * @param as - Who holds it.
 * @param slug - The event.
 * @returns Its id.
 */
const listFor = async (as: Call, slug: string): Promise<string> =>
  (
    await as<{ id: string }>('POST', '/api/lists', {
      icon: { emoji: '🎄', color: 'pine' },
      party: slug,
    })
  ).id;

/** Someone on a list: one of my people by name, or someone new. */
const addPerson = async (
  as: Call,
  listId: string,
  firstName: string,
  emoji: string,
  color: string,
): Promise<string> => {
  const doc = await as<ListDoc>('GET', `/api/lists/${listId}`);
  const known = doc.family.find((member) => member.firstName === firstName);
  return (
    await as<{ id: string }>(
      'POST',
      `/api/lists/${listId}/people`,
      known
        ? { memberId: known.id }
        : { newMember: { firstName, avatar: { emoji, color } } },
    )
  ).id;
};

/** Ideas of someone on a list, by their text. */
const addIdeas = async (
  as: Call,
  listId: string,
  listPersonId: string,
  ideas: readonly (string | { text: string; url: string })[],
): Promise<Record<string, string>> => {
  const ids: Record<string, string> = {};
  for (const idea of ideas) {
    const { text, url } =
      typeof idea === 'string' ? { text: idea, url: null } : idea;
    ids[text] = (
      await as<{ id: string }>('POST', `/api/lists/${listId}/ideas`, {
        listPersonId,
        text,
        url,
      })
    ).id;
  }
  return ids;
};

/**
 * Who sees a list (« Qui verra ta liste ? »): events for all their
 * members, events for « Celui qui m'a tiré », and the public.
 * @param as - Who manages it.
 * @param listId - The list.
 * @param share - What to tick.
 * @param share.members - Event names, for all their members.
 * @param share.giver - Event names, for the one who drew me.
 * @param share.isPublic - « Tout le monde, avec le lien ».
 * @returns Its link (token).
 */
const shareList = async (
  as: Call,
  listId: string,
  share: { members?: string[]; giver?: string[]; isPublic?: boolean },
): Promise<string> => {
  const { options } = await as<{ options: { id: string; name: string }[] }>(
    'GET',
    `/api/lists/${listId}/sharing`,
  );
  const ids = (names: string[] = []) =>
    names.map((name) => {
      const found = options.find((option) => option.name === name);
      if (!found) throw new Error(`« ${name} » n’est pas proposé au partage.`);
      return found.id;
    });
  await as('PUT', `/api/lists/${listId}/sharing`, {
    parties: ids(share.members),
    givers: ids(share.giver),
    isPublic: share.isPublic ?? false,
  });
  const doc = await as<ListDoc>('GET', `/api/lists/${listId}`);
  return doc.list.shareToken ?? '';
};

// --- The world -------------------------------------------------------------

const FAMILY = 'Famille Camille, Chez Mamie';
const camille = await login(at('camille'), 'Camille', '🦌', 'plum');
// Her events, once she organises one (refused before: then there is none).
const mine = await camille<{ groups: { name: string }[] }>(
  'GET',
  '/api/admin/groups',
).catch(() => ({ groups: [] }));
if (mine.groups.some((group) => group.name === FAMILY)) {
  console.log(`« ${FAMILY} » existe déjà : je ne touche à rien.`);
  process.exit(0);
}

console.log('Les comptes…');
const hugo = await login(at('hugo'), 'Hugo', '🐧', 'frost');
const mamie = await login(at('mamie'), 'Mamie', '🧣', 'brick');
const tonton = await login(at('tonton'), 'Tonton', '🎸', 'pine');
const ines = await login(at('ines'), 'Inès', '🦊', 'mustard');
// Louis only needs his account: Camille notes a gift for him.
await login(at('louis'), 'Louis', '🦉', 'kraft');
const lou = await login(at('lou'), 'Lou', '🌟', 'mustard');
const paul = await login(at('paul'), 'Paul', '🎄', 'pine');
const jeanne = await login(at('jeanne'), 'Jeanne', '🍪', 'brick');
const admin = await login(ADMIN, 'Admin', '❄️', 'frost');
await login(at('ancien'), 'Ancien');

console.log(`« ${FAMILY} »…`);
const family = await makeEvent(camille, {
  category: 'christmas',
  name: FAMILY,
  date: `${YEAR}-12-25`,
  recurring: true,
});
const familyIds = await addMembers(camille, family, [
  { firstName: 'Hugo', email: at('hugo') },
  { firstName: 'Mamie', email: at('mamie') },
  { firstName: 'Tonton', email: at('tonton') },
  { firstName: 'Inès', email: at('ines') },
  { firstName: 'Louis', email: at('louis') },
  { firstName: 'Rose' },
]);
const { persons } = await camille<{
  persons: { id: string; firstName: string }[];
}>('GET', `/api/admin/${family}/persons`);
const camilleId = persons.find((p) => p.firstName === 'Camille')?.id;
// Camille and Hugo live together: they never draw each other.
await camille('POST', `/api/admin/${family}/exclusions`, {
  giverId: camilleId,
  receiverId: familyIds.get('Hugo'),
  reciprocal: true,
});
await camille('PATCH', `/api/admin/${family}/rules`, {
  excludePreviousYears: 2,
  budget: '30 € max',
});
for (const year of [2024, 2025]) {
  const past = await makeSecretSanta(camille, family, {
    label: `Noël ${year}`,
    year,
    eventDate: `${year}-12-25`,
  });
  await camille('POST', `${past.path}/draw`);
  await camille('POST', `${past.path}/close`);
}
const noel = await makeSecretSanta(camille, family, {
  label: `Noël ${YEAR}`,
  year: YEAR,
  eventDate: `${YEAR}-12-25`,
  guardianMessage: 'On ouvre les cadeaux après le dessert !',
});
await camille('POST', `${noel.path}/draw`);

console.log('Les listes de la famille…');
// Camille's list, held with Hugo, shared with all the members.
const camilleList = await listFor(camille, family);
await camille('PATCH', `/api/lists/${camilleList}`, {
  note: 'Quelques idées pour vous éviter de chercher. Pas de peluches cette année : il n’y a plus de place !',
});
const leo = await addPerson(camille, camilleList, 'Léo', '🚀', 'frost');
const zoe = await addPerson(camille, camilleList, 'Zoé', '🦄', 'plum');
const leoIdeas = await addIdeas(camille, camilleList, leo, [
  {
    text: 'Circuit de billes, le grand modèle',
    url: 'https://example.com/circuit-de-billes',
  },
  'Déguisement de pompier (taille 6 ans)',
  'Vélo 16 pouces',
  'Livres sur les dinosaures',
  'Puzzle de la jungle',
  'Boîte de Lego',
]);
const zoeIdeas = await addIdeas(camille, camilleList, zoe, [
  'Poupée en tissu',
  'Des livres cartonnés, toujours',
]);
const camilleToken = await shareList(camille, camilleList, {
  members: [FAMILY],
});
await camille('POST', `/api/lists/${camilleList}/holders`, {
  email: at('hugo'),
  level: 'write',
});
// Hugo comes: the invitation to hold the list is accepted by coming.
await hugo('GET', '/api/lists');
const on = (as: Call, body: Record<string, unknown>) =>
  as('POST', `/api/l/${camilleToken}/claims`, body);
await on(mamie, { ideaId: leoIdeas['Circuit de billes, le grand modèle'] });
await on(tonton, {
  ideaId: leoIdeas['Déguisement de pompier (taille 6 ans)'],
  anonymous: true,
});
await on(mamie, {
  ideaId: leoIdeas['Vélo 16 pouces'],
  mode: 'group',
  note: 'Je mets 50 €, qui complète ?',
});
await on(tonton, { ideaId: leoIdeas['Vélo 16 pouces'], note: 'Je complète.' });
await mamie(
  'PATCH',
  `/api/l/${camilleToken}/claims/${leoIdeas['Vélo 16 pouces']}`,
  {
    closed: true,
  },
);
await mamie('POST', `/api/l/${camilleToken}/off-list`, {
  listPersonId: zoe,
  text: 'un pull tricoté',
});
await on(ines, { ideaId: zoeIdeas['Poupée en tissu'] });
// « Cocher pour quelqu'un »: a first name alone, a first name with an
// address that has no account, someone the app knows.
const givers = (ideaId: string | undefined, body: Record<string, unknown>) =>
  camille('PUT', `/api/lists/${camilleList}/claims/${ideaId}/givers`, {
    from: [],
    closed: false,
    ...body,
  });
await givers(leoIdeas['Livres sur les dinosaures'], {
  givers: [{ name: 'Tata', email: null }],
  mode: 'alone',
});
await givers(leoIdeas['Puzzle de la jungle'], {
  givers: [{ name: 'Parrain', email: at('parrain') }],
  mode: 'alone',
});
const { candidates } = await camille<{
  candidates: { key: string; name: string }[];
}>('GET', `/api/lists/${camilleList}`);
await givers(leoIdeas['Boîte de Lego'], {
  givers: [
    { key: candidates.find((c) => c.name === 'Louis')?.key },
    { key: candidates.find((c) => c.name === 'Tata')?.key },
  ],
  mode: 'group',
});

// Last year's list, to take up again: a few ideas, one given.
const lastYear = await listFor(camille, family);
await camille('PATCH', `/api/lists/${lastYear}`, {
  title: 'Noël 2025',
  eventDate: '2025-12-25',
});
const leoBefore = await addPerson(camille, lastYear, 'Léo', '🚀', 'frost');
const beforeIdeas = await addIdeas(camille, lastYear, leoBefore, [
  'Puzzle 100 pièces, avec des dinosaures',
  'Un télescope pour enfant',
]);
const lastToken = await shareList(camille, lastYear, { members: [FAMILY] });
await mamie('POST', `/api/l/${lastToken}/claims`, {
  ideaId: beforeIdeas['Puzzle 100 pièces, avec des dinosaures'],
});

// Mamie writes hers from her Secret Santa: for the one who drew her.
const mamieList = (
  await mamie<{ id: string }>('POST', `/api/p/${noel.token('Mamie')}/list`)
).id;
const mamieSelf = await addPerson(mamie, mamieList, 'Mamie', '🧣', 'brick');
await addIdeas(mamie, mamieList, mamieSelf, [
  'Un plaid tout doux',
  'Des graines pour le jardin',
]);
// Tonton's is still a draft; Inès's is public.
const tontonList = await listFor(tonton, family);
const tontonSelf = await addPerson(tonton, tontonList, 'Tonton', '🎸', 'pine');
await addIdeas(tonton, tontonList, tontonSelf, ['Des cordes de guitare']);
const inesList = await listFor(ines, family);
const inesSelf = await addPerson(ines, inesList, 'Inès', '🦊', 'mustard');
await addIdeas(ines, inesList, inesSelf, ['Un carnet à dessin', 'Des feutres']);
await shareList(ines, inesList, { members: [FAMILY], isPublic: true });

console.log('« Les 7 ans de Léo »…');
const birthdayName = 'Les 7 ans de Léo';
const birthday = await makeEvent(camille, {
  category: 'birthday',
  name: birthdayName,
  date: '2027-03-14',
  recurring: false,
});
await addMembers(camille, birthday, [
  { firstName: 'Mamie', email: at('mamie') },
  { firstName: 'Hugo', email: at('hugo') },
]);
const birthdayList = await listFor(camille, birthday);
const leoBirthday = await addPerson(
  camille,
  birthdayList,
  'Léo',
  '🚀',
  'frost',
);
await addIdeas(camille, birthdayList, leoBirthday, [
  'Un ballon de foot',
  'Un livre sur l’espace',
]);
await shareList(camille, birthdayList, { members: [birthdayName] });

console.log('« Mariage de Lou et Sacha »…');
const wedding = await makeEvent(lou, {
  category: 'wedding',
  name: 'Mariage de Lou et Sacha',
  date: '2027-06-12',
  recurring: false,
});
const weddingList = await listFor(lou, wedding);
await lou('POST', `/api/lists/${weddingList}/single`);
const weddingDoc = await lou<ListDoc>('GET', `/api/lists/${weddingList}`);
const weddingIdeas = await addIdeas(
  lou,
  weddingList,
  weddingDoc.people[0]?.id ?? '',
  ['Un service à raclette', 'Une nuit dans un gîte', 'Des verres à vin'],
);
const weddingToken = await shareList(lou, weddingList, { isPublic: true });
// Camille is not a member: what she gives shows in « Ce que j'offre
// ailleurs ».
await camille('GET', `/api/l/${weddingToken}`);
await camille('POST', `/api/l/${weddingToken}/claims`, {
  ideaId: weddingIdeas['Un service à raclette'],
});

console.log('« Amis de Camille »…');
const friends = await makeEvent(camille, {
  category: 'christmas',
  name: 'Amis de Camille',
  date: `${YEAR}-12-20`,
  recurring: true,
});
await addMembers(camille, friends, [
  { firstName: 'Lou', email: at('lou') },
  { firstName: 'Yanis' },
  { firstName: 'Sacha' },
]);
await makeSecretSanta(camille, friends, {
  label: `Noël ${YEAR}`,
  year: YEAR,
  eventDate: `${YEAR}-12-20`,
});

console.log('Les Secret Santa de Paul (à sa limite)…');
const FIVE = ['Paul', 'Anaïs', 'Bruno', 'Chloé', 'Denis'];
const others = FIVE.slice(1).map((firstName) => ({ firstName }));
const GAME_END = {
  endsAt: `${YEAR}-12-25T17:00:00.000Z`,
  timeZone: 'Europe/Paris',
};
/** `giver` says, by their link, who they give to. */
const answer = async (santa: SecretSanta, giver: string, receiver: string) => {
  const me = asParticipant(santa.token(giver));
  const { choices } = await me<{ choices: { id: string; name: string }[] }>(
    'GET',
    '/answer',
  );
  await me('PUT', '/answer', {
    personId: choices.find((c) => c.name === receiver)?.id,
  });
};
/** `guesser` thinks `giver` gives to `recipient`. */
const guess = async (
  santa: SecretSanta,
  guesser: string,
  recipient: string,
  giver: string,
) => {
  const me = asParticipant(santa.token(guesser));
  const game = await me<{ people: { id: string; name: string }[] }>(
    'GET',
    '/guess',
  );
  const id = (name: string) => game.people.find((p) => p.name === name)?.id;
  await me('PUT', '/guess', { recipientId: id(recipient), giverId: id(giver) });
};

// A draw done elsewhere: two answers clash, one is missing.
const elsewhere = await makeEvent(paul, {
  category: 'other',
  name: 'Week-end à Annecy',
  date: '2027-02-06',
  recurring: false,
});
await addMembers(paul, elsewhere, others);
const elsewhereSanta = await makeSecretSanta(paul, elsewhere, {
  label: 'Week-end 2027',
  year: 2027,
  eventDate: '2027-02-06',
});
await paul('POST', `${elsewhereSanta.path}/answers/start`);
await answer(elsewhereSanta, 'Paul', 'Anaïs');
await answer(elsewhereSanta, 'Anaïs', 'Chloé');
await answer(elsewhereSanta, 'Bruno', 'Chloé');
await answer(elsewhereSanta, 'Chloé', 'Paul');

// « Devine qui » under way.
const neighbours = await makeEvent(paul, {
  category: 'christmas',
  name: 'Noël des voisins',
  date: `${YEAR}-12-18`,
  recurring: true,
});
await addMembers(paul, neighbours, others);
const game = await makeSecretSanta(paul, neighbours, {
  label: `Noël ${YEAR}`,
  year: YEAR,
  eventDate: `${YEAR}-12-18`,
  guess: { mode: 'all', ...GAME_END },
});
await paul('POST', `${game.path}/draw`);
await guess(game, 'Anaïs', 'Anaïs', 'Bruno');
await guess(game, 'Bruno', 'Bruno', 'Denis');

// A palmarès: drawn, guessed, revealed early.
const office = await makeEvent(paul, {
  category: 'christmas',
  name: 'Noël du bureau',
  date: `${YEAR}-12-17`,
  recurring: true,
});
await addMembers(paul, office, others);
const reveal = await makeSecretSanta(paul, office, {
  label: `Noël ${YEAR}`,
  year: YEAR,
  eventDate: `${YEAR}-12-17`,
  guess: { mode: 'santa', ...GAME_END },
});
await paul('POST', `${reveal.path}/draw`);
const pairs = Object.fromEntries(
  await Promise.all(
    FIVE.map(async (name) => {
      const { receiver } = await asParticipant(reveal.token(name))<{
        receiver: { name: string };
      }>('POST', '/reveal');
      return [name, receiver.name] as const;
    }),
  ),
);
const santaOf = (name: string) =>
  FIVE.find((giver) => pairs[giver] === name) ?? '';
await guess(reveal, 'Anaïs', 'Anaïs', santaOf('Anaïs'));
await guess(reveal, 'Bruno', 'Bruno', santaOf('Bruno'));
for (const name of ['Chloé', 'Denis', 'Paul']) {
  const wrong = FIVE.find((p) => p !== name && p !== santaOf(name));
  if (wrong) await guess(reveal, name, name, wrong);
}
await paul('POST', `${reveal.path}/reveal`, { early: true });

console.log('« Le grand Noël des cousins », complet…');
const COUSINS =
  `Adèle Agathe Albane Alexis Ambre Anatole Antoine Apolline Arthur
Augustin Basile Baptiste Blanche Capucine Céleste Charles Clara Clément Colette
Constance Côme Diane Edgar Élise Émile Esther Félix Gaspard Héloïse`.split(
    /\s+/,
  );
const cousins = await makeEvent(jeanne, {
  category: 'christmas',
  name: 'Le grand Noël des cousins',
  date: `${YEAR}-12-26`,
  recurring: true,
});
await addMembers(
  jeanne,
  cousins,
  COUSINS.map((firstName) => ({ firstName })),
);
await makeSecretSanta(jeanne, cousins, {
  label: `Noël ${YEAR}`,
  year: YEAR,
  eventDate: `${YEAR}-12-26`,
});

console.log('Le super-admin…');
const { accounts } = await admin<{ accounts: { id: string; email: string }[] }>(
  'GET',
  '/api/admin/accounts',
);
await admin(
  'PATCH',
  `/api/admin/accounts/${accounts.find((a) => a.email === at('ancien'))?.id}`,
  { disabled: true },
);

console.log(`
Prêt : ${BASE}. Chaque adresse se connecte par son lien (la page de connexion
le montre, NUXT_DEV_LOGIN_LINKS=true).

  ${at('camille')}  organise « ${FAMILY} » (Secret Santa 2026 tiré),
                         « Les 7 ans de Léo » et « Amis de Camille » (à préparer) ;
                         sa liste : toutes les coches, « Cocher pour quelqu'un »,
                         « Noël 2025 » à reprendre, une coche au mariage (ailleurs)
  ${at('hugo')}     tient la liste de Camille avec elle, « Aide à écrire »
  ${at('mamie')}    a coché seule, à plusieurs (fermé) et hors liste ;
                         sa liste est réservée à celui qui l'a tirée
  ${at('tonton')}   une coche anonyme ; sa liste est un brouillon
  ${at('ines')}     sa liste est publique
  ${at('louis')}    Camille a noté pour lui la boîte de Lego, avec Tata
  ${at('lou')}      organise le mariage : une liste publique sans personne
  ${at('paul')}     à sa limite de 3 Secret Santa : tirage fait ailleurs
                         (« Week-end à Annecy »), « Devine qui » en cours
                         (« Noël des voisins »), palmarès (« Noël du bureau »)
  ${at('jeanne')}   « Le grand Noël des cousins », 30 membres, complet
  ${ADMIN}    super-admin ; ${at('ancien')} est désactivé
  ${at('parrain')}  sans compte : Camille lui a noté le puzzle ; en se
                         connectant, il le retrouve

Liste de Camille, par son lien : ${BASE}/l/${camilleToken}
Mariage, par son lien         : ${BASE}/l/${weddingToken}`);
