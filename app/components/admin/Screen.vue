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
// out). A super-admin also gets a bottom bar
// to their own pages.
const props = defineProps<{ back?: string | null }>();

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
  <div>
    <header
      class="sticky top-0 z-20 border-b border-default bg-page/90 pt-[env(safe-area-inset-top)] backdrop-blur"
    >
      <!-- The bars span the window; only the content below sits in the
           phone-wide column. -->
      <UContainer class="grid h-14 grid-cols-[1fr_auto_1fr] items-center">
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
        <UDropdownMenu :items="menu" :content="{ align: 'end' }">
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
      class="flex max-w-md flex-col gap-6 py-5"
      :class="{ 'pb-24': isSuper }"
    >
      <slot />
    </UContainer>
    <AdminBottomNav v-if="isSuper" />
  </div>
</template>
