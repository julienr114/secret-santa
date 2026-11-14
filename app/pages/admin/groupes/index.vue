<script setup lang="ts">
import { useAllGroupsQuery } from '~/composables/queries/useAdmin';

// Super-admin only: every group of the app.
definePageMeta({ middleware: 'admin', layout: 'admin' });
const { t } = useT();
useHead({
  title: () => `${t('auth.admin.groupsTitle')} — ${t('common.appName')}`,
});
const screen = computed(() => ({
  back: '/',
}));
const query = useAllGroupsQuery();
const groups = computed(() => query.data.value?.groups ?? []);
</script>

<template>
  <AdminScreen v-bind="screen">
    <UiPageTitle>{{ t('auth.admin.groupsTitle') }}</UiPageTitle>
    <AdminQueryState
      :pending="query.isPending.value"
      :error="query.error.value"
    >
      <UiList>
        <UiListItem
          to="/admin/groupes/nouveau"
          icon="i-lucide-plus"
          :title="t('auth.home.newGroup')"
        />
        <li v-if="groups.length === 0" class="px-4 py-3 text-sm text-muted">
          {{ t('auth.admin.groupsEmpty') }}
        </li>
        <UiListItem
          v-for="group in groups"
          :key="group.id"
          :to="`/admin/${group.slug}`"
          emoji="🎄"
          :title="group.name"
          :subtitle="group.slug"
        />
      </UiList>
    </AdminQueryState>
  </AdminScreen>
</template>
