<script setup lang="ts">
import type { JournalEntry } from '#server/utils/audit';

// Several events of a kind on one day, as one line of the journal: how
// many, from the first to the last time, and « Voir le détail » to unfold
// each of them.
const props = defineProps<{
  type: string;
  /** The events, newest first. */
  entries: JournalEntry[];
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
/** The sentence, cut around the count that is set in bold. */
const parts = computed(() => {
  const strong = tk(`journal.groupedCount.${props.type}`, {
    count: props.entries.length,
  });
  const [before = '', after = ''] = tk(`journal.grouped.${props.type}`, {
    strong: '\u0000',
  }).split('\u0000');
  return { before, strong, after };
});
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
        class="flex items-baseline gap-3 text-sm"
      >
        <span class="min-w-0 grow break-words">{{ entry.text }}</span>
        <time
          :datetime="entry.createdAt"
          class="shrink-0 text-xs text-toned tabular-nums"
          >{{ timeOf(entry.createdAt) }}</time
        >
      </li>
    </ul>
  </div>
</template>
