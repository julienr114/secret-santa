<script setup lang="ts">
import type {
  AdminAccountRow,
  PendingRequest,
} from '~/composables/queries/useAdmin';
import { fullName } from '#server/utils/people';
import { formatDay } from '~/utils/labels';

// One account on the admin page, on rows of the same height: who it is
// (name, or address without one), a one-line summary, and a badge when a
// request awaits the admin. A tap opens the account's page.
const props = defineProps<{
  account: AdminAccountRow;
  request?: PendingRequest;
}>();
const { t, locale } = useT();

const name = computed(() => fullName(props.account));
// The request in a few words, or the groups and the last visit.
const summary = computed(() => {
  if (props.request) return props.request.message;
  const groups = t('auth.admin.groupsCount', {
    count: props.account.groups.length,
  });
  return props.account.lastLoginAt
    ? `${groups} · ${t('auth.admin.seenOn', {
        date: formatDay(props.account.lastLoginAt, locale.value),
      })}`
    : `${groups} · ${t('auth.admin.neverLoggedIn')}`;
});
</script>

<template>
  <li :class="{ 'opacity-60': account.disabled }">
    <NuxtLink
      :to="`/admin/comptes/${account.id}`"
      class="flex h-16 w-full items-center gap-3 px-4 text-left transition-colors active:bg-muted"
    >
      <UiAvatar :avatar="account.avatar" />
      <span class="min-w-0 grow">
        <span class="block truncate font-medium">{{
          name || account.email
        }}</span>
        <span class="block truncate text-sm text-dimmed">{{ summary }}</span>
      </span>
      <UBadge
        v-if="request"
        color="warning"
        variant="solid"
        size="sm"
        :label="t('auth.admin.toHandle')"
      />
      <UBadge
        v-else-if="account.isSuperAdmin"
        color="primary"
        variant="subtle"
        size="sm"
        :label="t('auth.account.superAdmin')"
      />
      <UIcon
        name="i-lucide-chevron-right"
        class="size-5 shrink-0 text-dimmed"
        aria-hidden="true"
      />
    </NuxtLink>
  </li>
</template>
