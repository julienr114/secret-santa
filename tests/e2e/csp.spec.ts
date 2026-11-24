import { expect, test, type Page } from '@playwright/test';
import { apiLogin, hydrated } from './helpers';

// The content policy (lot 38 A, README 8) is sent as « report only »:
// the browser applies nothing yet, and tells what it would have refused.
// These pages must report nothing, so that applying it breaks nothing.
const EMAIL = 'csp-camille@example.com';

/** Collects what the policy would refuse, on every page of the context. */
const watch = async (page: Page) => {
  await page.addInitScript(() => {
    const seen: string[] = [];
    (window as unknown as { cspSeen: string[] }).cspSeen = seen;
    document.addEventListener('securitypolicyviolation', (event) => {
      seen.push(
        `${event.violatedDirective} ${event.blockedURI} ${event.sourceFile}:${event.lineNumber} ${event.sample}`,
      );
    });
  });
};
const seen = (page: Page) =>
  page.evaluate(() => (window as unknown as { cspSeen: string[] }).cspSeen);

test('the pages send a strict policy, and would break nothing of it', async ({
  page,
}) => {
  await watch(page);
  const first = await page.goto('/');
  const policy = first?.headers()['content-security-policy-report-only'] ?? '';
  expect(policy).toContain("default-src 'self'");
  expect(policy).toMatch(/script-src 'self' 'nonce-[A-Za-z0-9+/=]+'/);
  expect(policy).toContain("object-src 'none'");
  expect(policy).toContain("base-uri 'self'");
  expect(policy).toContain("form-action 'self'");
  expect(policy).not.toContain('unsafe-eval');
  // A nonce of its own for each answer.
  const again = await page.request.get('/');
  expect(again.headers()['content-security-policy-report-only']).not.toBe(
    policy,
  );
  await hydrated(page);
  expect(await seen(page)).toEqual([]);

  // Logged in: the home, a list and its document, « Mon compte ».
  await apiLogin(page.request, EMAIL);
  await page.request.put('/api/auth/profile', {
    data: { firstName: 'Camille', avatarEmoji: '🦌', avatarColor: 'plum' },
  });
  const { id } = await (
    await page.request.post('/api/lists', {
      data: { icon: { emoji: '🎄', color: 'pine' }, title: 'Noël sous règle' },
    })
  ).json();
  const person = await (
    await page.request.post(`/api/lists/${id}/people`, {
      data: {
        newMember: { firstName: 'Léo', avatar: { emoji: '🚀', color: 'pine' } },
      },
    })
  ).json();
  await page.request.post(`/api/lists/${id}/ideas`, {
    data: { listPersonId: person.id, text: 'Un cerf-volant' },
  });
  const { token } = await (
    await page.request.post(`/api/lists/${id}/share`, { data: {} })
  ).json();
  for (const path of ['/', `/listes/${id}`, '/compte', `/l/${token}`]) {
    await page.goto(path);
    await hydrated(page);
    // Icons and fonts come after the page: leave them the time to load.
    await page.waitForLoadState('networkidle');
    expect(await seen(page), path).toEqual([]);
  }
});
