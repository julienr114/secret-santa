import { expect, test, type APIRequestContext } from '@playwright/test';
import { apiLogin } from './helpers';

// The lists are walled off (lot 38 A, README 8.5), checked from the
// outside like the draws (security.spec): account B tries every route of
// account A's list and people; the link of one list tries the ideas of
// another; nothing a visitor reads names who ticked what. And the caps
// and the names of the safety net answer as they should.
test.describe.configure({ mode: 'serial' });

const A = 'wall-camille@example.com';
const B = 'wall-voisin@example.com';
const GIVER = 'wall-mamie@example.com';

const state: {
  a?: APIRequestContext;
  b?: APIRequestContext;
  giver?: APIRequestContext;
  anonymous?: APIRequestContext;
  listId: string;
  token: string;
  personId: string;
  memberId: string;
  ideaId: string;
  otherToken: string;
  otherIdeaId: string;
  otherPersonId: string;
  holderId: string;
  inviteId: string;
} = {
  listId: '',
  token: '',
  personId: '',
  memberId: '',
  ideaId: '',
  otherToken: '',
  otherIdeaId: '',
  otherPersonId: '',
  holderId: '',
  inviteId: '',
};
const ctx = (who: 'a' | 'b' | 'giver' | 'anonymous') => {
  const api = state[who];
  if (!api) throw new Error(`${who} is not ready`);
  return api;
};
/** A list with one person and one idea, shared. */
const makeList = async (
  api: APIRequestContext,
  title: string,
  name: string,
) => {
  const { id } = await (
    await api.post('/api/lists', {
      data: { icon: { emoji: '🎄', color: 'pine' }, title },
    })
  ).json();
  const person = await (
    await api.post(`/api/lists/${id}/people`, {
      data: {
        newMember: { firstName: name, avatar: { emoji: '🚀', color: 'pine' } },
      },
    })
  ).json();
  const idea = await (
    await api.post(`/api/lists/${id}/ideas`, {
      data: { listPersonId: person.id, text: `Idée secrète de ${name}` },
    })
  ).json();
  const { token } = await (
    await api.post(`/api/lists/${id}/share`, { data: {} })
  ).json();
  return {
    id,
    token,
    personId: person.id,
    memberId: person.memberId,
    ideaId: idea.id,
  };
};

test.beforeAll(async ({ playwright, baseURL }) => {
  const login = async (email: string, firstName: string) => {
    const api = await playwright.request.newContext({ baseURL });
    await apiLogin(api, email);
    await api.put('/api/auth/profile', {
      data: { firstName, avatarEmoji: '🦌', avatarColor: 'plum' },
    });
    return api;
  };
  state.a = await login(A, 'Camille');
  state.b = await login(B, 'Voisin');
  state.giver = await login(GIVER, 'Mamie-Secrète');
  state.anonymous = await playwright.request.newContext({ baseURL });
  const mine = await makeList(state.a, 'Noël muré', 'Léo');
  const other = await makeList(state.a, 'Anniversaire muré', 'Inès');
  // Someone gives Léo's idea, under their name, and a gift off the list.
  await state.giver.post(`/api/l/${mine.token}/claims`, {
    data: { ideaId: mine.ideaId },
  });
  await state.giver.post(`/api/l/${mine.token}/off-list`, {
    data: { listPersonId: mine.personId, text: 'Surprise de Mamie-Secrète' },
  });
  // An invitation waiting, to try its routes.
  await state.a.post(`/api/lists/${mine.id}/holders`, {
    data: { email: 'wall-invite@example.com' },
  });
  const holders = await (
    await state.a.get(`/api/lists/${mine.id}/holders`)
  ).json();
  Object.assign(state, {
    listId: mine.id,
    token: mine.token,
    personId: mine.personId,
    memberId: mine.memberId,
    ideaId: mine.ideaId,
    otherToken: other.token,
    otherIdeaId: other.ideaId,
    otherPersonId: other.personId,
    holderId: holders.holders[0].accountId,
    inviteId: holders.invites[0].id,
  });
});

test.afterAll(async () => {
  await Promise.all(
    [state.a, state.b, state.giver, state.anonymous].map((api) =>
      api?.dispose(),
    ),
  );
});

test('another account reaches no route of a list it does not hold', async () => {
  const list = `/api/lists/${state.listId}`;
  const calls: [string, string, unknown?][] = [
    ['get', list],
    ['patch', list, { title: 'Volé' }],
    ['delete', list],
    ['post', `${list}/share`, { ask: 'off' }],
    ['put', `${list}/order`, []],
    ['post', `${list}/people`, { memberId: state.memberId }],
    ['delete', `${list}/people/${state.personId}`],
    ['post', `${list}/ideas`, { listPersonId: state.personId, text: 'x' }],
    ['patch', `${list}/ideas/${state.ideaId}`, { text: 'Volé' }],
    ['delete', `${list}/ideas/${state.ideaId}`],
    ['post', `${list}/claims`, { ideaId: state.ideaId }],
    ['patch', `${list}/claims/${state.ideaId}`, { note: 'x' }],
    ['delete', `${list}/claims/${state.ideaId}`],
    ['get', `${list}/holders`],
    ['post', `${list}/holders`, { email: B }],
    ['patch', `${list}/holders/${state.holderId}`, { level: 'write' }],
    ['delete', `${list}/holders/${state.holderId}`],
    ['delete', `${list}/invites/${state.inviteId}`],
    ['post', `${list}/invites/${state.inviteId}/resend`],
    ['get', `/api/family/${state.memberId}`],
    ['patch', `/api/family/${state.memberId}`, { firstName: 'Volé' }],
    ['delete', `/api/family/${state.memberId}`],
  ];
  for (const who of ['b', 'anonymous'] as const) {
    for (const [method, path, data] of calls) {
      const response = await ctx(who).fetch(path, { method, data });
      // Not found for an account, as if the list did not exist; no
      // session, no answer at all.
      expect(response.status(), `${who} ${method} ${path}`).toBe(
        who === 'b' ? 404 : 401,
      );
      expect(await response.text(), `${who} ${method} ${path}`).not.toContain(
        'Léo',
      );
    }
  }
  // B's own lists and people say nothing of A's.
  for (const path of ['/api/lists', '/api/family']) {
    const text = await (await ctx('b').get(path)).text();
    expect(text, path).not.toContain('Noël muré');
    expect(text, path).not.toContain('Léo');
  }
  // Nothing moved: A still reads the list as it was.
  const doc = await (await ctx('a').get(list)).json();
  expect(doc.list.title).toBe('Noël muré');
  expect(doc.people[0].ideas[0].text).toBe('Idée secrète de Léo');
  expect(doc.holders).toHaveLength(1);
});

