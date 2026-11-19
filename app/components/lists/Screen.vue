<script setup lang="ts">
import { HOME } from '~/composables/queries/useSession';
import type { SkeletonPart } from '~/components/ui/Skeleton.vue';

// A screen of a list opened by its link (README 22.19), with or without
// an account: the light bar of the participants' screens (back, the name
// of the app, the language, or the menu for someone logged in), then the content, or the loading and
// unknown-link states. The title stays neutral: messaging apps preview
// these links.
defineProps<{
  back?: string;
  pending: boolean;
  error: unknown;
  skeleton?: SkeletonPart[];
}>();
const { t, setLocale } = useT();
const { loggedIn } = useUserSession();
const goBack = useGoBack();
const NuxtLink = resolveComponent('NuxtLink');
useHead({ title: () => t('common.appName') });
</script>

<template>
  <div
    class="flex min-h-[100dvh] flex-col pb-[calc(2rem+var(--tab-bar)+env(safe-area-inset-bottom))]"
  >
    <header class="pt-[env(safe-area-inset-top)]">
      <UContainer class="grid h-14 grid-cols-[1fr_auto_1fr] items-center">
        <div>
          <UButton
            v-if="back"
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
        <AppMenu v-if="loggedIn" class="-mr-2 justify-self-end" />
        <LanguageSwitch
          v-else
          class="-mr-2 justify-self-end"
          @change="setLocale"
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
        data-testid="list-gone"
      >
        <UiEnvelope state="locked" />
        <p class="text-muted" role="alert">{{ t('lists.visitor.gone') }}</p>
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
