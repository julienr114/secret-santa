<script setup lang="ts">
import {
  useAdminAccountsQuery,
  type AdminAccountRow,
} from '~/composables/queries/useAdmin';

// Super-admin only: every account in one list, those awaiting an answer
// first, then the disabled ones, folded. A row opens the account's page; a search narrows the lists by name or address.
definePageMeta({ middleware: 'admin', layout: 'admin' });
const { t } = useT();
useHead({
  title: () => `${t('auth.admin.accountsTitle')} — ${t('common.appName')}`,
});
const screen = computed(() => ({
  back: '/',
}));

const query = useAdminAccountsQuery();
const requestOf = computed(
  () =>
    new Map(
      (query.data.value?.requests ?? []).map((request) => [
        request.accountId,
        request,
      ]),
    ),
);
const search = ref('');
const matches = (account: AdminAccountRow) => {
  const needle = search.value.trim().toLowerCase();
  return (
    !needle ||
    [account.email, account.firstName, account.lastName].some((field) =>
      field?.toLowerCase().includes(needle),
    )
  );
};
const all = computed(() => (query.data.value?.accounts ?? []).filter(matches));
// Oldest request first.
const asking = computed(() =>
  (query.data.value?.requests ?? []).flatMap((request) =>
    all.value.filter((account) => account.id === request.accountId),
  ),
);
// One list: accounts awaiting an answer first, oldest request first.
const active = computed(() => [
  ...asking.value,
  ...all.value.filter((a) => !a.disabled && !requestOf.value.has(a.id)),
]);
const disabled = computed(() =>
  all.value.filter((a) => a.disabled && !requestOf.value.has(a.id)),
);
const showDisabled = ref(false);
// The requests to handle are counted on top of the list.
const listTitle = computed(() =>
  [
    t('auth.admin.accounts', { count: active.value.length }),
    ...(asking.value.length > 0
      ? [t('auth.admin.requests', { count: asking.value.length })]
      : []),
  ].join(' · '),
);
const total = computed(() => query.data.value?.accounts.length ?? 0);
</script>

<template>
  <AdminScreen v-bind="screen">
    <UiPageTitle>{{ t('auth.admin.accountsTitle') }}</UiPageTitle>
    <AdminQueryState
      :pending="query.isPending.value"
      :error="query.error.value"
    >
      <UInput
        v-if="total > 5"
        v-model="search"
        icon="i-lucide-search"
        :placeholder="t('auth.admin.search')"
        class="w-full"
      />
      <UiList :title="listTitle" data-testid="accounts">
        <li v-if="active.length === 0" class="px-4 py-3 text-sm text-muted">
          {{ t('auth.admin.noMatch') }}
        </li>
        <AdminAccountRow
          v-for="account in active"
          :key="account.id"
          :account="account"
          :request="requestOf.get(account.id)"
        />
      </UiList>
      <section v-if="disabled.length > 0" class="flex flex-col gap-1">
        <UButton
          variant="link"
          color="neutral"
          size="sm"
          class="self-start px-1"
          :trailing-icon="
            showDisabled ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'
          "
          :aria-expanded="showDisabled"
          :label="
            showDisabled
              ? t('auth.admin.disabledHide')
              : t('auth.admin.disabledShow', { count: disabled.length })
          "
          @click="showDisabled = !showDisabled"
        />
        <UiList v-if="showDisabled" data-testid="disabled-accounts">
          <AdminAccountRow
            v-for="account in disabled"
            :key="account.id"
            :account="account"
          />
        </UiList>
      </section>
    </AdminQueryState>
  </AdminScreen>
</template>
