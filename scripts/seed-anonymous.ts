// Local demo data to try the gift list linked to the hints of a draw, and
// « Mode anonyme » (lot 27 ter), created through the API like users
// would. Usage: pnpm dev (with NUXT_DEV_LOGIN_LINKS=true), then
// pnpm seed:anonymous [base URL]. It can be run again: what is already
// there is kept, what is missing is made, and the addresses are printed
// again.
// For the account of SEED_ADMIN_EMAIL (the super-admin by default), who
// organises: the group « Tirage anonyme (démo) », three people with an
// address, a draw done. Each of the three has an account at that address,
// holds a shared gift list, and linked it to their hints: whoever gives
// to whom, the one who gives finds a link under their result.
// At the end it prints who gives to whom, and every address to open.
const BASE = process.argv[2] ?? 'http://localhost:4000';
const ME = process.env.SEED_ADMIN_EMAIL ?? 'julienr114@gmail.com';
const GROUP = 'Tirage anonyme (démo)';
const PEOPLE = [
  { firstName: 'Alice', emoji: '🦌', email: 'alice-anonyme-demo@example.com' },
  { firstName: 'Bruno', emoji: '🐧', email: 'bruno-anonyme-demo@example.com' },
  { firstName: 'Chloé', emoji: '🧣', email: 'chloe-anonyme-demo@example.com' },
] as const;
/** Someone who has nothing to do with the draw, to compare. */
const OUTSIDER = {
  firstName: 'Denis',
  email: 'denis-anonyme-demo@example.com',
};

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
 * @param firstName - Its first name, set when given.
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

const me = await login(ME, null);
const groups = await me<{ groups: { name: string; slug: string }[] }>(
  'GET',
  '/api/admin/groups',
);
const existing = groups.groups.find((one) => one.name === GROUP);
const slug =
  existing?.slug ??
  (
    await me<{ group: { slug: string } }>('POST', '/api/admin/groups', {
      name: GROUP,
    })
  ).group.slug;
const at = `/api/admin/${slug}`;
const year = new Date().getFullYear();
const { editions } = await me<{ editions: { id: string }[] }>(
  'GET',
  `${at}/editions`,
);
const made = editions[0] === undefined;
if (made) {
  for (const person of PEOPLE) {
    await me('POST', `${at}/persons`, {
      firstName: person.firstName,
      email: person.email,
    });
  }
}
const edition =
  editions[0] ??
  (
    await me<{ edition: { id: string } }>('POST', `${at}/editions`, {
      label: `Noël ${year}`,
      year,
      eventDate: `${year}-12-24`,
    })
  ).edition;
const { participants } = await me<{
  participants: { firstName: string; participationId: string }[];
}>('GET', `${at}/editions/${edition.id}`);
// The personal links: in the invitation before the draw, in the message
// of the draw after it.
const { messages } = await me<{
  messages: Record<string, { link: string }>;
}>(
  'GET',
  `${at}/editions/${edition.id}/messages?type=${made ? 'invitation' : 'drawn'}`,
);
const linkOf = (firstName: string) => {
  const found = participants.find((p) => p.firstName === firstName);
  return new URL(messages[found?.participationId ?? '']?.link ?? BASE).pathname;
};
if (made) await me('POST', `${at}/editions/${edition.id}/draw`);

// Each one: an account, a shared gift list, linked to their hints.
const lists: Record<string, string> = {};
const gives: Record<string, string> = {};
for (const person of PEOPLE) {
  const as = await login(person.email, person.firstName, person.emoji);
  const title = `La liste de ${person.firstName} (démo)`;
  const held = await as<{ coming: { id: string; title: string }[] }>(
    'GET',
    '/api/lists',
  );
  const before = held.coming.find((list) => list.title === title);
  const id =
    before?.id ??
    (
      await as<{ id: string }>('POST', '/api/lists', {
        icon: { emoji: '🎄', color: 'pine' },
        title,
      })
    ).id;
  if (!before) {
    const added = await as<{ id: string }>('POST', `/api/lists/${id}/people`, {
      newMember: {
        firstName: 'Léo',
        avatar: { emoji: '🚀', color: 'frost' },
      },
    });
    for (const text of [
      'Un circuit de billes',
      'Un vélo 16 pouces',
      'Des livres sur les dinosaures',
    ]) {
      await as('POST', `/api/lists/${id}/ideas`, {
        listPersonId: added.id,
        text,
      });
    }
  }
  const { token } = await as<{ token: string }>(
    'POST',
    `/api/lists/${id}/share`,
    {},
  );
  lists[person.firstName] = `/l/${token}`;
  await as('PUT', `/api${linkOf(person.firstName)}/hints/list`, {
    listId: id,
  });
  const reveal = await as<{ receiver: { name: string } }>(
    'POST',
    `/api${linkOf(person.firstName)}/reveal`,
  );
  gives[person.firstName] = reveal.receiver.name;
}
await login(OUTSIDER.email, OUTSIDER.firstName);

console.log(
  `\n« ${GROUP} » est prêt. Connexion : ${BASE}/login, avec l’adresse.\n`,
);
for (const person of PEOPLE) {
  console.log(
    `${person.firstName} (${person.email}) offre à ${gives[person.firstName]}`,
  );
  console.log(`  sa page du tirage : ${BASE}${linkOf(person.firstName)}`);
  console.log(`  sa liste, par son lien : ${BASE}${lists[person.firstName]}`);
}
console.log(
  `\n${OUTSIDER.firstName} (${OUTSIDER.email}) n’est dans aucun tirage : pour voir la barre désactivée, sans note.`,
);
