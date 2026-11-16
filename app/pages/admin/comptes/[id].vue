<script setup lang="ts">
import { z } from 'zod';
import type { Avatar } from '#server/utils/avatars';
import { GROUP_QUOTA_MAX } from '#server/utils/quota';
import { fullName } from '#server/utils/people';
import {
  useAdminAccountsQuery,
  useUpdateAccountMutation,
} from '~/composables/queries/useAdmin';

// Super-admin only: one account. Who it is (names and avatar, which the
// admin may set), three figures, the creation of groups (its pending
// request, answered in a sheet, its quota, then the groups it organises)
// and its access.
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

const NAME_MAX = 60;
// The last visit: a short date, and how long ago in words.
const seen = computed(() => {
  const iso = account.value?.lastLoginAt;
  if (!iso) return { value: '—', hint: t('auth.admin.neverLoggedIn') };
  const days = Math.floor((Date.now() - Date.parse(iso)) / 86_400_000);
  return {
    value: new Intl.DateTimeFormat(locale.value, {
      day: 'numeric',
      month: 'short',
    }).format(new Date(iso)),
    hint: new Intl.RelativeTimeFormat(locale.value, { numeric: 'auto' }).format(
      -days,
      'day',
    ),
  };
});
const tiles = computed(() => {
  const a = account.value;
  if (!a) return [];
  return [
    {
      label: t('auth.admin.tileCreated'),
      value: String(a.createdCount),
      hint: t('auth.admin.tileCreatedHint', { quota: a.groupQuota }),
    },
    {
      label: t('auth.admin.tileOrganized'),
      value: String(a.groups.length),
      hint: t('auth.admin.tileOrganizedHint', { count: a.groups.length }),
    },
    { label: t('auth.admin.tileSeen'), ...seen.value },
  ];
});

const onError = (error: unknown) =>
  toast.add({ title: errorMessage(error), color: 'error' });
const done = (title: string) =>
  toast.add({ title, color: 'success', icon: 'i-lucide-check' });
const update = useUpdateAccountMutation();
type Change = Omit<Parameters<typeof update.mutate>[0], 'id'>;
const save = (change: Change, message = t('auth.admin.saved')) =>
  update.mutate(
    { id: id.value, ...change },
    { onSuccess: () => done(message), onError },
  );

// Names: saved when a field loses focus, if valid and changed.
const names = reactive({ firstName: '', lastName: '' });
watch(
  account,
  (a) => {
    if (!a) return;
    names.firstName = a.firstName ?? '';
    names.lastName = a.lastName ?? '';
  },
  { immediate: true },
);
const onNames = () => {
  const firstName = names.firstName.trim();
  const lastName = names.lastName.trim() || null;
  const a = account.value;
  if (!a || !z.string().min(1).safeParse(firstName).success) return;
  if (firstName === a.firstName && lastName === a.lastName) return;
  save({ firstName, lastName });
};

// Avatar: picked in a sheet, saved with "Valider".
const avatarOpen = ref(false);
/**
 * Opens the icon sheet.
 * @returns Nothing.
 */
const openAvatar = () => {
  avatarOpen.value = true;
};
/**
 * Saves the icon picked.
 * @param avatar - The icon.
 * @returns Nothing.
 */
const onAvatar = (avatar: Avatar) => {
  avatarOpen.value = false;
  save({ avatarEmoji: avatar.emoji, avatarColor: avatar.color });
};

const requestOpen = ref(false);
// Disabling asks for a second tap; restoring does not.
const confirming = ref(false);
const setDisabled = (disabled: boolean) => {
  confirming.value = false;
  save(
    { disabled },
    disabled ? t('auth.admin.disabledDone') : t('auth.admin.restored'),
  );
};
</script>

