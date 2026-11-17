<script setup lang="ts">
import type { JournalEntry } from '#server/utils/audit';
import type { JournalPersonCard } from '#server/database/journal';
import { hasMessage } from '#shared/i18n';

// Several events of a kind on one day, as one line of the journal: how
// many, from the first to the last time, the icons of the people when
// they discovered their result, and « Voir le détail » to unfold each of
// them, by person.
const props = defineProps<{
  type: string;
  /** The events, newest first. */
  entries: JournalEntry[];
  people: JournalPersonCard[];
}>();
const { t, tk, locale } = useT();
const open = ref(false);
const detailId = useId();

const timeFormat = computed(
  () => new Intl.DateTimeFormat(locale.value, { timeStyle: 'short' }),
);
/**
 * The time of a moment.
 * @param iso - The moment.
 * @returns « 14:02 ».
 */
const timeOf = (iso: string) => timeFormat.value.format(new Date(iso));
/** From the first time to the last: « 21:40 – 23:50 ». */
const span = computed(() => {
  const first = timeOf(props.entries.at(-1)!.createdAt);
  const last = timeOf(props.entries[0]!.createdAt);
  return first === last ? last : `${first} – ${last}`;
});
/**
 * The words of a message sent, the same for all the events of the line.
 * @param group - `what` or `via`.
 * @param word - The kind of message, or how it went.
 * @returns « « Tirage fait » », « par email », or nothing.
 */
const wordOf = (group: 'what' | 'via', word: string | null) => {
  const key = `journal.${group}.${word ?? ''}`;
  if (hasMessage(key)) return tk(key);
  return group === 'what' ? t('journal.what.other') : '';
};
/** The sentence, cut around the count that is set in bold. */
const parts = computed(() => {
  const strong = tk(`journal.groupedCount.${props.type}`, {
    count: props.entries.length,
  });
  const [before = '', after = ''] = tk(`journal.grouped.${props.type}`, {
    strong: '\u0000',
    what: wordOf('what', props.entries[0]!.messageType),
    via: wordOf('via', props.entries[0]!.via),
  }).split('\u0000');
  return { before, strong, after };
});
/**
 * The person of an event.
 * @param entry - An event of the line.
 * @returns Its person, if the journal knows them.
 */
const personOf = (entry: JournalEntry) =>
  props.people.find((p) => p.id === entry.personId);
/** Icons shown on the line: up to five, then how many more. */
const AVATARS_SHOWN = 5;
const avatars = computed(() =>
  props.type === 'result_viewed'
    ? props.entries
        .toReversed()
        .map(personOf)
        .filter((p): p is JournalPersonCard => p !== undefined)
    : [],
);
const icon = computed(() => journalLook(props.type).icon);
</script>

<template>
  <span class="flex w-10 shrink-0 justify-center" aria-hidden="true">
    <span
      class="knot flex size-8 items-center justify-center rounded-full bg-default text-toned"
    >
      <UIcon :name="icon" class="size-4" />
    </span>
  </span>
  <div class="flex min-w-0 grow flex-col gap-1.5 pt-[5px]">
    <div class="flex items-baseline gap-3">
      <p class="min-w-0 grow text-[15px] leading-[1.35]">
        {{ parts.before }}<strong>{{ parts.strong }}</strong
        >{{ parts.after }}
      </p>
      <time
        :datetime="entries[0]!.createdAt"
        class="shrink-0 text-xs text-toned tabular-nums"
        >{{ span }}</time
      >
    </div>
    <span v-if="avatars.length" class="flex" aria-hidden="true">
      <UiAvatar
        v-for="(person, index) in avatars.slice(0, AVATARS_SHOWN)"
        :key="person.id"
        :avatar="person.avatar"
        class="size-6.5! text-xs! shadow-[0_0_0_2px_var(--color-page)]"
        :class="index > 0 && '-ml-2'"
      />
      <span
        v-if="avatars.length > AVATARS_SHOWN"
        class="-ml-2 flex size-6.5 items-center justify-center rounded-full bg-muted text-[11px] font-bold text-toned shadow-[0_0_0_2px_var(--color-page)]"
        >+{{ avatars.length - AVATARS_SHOWN }}</span
      >
    </span>
    <button
      type="button"
      class="-my-2 flex min-h-11 items-center gap-1 self-start text-sm font-bold text-primary-ink"
      :aria-expanded="open"
      :aria-controls="detailId"
      @click="open = !open"
    >
      {{
        open ? t('journal.screen.hideDetail') : t('journal.screen.showDetail')
      }}
      <UIcon
        :name="open ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
        class="size-3.5"
      />
    </button>
    <ul
      v-if="open"
      :id="detailId"
      class="mt-1 flex flex-col gap-2.5 border-t border-divider pt-2.5"
    >
      <li
        v-for="entry in entries"
        :key="entry.id"
        class="flex items-center gap-3 text-sm"
      >
        <template v-if="personOf(entry)">
          <UiAvatar :avatar="personOf(entry)!.avatar" size="sm" />
          <span class="min-w-0 grow truncate font-semibold">{{
            personOf(entry)!.name
          }}</span>
        </template>
        <span v-else class="min-w-0 grow break-words">{{ entry.text }}</span>
        <time
          :datetime="entry.createdAt"
          class="shrink-0 text-xs text-toned tabular-nums"
          >{{ timeOf(entry.createdAt) }}</time
        >
      </li>
    </ul>
  </div>
</template>
