<script setup lang="ts">
import type {
  AdminAccountRow,
  PendingRequest,
} from '~/composables/queries/useAdmin';
import { fullName } from '#server/utils/people';
import { remainingGroups } from '#server/utils/quota';

// One account on the admin's list: its icon, its name (or its address
// without one), then its address (« Super-admin » for one), its groups
// (or how many it may create) and its last visit; « À traiter » when a
// request waits. A tap opens the account's page.
const props = defineProps<{
  account: AdminAccountRow;
  request?: PendingRequest;
}>();
const { t, locale } = useT();

const name = computed(() => fullName(props.account));
/** « 2 groupes », « peut créer 1 groupe » or « aucun groupe ». */
const groupsPart = computed(() => {
  const organized = props.account.groups.length;
  if (organized > 0) return t('auth.admin.groupsCount', { count: organized });
  const left = remainingGroups(props.account);
  return left > 0 && Number.isFinite(left)
    ? t('auth.admin.canCreate', { count: left })
    : t('auth.admin.noGroup');
});
const line = computed(() =>
  [
    props.account.isSuperAdmin
      ? t('auth.account.superAdmin')
      : name.value && props.account.email,
    groupsPart.value,
    props.account.lastLoginAt &&
      t('auth.admin.seenOn', {
        date: new Intl.DateTimeFormat(locale.value, {
          day: 'numeric',
          month: 'short',
        }).format(new Date(props.account.lastLoginAt)),
      }),
  ]
    .filter(Boolean)
    .join(' · '),
);
</script>

<template>
  <UiListItem
    :to="`/admin/comptes/${account.id}`"
    :avatar="account.avatar"
    :title="name || account.email"
    :subtitle="line"
    :class="{ 'opacity-60': account.disabled }"
  >
    <template v-if="request" #trailing>
      <span
        class="shrink-0 rounded-full bg-warning-soft px-2 py-0.5 text-[13px] font-bold text-warning-ink"
        >{{ t('auth.admin.toHandle') }}</span
      >
    </template>
  </UiListItem>
</template>
