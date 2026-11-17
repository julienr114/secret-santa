<script setup lang="ts">
import { GROUP_QUOTA_MAX, remainingGroups } from '#server/utils/quota';
import { fullName } from '#server/utils/people';
import {
  useAdminAccountsQuery,
  useUpdateAccountMutation,
} from '~/composables/queries/useAdmin';
import { formatDay } from '~/utils/labels';

// Super-admin only: one account, read and not edited (its profile is its
// own, decided on 16 November 2026). Who it is and its last visit; its
// groups: a request waiting (answered in a sheet), how many it may
// create, changed with « moins » and « plus » and shown at once, and the
// groups it organises; then its access.
definePageMeta({ middleware: 'admin', layout: 'admin' });
const route = useRoute();
const id = computed(() => String(route.params.id));
const { t, locale } = useT();
const errorMessage = useErrorMessage();
const toast = useToast();

const query = useAdminAccountsQuery();
const account = computed(() =>
  query.data.value?.accounts.find((a) => a.id === id.value),
);
const request = computed(() =>
  query.data.value?.requests.find((r) => r.accountId === id.value),
);
const stats = computed(
  () =>
    query.data.value?.stats ?? { groups: 0, active: 0, load: 'ok' as const },
);
const name = computed(() => (account.value ? fullName(account.value) : ''));
useHead({
  title: () =>
    `${name.value || account.value?.email || t('auth.admin.accountsTitle')} — ${t('common.appName')}`,
});
const screen = { back: '/admin/comptes' };

/** « Dernière visite le 15 novembre », and whether it is disabled. */
const visit = computed(() => {
  const a = account.value;
  if (!a) return '';
  return [
    a.lastLoginAt
      ? t('auth.admin.lastVisit', {
          date: formatDay(a.lastLoginAt, locale.value),
        })
      : t('auth.admin.neverLoggedIn'),
    a.disabled && t('auth.admin.disabled'),
  ]
    .filter(Boolean)
    .join(' · ');
});

const update = useUpdateAccountMutation();
/** A quota chosen and not yet confirmed: shown at once. */
const pendingQuota = ref<number | null>(null);
const quota = computed(
  () => pendingQuota.value ?? account.value?.groupQuota ?? 0,
);
/**
 * Moves the quota by one, shown at once, put back on failure.
 * @param step - +1 or -1.
 * @returns Nothing: errors are told in a toast.
 */
const onQuota = (step: number) => {
  const next = Math.min(GROUP_QUOTA_MAX, Math.max(0, quota.value + step));
  pendingQuota.value = next;
  update.mutate(
    { id: id.value, groupQuota: next },
    {
      onSettled: () => {
        if (pendingQuota.value === next) pendingQuota.value = null;
      },
      onError: (error) =>
        toast.add({ title: errorMessage(error), color: 'error' }),
    },
  );
};
/** « 2 déjà créés · il lui en reste 1 ». */
const quotaLine = computed(() => {
  const a = account.value;
  if (!a) return '';
  const left = remainingGroups({ ...a, groupQuota: quota.value });
  return [
    t('auth.admin.created', { count: a.createdCount }),
    Number.isFinite(left) && t('auth.admin.left', { count: left }),
  ]
    .filter(Boolean)
    .join(' · ');
});

const requestOpen = ref(false);
// Disabling asks for a second tap; restoring does not.
const confirming = ref(false);
/**
 * Disables or restores the account.
 * @param disabled - True to disable it.
 * @returns Nothing: a toast reports.
 */
const setDisabled = (disabled: boolean) =>
  update.mutate(
    { id: id.value, disabled },
    {
      onSuccess: () => {
        confirming.value = false;
        toast.add({
          title: disabled
            ? t('auth.admin.disabledDone')
            : t('auth.admin.restored'),
          color: 'success',
          icon: 'i-lucide-check',
        });
      },
      onError: (error) =>
        toast.add({ title: errorMessage(error), color: 'error' }),
    },
  );
</script>

