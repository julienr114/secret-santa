<script setup lang="ts">
import type { Locale } from '#shared/i18n';
import { useSaveLanguageMutation } from '~/composables/queries/usePersonal';
import { HOME } from '~/composables/queries/useSession';

// One participant screen: a light top bar (back on the left, the name of
// the app in the middle, language on the right), then the content, or the loading
// and refused-link states. For someone logged in, the name of the app
// leads back to their home. The title stays neutral: messaging apps preview
// these links (README 11).
const props = defineProps<{
  token: string;
  back?: string;
  pending: boolean;
  error: unknown;
}>();
const { t, setLocale } = useT();
const { loggedIn } = useUserSession();
const fromHome = useDrawFromHome();
// "Retour" follows the history, like the rest of the app: a sub-screen
// goes back to where the user came from (the draw, or the home page), or
// to `back` when opened directly. The draw page itself has one only when
// it was opened from the home page.
const fromHomeHere = computed(
  () =>
    loggedIn.value &&
    !props.error &&
    fromHome.value?.path === `/p/${props.token}`,
);
const goBack = useGoBack();
const errorMessage = useErrorMessage();
// A string in <component :is> does not resolve global components.
const NuxtLink = resolveComponent('NuxtLink');
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
      <UContainer class="grid h-14 grid-cols-[1fr_auto_1fr] items-center">
        <div>
          <UButton
            v-if="(back || fromHomeHere) && !error"
            variant="ghost"
            color="neutral"
            icon="i-lucide-chevron-left"
            :aria-label="t('common.actions.back')"
            class="-ml-2"
            @click="goBack(back ?? HOME)"
          />
        </div>
        <component
          :is="loggedIn ? NuxtLink : 'span'"
          :to="loggedIn ? HOME : undefined"
          class="truncate font-display text-lg font-bold text-primary"
          >✦ {{ t('common.appName') }}</component
        >
        <LanguageSwitch class="-mr-2 justify-self-end" @change="onLanguage" />
      </UContainer>
    </header>
    <UContainer as="main" class="flex max-w-md flex-col gap-6 py-4">
      <div
        v-if="error"
        class="flex flex-col items-center gap-3 py-12 text-center"
      >
        <UiEnvelope state="locked" />
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
        <USkeleton class="h-9 w-2/3 rounded-md bg-skeleton" />
        <USkeleton class="h-40 rounded-lg bg-skeleton" />
      </div>
      <slot v-else />
    </UContainer>
  </div>
</template>
