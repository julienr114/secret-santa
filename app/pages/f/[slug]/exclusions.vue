<script setup lang="ts">
import {
  useDashboardQuery,
  usePeopleQuery,
} from '~/composables/queries/useGroup';

// The group's exclusions: who must not draw whom, « Ajouter une
// exclusion » first, then what the draw applies by itself (previous
// years), which is set in the group's settings.
definePageMeta({ middleware: 'admin', layout: 'admin' });
const { t } = useT();
const route = useRoute();
const slug = computed(() => String(route.params.slug));
const people = usePeopleQuery(slug);
const dashboard = useDashboardQuery(slug);
const context = useScreenContext(slug);
useHead({ title: () => context.titleOf(t('adminGroup.exclusions.title')) });
const screen = computed(() => ({
  back: `/f/${slug.value}/reglages/secret-santa`,
}));
const years = computed(
  () => dashboard.data.value?.rules.excludePreviousYears ?? 0,
);
</script>

<template>
  <AdminScreen v-bind="screen">
    <div class="flex flex-col gap-1">
      <UiPageContext
        :parts="context.parts.value"
        :label="t('common.context')"
      />
      <UiPageTitle>{{ t('adminGroup.exclusions.title') }}</UiPageTitle>
    </div>
    <p class="text-[15px] leading-[1.45] text-toned">
      {{ t('adminGroup.exclusions.intro') }}
    </p>
    <AdminQueryState
      :pending="people.isPending.value"
      :error="people.error.value"
      :skeleton="['list']"
      :rows="3"
    >
      <AdminExclusions :slug="slug" />
      <UiList
        :title="t('adminGroup.exclusions.automatic')"
        :footer="t('adminGroup.exclusions.untilDraw')"
      >
        <UiListItem
          :to="`/f/${slug}/reglages/secret-santa`"
          icon="i-lucide-history"
          icon-tone="neutral"
          :title="
            years > 0
              ? t('adminGroup.exclusions.lastYear', { count: years })
              : t('adminGroup.exclusions.previousOff')
          "
          :subtitle="t('adminGroup.exclusions.inSettings')"
        />
      </UiList>
    </AdminQueryState>
  </AdminScreen>
</template>
