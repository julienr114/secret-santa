<script setup lang="ts">
import { LOCALES } from '#shared/i18n';
import { homeOf, useLogoutMutation } from '~/composables/queries/useSession';

// One admin screen. The top bar always shows the logo (a link back to the
// user's home) and one menu button holding the language and the log out.
// Screens below the home get a second, thinner line: the back button and
// the way back up. The current page is not repeated there, its title is
// right below; a long trail keeps only its last two levels.
export type Crumb = { label: string; to?: string };
const props = defineProps<{ back?: string | null; crumbs: Crumb[] }>();

const { t, tk, locale, setLocale } = useT();
const { user } = useUserSession();
const home = computed(() => homeOf(user.value));

const TRAIL_MAX = 2;
const trail = computed<Crumb[]>(() => {
  const ancestors = props.crumbs.slice(0, -1);
  return ancestors.length > TRAIL_MAX
    ? [{ label: '…' }, ...ancestors.slice(-TRAIL_MAX)]
    : ancestors;
});

const logout = useLogoutMutation();
const onLogout = () =>
  logout.mutate(undefined, { onSuccess: () => navigateTo('/admin') });
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
      label: t('common.actions.logout'),
      icon: 'i-lucide-log-out',
      onSelect: onLogout,
    },
  ],
]);
</script>

<template>
  <div>
    <header
      class="sticky top-0 z-20 border-b border-default bg-[var(--color-kraft-50)]/90 pt-[env(safe-area-inset-top)] backdrop-blur"
    >
      <UContainer class="flex h-14 max-w-3xl items-center gap-1">
        <NuxtLink
          :to="home"
          class="min-w-0 grow truncate font-display text-lg font-bold text-primary"
          >✦ {{ t('common.appName') }}</NuxtLink
        >
        <UDropdownMenu :items="menu" :content="{ align: 'end' }">
          <UButton
            variant="ghost"
            color="neutral"
            icon="i-lucide-menu"
            class="-mr-2"
            :aria-label="t('adminShell.menu')"
          />
        </UDropdownMenu>
      </UContainer>
      <UContainer
        v-if="back"
        class="flex h-10 max-w-3xl items-center gap-1 border-t border-default/60"
      >
        <UButton
          :to="back"
          variant="ghost"
          color="neutral"
          size="sm"
          icon="i-lucide-chevron-left"
          :aria-label="t('common.actions.back')"
          class="-ml-2 shrink-0"
        />
        <UBreadcrumb
          :items="trail"
          separator-icon="i-lucide-chevron-right"
          class="min-w-0 grow"
          :ui="{
            list: 'flex-nowrap',
            item: 'min-w-0',
            link: 'truncate text-sm',
          }"
        />
      </UContainer>
    </header>
    <UContainer as="main" class="flex max-w-3xl flex-col gap-6 py-5">
      <slot />
    </UContainer>
  </div>
</template>
