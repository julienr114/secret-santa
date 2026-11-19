<script setup lang="ts">
import { HOME } from '~/composables/queries/useSession';

// One screen of a logged-in account. One top bar: "Retour" on the left on
// screens below the home (back to wherever the user came from, or to
// `back` when the page was opened directly), the logo in the middle (a
// link to the home) and the menu on the right (`AppMenu`); a screen with a
// `bar` has « Annuler », its title and where it belongs instead.
const props = defineProps<{
  back?: string | null;
  /**
   * A screen of its own, like a form over the edition: the bar shows
   * « Annuler » on the left, the title and where it belongs in the middle,
   * instead of the logo and the menu.
   */
  bar?: { title: string; context: string; cancel: string };
}>();

const { t } = useT();

const goBack = useGoBack();
</script>

<template>
  <!-- At least the window's height (less the layout's bottom padding), so a
       sticky footer rests at the bottom of a short screen. -->
  <div
    class="flex min-h-[calc(100dvh-2rem-var(--tab-bar)-env(safe-area-inset-bottom))] flex-col"
  >
    <header
      class="sticky top-0 z-20 border-b border-default bg-page/90 pt-[env(safe-area-inset-top)] backdrop-blur"
    >
      <!-- The bars span the window; only the content below sits in the
           phone-wide column. -->
      <UContainer
        v-if="bar"
        class="grid h-14 grid-cols-[1fr_auto_1fr] items-center"
      >
        <button
          type="button"
          class="-ml-2 h-11 justify-self-start px-2 text-[15px] font-semibold"
          @click="goBack(props.back ?? HOME)"
        >
          {{ bar.cancel }}
        </button>
        <div class="flex min-w-0 flex-col items-center gap-px text-center">
          <h1 class="truncate font-display text-lg leading-[1.15] font-bold">
            {{ bar.title }}
          </h1>
          <p class="truncate text-xs leading-[1.2] font-semibold text-toned">
            {{ bar.context }}
          </p>
        </div>
        <div />
      </UContainer>
      <UContainer
        v-else
        class="grid h-14 grid-cols-[1fr_auto_1fr] items-center"
      >
        <div>
          <UButton
            v-if="back"
            variant="ghost"
            color="neutral"
            icon="i-lucide-chevron-left"
            class="-ml-2"
            :aria-label="t('common.actions.back')"
            @click="goBack(props.back!)"
          />
        </div>
        <NuxtLink
          :to="HOME"
          class="truncate font-display text-lg font-bold text-primary"
          >✦ {{ t('common.appName') }}</NuxtLink
        >
        <AppMenu class="-mr-2 justify-self-end" />
      </UContainer>
    </header>
    <UContainer as="main" class="flex w-full max-w-md grow flex-col gap-6 py-5">
      <slot />
    </UContainer>
  </div>
</template>
