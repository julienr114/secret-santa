import { expect, test, type APIRequestContext } from '@playwright/test';
import { apiLogin } from './helpers';

// The secret of the draw, checked from the outside (README 8.6 and 18):
// once drawn, nothing the admin API answers may say who gives to whom, nor
// what anyone wishes for. The real pairs are learned the only legitimate
// way, through each participant's own link, then every admin answer is
// searched for them.
test.describe.configure({ mode: 'serial' });

const SLUG = 'famille-coffre';
const SUPER = 'super-security@example.com';
const ORGANIZER = 'orga-coffre@example.com';
const ADMIN = `/api/admin/${SLUG}`;
const NAMES = ['Aude', 'Basile', 'Carla', 'Denis', 'Elsa'];
const WISH = 'SOUHAIT-ULTRA-SECRET';

type Json = null | string | number | boolean | Json[] | { [k: string]: Json };
type Person = { id: string; firstName: string; participationId: string };

const state: {
  superApi?: APIRequestContext;
  guardian?: APIRequestContext;
  anonymous?: APIRequestContext;
  editionId: string;
  people: Person[];
  tokens: Record<string, string>;
  pairs: { giver: Person; receiver: Person }[];
} = { editionId: '', people: [], tokens: {}, pairs: [] };

const ctx = (key: 'superApi' | 'guardian' | 'anonymous') => {
  const value = state[key];
  if (!value) throw new Error(`${key} context missing`);
  return value;
};

/** Every object of a JSON answer, at any depth. */
const objectsOf = (node: Json): { [k: string]: Json }[] => {
  if (Array.isArray(node)) return node.flatMap(objectsOf);
  if (node === null || typeof node !== 'object') return [];
  return [node, ...Object.values(node).flatMap(objectsOf)];
};
/** True when one object of the answer holds both ids of a real pair. */
const leaksAPair = (body: Json) =>
  objectsOf(body).some((object) => {
    const values = Object.values(object).filter((v) => typeof v === 'string');
    return state.pairs.some(
      ({ giver, receiver }) =>
        values.includes(giver.id) && values.includes(receiver.id),
    );
  });
const FORBIDDEN =
  /receiverEnc|receiver_enc|receiverIv|tokenHash|tokenEnc|tokenIv|token_hash|passwordHash/;

const adminReads = () => [
  ADMIN,
  `${ADMIN}/persons`,
  `${ADMIN}/rules`,
  `${ADMIN}/editions`,
  `${ADMIN}/editions/${state.editionId}`,
  `${ADMIN}/editions/${state.editionId}/check`,
  `${ADMIN}/editions/${state.editionId}/messages?type=drawn`,
  `${ADMIN}/editions/${state.editionId}/messages?type=reminder`,
  `${ADMIN}/journal?locale=fr`,
];

test.beforeAll(async ({ playwright, baseURL }) => {
  state.superApi = await playwright.request.newContext({ baseURL });
  state.guardian = await playwright.request.newContext({ baseURL });
  state.anonymous = await playwright.request.newContext({ baseURL });
  const api = ctx('superApi');
  await apiLogin(api, SUPER);
  await api.post('/api/admin/groups', {
    data: { slug: SLUG, name: 'Famille Coffre', organizers: [ORGANIZER] },
  });
  await apiLogin(ctx('guardian'), ORGANIZER);
  const guardian = ctx('guardian');
  const ids: string[] = [];
  for (const firstName of NAMES) {
    const created = await guardian.post(`${ADMIN}/persons`, {
      data: { firstName, email: `${firstName.toLowerCase()}@example.com` },
    });
    ids.push((await created.json()).person.id);
  }
  // An exclusion pairs two ids on purpose: the check below must tell such
  // a rule from a result.
  await guardian.post(`${ADMIN}/exclusions`, {
    data: { giverId: ids[0], receiverId: ids[1], reciprocal: true },
  });
  const edition = await guardian.post(`${ADMIN}/editions`, {
    data: { label: 'Noël du coffre', year: 2026, eventDate: '2026-12-25' },
  });
  state.editionId = (await edition.json()).edition.id;
  const { participants } = await (
    await guardian.get(`${ADMIN}/editions/${state.editionId}`)
  ).json();
  state.people = participants;
  const { messages } = await (
    await guardian.get(
      `${ADMIN}/editions/${state.editionId}/messages?type=invitation`,
    )
  ).json();
  for (const person of state.people) {
    const token = new URL(messages[person.participationId].link).pathname
      .split('/')
      .at(-1);
    state.tokens[person.id] = token ?? '';
    const saved = await ctx('anonymous').put(`/api/p/${token}/wishes`, {
      data: { wishes: [{ label: `${WISH} de ${person.firstName}` }] },
    });
    expect(saved.ok()).toBe(true);
    const portrait = await ctx('anonymous').patch(`/api/p/${token}/hints`, {
      data: { texts: { avoid: `${WISH} évité par ${person.firstName}` } },
    });
    expect(portrait.ok()).toBe(true);
  }
});

