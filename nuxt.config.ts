import { existsSync } from 'node:fs';
import { appendFile } from 'node:fs/promises';
import { join } from 'node:path';
import { defineNuxtConfig } from 'nuxt/config';
import tailwindcss from '@tailwindcss/vite';

// Personal pages and their API (README 8.1): never cached, never indexed,
// and the token in the URL never leaks through a Referer header.
const personalHeaders = {
  'Referrer-Policy': 'no-referrer',
  'Cache-Control': 'no-store',
  'X-Robots-Tag': 'noindex',
};

// Every page and API answer: never framed by another site, no content
// type guessing, no path leaked to other sites, no device features.
const securityHeaders = {
  'X-Frame-Options': 'DENY',
  'Content-Security-Policy': "frame-ancestors 'none'",
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  // HTTPS only, for a year. Not the sub-domains: nothing says they all
  // answer in HTTPS.
  'Strict-Transport-Security': 'max-age=31536000',
};

export default defineNuxtConfig({
  compatibilityDate: '2026-11-13',
  devServer: { port: 4000 },
  devtools: { enabled: true },
  // Development only: the session cookie is not `Secure`, so that logging in
  // works over plain HTTP on the local network (a phone on the same wifi).
  $development: {
    runtimeConfig: { session: { cookie: { secure: false } } },
  },
  modules: ['@nuxt/eslint', 'nuxt-auth-utils', '@nuxt/ui'],
  // Secrets come from the environment (NUXT_* variables, Cloudflare secrets
  // in production). See README section 15.
  runtimeConfig: {
    dataKey: '',
    // Bulk sending by email (Resend). Without a key the feature answers
    // "not configured"; sharing from the phone never depends on it.
    // Accounts (README 22.5). Addresses that become super-admins on their
    // first login link: how a fresh install gets its administrator.
    superAdminEmails: '',
    // Development and tests only: the login link is returned to the screen
    // instead of only being emailed. Never in production.
    devLoginLinks: false,
    // Login links one client address may ask for per hour (0: default).
    linkRequestsPerIp: 0,
    resendApiKey: '',
    emailFrom: 'Under the Tree <gardien@under-the-tree.party>',
    // 30 days; each session is also a row that can be revoked.
    session: { maxAge: 60 * 60 * 24 * 30, cookie: { sameSite: 'lax' } },
    public: { baseUrl: '' },
  },
  css: ['~/assets/css/main.css'],
  // Outfit for the titles, DM Sans for the text (README 23.5), with the
  // only weights the screens use.
  fonts: {
    families: [
      { name: 'Outfit', provider: 'google', weights: [600, 700] },
      {
        name: 'DM Sans',
        provider: 'google',
        weights: [400, 500, 600, 700],
        styles: ['normal', 'italic'],
      },
    ],
  },
  // Light theme only (README 23.5: a dark mode is out of this lot).
  ui: { colorMode: false },
  vite: { plugins: [tailwindcss()] },
  // Strict TypeScript; `pnpm typecheck` (vue-tsc) runs in CI rather than on
  // every dev reload.
  typescript: { strict: true, typeCheck: false },
  // Cloudflare Workers. In dev, Nitro emulates the bindings declared in
  // wrangler.toml through Miniflare (state in .wrangler/state/v3).
  nitro: { preset: 'cloudflare_module' },
  hooks: {
    // The file that tells an open tab a new version is out must be asked
    // again each time (Correction 11). Nitro gives it, through the
    // `_headers` of Cloudflare, both « one second » and the year of the
    // other code files, joined: the year won, and no tab ever learnt of a
    // deployment. A rule at the end of the file takes both off, then sets
    // its own (Cloudflare applies the rules in order). Added after the
    // preset's own hook, which writes the file.
    'nitro:init': (nitro) => {
      nitro.hooks.hook('compiled', async () => {
        const file = join(nitro.options.output.publicDir, '_headers');
        if (!existsSync(file)) return;
        await appendFile(
          file,
          '\n/_nuxt/builds/latest.json\n  ! cache-control\n  cache-control: no-cache\n',
        );
      });
    },
  },
  routeRules: {
    '/**': { headers: securityHeaders },
    '/p/**': { headers: personalHeaders },
    '/api/p/**': { headers: personalHeaders },
    // The link of a list is a secret in a URL too (Correction 23): opening
    // the link of an idea must not send it to that shop in a Referer.
    '/l/**': { headers: personalHeaders },
    '/api/l/**': { headers: personalHeaders },
    // A login link is a credential in a URL, like a personal link.
    '/login/**': { headers: personalHeaders },
    // An invitation link is shared, but still no business of search engines.
    '/rejoindre/**': { headers: personalHeaders },
    '/api/invite/**': { headers: personalHeaders },
    // The link of an invitation to hold a list is worth a login for the
    // address invited (lot 25 bis).
    '/invitation/**': { headers: personalHeaders },
    '/api/invitations/**': { headers: personalHeaders },
    '/api/auth/**': { headers: personalHeaders },
  },
  app: {
    head: {
      htmlAttrs: { lang: 'fr' },
      title: 'Under the Tree',
      meta: [
        // The page runs under the iPhone's rounded corners and home bar; each
        // bar, sheet and footer keeps its content out of them (README 23.3).
        {
          name: 'viewport',
          // Android shrinks the page under its keyboard, so that a bottom
          // sheet stays above it (iPhone: see useKeyboardInset).
          content:
            'width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-content',
        },
        { name: 'robots', content: 'noindex' },
        { name: 'theme-color', content: '#fff6f1' },
      ],
      // The tab icon: a tree under its star. SVG first, PNG for browsers
      // that do not take SVG icons, and a larger one for phone home screens.
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        {
          rel: 'icon',
          type: 'image/png',
          sizes: '32x32',
          href: '/favicon-32.png',
        },
        {
          rel: 'apple-touch-icon',
          sizes: '180x180',
          href: '/apple-touch-icon.png',
        },
      ],
    },
  },
});
