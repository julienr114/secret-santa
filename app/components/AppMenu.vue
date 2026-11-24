<script setup lang="ts">
import { LOCALES, type Locale } from '#shared/i18n';
import { useAccountQuery } from '~/composables/queries/useAuth';
import { LOGIN, useLogoutMutation } from '~/composables/queries/useSession';

// The menu of someone logged in, at the top right of every screen, opened
// by their own icon (docs/spec/v3/accueil-et-creation.md): « Mon compte »
// first, with the first name and the address; « Langue »; « Se
// déconnecter ». The administration is a tab of the bar at the bottom. It
// sets the language itself, chosen in a sheet (a menu beside the menu
// does not fit a phone), and tells the screen which one.
defineOptions({ inheritAttrs: false });
const emit = defineEmits<{
  /** The language just chosen, for a screen that also saves it. */
  language: [locale: Locale];
}>();
const { t, tk, locale, setLocale } = useT();
const account = useAccountQuery();
const me = computed(() => account.data.value);

const logout = useLogoutMutation();
const onLogout = () =>
  logout.mutate(undefined, { onSuccess: () => navigateTo(LOGIN) });
const choosing = ref(false);
const languages = computed(() =>
  LOCALES.map((code) => ({
    value: code,
    label: tk(`common.language.${code}`),
  })),
);
/**
 * Sets the language chosen in the sheet.
 * @param code - The language.
 */
const choose = (code: Locale) => {
  choosing.value = false;
  setLocale(code);
  emit('language', code);
};
const menu = computed(() => [
  [
    {
      label: t('auth.account.title'),
      to: '/compte',
      slot: 'account' as const,
    },
  ],
  [
    {
      label: t('common.language.label'),
      icon: 'i-lucide-languages',
      slot: 'language' as const,
      onSelect: () => {
        choosing.value = true;
      },
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
  <UDropdownMenu
    :items="menu"
    :content="{ align: 'end' }"
    :ui="{
      content:
        'min-w-[260px] rounded-xl shadow-[0_8px_24px_rgba(60,30,10,0.14)]',
      group: 'p-0',
      separator: 'mx-0 my-0 bg-divider',
      item: 'min-h-12 items-center px-3.5 text-base',
      itemLeadingIcon: 'size-5 text-toned',
      itemTrailingIcon: 'size-5 text-primary',
    }"
  >
    <template #account-leading>
      <UiAvatar v-if="me" :avatar="me.avatar" size="sm" />
    </template>
    <template #account-label>
      <span class="flex min-w-0 flex-col">
        <span class="font-semibold">{{ t('auth.account.title') }}</span>
        <span class="truncate text-[13px] text-toned">
          {{ [me?.firstName, me?.email].filter(Boolean).join(' · ') }}
        </span>
      </span>
    </template>
    <template #language-trailing>
      <span class="text-[15px] text-muted">
        {{ tk(`common.language.${locale}`) }}
      </span>
    </template>
    <button
      type="button"
      class="flex size-11 items-center justify-center rounded-full"
      :aria-label="t('auth.account.title')"
      aria-haspopup="menu"
      v-bind="$attrs"
    >
      <UiAvatar v-if="me" :avatar="me.avatar" :px="34" />
      <UIcon v-else name="i-lucide-circle-user" class="size-7 text-toned" />
    </button>
  </UDropdownMenu>
  <UiChoiceSheet
    v-model:open="choosing"
    :title="t('common.language.label')"
    :choices="languages"
    :value="locale"
    :validate-label="t('common.actions.validate')"
    :cancel-label="t('common.actions.cancel')"
    @validate="choose"
  />
</template>
