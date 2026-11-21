<script setup lang="ts">
import { APP_GROUPS_COMFORT } from '#server/utils/quota';
import { useAdminAccountsQuery } from '~/composables/queries/useAdmin';

// The administration, for super-admins only: how full the app is, then
// the accounts, the groups and the style guide. There is no request to
// answer any more (ticket 105).
definePageMeta({ middleware: 'admin', layout: 'admin' });
const { t } = useT();
useHead({ title: () => `${t('auth.admin.title')} — ${t('common.appName')}` });
const screen = computed(() => ({ back: '/' }));

const query = useAdminAccountsQuery();
const accounts = computed(() => query.data.value?.accounts ?? []);
const stats = computed(
  () =>
    query.data.value?.stats ?? { groups: 0, active: 0, load: 'ok' as const },
);
const disabledCount = computed(
  () => accounts.value.filter((account) => account.disabled).length,
);
const accountsLine = computed(() =>
  [
    t('auth.admin.accounts', { count: accounts.value.length }),
    disabledCount.value > 0 &&
      t('auth.admin.disabledCount', { count: disabledCount.value }),
  ]
    .filter(Boolean)
    .join(' · '),
);
const groupsLine = computed(() =>
  [
    t('auth.admin.groupsCount', { count: stats.value.groups }),
    t('auth.admin.activeDraws', { count: stats.value.active }),
  ].join(' · '),
);
</script>

<template>
  <AdminScreen v-bind="screen">
    <div class="flex flex-col gap-1">
      <UiPageTitle>{{ t('auth.admin.title') }}</UiPageTitle>
      <p class="text-[15px] text-toned">{{ t('auth.admin.reserved') }}</p>
    </div>
    <AdminQueryState
      :pending="query.isPending.value"
      :error="query.error.value"
      :skeleton="['card', 'card', 'list']"
      :rows="3"
    >
      <UiCard padding="lg" class="flex flex-col gap-3" data-testid="capacity">
        <div class="flex items-baseline justify-between gap-2">
          <h2 class="font-display text-xl font-semibold">
            {{ t('auth.admin.capacity') }}
          </h2>
          <p class="text-sm font-bold">
            {{
              t('auth.admin.capacityCount', {
                count: stats.groups,
                max: APP_GROUPS_COMFORT,
              })
            }}
          </p>
        </div>
        <AdminCapacityBar
          :groups="stats.groups"
          :caption="t('auth.admin.capacityHint')"
        />
      </UiCard>

      <UiList :title="t('auth.admin.seeAll')">
        <UiListItem
          to="/admin/comptes"
          icon="i-lucide-users"
          :title="t('auth.admin.accountsTitle')"
          :subtitle="accountsLine"
        />
        <UiListItem
          to="/admin/groupes"
          icon="i-lucide-file-text"
          :title="t('auth.admin.groupsShort')"
          :subtitle="groupsLine"
        />
        <UiListItem
          to="/admin/guide-de-style"
          icon="i-lucide-sliders-horizontal"
          icon-tone="neutral"
          :title="t('auth.admin.styleGuide')"
          :subtitle="t('auth.admin.styleGuideHint')"
        />
      </UiList>
    </AdminQueryState>
  </AdminScreen>
</template>
