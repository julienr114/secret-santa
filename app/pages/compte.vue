<script setup lang="ts">
import {
  useAccountQuery,
  useRevokeAllMutation,
} from '~/composables/queries/useAuth';
import { HOME, LOGIN } from '~/composables/queries/useSession';
import { formatDate } from '~/utils/labels';

// "My account": the address, and the devices the account is logged in
// on, with a way to close them all.
definePageMeta({ middleware: 'admin', layout: 'admin' });
const { t, locale } = useT();
const errorMessage = useErrorMessage();
const toast = useToast();
const account = useAccountQuery();
const revokeAll = useRevokeAllMutation();
useHead({ title: () => `${t('auth.account.title')} — ${t('common.appName')}` });
const screen = computed(() => ({
  back: HOME,
  crumbs: [
    { label: t('common.appName'), to: HOME },
    { label: t('auth.account.title') },
  ],
}));

const confirming = ref(false);
const onRevokeAll = () =>
  revokeAll.mutate(undefined, {
    onSuccess: () => navigateTo(LOGIN, { replace: true }),
    onError: (error) => {
      confirming.value = false;
      toast.add({ title: errorMessage(error), color: 'error' });
    },
  });
</script>

<template>
  <AdminScreen v-bind="screen">
    <UiPageTitle>{{ t('auth.account.title') }}</UiPageTitle>
    <AdminQueryState
      :pending="account.isPending.value"
      :error="account.error.value"
    >
      <template v-if="account.data.value">
        <UiList>
          <UiListItem icon="i-lucide-at-sign" :title="account.data.value.email">
            <template v-if="account.data.value.isSuperAdmin" #trailing>
              <UBadge
                color="primary"
                variant="subtle"
                size="sm"
                :label="t('auth.account.superAdmin')"
              />
            </template>
          </UiListItem>
        </UiList>

        <UiList
          :title="t('auth.account.devices')"
          :footer="t('auth.account.devicesHint')"
        >
          <UiListItem
            v-for="session in account.data.value.sessions"
            :key="session.id"
            icon="i-lucide-monitor-smartphone"
            :title="session.device ?? t('auth.account.unknownDevice')"
            :subtitle="
              t('auth.account.lastSeen', {
                date: formatDate(session.lastSeenAt, locale),
              })
            "
          >
            <template v-if="session.current" #trailing>
              <UBadge
                color="success"
                variant="subtle"
                size="sm"
                :label="t('auth.account.current')"
              />
            </template>
          </UiListItem>
        </UiList>

        <UiList>
          <UiListItem
            v-if="!confirming"
            icon="i-lucide-log-out"
            tone="danger"
            :title="t('auth.account.revokeAll')"
            :subtitle="t('auth.account.revokeAllHint')"
            :on-click="() => (confirming = true)"
          />
          <li v-else class="flex flex-col gap-2 px-4 py-3">
            <p class="text-sm">{{ t('auth.account.revokeAllConfirm') }}</p>
            <div class="flex gap-2">
              <UButton
                color="error"
                :loading="revokeAll.isPending.value"
                :label="t('auth.account.revokeAll')"
                @click="onRevokeAll"
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
      </template>
    </AdminQueryState>
  </AdminScreen>
</template>