test.afterAll(async () => {
  await Promise.all(
    [state.superApi, state.guardian, state.anonymous].map((c) => c?.dispose()),
  );
});

test('the draw answers with a count, never with a pair', async () => {
  const draw = await ctx('guardian').post(
    `${ADMIN}/editions/${state.editionId}/draw`,
  );
  // The organiser takes part too: a person of the group by default.
  expect(await draw.json()).toEqual({ ok: true, count: NAMES.length + 1 });

  // The real pairs, as each participant sees their own.
  for (const giver of state.people) {
    const reveal = await ctx('anonymous').post(
      `/api/p/${state.tokens[giver.id]}/reveal`,
    );
    const { receiver } = await reveal.json();
    const found = state.people.find((p) => p.firstName === receiver.name);
    if (!found) throw new Error(`unknown receiver ${receiver.name}`);
    state.pairs.push({ giver, receiver: found });
  }
  expect(state.pairs).toHaveLength(NAMES.length + 1);
  // The excluded pair was not drawn, in either direction.
  expect(
    state.pairs.some(
      ({ giver, receiver }) =>
        [giver.firstName, receiver.firstName].toSorted().join() ===
        'Aude,Basile',
    ),
  ).toBe(false);
});

test('no admin answer tells who gives to whom, nor any wish', async () => {
  // The detector itself: an answer shaped like a result must be caught,
  // the exclusion rule set up above must not.
  const [real] = state.pairs;
  if (!real) throw new Error('no pair');
  expect(
    leaksAPair({ rows: [{ giverId: real.giver.id, to: real.receiver.id }] }),
  ).toBe(true);
  expect(
    leaksAPair({
      giverId: state.people[0]?.id ?? '',
      receiverId: state.people[1]?.id ?? '',
    }),
  ).toBe(false);

  for (const url of adminReads()) {
    const response = await ctx('guardian').get(url);
    expect(response.status(), url).toBe(200);
    const text = await response.text();
    expect(text, url).not.toContain(WISH);
    expect(text, url).not.toMatch(FORBIDDEN);
    expect(leaksAPair(JSON.parse(text)), url).toBe(false);
  }
  // The results of a drawn edition stay closed to the guardian.
  const results = await ctx('guardian').get(
    `${ADMIN}/editions/${state.editionId}/results`,
  );
  expect(results.status()).toBe(403);
  // The super-admin sees no more than the guardian.
  for (const url of [...adminReads(), '/api/admin/groups']) {
    const text = await (await ctx('superApi').get(url)).text();
    expect(text, url).not.toContain(WISH);
    expect(text, url).not.toMatch(FORBIDDEN);
    expect(leaksAPair(JSON.parse(text)), url).toBe(false);
  }
});

test('a participant learns their own result only, and only by asking', async () => {
  const { giver, receiver } = state.pairs[0] ?? {};
  if (!giver || !receiver) throw new Error('no pair');
  const token = state.tokens[giver.id];
  for (const path of ['', '/wishes', '/hints', '/journal']) {
    const text = await (
      await ctx('anonymous').get(`/api/p/${token}${path}`)
    ).text();
    expect(text, path).not.toContain(receiver.id);
    expect(text, path).not.toContain(`${WISH} de ${receiver.firstName}`);
    expect(text, path).not.toContain(`par ${receiver.firstName}`);
    expect(text, path).not.toMatch(FORBIDDEN);
  }
  // The reveal gives the receiver's hints and nobody else's.
  const reveal = await (
    await ctx('anonymous').post(`/api/p/${token}/reveal`)
  ).json();
  expect(reveal.hints.ideas).toEqual([
    { label: `${WISH} de ${receiver.firstName}`, url: null },
  ]);
  expect(reveal.hints.portrait.texts.avoid).toBe(
    `${WISH} évité par ${receiver.firstName}`,
  );
  expect(JSON.stringify(reveal).match(new RegExp(WISH, 'g'))).toHaveLength(2);
  expect(JSON.stringify(reveal)).not.toMatch(FORBIDDEN);
});

