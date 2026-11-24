<script setup lang="ts">
import { useGroupJournalQuery } from '~/composables/queries/useGroup';

// The group's journal for its organiser: exactly what every participant
// reads from their personal page, without needing a link of one's own.
definePageMeta({ middleware: 'admin', layout: 'admin' });
const route = useRoute();
const slug = computed(() => String(route.params.slug));
const { t, locale } = useT();
const journal = useGroupJournalQuery(slug, locale);
const context = useScreenContext(slug);
useHead({ title: () => context.titleOf(t('participant.journal.title')) });
const screen = computed(() => ({ back: `/e/${slug.value}` }));
</script>

<template>
  <AdminScreen v-bind="screen">
    <AdminQueryState
      :pending="journal.isPending.value"
      :error="journal.error.value"
      :skeleton="['title', 'journal']"
    >
      <div class="flex flex-col gap-1">
        <UiPageContext
          :parts="context.parts.value"
          :label="t('common.context')"
        />
        <UiPageTitle>{{ t('participant.journal.title') }}</UiPageTitle>
      </div>
      <JournalView
        v-if="journal.data.value"
        :entries="journal.data.value.entries"
        :editions="journal.data.value.editions"
        :current-edition-id="journal.data.value.currentEditionId"
        :people="journal.data.value.people"
        :palmares-of="
          (editionId) =>
            editionId ? `/admin/${slug}/editions/${editionId}/palmares` : null
        "
      />
    </AdminQueryState>
  </AdminScreen>
</template>
