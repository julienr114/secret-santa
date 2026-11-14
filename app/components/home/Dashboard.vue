<script setup lang="ts">
import { useHomeQuery } from '~/composables/queries/useAuth';

// The home of a logged-in account, the same for everyone: their draws
// first, then the groups they manage. Organisers and super-admins only
// get more rows.
const { t } = useT();
const home = useHomeQuery();
const draws = computed(() => home.data.value?.draws ?? []);
const groups = computed(() => home.data.value?.groups ?? []);
const role = computed(() => home.data.value?.role ?? 'member');
const isSuper = computed(() => role.value === 'super_admin');
const managesGroups = computed(() => role.value !== 'member');
const groupsTitle = computed(() =>
  isSuper.value ? t('auth.home.allGroups') : t('auth.home.groups'),
);
</script>

<template>
  <AdminScreen :crumbs="[]">
    <UiPageTitle>{{ t('auth.home.title') }}</UiPageTitle>
    <AdminQueryState :pending="home.isPending.value" :error="home.error.value">
      <UiList :title="t('auth.home.draws')" data-testid="home-draws">
        <li v-if="draws.length === 0" class="px-4 py-3 text-sm text-muted">
          {{ t('auth.home.drawsEmpty') }}
        </li>
        <UiListItem
          v-for="draw in draws"
          :key="draw.id"
          :to="draw.path"
          :avatar="draw.avatar"
          :title="draw.editionLabel"
          :subtitle="`${draw.groupName} · ${draw.firstName}`"
        >
          <template #trailing>
            <AdminStatusBadge :code="draw.status" />
          </template>
        </UiListItem>
      </UiList>

      <UiList
        v-if="managesGroups"
        :title="groupsTitle"
        data-testid="home-groups"
      >
        <li v-if="groups.length === 0" class="px-4 py-3 text-sm text-muted">
          {{ t('auth.home.groupsEmpty') }}
        </li>
        <UiListItem
          v-for="group in groups"
          :key="group.id"
          :to="`/admin/${group.slug}`"
          emoji="🎄"
          :title="group.name"
        />
        <UiListItem
          v-if="isSuper"
          to="/admin/groupes/nouveau"
          icon="i-lucide-plus"
          :title="t('auth.home.newGroup')"
        />
      </UiList>

      <UiList v-if="isSuper" :title="t('auth.home.admin')">
        <UiListItem
          to="/admin/guide-de-style"
          icon="i-lucide-palette"
          :title="t('adminGroup.groups.styleguide')"
          :subtitle="t('adminGroup.groups.styleguideHint')"
        />
      </UiList>
    </AdminQueryState>
  </AdminScreen>
</template>
