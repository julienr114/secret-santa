<script setup lang="ts">
import type { JournalEntry } from '#server/utils/audit';

// The journal with its edition filter, shared by the participant and the
// guardian. It opens on the edition in progress and can show them all.
const props = defineProps<{
  entries: JournalEntry[];
  editions: { id: string; label: string }[];
  currentEditionId?: string | null;
}>();
const { t } = useT();

const ALL = 'all';
const filter = ref<string | null>(null);
const items = computed(() => [
  { label: t('participant.journal.allEditions'), value: ALL },
  ...props.editions.map((e) => ({ label: e.label, value: e.id })),
]);
const selected = computed({
  get: () => filter.value ?? props.currentEditionId ?? ALL,
  set: (value: string) => {
    filter.value = value;
  },
});
// Events without an edition (none today) only show under "all".
const shown = computed(() =>
  props.entries.filter(
    (entry) => selected.value === ALL || entry.editionId === selected.value,
  ),
);
</script>

<template>
  <USelect
    v-if="editions.length > 1"
    v-model="selected"
    :items="items"
    :aria-label="t('participant.journal.edition')"
    class="w-full"
  />
  <JournalList :entries="shown" />
</template>
