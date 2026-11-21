<script setup lang="ts">
import { APP_GROUPS_COMFORT, remainingSecretSantas } from '#server/utils/quota';
import {
  useAdminAccountsQuery,
  useSwitchMutation,
} from '~/composables/queries/useAdmin';

// The administration, for super-admins only (docs/spec/v3/administration.md,
// V3Admin): how full the app is, the accounts, the parties and the style
// guide; then what to watch, numbers and not badges since nothing waits
// (the accounts at their limit of Secret Santa, the parties at 30
// members); then « Suspendre les nouveaux Secret Santa ». No request to
// answer any more. The rest of V3Admin comes with ticket 127.
definePageMeta({ middleware: 'admin', layout: 'admin' });
const { t } = useT();
useHead({ title: () => `${t('auth.admin.title')} — ${t('common.appName')}` });
const screen = computed(() => ({ back: '/' }));

const query = useAdminAccountsQuery();
const accounts = computed(() => query.data.value?.accounts ?? []);
const stats = computed(
  () =>
    query.data.value?.stats ?? {
      groups: 0,
      active: 0,
      fullParties: 0,
      load: 'ok' as const,
    },
);
const atLimit = computed(
  () =>
    accounts.value.filter(
      (account) => !account.disabled && remainingSecretSantas(account) === 0,
    ).length,
);
const errorMessage = useErrorMessage();
const toast = useMessages();
const switches = useSwitchMutation();
/** The switch as just tapped, until the server has it. */
const pausing = ref<boolean | null>(null);
const paused = computed(
  () => pausing.value ?? query.data.value?.switches.newSecretSantas ?? false,
);
/**
 * Pauses new Secret Santa, or lets them be created again.
 * @param on - True to pause them.
 * @returns Nothing: errors are told in a toast.
 */
const onPause = (on: boolean) => {
  pausing.value = on;
  switches.mutate(
    { newSecretSantas: on },
    {
      onSettled: () => {
        pausing.value = null;
      },
      onError: (error) => toast.failed(errorMessage(error)),
    },
  );
};
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

      <UiList :title="t('auth.admin.watch')" data-testid="watch">
        <UiListItem
          to="/admin/comptes"
          :title="t('auth.admin.atLimitCount')"
          :value="String(atLimit)"
          data-testid="watch-at-limit"
        />
        <UiListItem
          to="/admin/groupes"
          :title="t('auth.admin.fullParties')"
          :value="String(stats.fullParties)"
          data-testid="watch-full-parties"
        />
      </UiList>

      <UiList :title="t('auth.admin.emergency')">
        <UiListItem
          :checked="paused"
          :title="t('auth.admin.pauseSecretSantas')"
          :subtitle="t('auth.admin.pauseSecretSantasHelp')"
          :busy="switches.isPending.value"
          data-testid="pause-secret-santas"
          @update:checked="(on) => onPause(Boolean(on))"
        />
      </UiList>
    </AdminQueryState>
  </AdminScreen>
</template>
