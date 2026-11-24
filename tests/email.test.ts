import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { testDb } from './d1';
import { countersOf } from '#server/database/counters';
import { isSwitchOn, setSwitch } from '#server/database/switches';
import { sendEmails } from '#server/http/email';

// The email sender (ticket 129) against a fake email service: while
// « Suspendre les emails » is on, only a login link leaves; what leaves
// is counted; the super-admins are warned once at 70 % of a cap; the cap
// of the month reached suspends the emails by itself.

vi.mock('#server/http/context', async (original) => ({
  ...(await original<typeof import('#server/http/context')>()),
  secretsOf: () => ({
    resendApiKey: 'test-key',
    emailFrom: 'app@test',
    superAdminEmails: 'admin@test',
    baseUrl: 'https://app.test',
  }),
  nowIso: () => '2026-11-24T10:00:00.000Z',
  appUrl: (_event: unknown, path: string) => `https://app.test${path}`,
}));

const email = (to: string) => ({
  to,
  subject: 'S',
  text: 'T',
  html: '<p>T</p>',
});
const posted: string[][] = [];

beforeEach(() => {
  posted.length = 0;
  vi.stubGlobal(
    'fetch',
    vi.fn(async (_url: string, init: { body: string }) => {
      posted.push(
        (JSON.parse(init.body) as { to: string[] }[]).map((one) => one.to[0]!),
      );
      return new Response('{}', { status: 200 });
    }),
  );
});
afterEach(() => vi.unstubAllGlobals());

describe('sending emails', () => {
  it('lets only a login link through while emails are suspended', async () => {
    const { db } = testDb();
    await setSwitch(db, 'emails', true);
    const app = await sendEmails(undefined, [email('a@x.fr')], { db });
    expect(app.ok).toBe(false);
    const login = await sendEmails(undefined, [email('b@x.fr')], {
      db,
      login: true,
    });
    expect(login.ok).toBe(true);
    expect(posted).toEqual([['b@x.fr']]);
  });

  it('counts what leaves, and what is rejected', async () => {
    const { db } = testDb();
    await sendEmails(undefined, [email('a@x.fr'), email('b@x.fr')], { db });
    vi.stubGlobal('fetch', async () => new Response('{}', { status: 422 }));
    await sendEmails(undefined, [email('c@x.fr')], { db });
    const counts = await countersOf(db, '2026-11-24');
    expect(counts.day.emails_sent).toBe(2);
    expect(counts.day.emails_rejected).toBe(1);
  });

  it('warns the super-admins once at 70 % of the day', async () => {
    const { db, sqlite } = testDb();
    sqlite.exec(
      "INSERT INTO app_counters (day, name, count) VALUES ('2026-11-24', 'emails_sent', 69);",
    );
    await sendEmails(undefined, [email('a@x.fr')], { db });
    await sendEmails(undefined, [email('b@x.fr')], { db });
    expect(posted).toEqual([['a@x.fr'], ['admin@test'], ['b@x.fr']]);
  });

  it('suspends the emails once the cap of the month is reached', async () => {
    const { db, sqlite } = testDb();
    sqlite.exec(
      "INSERT INTO app_counters (day, name, count) VALUES ('2026-11-02', 'emails_sent', 2999), ('2026-11-01', 'warned_emails_month', 1);",
    );
    await sendEmails(undefined, [email('a@x.fr')], { db });
    expect(await isSwitchOn(db, 'emails')).toBe(true);
    const after = await sendEmails(undefined, [email('b@x.fr')], { db });
    expect(after.ok).toBe(false);
  });
});