test('without a session every admin route is closed', async () => {
  for (const url of [...adminReads(), '/api/admin/groups']) {
    expect((await ctx('anonymous').get(url)).status(), url).toBe(401);
  }
  const writes = [
    `${ADMIN}/editions/${state.editionId}/draw`,
    `${ADMIN}/editions/${state.editionId}/redraw`,
    `${ADMIN}/editions/${state.editionId}/close`,
    `${ADMIN}/editions/${state.editionId}/emails`,
    `${ADMIN}/editions/${state.editionId}/reveal-one`,
    `${ADMIN}/persons`,
    `${ADMIN}/exclusions`,
  ];
  for (const url of writes) {
    const response = await ctx('anonymous').post(url, { data: {} });
    expect(response.status(), url).toBe(401);
  }
});

test('reading never writes, and pages cannot be framed', async () => {
  const person = state.people[0];
  if (!person) throw new Error('no participant');
  const link = `${ADMIN}/participations/${person.participationId}/link`;
  // Copying a link is journaled, so it is not reachable with a GET.
  expect((await ctx('guardian').get(link)).ok()).toBe(false);
  expect((await ctx('guardian').post(link)).ok()).toBe(true);

  for (const path of ['/login', `/p/${state.tokens[person.id]}`]) {
    const headers = (await ctx('anonymous').get(path)).headers();
    expect(headers['x-frame-options'], path).toBe('DENY');
    expect(headers['content-security-policy'], path).toContain(
      "frame-ancestors 'none'",
    );
    expect(headers['x-content-type-options'], path).toBe('nosniff');
  }
  // Personal pages keep their stricter rules.
  const personal = (
    await ctx('anonymous').get(`/p/${state.tokens[person.id]}`)
  ).headers();
  expect(personal['referrer-policy']).toBe('no-referrer');
  expect(personal['cache-control']).toContain('no-store');
});

test('the link of a list leaks nowhere, and another site cannot write', async () => {
  // A list by its link, page and data (Correction 23): never cached,
  // never indexed, and its address never sent to the shop of an idea.
  const { id } = await (
    await ctx('guardian').post('/api/lists', {
      data: { icon: { emoji: '❄️', color: 'night' }, title: 'Noël' },
    })
  ).json();
  await ctx('guardian').post(`/api/lists/${id}/people`, {
    data: {
      newMember: { firstName: 'Léo', avatar: { emoji: '🚀', color: 'frost' } },
    },
  });
  const { token } = await (
    await ctx('guardian').post(`/api/lists/${id}/share`, { data: {} })
  ).json();
  expect(token).toBeTruthy();
  for (const path of [`/l/${token}`, `/api/l/${token}`]) {
    const headers = (await ctx('anonymous').get(path)).headers();
    expect(headers['referrer-policy'], path).toBe('no-referrer');
    expect(headers['cache-control'], path).toContain('no-store');
    expect(headers['x-robots-tag'], path).toBe('noindex');
  }
  // HTTPS only, on every answer.
  for (const path of ['/login', '/api/health']) {
    const headers = (await ctx('anonymous').get(path)).headers();
    expect(headers['strict-transport-security'], path).toContain(
      'max-age=31536000',
    );
  }
  // A write sent from another site is refused before anything else; the
  // same from the application itself goes on to its usual answer.
  const foreign = await ctx('guardian').post(`${ADMIN}/persons`, {
    data: {},
    headers: { origin: 'https://evil.example' },
  });
  expect(foreign.status()).toBe(403);
  const own = await ctx('guardian').post(`${ADMIN}/persons`, {
    data: {},
    headers: { origin: new URL(foreign.url()).origin },
  });
  expect(own.status()).not.toBe(403);
  // Reading from elsewhere stays possible: a link opened from an email.
  const read = await ctx('anonymous').get('/api/health', {
    headers: { origin: 'https://evil.example' },
  });
  expect(read.ok()).toBe(true);
});
