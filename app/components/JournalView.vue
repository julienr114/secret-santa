<script setup lang="ts">
import type { JournalEntry } from '#server/utils/audit';
import type { JournalPersonCard } from '#server/database/journal';
import {
  aboutPerson,
  essentialEvents,
  groupEvents,
  journalDays,
} from '#shared/utils/journal';

// The journal with what goes around it, shared by the participant and the
// organiser: who sees it and « À quoi sert-il ? », « L'essentiel » or
// « Tout », the edition (the one in progress first) and the person, the
// timeline, and the sheets that explain the journal and its alerts. A
// participant filters on « Moi », told in the second person; the
// organiser on anyone.
const props = defineProps<{
  entries: JournalEntry[];
  editions: { id: string; label: string }[];
  currentEditionId?: string | null;
  /** The people the lines are about. */
  people?: JournalPersonCard[];
  /** The participant reading it; none for the organiser. */
  me?: string | null;
  /** An alert to explain at once, opened from the home. */
  explainId?: string | null;
  /** Where « Découvrir le palmarès » leads for an edition (22.17). */
  palmaresOf?: (editionId: string | null) => string | null;
}>();
const { t } = useT();
const organizers = useOrganizers();

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

const EVERYONE = 'everyone';
const person = ref(EVERYONE);
/** The reader, as the filter names them. */
const meCard = computed(() =>
  (props.people ?? []).find((p) => p.id === props.me),
);
const personItems = computed(() => [
  { label: t('journal.screen.everyone'), value: EVERYONE },
  ...(meCard.value
    ? [
        {
          label: t('journal.screen.me', { name: meCard.value.name }),
          value: meCard.value.id,
        },
      ]
    : props.me
      ? []
      : (props.people ?? [])
          .toSorted((a, b) => a.name.localeCompare(b.name))
          .map((p) => ({ label: p.name, value: p.id }))),
]);
/** The person filtered on, or null for everyone. */
const personId = computed(() =>
  person.value === EVERYONE ? null : person.value,
);
/** « Moi »: the lines about the reader, told to them. */
const onMe = computed(
  () => personId.value !== null && personId.value === props.me,
);

/**
 * The day of a moment, as the reader counts days.
 * @param iso - The moment.
 * @returns The local day, as `YYYY-MM-DD`.
 */
const dayOf = (iso: string) => new Date(iso).toLocaleDateString('sv-SE');
const days = computed(() => {
  const ofEdition = aboutPerson(
    props.entries.filter(
      (entry) => edition.value === ALL || entry.editionId === edition.value,
    ),
    personId.value,
  ).map((entry) =>
    onMe.value ? { ...entry, text: entry.ownText ?? entry.text } : entry,
  );
  const shown =
    view.value === 'essential' ? essentialEvents(ofEdition) : ofEdition;
  return journalDays(groupEvents(shown, dayOf), dayOf);
});
/** The classes of a filter pill, coral once it narrows the journal. */
const pill = (narrowed: boolean) => ({
  base: [
    'min-h-11 rounded-full px-3.5 text-sm font-semibold',
    narrowed
      ? 'bg-primary-tint text-primary-ink ring-primary'
      : 'bg-default ring-default',
  ].join(' '),
  trailingIcon: [
    'size-3.5',
    narrowed ? 'text-primary-ink' : 'text-highlighted',
  ].join(' '),
});

/** Who reads an alert's explanation, for what it changes for them. */
const reader = computed(() => {
  if (!props.me) return 'organiser' as const;
  return explained.value?.personId === props.me
    ? ('them' as const)
    : ('other' as const);
});
/** The name of the person an explained alert is about. */
const explainedName = computed(
  () =>
    props.people?.find((p) => p.id === explained.value?.personId)?.name ?? null,
);
const helpOpen = ref(false);
const explained = ref<JournalEntry | null>(null);
onMounted(() => {
  const entry = props.entries.find((e) => e.id === props.explainId);
  if (entry && isJournalAlert(entry.type)) explained.value = entry;
});
const alertOpen = computed({
  get: () => explained.value !== null,
  set: (value) => {
    if (!value) explained.value = null;
  },
});
</script>

<template>
  <p v-if="!onMe" class="text-[15px] leading-[1.45] text-toned">
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
      :ui="pill(false)"
    />
    <USelect
      v-if="personItems.length > 1"
      v-model="person"
      :items="personItems"
      :aria-label="t('journal.screen.person')"
      trailing-icon="i-lucide-chevron-down"
      :ui="pill(personId !== null)"
      data-testid="journal-person"
    />
  </div>
  <p
    v-if="onMe"
    class="flex items-start gap-2.5 rounded-xl bg-success-tint px-3.5 py-3 text-sm leading-[1.45] text-success-ink"
  >
    <UIcon name="i-lucide-check" class="mt-px size-4.5 shrink-0" />
    {{ t('journal.screen.meNote', { count: organizers }) }}
  </p>
  <JournalList
    :days="days"
    :people="people ?? []"
    :palmares-of="palmaresOf"
    @explain="(entry) => (explained = entry)"
  />
  <JournalHelpSheet v-model:open="helpOpen" />
  <JournalAlertSheet
    v-model:open="alertOpen"
    :entry="explained"
    :name="explainedName"
    :reader="reader"
  />
</template>
