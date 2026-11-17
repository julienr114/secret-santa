<script setup lang="ts">
import { fullName } from '#server/utils/people';
import {
  useAdminAccountsQuery,
  useAllGroupsQuery,
  type AdminGroupRow,
} from '~/composables/queries/useAdmin';

// Super-admin only: every group of the app, with who organises it, its
// members and where its draw stands, a search by group or organiser, and
// « Créer un groupe pour quelqu'un ».
definePageMeta({ middleware: 'admin', layout: 'admin' });
const { t } = useT();
useHead({
  title: () => `${t('auth.admin.groupsShort')} — ${t('common.appName')}`,
});
const screen = computed(() => ({ back: '/admin' }));
const query = useAllGroupsQuery();
const accounts = useAdminAccountsQuery();
const groups = computed(() => query.data.value?.groups ?? []);
const stats = computed(() => accounts.data.value?.stats);

/** Who organises each group, by its slug: names, or addresses. */
const organizersOf = computed(() =>
  (accounts.data.value?.accounts ?? []).reduce<Record<string, string[]>>(
    (acc, account) =>
      account.groups.reduce(
        (inner, group) => ({
          ...inner,
          [group.slug]: [
            ...(inner[group.slug] ?? []),
            fullName(account) || account.email,
          ],
        }),
        acc,
      ),
    {},
  ),
);
const { membersPart, drawPart } = useGroupLine();
/**
 * The line under a group's name.
 * @param group - The group.
 * @returns « Camille · 5 membres · tirage fait, 1 sur 5 a consulté ».
 */
const lineOf = (group: AdminGroupRow) =>
  [
    (organizersOf.value[group.slug] ?? []).join(', ') ||
      t('auth.admin.noOrganizer'),
    membersPart(group.members),
    drawPart(group.draw, true),
  ].join(' · ');
const search = ref('');
const shown = computed(() => {
  const needle = search.value.trim().toLowerCase();
  return groups.value.filter(
    (group) =>
      !needle ||
      [group.name, ...(organizersOf.value[group.slug] ?? [])].some((text) =>
        text.toLowerCase().includes(needle),
      ),
  );
});
const subtitle = computed(() =>
  stats.value
    ? [
        t('auth.admin.groupsCount', { count: stats.value.groups }),
        t('auth.admin.activeDraws', { count: stats.value.active }),
      ].join(' · ')
    : t('auth.admin.groupsCount', { count: groups.value.length }),
);
</script>

<template>
  <AdminScreen v-bind="screen">
    <div class="flex flex-col gap-1">
      <UiPageTitle>{{ t('auth.admin.groupsShort') }}</UiPageTitle>
      <p v-if="query.data.value" class="text-[15px] text-toned">
        {{ subtitle }}
      </p>
    </div>
    <AdminQueryState
      :pending="query.isPending.value"
      :error="query.error.value"
      :skeleton="['list']"
      :rows="5"
    >
      <UiSearchField
        v-model="search"
        :label="t('auth.admin.searchGroups')"
        :clear-label="t('adminEdition.screen.lists.clear')"
      />
      <UiList data-testid="groups">
        <li v-if="shown.length === 0" class="px-4 py-3 text-sm text-muted">
          {{
            groups.length === 0
              ? t('auth.admin.groupsEmpty')
              : t('auth.admin.noGroupMatch')
          }}
        </li>
        <UiListItem
          v-for="group in shown"
          :key="group.id"
          :to="`/admin/${group.slug}`"
          icon="i-lucide-users"
          icon-tone="neutral"
          :title="group.name"
          :subtitle="lineOf(group)"
        />
        <UiListItem
          to="/admin/groupes/nouveau"
          icon="i-lucide-plus"
          :title="t('auth.admin.createFor')"
          :subtitle="t('auth.admin.createForHint')"
        />
      </UiList>
    </AdminQueryState>
  </AdminScreen>
</template>
