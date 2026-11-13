import { defineNuxtConfig } from 'nuxt/config';
import tailwindcss from '@tailwindcss/vite';

export default defineNuxtConfig({
  compatibilityDate: '2026-11-13',
  devtools: { enabled: true },
  modules: ['@nuxt/eslint', 'nuxt-auth-utils', '@nuxt/ui'],
  // Secrets come from the environment (NUXT_* variables, Cloudflare secrets
  // in production). See README section 15.
  runtimeConfig: {
    superAdminPassword: '',
    dataKey: '',
    pinPepper: '',
    pbkdf2Iterations: 20000,
    session: { maxAge: 60 * 60 * 12, cookie: { sameSite: 'lax' } },
    public: { baseUrl: '' },
  },
  css: ['~/assets/css/main.css'],
  vite: { plugins: [tailwindcss()] },
  // Strict TypeScript; `pnpm typecheck` (vue-tsc) runs in CI rather than on
  // every dev reload.
  typescript: { strict: true, typeCheck: false },
  // Cloudflare Workers. In dev, Nitro emulates the bindings declared in
  // wrangler.toml through Miniflare (state in .wrangler/state/v3).
  nitro: { preset: 'cloudflare_module' },
  app: {
    head: {
      htmlAttrs: { lang: 'fr' },
      title: 'Secret Santa',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'robots', content: 'noindex' },
      ],
    },
  },
});
