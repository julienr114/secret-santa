<script setup lang="ts">
import {
  useAdminAccountsQuery,
  type AdminAccountRow,
} from '~/composables/queries/useAdmin';

// Super-admin only: the accounts in use, with a search by name or
// address; the disabled ones behind their own row (`?desactives`).
definePageMeta({ middleware: 'admin', layout: 'admin' });
const { t } = useT();
const route = useRoute();
const disabledView = computed(() => 'desactives' in route.query);
const title = computed(() =>
  disabledView.value
    ? t('auth.admin.disabledRow')
    : t('auth.admin.accountsTitle'),
);
useHead({ title: () => `${title.value} — ${t('common.appName')}` });
const screen = computed(() => ({
  back: disabledView.value ? '/admin/comptes' : '/admin',
}));

const query = useAdminAccountsQuery();
const search = ref('');
/**
 * Whether an account matches the search, by name or address.
 * @param account - The account.
 * @returns True when it matches, or with nothing typed.
 */
const matches = (account: AdminAccountRow) => {
  const needle = search.value.trim().toLowerCase();
  return (
    !needle ||
    [account.email, account.firstName, account.lastName].some((field) =>
      field?.toLowerCase().includes(needle),
    )
  );
};
const everyone = computed(() => query.data.value?.accounts ?? []);
const inUse = computed(() => everyone.value.filter((a) => !a.disabled));
const disabled = computed(() => everyone.value.filter((a) => a.disabled));
const shown = computed(() =>
  (disabledView.value ? disabled.value : inUse.value).filter(matches),
);
const subtitle = computed(() =>
  disabledView.value
    ? t('auth.admin.accounts', { count: disabled.value.length })
    : t('auth.admin.activeAccounts', { count: inUse.value.length }),
);
</script>

<template>
  <AdminScreen v-bind="screen">
    <div class="flex flex-col gap-1">
      <UiPageTitle>{{ title }}</UiPageTitle>
      <p v-if="query.data.value" class="text-[15px] text-toned">
        {{ subtitle }}
      </p>
    </div>
    <AdminQueryState
      :pending="query.isPending.value"
      :error="query.error.value"
      :skeleton="['list']"
      :rows="6"
    >
      <UiSearchField
        v-model="search"
        :label="t('auth.admin.search')"
        :clear-label="t('adminEdition.screen.lists.clear')"
      />
      <UiList data-testid="accounts">
        <li v-if="shown.length === 0" class="px-4 py-3 text-sm text-muted">
          {{ t('auth.admin.noMatch') }}
        </li>
        <AdminAccountRow
          v-for="account in shown"
          :key="account.id"
          :account="account"
        />
      </UiList>
      <UiList v-if="!disabledView && disabled.length > 0">
        <UiListItem
          to="/admin/comptes?desactives"
          icon="i-lucide-archive"
          icon-tone="neutral"
          :title="t('auth.admin.disabledRow')"
          :subtitle="t('auth.admin.accounts', { count: disabled.length })"
          data-testid="disabled-row"
        />
      </UiList>
    </AdminQueryState>
  </AdminScreen>
</template>
