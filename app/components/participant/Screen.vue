<script setup lang="ts">
import type { Locale } from '#shared/i18n';
import { useSaveLanguageMutation } from '~/composables/queries/usePersonal';

// One participant screen: a light top bar (back to the personal page on
// sub-screens, language on the right), then the content, or the loading
// and refused-link states. The title stays neutral: messaging apps preview
// these links (README 11).
const props = defineProps<{
  token: string;
  back?: string;
  pending: boolean;
  error: unknown;
}>();
const { t, setLocale } = useT();
const errorMessage = useErrorMessage();
useHead({ title: () => t('common.appName') });

// With a valid link the choice is saved as the participant's preference
// (page, messages and emails); on a refused link it only changes the
// language of this screen.
const saveLanguage = useSaveLanguageMutation(() => props.token);
const onLanguage = (locale: Locale) => {
  setLocale(locale);
  if (!props.error) saveLanguage.mutate(locale);
};
</script>

<template>
  <div class="min-h-dvh pb-[calc(2rem+env(safe-area-inset-bottom))]">
    <header class="pt-[env(safe-area-inset-top)]">
      <UContainer class="flex h-14 max-w-md items-center gap-1">
        <UButton
          v-if="back && !error"
          :to="back"
          variant="ghost"
          color="neutral"
          icon="i-lucide-chevron-left"
          :aria-label="t('common.actions.back')"
          class="-ml-2"
        />
        <span class="grow font-display text-lg font-bold text-primary"
          >✦ {{ t('common.appName') }}</span
        >
        <LanguageSwitch class="-mr-2" @change="onLanguage" />
      </UContainer>
    </header>
    <UContainer as="main" class="flex max-w-md flex-col gap-6 py-4">
      <div
        v-if="error"
        class="flex flex-col items-center gap-3 py-12 text-center"
      >
        <p class="text-4xl" aria-hidden="true">🔒</p>
        <h1 class="font-display text-2xl font-bold">
          {{ t('participant.invalid.title') }}
        </h1>
        <p class="text-muted" role="alert">{{ errorMessage(error) }}</p>
      </div>
      <div
        v-else-if="pending"
        class="flex flex-col gap-4"
        aria-busy="true"
        :aria-label="t('common.loading')"
      >
        <USkeleton class="h-9 w-2/3 rounded-md bg-[var(--color-kraft-200)]" />
        <USkeleton class="h-40 rounded-lg bg-[var(--color-kraft-200)]" />
      </div>
      <slot v-else />
    </UContainer>
  </div>
</template>
