<script setup lang="ts">
import {
  useDashboardQuery,
  useGroupJournalQuery,
} from '~/composables/queries/useGroup';

// The group's journal for its guardian: exactly what every participant
// reads from their personal page, without needing a link of one's own.
definePageMeta({ middleware: 'admin', layout: 'admin' });
const route = useRoute();
const slug = computed(() => String(route.params.slug));
const { t, locale } = useT();
const dashboard = useDashboardQuery(slug);
const journal = useGroupJournalQuery(slug, locale);

useHead({
  title: () => `${t('participant.journal.title')} — ${t('common.appName')}`,
});
const screen = computed(() => ({
  back: `/admin/${slug.value}`,
  crumbs: [
    {
      label: dashboard.data.value?.group.name ?? slug.value,
      to: `/admin/${slug.value}`,
    },
    { label: t('participant.journal.title') },
  ],
}));
</script>

<template>
  <AdminScreen v-bind="screen">
    <h1 class="font-display text-3xl font-bold">
      {{ t('participant.journal.title') }}
    </h1>
    <p class="text-sm text-muted">
      {{ t('participant.journal.intro') }}
    </p>
    <AdminQueryState
      :pending="journal.isPending.value"
      :error="journal.error.value"
    >
      <JournalView
        v-if="journal.data.value"
        :entries="journal.data.value.entries"
        :editions="journal.data.value.editions"
        :current-edition-id="journal.data.value.currentEditionId"
      />
    </AdminQueryState>
  </AdminScreen>
</template>
