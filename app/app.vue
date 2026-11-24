<script setup lang="ts">
import { de, en, fr } from '@nuxt/ui/locale';

// Nuxt UI's own texts and the document language follow the interface
// language (see useT).
const { locale } = useT();
// Someone logged in has the bottom bar on every screen
// (README 22.21); each screen stops above it (`--tab-bar`, main.css).
const { loggedIn } = useUserSession();
const UI_LOCALES = { fr, en, de };
// The messages after an action (README 23.3) sit at the bottom, centred,
// under the thumb. While the on-screen keyboard is open it would hide
// them there, and just above it they would cover the line being
// written: they go to the top, under the title bar, until it closes.
const keyboard = useKeyboardInset(() => true, 'message');
const toaster = computed(() => ({
  position:
    keyboard.value.lift > 0
      ? ('top-center' as const)
      : ('bottom-center' as const),
  max: 1,
  expand: false,
  progress: false,
  duration: 4000,
}));
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
  <UApp :locale="UI_LOCALES[locale]" :toaster="toaster">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <UiTabBar v-if="loggedIn" />
  </UApp>
</template>
