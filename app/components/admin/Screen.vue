<script setup lang="ts">
import { LOCALES } from '#shared/i18n';
import {
  HOME,
  LOGIN,
  useLogoutMutation,
} from '~/composables/queries/useSession';

// One screen of a logged-in account. One top bar: "Retour" on the left on
// screens below the home (back to wherever the user came from, or to
// `back` when the page was opened directly), the logo in the middle (a
// link to the home) and the menu on the right (language, account, log
// out); a screen with a `bar` has « Annuler », its title and where it
// belongs instead. A super-admin also gets a bottom bar
// to their own pages.
const props = defineProps<{
  back?: string | null;
  /**
   * A screen of its own, like a form over the edition: the bar shows
   * « Annuler » on the left, the title and where it belongs in the middle,
   * instead of the logo and the menu.
   */
  bar?: { title: string; context: string; cancel: string };
}>();

const { t, tk, locale, setLocale } = useT();
const { user } = useUserSession();
const isSuper = computed(() => user.value?.role === 'super_admin');

const goBack = useGoBack();

const logout = useLogoutMutation();
const onLogout = () =>
  logout.mutate(undefined, { onSuccess: () => navigateTo(LOGIN) });
const menu = computed(() => [
  [
    { type: 'label' as const, label: t('common.language.label') },
    ...LOCALES.map((code) => ({
      label: tk(`common.language.${code}`),
      type: 'checkbox' as const,
      checked: code === locale.value,
      onSelect: () => setLocale(code),
    })),
  ],
  [
    {
      label: t('auth.account.title'),
      icon: 'i-lucide-circle-user',
      to: '/compte',
    },
    {
      label: t('common.actions.logout'),
      icon: 'i-lucide-log-out',
      onSelect: onLogout,
    },
  ],
]);
</script>

<template>
  <!-- At least the window's height (less the layout's bottom padding), so a
       sticky footer rests at the bottom of a short screen. -->
  <div
    class="flex min-h-[calc(100dvh-2rem-env(safe-area-inset-bottom))] flex-col"
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
        <UDropdownMenu
          :items="menu"
          :content="{ align: 'end' }"
          :ui="{
            content:
              'min-w-[230px] rounded-xl shadow-[0_8px_24px_rgba(60,30,10,0.14)]',
            group: 'p-0',
            label:
              'px-3.5 pt-3 pb-1 text-xs font-bold tracking-[0.04em] text-toned uppercase',
            separator: 'mx-0 my-0 bg-divider',
            item: 'min-h-12 items-center px-3.5 text-base',
            itemLeadingIcon: 'size-5 text-toned',
            itemTrailingIcon: 'size-5 text-primary',
          }"
        >
          <UButton
            variant="ghost"
            color="neutral"
            icon="i-lucide-menu"
            class="-mr-2 justify-self-end"
            :aria-label="t('adminShell.menu')"
          />
        </UDropdownMenu>
      </UContainer>
    </header>
    <UContainer
      as="main"
      class="flex w-full max-w-md grow flex-col gap-6 py-5"
      :class="{ 'pb-24': isSuper }"
    >
      <slot />
    </UContainer>
    <AdminBottomNav v-if="isSuper" />
  </div>
</template>
