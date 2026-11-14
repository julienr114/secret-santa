<script setup lang="ts">
import { useGroupsQuery } from '~/composables/queries/useGroups';

definePageMeta({ middleware: 'admin', layout: 'admin' });
const { t } = useT();
useHead({
  title: computed(
    () => `${t('adminGroup.groups.title')} — ${t('common.appName')}`,
  ),
});
const screen = computed(() => ({
  back: null,
  crumbs: [{ label: t('adminGroup.groups.title') }],
}));

const groups = useGroupsQuery();
</script>

<template>
  <AdminScreen v-bind="screen">
    <div class="flex items-center justify-between gap-3">
      <UiPageTitle>
        {{ t('adminGroup.groups.title') }}
      </UiPageTitle>
      <UButton
        to="/admin/groupes/nouveau"
        icon="i-lucide-plus"
        :label="t('adminGroup.groups.create')"
      />
    </div>

    <AdminQueryState
      :pending="groups.isPending.value"
      :error="groups.error.value"
    >
      <p v-if="groups.data.value?.groups.length === 0" class="text-muted">
        {{ t('adminGroup.groups.empty') }}
      </p>
      <UiList v-else>
        <UiListItem
          v-for="group in groups.data.value?.groups ?? []"
          :key="group.id"
          :to="`/admin/${group.slug}`"
          emoji="🎄"
          :title="group.name"
          :subtitle="
            group.hasGuardianPassword
              ? t('adminGroup.groups.guardianConfigured')
              : t('adminGroup.groups.guardianToConfigure')
          "
        />
      </UiList>
    </AdminQueryState>
    <UiList>
      <UiListItem
        to="/admin/guide-de-style"
        icon="i-lucide-palette"
        :title="t('adminGroup.groups.styleguide')"
        :subtitle="t('adminGroup.groups.styleguideHint')"
      />
    </UiList>
  </AdminScreen>
</template>
