<script setup lang="ts">
import { HOME } from '~/composables/queries/useSession';
import type { SkeletonPart } from '~/components/ui/Skeleton.vue';

// A screen of a list opened by its link (README 22.19), with or without
// an account: the light bar of the participants' screens (back, the name
// of the app, the language, or the menu for someone logged in), then the
// content, or the loading state. A list that is not open to whoever
// arrives says so without a word of the list (docs/spec/v3/listes.md,
// « Arriver par le lien »): logged out, « Se connecter », which comes back
// here (V3ListeFermee); logged in, ask whoever sent the link
// (V3ListeFermeeConnecte). One its link lets into its event (ticket 117)
// sees the list load while the page lets them in. The title stays neutral:
// messaging apps preview these links.
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
const route = useRoute();
/** Which refusal: log in first, not shared, or anything else. */
const refusal = (error: unknown) => {
  const code = (error as { statusCode?: number }).statusCode;
  return code === 401 ? 'login' : code === 403 ? 'closed' : 'gone';
};
/**
 * Whether the page is letting them into the list's event.
 * @param error - The refusal.
 * @returns True while coming in.
 */
const entering = (error: unknown) =>
  (error as { statusMessage?: string } | null)?.statusMessage === 'list_join';
useHead({ title: () => t('common.appName') });
</script>

<template>
  <div
    class="flex min-h-[100dvh] flex-col pb-[calc(2rem+var(--tab-bar)+env(safe-area-inset-bottom))]"
  >
    <!-- Stuck on top, as on every screen of the app (AdminScreen): the bar
         of a list, its mode included, stays under it (Julien, 24 November
         2026). -->
    <header
      class="sticky top-0 z-20 border-b border-default bg-page/90 pt-[env(safe-area-inset-top)] backdrop-blur"
    >
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
      <UiSkeleton
        v-if="error && entering(error)"
        :parts="skeleton ?? ['title', 'card']"
        :rows="2"
        :label="t('common.loading')"
      />
      <div
        v-else-if="error && refusal(error) !== 'gone'"
        class="flex flex-col gap-4 pt-2"
        :data-testid="`list-${refusal(error)}`"
      >
        <UiPageTitle>{{
          refusal(error) === 'login'
            ? t('lists.sharing.closed.loginTitle')
            : t('lists.sharing.closed.title')
        }}</UiPageTitle>
        <p class="text-[15px] leading-[1.45] text-toned" role="alert">
          {{
            refusal(error) === 'login'
              ? t('lists.sharing.closed.loginBody')
              : t('lists.sharing.closed.body')
          }}
        </p>
        <UButton
          v-if="refusal(error) === 'login'"
          block
          size="xl"
          class="h-13 justify-center text-[17px] font-bold"
          :to="`/login?next=${encodeURIComponent(route.fullPath)}`"
          :label="t('lists.sharing.closed.login')"
        />
      </div>
      <div
        v-else-if="error"
        class="flex flex-col items-center gap-3 py-12 text-center"
        data-testid="list-gone"
      >
        <UiEnvelope state="locked" />
        <p class="text-muted" role="alert">
          {{ t('lists.visitor.gone') }}
        </p>
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
