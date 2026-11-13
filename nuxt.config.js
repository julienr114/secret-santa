import { defineNuxtConfig } from 'nuxt/config';

export default defineNuxtConfig({
  compatibilityDate: '2026-11-13',
  devtools: { enabled: true },
  modules: ['@nuxt/eslint'],
  // Plain JavaScript project: Nuxt still generates .nuxt/tsconfig.json for
  // editor tooling, but never type-checks.
  typescript: { typeCheck: false },
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
