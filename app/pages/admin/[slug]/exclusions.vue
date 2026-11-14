<script setup lang="ts">
import { usePeopleQuery } from '~/composables/queries/useGroup';

definePageMeta({ middleware: 'admin', layout: 'admin' });
const { t } = useT();
const route = useRoute();
const slug = computed(() => String(route.params.slug));
const people = usePeopleQuery(slug);
useHead({
  title: computed(
    () => `${t('adminGroup.exclusions.title')} — ${t('common.appName')}`,
  ),
});
const screen = computed(() => ({
  back: `/admin/${slug.value}/personnes`,
}));
</script>

<template>
  <AdminScreen v-bind="screen">
    <UiPageTitle>
      {{ t('adminGroup.exclusions.title') }}
    </UiPageTitle>
    <p class="text-muted">
      {{ t('adminGroup.exclusions.intro') }}
    </p>
    <AdminQueryState
      :pending="people.isPending.value"
      :error="people.error.value"
    >
      <AdminExclusions :slug="slug" />
    </AdminQueryState>
  </AdminScreen>
</template>
