<script setup lang="ts">
import { de, en, fr } from '@nuxt/ui/locale';

// Nuxt UI's own texts and the document language follow the interface
// language (see useT).
const { locale } = useT();
const UI_LOCALES = { fr, en, de };
useHead({ htmlAttrs: { lang: locale } });
</script>

<template>
  <UApp :locale="UI_LOCALES[locale]">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