<template>
  <AdminScreen v-bind="screen">
    <AdminQueryState
      :pending="query.isPending.value"
      :error="query.error.value"
      :skeleton="['header', 'list', 'list']"
      :rows="3"
    >
      <p v-if="!account" class="text-muted">
        {{ t('errors.account_not_found') }}
      </p>
      <template v-else>
        <div class="flex items-center gap-3.5">
          <UiAvatar
            :avatar="account.avatar"
            size="xl"
            class="size-16! text-[28px]!"
          />
          <div class="flex min-w-0 flex-col gap-0.5">
            <UiPageTitle v-if="name" class="truncate">{{ name }}</UiPageTitle>
            <h1 v-else class="font-display text-xl font-bold break-all">
              {{ account.email }}
            </h1>
            <p v-if="name" class="truncate text-sm text-toned">
              {{ account.email }}
            </p>
            <p class="text-[13px] text-toned" data-testid="account-visit">
              {{ visit }}
            </p>
          </div>
        </div>

        <UiList :title="t('auth.admin.groupsShort')">
          <UiListItem
            v-if="request"
            icon="i-lucide-inbox"
            :title="t('auth.admin.requestPending')"
            :subtitle="request.message"
            :on-click="() => (requestOpen = true)"
            chevron
            data-testid="request-row"
          >
            <template #trailing>
              <span
                class="shrink-0 rounded-full bg-warning-soft px-2 py-0.5 text-[13px] font-bold text-warning-ink"
                >{{ t('auth.admin.toHandle') }}</span
              >
            </template>
          </UiListItem>
          <UiListItem
            :title="t('auth.admin.mayCreate', { count: quota })"
            :subtitle="quotaLine"
            :chevron="false"
          >
            <template #trailing>
              <div
                role="group"
                :aria-label="t('auth.admin.quotaLabel')"
                class="flex shrink-0 items-center gap-1.5"
              >
                <UButton
                  variant="outline"
                  color="neutral"
                  icon="i-lucide-minus"
                  class="size-11 justify-center rounded-full"
                  :disabled="quota <= 0"
                  :aria-label="t('auth.admin.quotaLess')"
                  @click="onQuota(-1)"
                />
                <output
                  class="min-w-5 text-center text-lg font-bold tabular-nums"
                  data-testid="quota"
                  >{{ quota }}</output
                >
                <UButton
                  variant="outline"
                  color="neutral"
                  icon="i-lucide-plus"
                  class="size-11 justify-center rounded-full"
                  :disabled="quota >= GROUP_QUOTA_MAX"
                  :aria-label="t('auth.admin.quotaMore')"
                  @click="onQuota(1)"
                />
              </div>
            </template>
          </UiListItem>
          <UiListItem
            v-for="group in account.groups"
            :key="group.slug"
            :to="`/admin/${group.slug}`"
            icon="i-lucide-users"
            icon-tone="neutral"
            :title="group.name"
            :subtitle="t('auth.admin.organizes')"
          />
        </UiList>

        <UiList
          v-if="!account.me"
          :title="t('auth.admin.access')"
          :footer="t('auth.admin.profileOwn')"
        >
          <UiListItem
            v-if="account.disabled"
            icon="i-lucide-user-check"
            icon-tone="neutral"
            :title="t('auth.admin.restore')"
            :subtitle="t('auth.admin.restoreHelp')"
            :busy="update.isPending.value"
            :busy-label="t('common.actions.saving')"
            :on-click="() => setDisabled(false)"
          />
          <UiListItem
            v-else-if="!confirming"
            icon="i-lucide-x"
            tone="danger"
            :title="t('auth.admin.disable')"
            :subtitle="t('auth.admin.disabledHelp')"
            :on-click="() => (confirming = true)"
            chevron
          />
          <li v-else class="flex flex-col gap-2 px-4 py-3">
            <p class="text-sm">{{ t('auth.admin.disableConfirm') }}</p>
            <div class="flex gap-2">
              <UButton
                color="error"
                class="min-h-11"
                :loading="update.isPending.value"
                :label="t('auth.admin.disable')"
                @click="setDisabled(true)"
              />
              <UButton
                variant="ghost"
                color="neutral"
                class="min-h-11"
                :label="t('common.actions.cancel')"
                @click="confirming = false"
              />
            </div>
          </li>
        </UiList>
        <p v-else class="text-[13px] leading-[1.4] text-toned">
          {{ t('auth.admin.profileOwn') }}
        </p>

        <AdminRequestSheet
          v-if="request"
          v-model:open="requestOpen"
          :account="account"
          :request="request"
          :stats="stats"
        />
      </template>
    </AdminQueryState>
  </AdminScreen>
</template>
