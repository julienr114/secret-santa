<script setup lang="ts">
import { useJournalQuery } from '~/composables/queries/usePersonal';

// The group's journal, as every participant can read it (README section 9).
const route = useRoute();
const token = computed(() => String(route.params.token));
const journal = useJournalQuery(token);

const ALL = 'all';
const filter = ref<string | null>(null);
const editions = computed(() => journal.data.value?.editions ?? []);
const items = computed(() => [
  { label: 'Toutes les éditions', value: ALL },
  ...editions.value.map((e) => ({ label: e.label, value: e.id })),
]);
// The participant's own edition until they choose another one.
const selected = computed({
  get: () => filter.value ?? journal.data.value?.currentEditionId ?? ALL,
  set: (value: string) => {
    filter.value = value;
  },
});
// Events without an edition (none today) only show under "all".
const entries = computed(() =>
  (journal.data.value?.entries ?? []).filter(
    (entry) => selected.value === ALL || entry.editionId === selected.value,
  ),
);
</script>

<template>
  <ParticipantScreen
    :back="`/p/${token}`"
    :pending="journal.isPending.value"
    :error="journal.error.value"
  >
    <h1 class="font-display text-3xl font-bold">Journal du groupe</h1>
    <p class="text-sm text-muted">
      Tout le monde voit ce journal. Il ne dit jamais qui offre à qui.
    </p>
    <USelect
      v-if="editions.length > 1"
      v-model="selected"
      :items="items"
      aria-label="Édition"
      class="w-full"
    />
    <JournalList :entries="entries" />
  </ParticipantScreen>
</template>
