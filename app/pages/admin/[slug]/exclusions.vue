<script setup lang="ts">
import {
  useDashboardQuery,
  usePeopleQuery,
} from '~/composables/queries/useGroup';

definePageMeta({ middleware: 'admin', layout: 'admin' });
const route = useRoute();
const slug = computed(() => String(route.params.slug));
const dashboard = useDashboardQuery(slug);
const people = usePeopleQuery(slug);
const name = computed(() => dashboard.data.value?.group.name ?? slug.value);
useHead({ title: 'Exclusions — Secret Santa' });
const screen = computed(() => ({
  back: `/admin/${slug.value}/personnes`,
  crumbs: [
    { label: name.value, to: `/admin/${slug.value}` },
    { label: 'Personnes', to: `/admin/${slug.value}/personnes` },
    { label: 'Exclusions' },
  ],
}));
</script>

<template>
  <AdminScreen v-bind="screen">
    <h1 class="font-display text-3xl font-bold">Exclusions</h1>
    <p class="text-muted">
      Les personnes qui ne doivent pas se tirer l'une l'autre : un couple, des
      frères et sœurs, un parent et son enfant…
    </p>
    <AdminQueryState
      :pending="people.isPending.value"
      :error="people.error.value"
    >
      <AdminExclusions :slug="slug" />
    </AdminQueryState>
  </AdminScreen>
</template>
