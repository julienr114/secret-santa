<script setup lang="ts">
import { de, en, fr } from '@nuxt/ui/locale';

// Nuxt UI's own texts and the document language follow the interface
// language (see useT).
const { locale } = useT();
// Someone logged in has the bar « Tirages / Listes » on every screen
// (README 22.21); each screen stops above it (`--tab-bar`, main.css).
const { loggedIn } = useUserSession();
const UI_LOCALES = { fr, en, de };
useHead({
  htmlAttrs: {
    lang: locale,
    class: () => (loggedIn.value ? 'has-tab-bar' : ''),
  },
});
</script>

<template>
  <!-- One message at a time, at the bottom, without a progress line
       (README 23.3): a new one replaces the old. -->
  <UApp
    :locale="UI_LOCALES[locale]"
    :toaster="{
      position: 'bottom-center',
      max: 1,
      expand: false,
      progress: false,
      duration: 4000,
    }"
  >
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <UiTabBar v-if="loggedIn" />
  </UApp>
</template>
