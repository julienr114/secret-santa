<script setup lang="ts">
import type { JournalEntry } from '#server/utils/audit';
import {
  essentialEvents,
  groupEvents,
  journalDays,
} from '#shared/utils/journal';

// The journal with what goes around it, shared by the participant and the
// organiser: who sees it and « À quoi sert-il ? », « L'essentiel » or
// « Tout », the edition (the one in progress first), the timeline, and
// the sheets that explain the journal and its alerts.
const props = defineProps<{
  entries: JournalEntry[];
  editions: { id: string; label: string }[];
  currentEditionId?: string | null;
}>();
const { t } = useT();

const view = ref<'essential' | 'all'>('essential');
const views = computed(() => [
  { value: 'essential' as const, label: t('journal.screen.essential') },
  { value: 'all' as const, label: t('journal.screen.all') },
]);

const ALL = 'all';
const filter = ref<string | null>(null);
const editionItems = computed(() => [
  ...props.editions.map((e) => ({ label: e.label, value: e.id })),
  { label: t('participant.journal.allEditions'), value: ALL },
]);
const edition = computed({
  get: () => filter.value ?? props.currentEditionId ?? ALL,
  set: (value: string) => {
    filter.value = value;
  },
});

/**
 * The day of a moment, as the reader counts days.
 * @param iso - The moment.
 * @returns The local day, as `YYYY-MM-DD`.
 */
const dayOf = (iso: string) => new Date(iso).toLocaleDateString('sv-SE');
const days = computed(() => {
  const ofEdition = props.entries.filter(
    (entry) => edition.value === ALL || entry.editionId === edition.value,
  );
  const shown =
    view.value === 'essential' ? essentialEvents(ofEdition) : ofEdition;
  return journalDays(groupEvents(shown, dayOf), dayOf);
});

const helpOpen = ref(false);
const explained = ref<JournalEntry | null>(null);
const alertOpen = computed({
  get: () => explained.value !== null,
  set: (value) => {
    if (!value) explained.value = null;
  },
});
</script>

<template>
  <p class="text-[15px] leading-[1.45] text-toned">
    {{ t('participant.journal.intro') }}
    <button
      type="button"
      class="font-bold text-primary-ink underline underline-offset-2"
      @click="helpOpen = true"
    >
      {{ t('journal.screen.helpLink') }}
    </button>
  </p>
  <UiSegmented
    v-model="view"
    :items="views"
    :label="t('journal.screen.views')"
  />
  <div class="flex flex-wrap gap-2">
    <USelect
      v-model="edition"
      :items="editionItems"
      :aria-label="t('participant.journal.edition')"
      trailing-icon="i-lucide-chevron-down"
      :ui="{
        base: 'min-h-11 rounded-full bg-default px-3.5 text-sm font-semibold ring-default',
        trailingIcon: 'size-3.5 text-highlighted',
      }"
    />
  </div>
  <JournalList :days="days" @explain="(entry) => (explained = entry)" />
  <p
    v-if="view === 'essential' && days.length > 0"
    class="text-[13px] leading-[1.4] text-toned"
  >
    {{ t('journal.screen.essentialNote') }}
  </p>
  <JournalHelpSheet v-model:open="helpOpen" />
  <JournalAlertSheet v-model:open="alertOpen" :entry="explained" />
</template>