<template>
  <AdminScreen v-bind="screen">
    <AdminQueryState
      :pending="query.isPending.value"
      :error="query.error.value"
    >
      <p v-if="!account" class="text-muted">
        {{ t('errors.account_not_found') }}
      </p>
      <template v-else>
        <div class="flex items-center gap-4">
          <button
            type="button"
            class="relative shrink-0 rounded-full focus-visible:ring-2 focus-visible:ring-primary"
            :aria-label="t('adminGroup.personForm.changeAvatar')"
            @click="openAvatar"
          >
            <UiAvatar :avatar="account.avatar" class="size-16 text-3xl" />
            <span
              class="absolute -right-1 -bottom-1 flex size-6 items-center justify-center rounded-full bg-default shadow ring-1 ring-default"
              aria-hidden="true"
            >
              <UIcon name="i-lucide-pencil" class="size-3 text-muted" />
            </span>
          </button>
          <div class="min-w-0">
            <UiPageTitle v-if="name" class="truncate">{{ name }}</UiPageTitle>
            <h1 v-else class="font-display text-xl font-bold break-all">
              {{ account.email }}
            </h1>
            <p v-if="name" class="truncate text-sm text-muted">
              {{ account.email }}
            </p>
            <div class="mt-1 flex gap-1.5">
              <UBadge
                v-if="account.isSuperAdmin"
                color="primary"
                variant="subtle"
                size="sm"
                :label="t('auth.account.superAdmin')"
              />
              <UBadge
                v-if="account.disabled"
                color="neutral"
                variant="subtle"
                size="sm"
                :label="t('auth.admin.disabled')"
              />
            </div>
          </div>
        </div>

        <dl class="grid grid-cols-3 gap-2" data-testid="account-tiles">
          <div
            v-for="tile in tiles"
            :key="tile.label"
            class="flex min-w-0 flex-col rounded-lg bg-muted/60 px-3 py-2.5"
          >
            <dt class="truncate text-xs font-medium text-muted">
              {{ tile.label }}
            </dt>
            <dd
              class="truncate font-display text-xl leading-tight font-bold whitespace-nowrap"
            >
              {{ tile.value }}
            </dd>
            <dd class="h-4 truncate text-xs text-dimmed">{{ tile.hint }}</dd>
          </div>
        </dl>

        <section class="flex flex-col gap-4">
          <UFormField :label="t('adminGroup.personForm.firstNameLabel')">
            <UInput
              v-model="names.firstName"
              :maxlength="NAME_MAX"
              class="w-full"
              @blur="onNames"
            />
          </UFormField>
          <UFormField :label="t('adminGroup.personForm.lastNameLabel')">
            <UInput
              v-model="names.lastName"
              :maxlength="NAME_MAX"
              class="w-full"
              @blur="onNames"
            />
          </UFormField>
        </section>

        <UiList :title="t('auth.admin.creation')">
          <UiListItem
            v-if="request"
            icon="i-lucide-inbox"
            :title="t('auth.admin.requestPending')"
            :subtitle="request.message"
            :on-click="() => (requestOpen = true)"
            data-testid="request-row"
          >
            <template #trailing>
              <UBadge
                color="warning"
                variant="solid"
                size="sm"
                :label="t('auth.admin.toHandle')"
              />
              <UIcon
                name="i-lucide-chevron-right"
                class="size-5 shrink-0 text-dimmed"
              />
            </template>
          </UiListItem>
          <UiListItem
            icon="i-lucide-trees"
            :title="t('auth.admin.quotaLabel')"
            :subtitle="
              t('auth.admin.quotaHelp', { created: account.createdCount })
            "
            :chevron="false"
          >
            <template #trailing>
              <div class="flex shrink-0 items-center gap-1">
                <UButton
                  variant="ghost"
                  color="neutral"
                  icon="i-lucide-minus"
                  :disabled="account.groupQuota <= 0 || update.isPending.value"
                  :aria-label="t('auth.admin.quotaLess')"
                  @click="save({ groupQuota: account.groupQuota - 1 })"
                />
                <span
                  class="w-6 text-center font-semibold tabular-nums"
                  data-testid="quota"
                  >{{ account.groupQuota }}</span
                >
                <UButton
                  variant="ghost"
                  color="neutral"
                  icon="i-lucide-plus"
                  :disabled="
                    account.groupQuota >= GROUP_QUOTA_MAX ||
                    update.isPending.value
                  "
                  :aria-label="t('auth.admin.quotaMore')"
                  @click="save({ groupQuota: account.groupQuota + 1 })"
                />
              </div>
            </template>
          </UiListItem>
          <UiListItem
            v-for="group in account.groups"
            :key="group.slug"
            :to="`/admin/${group.slug}`"
            emoji="🎄"
            :title="group.name"
          />
        </UiList>

        <UiList v-if="!account.me" :title="t('auth.admin.access')">
          <UiListItem
            v-if="account.disabled"
            icon="i-lucide-user-check"
            :title="t('auth.admin.restore')"
            :subtitle="t('auth.admin.restoreHelp')"
            :on-click="() => setDisabled(false)"
          />
          <UiListItem
            v-else-if="!confirming"
            icon="i-lucide-user-x"
            tone="danger"
            :title="t('auth.admin.disable')"
            :subtitle="t('auth.admin.disabledHelp')"
            :on-click="() => (confirming = true)"
          />
          <li v-else class="flex flex-col gap-2 px-4 py-3">
            <p class="text-sm">{{ t('auth.admin.disableConfirm') }}</p>
            <div class="flex gap-2">
              <UButton
                color="error"
                :loading="update.isPending.value"
                :label="t('auth.admin.disable')"
                @click="setDisabled(true)"
              />
              <UButton
                variant="ghost"
                color="neutral"
                :label="t('common.actions.cancel')"
                @click="confirming = false"
              />
            </div>
          </li>
        </UiList>

        <AdminRequestSheet
          v-if="request"
          v-model:open="requestOpen"
          :account="account"
          :request="request"
          :stats="stats"
        />
        <AdminAvatarSheet
          v-if="account?.avatar"
          v-model:open="avatarOpen"
          :initial="account.avatar"
          :title="t('adminGroup.avatar.title')"
          @validate="onAvatar"
        />
      </template>
    </AdminQueryState>
  </AdminScreen>
</template>
