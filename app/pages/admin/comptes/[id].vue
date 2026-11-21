<script setup lang="ts">
import {
  SECRET_SANTA_LIMIT_MAX,
  remainingSecretSantas,
} from '#server/utils/quota';
import { fullName } from '#server/utils/people';
import {
  useAdminAccountsQuery,
  useUpdateAccountMutation,
  type AdminAccountGroup,
} from '~/composables/queries/useAdmin';
import { formatDay } from '~/utils/labels';

// Super-admin only: one account, read and not edited (its profile is its
// own, decided on 16 November 2026), V3AdminCompte. Who it is and its last
// visit; how many Secret Santa it may organise at once, changed with
// « moins » and « plus » and shown at once (docs/spec/v3/administration.md);
// its parties, with its role, and for those it organises their members
// and their Secret Santa; then its access.
definePageMeta({ middleware: 'admin', layout: 'admin' });
const route = useRoute();
const id = computed(() => String(route.params.id));
const { t, locale } = useT();
const errorMessage = useErrorMessage();
const toast = useMessages();

const query = useAdminAccountsQuery();
const account = computed(() =>
  query.data.value?.accounts.find((a) => a.id === id.value),
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
/** A limit chosen and not yet confirmed: shown at once. */
const pendingQuota = ref<number | null>(null);
const quota = computed(
  () => pendingQuota.value ?? account.value?.secretSantaLimit ?? 0,
);
/**
 * Moves the limit by one, shown at once, put back on failure.
 * @param step - +1 or -1.
 * @returns Nothing: errors are told in a toast.
 */
const onQuota = (step: number) => {
  const next = Math.min(
    SECRET_SANTA_LIMIT_MAX,
    Math.max(0, quota.value + step),
  );
  pendingQuota.value = next;
  update.mutate(
    { id: id.value, secretSantaLimit: next },
    {
      onSettled: () => {
        if (pendingQuota.value === next) pendingQuota.value = null;
      },
      onError: (error) => toast.failed(errorMessage(error)),
    },
  );
};
/** « 2 en cours · il lui en reste 1 ». */
const quotaLine = computed(() => {
  const a = account.value;
  if (!a) return '';
  const left = remainingSecretSantas({ ...a, secretSantaLimit: quota.value });
  return [
    t('auth.admin.inProgress', { count: a.organisedCount }),
    Number.isFinite(left) && t('auth.admin.left', { count: left }),
  ]
    .filter(Boolean)
    .join(' · ');
});

const { membersPart } = useGroupLine();
/**
 * The line under one of its parties.
 * @param group - The party.
 * @returns « Organise · 5 membres · Secret Santa tiré », or « Membre ».
 */
const groupLine = (group: AdminAccountGroup) =>
  group.role === 'organizer'
    ? [
        t('auth.admin.role.organizer'),
        membersPart(group.members),
        group.draw && t(`auth.admin.santa.${group.draw.status}`),
      ]
        .filter(Boolean)
        .join(' · ')
    : t('auth.admin.role.participant');
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
        toast.done(
          disabled ? t('auth.admin.disabledDone') : t('auth.admin.restored'),
        );
      },
      onError: (error) => toast.failed(errorMessage(error)),
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

        <UiList :title="t('auth.admin.secretSantaSection')">
          <UiListItem
            :title="t('auth.admin.mayOrganise', { count: quota })"
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
                  :disabled="quota >= SECRET_SANTA_LIMIT_MAX"
                  :aria-label="t('auth.admin.quotaMore')"
                  @click="onQuota(1)"
                />
              </div>
            </template>
          </UiListItem>
        </UiList>

        <UiList
          v-if="account.groups.length > 0"
          :title="t('auth.admin.groupsShort')"
          data-testid="account-parties"
        >
          <UiListItem
            v-for="group in account.groups"
            :key="group.slug"
            :to="`/e/${group.slug}`"
            icon="i-lucide-users"
            icon-tone="neutral"
            :title="group.name"
            :subtitle="groupLine(group)"
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
      </template>
    </AdminQueryState>
  </AdminScreen>
</template>
