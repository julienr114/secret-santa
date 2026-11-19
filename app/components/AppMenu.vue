<script setup lang="ts">
import { LOCALES, type Locale } from '#shared/i18n';
import { useHomeQuery } from '~/composables/queries/useAuth';
import { LOGIN, useLogoutMutation } from '~/composables/queries/useSession';

// The menu of someone logged in, at the top right of every screen (README
// 22.21): the language, « Mon compte », « Se déconnecter ». A
// super-admin's opens on « Administration », with the number of requests
// waiting. It sets the language itself, and tells the screen which one.
defineOptions({ inheritAttrs: false });
const emit = defineEmits<{
  /** The language just chosen, for a screen that also saves it. */
  language: [locale: Locale];
}>();
const { t, tk, locale, setLocale } = useT();
const { user } = useUserSession();
const isSuper = computed(() => user.value?.role === 'super_admin');

const logout = useLogoutMutation();
const onLogout = () =>
  logout.mutate(undefined, { onSuccess: () => navigateTo(LOGIN) });
const home = useHomeQuery(isSuper);
/** Requests for a group waiting for the super-admin. */
const pending = computed(() => home.data.value?.pendingRequests ?? 0);
const languages = computed(() => [
  { type: 'label' as const, label: t('common.language.label') },
  ...LOCALES.map((code) => ({
    label: tk(`common.language.${code}`),
    type: 'checkbox' as const,
    checked: code === locale.value,
    onSelect: () => {
      setLocale(code);
      emit('language', code);
    },
  })),
]);
const account = computed(() => [
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
]);
// The super-admin's menu starts with the administration and their
// account; everyone else's with the language.
const menu = computed(() =>
  isSuper.value
    ? [
        [
          {
            label: t('auth.admin.title'),
            icon: 'i-lucide-shield',
            to: '/admin',
            slot: 'admin' as const,
            class: 'font-bold',
          },
        ],
        account.value,
        languages.value,
      ]
    : [languages.value, account.value],
);
</script>

<template>
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
    <template #admin-trailing>
      <UiCountBadge
        v-if="pending > 0"
        :count="pending"
        :label="t('auth.home.requestsToHandle', { count: pending })"
      />
    </template>
    <UButton
      variant="ghost"
      color="neutral"
      icon="i-lucide-menu"
      :aria-label="t('adminShell.menu')"
      v-bind="$attrs"
    />
  </UDropdownMenu>
</template>