test('the link of a list opens nothing of another list', async () => {
  const mine = `/api/l/${state.token}`;
  const calls: [string, string, unknown?][] = [
    ['post', `${mine}/claims`, { ideaId: state.otherIdeaId }],
    ['patch', `${mine}/claims/${state.otherIdeaId}`, { note: 'x' }],
    [
      'post',
      `${mine}/ideas`,
      { listPersonId: state.otherPersonId, text: 'x', after: null },
    ],
    ['patch', `${mine}/ideas/${state.otherIdeaId}`, { text: 'Volé' }],
    ['delete', `${mine}/ideas/${state.otherIdeaId}`],
    [
      'post',
      `${mine}/off-list`,
      { listPersonId: state.otherPersonId, text: 'x' },
    ],
  ];
  for (const [method, path, data] of calls) {
    const response = await ctx('b').fetch(path, { method, data });
    expect(response.status(), `${method} ${path}`).toBe(404);
  }
  // The idea of the other list was not touched, nor ticked.
  const other = await (await ctx('b').get(`/api/l/${state.otherToken}`)).json();
  expect(other.people[0].ideas[0].text).toBe('Idée secrète de Inès');
  expect(other.people[0].ideas[0].view.kind).toBe('free');
  // Without a session, the link reads, and writes nothing.
  const write = await ctx('anonymous').post(`${mine}/claims`, {
    data: { ideaId: state.ideaId },
  });
  expect(write.status()).toBe(401);
});

test('nothing a visitor reads says who ticked what', async () => {
  for (const who of ['b', 'anonymous'] as const) {
    for (const path of [`/api/l/${state.token}`, `/l/${state.token}`]) {
      const text = await (await ctx(who).get(path)).text();
      // The idea is there, taken; not who gives it, nor their words.
      expect(text, `${who} ${path}`).toContain('Idée secrète de Léo');
      expect(text, `${who} ${path}`).not.toContain('Mamie-Secrète');
      expect(text, `${who} ${path}`).not.toContain(GIVER);
      expect(text, `${who} ${path}`).not.toContain(A);
    }
  }
  // The one who holds the list does read the name: the test would see it.
  const held = await (await ctx('a').get(`/api/lists/${state.listId}`)).text();
  expect(held).toContain('Mamie-Secrète');
});

test('a name that carries a web address is refused, with its reason', async () => {
  const refused = [
    await ctx('a').post('/api/lists', {
      data: {
        icon: { emoji: '🎄', color: 'pine' },
        title: 'Gagne sur promo.xyz',
      },
    }),
    await ctx('a').patch(`/api/lists/${state.listId}`, {
      data: { title: 'https://exemple.fr' },
    }),
    await ctx('a').post('/api/family', {
      data: {
        firstName: 'www.gain.example',
        avatar: { emoji: '🚀', color: 'pine' },
      },
    }),
    await ctx('a').put('/api/auth/profile', {
      data: {
        firstName: 'Léa bit.ly/x',
        lastName: null,
        language: 'fr',
        avatarEmoji: '🦌',
        avatarColor: 'plum',
      },
    }),
  ];
  for (const response of refused) {
    expect(response.status(), response.url()).toBe(400);
    expect((await response.json()).statusMessage).toBe('web_address');
  }
  // An ordinary name with a dot still goes.
  const fine = await ctx('a').post('/api/family', {
    data: { firstName: 'J. Martin', avatar: { emoji: '🚀', color: 'pine' } },
  });
  expect(fine.status()).toBe(201);
});

test('what one visitor may add to a list is capped', async () => {
  // Twenty gifts off the list from one account on one list, no more.
  const add = () =>
    ctx('b').post(`/api/l/${state.otherToken}/off-list`, {
      data: { listPersonId: state.otherPersonId, text: 'encore un' },
    });
  // One after the other: each one counts those before it.
  const statuses = await Array.from({ length: 21 }).reduce<Promise<number[]>>(
    async (done) => [...(await done), (await add()).status()],
    Promise.resolve([]),
  );
  expect(statuses.slice(0, 20).every((status) => status === 201)).toBe(true);
  expect(statuses[20]).toBe(409);
  const last = await add();
  expect((await last.json()).statusMessage).toBe('limit_off_list');
});
