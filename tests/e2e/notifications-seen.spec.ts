import { expect, test } from '@playwright/test';
import { apiLogin, hydrated } from './helpers';

// A notification whose news is seen leaves the phone (ticket 175): the
// app, once open, takes away those of news no longer waiting. The phone
// itself needs Julien's iPhone; here, the call to the worker.
const ME = 'notifications-seen@example.com';

test('the open app takes away a notification whose news is seen', async ({
  page,
  context,
  baseURL,
}) => {
  await context.grantPermissions(['notifications'], { origin: baseURL });
  await apiLogin(page.request, ME);
  await page.goto('/');
  await hydrated(page);
  const shown = () =>
    page.evaluate(async () => {
      const registration = await navigator.serviceWorker.ready;
      return (await registration.getNotifications()).map((one) => one.tag);
    });
  await page.evaluate(async () => {
    await navigator.serviceWorker.register('/sw.js');
    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification('Famille', {
      body: 'Ton enveloppe t’attend',
      tag: 'news-seen-elsewhere',
    });
  });
  await expect.poll(shown).toEqual(['news-seen-elsewhere']);
  await page.reload();
  await hydrated(page);
  await expect.poll(shown).toEqual([]);
});
