// The service worker of Under the Tree (ticket 124): only the
// notifications of the phone and the badge of the icon. No offline mode:
// it keeps nothing and never answers a request in place of the server.

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) =>
  event.waitUntil(self.clients.claim()),
);

// A notification from the server: what a locked phone may show (the
// server writes nothing more), and the news not seen yet on the icon.
// It carries its news as its tag; those of news seen since, on this
// phone or elsewhere, go (ticket 175): a phone shows every push, so this
// is the only moment the app is not open and may still tidy them.
self.addEventListener('push', (event) => {
  const message = (() => {
    try {
      return event.data ? event.data.json() : null;
    } catch {
      return null;
    }
  })();
  if (!message) return;
  event.waitUntil(
    Promise.all([
      self.registration
        .showNotification(message.title, {
          body: message.body,
          icon: '/icon-192.png',
          badge: '/icon-192.png',
          data: { url: message.url },
          tag: message.tag || message.url,
        })
        .then(() =>
          Array.isArray(message.keep)
            ? self.registration
                .getNotifications()
                .then((shown) =>
                  shown
                    .filter(
                      (one) =>
                        one.tag !== message.tag &&
                        !message.keep.includes(one.tag),
                    )
                    .forEach((one) => one.close()),
                )
            : undefined,
        ),
      typeof message.badge === 'number' && 'setAppBadge' in navigator
        ? navigator.setAppBadge(message.badge).catch(() => undefined)
        : Promise.resolve(),
    ]),
  );
});

// Touching it opens the screen it speaks of, in the app if it is open.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = new URL(
    (event.notification.data && event.notification.data.url) || '/',
    self.location.origin,
  ).href;
  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((windows) => {
        const open = windows.find((one) => 'focus' in one);
        return open
          ? open.focus().then((focused) => focused.navigate(url))
          : self.clients.openWindow(url);
      }),
  );
});
