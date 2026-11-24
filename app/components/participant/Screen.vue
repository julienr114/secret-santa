<script setup lang="ts">
import type { Locale } from '#shared/i18n';
import { useSaveLanguageMutation } from '~/composables/queries/usePersonal';
import { HOME } from '~/composables/queries/useSession';
import type { SkeletonPart } from '~/components/ui/Skeleton.vue';

// One participant screen: a light top bar (back on the left, the name of
// the app in the middle, the language on the right, or the menu for
// someone logged in: README 22.21), then the content, or the loading and
// refused-link states. For someone logged in, the name of the app
// leads back to their home. The title stays neutral: messaging apps preview
// these links (README 11).
const props = defineProps<{
  token: string;
  back?: string;
  pending: boolean;
  error: unknown;
  /** The shape of the screen while it loads. */
  skeleton?: SkeletonPart[];
}>();
const { t, setLocale } = useT();
const { loggedIn } = useUserSession();
const goBack = useGoBack();
const errorMessage = useErrorMessage();
// A string in <component :is> does not resolve global components.
const NuxtLink = resolveComponent('NuxtLink');
useHead({ title: () => t('common.appName') });

// With a valid link the choice is saved as the participant's preference
// (page, messages and emails); on a refused link it only changes the
// language of this screen.
const saveLanguage = useSaveLanguageMutation(() => props.token);
const onSaveLanguage = (locale: Locale) => {
  if (!props.error) saveLanguage.mutate(locale);
};
const onLanguage = (locale: Locale) => {
  setLocale(locale);
  onSaveLanguage(locale);
};
</script>

<template>
  <!-- At least the window's height, so a sticky footer rests at the
       bottom of a short screen. -->
  <div
    class="flex min-h-[100dvh] flex-col pb-[calc(2rem+var(--tab-bar)+env(safe-area-inset-bottom))]"
  >
    <header class="pt-[env(safe-area-inset-top)]">
      <UContainer class="grid h-14 grid-cols-[1fr_auto_1fr] items-center">
        <div>
          <UButton
            v-if="back && !error"
            variant="ghost"
            color="neutral"
            icon="i-lucide-chevron-left"
            :aria-label="t('common.actions.back')"
            class="-ml-2"
            @click="goBack(back)"
          />
        </div>
        <component
          :is="loggedIn ? NuxtLink : 'span'"
          :to="loggedIn ? HOME : undefined"
          class="truncate font-display text-lg font-bold text-primary"
          >✦ {{ t('common.appName') }}</component
        >
        <AppMenu
          v-if="loggedIn"
          class="-mr-2 justify-self-end"
          @language="onSaveLanguage"
        />
        <LanguageSwitch
          v-else
          class="-mr-2 justify-self-end"
          @change="onLanguage"
        />
      </UContainer>
    </header>
    <UContainer
      as="main"
      class="flex w-full max-w-md grow flex-col gap-6 pt-4 pb-5"
    >
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
      <UiSkeleton
        v-else-if="pending"
        :parts="skeleton ?? ['title', 'card']"
        :rows="2"
        :label="t('common.loading')"
      />
      <slot v-else />
    </UContainer>
  </div>
</template>
