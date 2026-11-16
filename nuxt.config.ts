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
};

export default defineNuxtConfig({
  compatibilityDate: '2026-11-13',
  devServer: { port: 4000 },
  devtools: { enabled: true },
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
  // Light theme only: the art direction is a kraft-paper Christmas card.
  ui: { colorMode: false },
  vite: { plugins: [tailwindcss()] },
  // Strict TypeScript; `pnpm typecheck` (vue-tsc) runs in CI rather than on
  // every dev reload.
  typescript: { strict: true, typeCheck: false },
  // Cloudflare Workers. In dev, Nitro emulates the bindings declared in
  // wrangler.toml through Miniflare (state in .wrangler/state/v3).
  nitro: { preset: 'cloudflare_module' },
  routeRules: {
    '/**': { headers: securityHeaders },
    '/p/**': { headers: personalHeaders },
    '/api/p/**': { headers: personalHeaders },
    // A login link is a credential in a URL, like a personal link.
    '/login/**': { headers: personalHeaders },
    // An invitation link is shared, but still no business of search engines.
    '/rejoindre/**': { headers: personalHeaders },
    '/api/invite/**': { headers: personalHeaders },
    // The old address of the login page.
    '/admin': { redirect: '/' },
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
          content: 'width=device-width, initial-scale=1, viewport-fit=cover',
        },
        { name: 'robots', content: 'noindex' },
        { name: 'theme-color', content: '#f7f2e9' },
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
