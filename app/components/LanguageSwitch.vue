<script setup lang="ts">
import { LOCALES, type Locale } from '#shared/i18n';

// A small button showing the current language, with the three languages
// in a menu. It only reports the choice: the admin side remembers it on
// the device, a personal page saves it as the participant's preference.
const emit = defineEmits<{ change: [locale: Locale] }>();
const { t, tk, locale } = useT();
const items = computed(() =>
  LOCALES.map((code) => ({
    label: tk(`common.language.${code}`),
    type: 'checkbox' as const,
    checked: code === locale.value,
    onSelect: () => emit('change', code),
  })),
);
</script>

<template>
  <UDropdownMenu :items="items">
    <UButton
      variant="ghost"
      color="neutral"
      :label="locale.toUpperCase()"
      :aria-label="t('adminShell.changeLanguage')"
    />
  </UDropdownMenu>
</template>
