<script setup lang="ts">
import type { AdminAccountRow } from '~/composables/queries/useAdmin';
import { fullName } from '#server/utils/people';
import { remainingSecretSantas } from '#server/utils/quota';

// One account on the admin's list: its icon, its name (or its address
// without one), then its address (« Super-admin » for one), the groups it
// organises (« à sa limite de Secret Santa » once it has reached it) and
// its last visit. A tap opens the account's page.
const props = defineProps<{ account: AdminAccountRow }>();
const { t, locale } = useT();

const name = computed(() => fullName(props.account));
/** « à sa limite de Secret Santa », « 2 groupes » or « aucun groupe ». */
const groupsPart = computed(() => {
  if (remainingSecretSantas(props.account) === 0) {
    return t('auth.admin.atLimit');
  }
  const organized = props.account.groups.filter(
    (group) => group.role === 'organizer',
  ).length;
  return organized > 0
    ? t('auth.admin.groupsCount', { count: organized })
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
  />
</template>
