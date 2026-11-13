<script setup lang="ts">
import type { JournalEntry } from '#server/utils/audit';

// The public journal (README section 9) as a timeline, newest first and
// grouped by day. A thin red thread runs down the left and fades out;
// every event hangs on it with an emoji that tells what happened.
// Two levels, so the eye finds what matters: milestones of the edition
// (created, draw, closing…) are cards, everyday events are plain lines.
// Shared by the participant and admin sides.
const props = defineProps<{ entries: JournalEntry[] }>();

const EMOJIS: Record<string, string> = {
  edition_created: '🎄',
  participant_added: '👋',
  participant_removed: '🚪',
  rules_changed: '📜',
  message_sent: '✉️',
  link_copied: '🔗',
  link_shared: '🔗',
  link_regenerated: '🔑',
  draw_done: '🎲',
  draw_cancelled: '↩️',
  results_revealed: '👀',
  result_viewed: '🎁',
  wishes_updated: '📝',
  edition_closed: '🎉',
};
const emojiOf = (type: string) => EMOJIS[type] ?? '✦';

const MILESTONES = new Set([
  'edition_created',
  'draw_done',
  'draw_cancelled',
  'results_revealed',
  'edition_closed',
]);
// Milestones everyone should notice: something was undone or looked at.
const ALERTS = new Set(['draw_cancelled', 'results_revealed']);

const dayFormat = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});
const timeFormat = new Intl.DateTimeFormat('fr-FR', { timeStyle: 'short' });
const timeOf = (iso: string) => timeFormat.format(new Date(iso));

// Entries arrive newest first; consecutive ones of the same day share a
// heading.
type Day = { label: string; entries: JournalEntry[] };
const days = computed(() =>
  props.entries.reduce<Day[]>((acc, entry) => {
    const label = dayFormat.format(new Date(entry.createdAt));
    const last = acc.at(-1);
    return last && last.label === label
      ? [...acc.slice(0, -1), { label, entries: [...last.entries, entry] }]
      : [...acc, { label, entries: [entry] }];
  }, []),
);
</script>

<template>
  <p v-if="entries.length === 0" class="text-sm text-muted">
    Rien à signaler pour l'instant.
  </p>
  <div v-else class="relative" data-testid="journal">
    <!-- The thread: 2.5rem rail, line in its middle, fading at the end. -->
    <span
      class="absolute top-3 bottom-0 left-[calc(1.25rem-1px)] w-0.5 rounded-full bg-linear-to-b from-primary/70 via-primary/30 to-transparent"
      aria-hidden="true"
    />
    <section
      v-for="day in days"
      :key="day.label"
      class="relative pb-8 last:pb-2"
    >
      <h2 class="flex items-center font-sans">
        <span class="flex w-10 shrink-0 justify-center" aria-hidden="true">
          <span class="knot size-2.5 rounded-full bg-primary" />
        </span>
        <span
          class="pl-3 text-xs font-semibold tracking-wider text-muted uppercase"
          >{{ day.label }}</span
        >
      </h2>
      <ol class="mt-4 flex flex-col gap-5">
        <li
          v-for="entry in day.entries"
          :key="entry.id"
          class="flex items-start gap-3"
        >
          <span class="flex w-10 shrink-0 justify-center" aria-hidden="true">
            <span
              v-if="MILESTONES.has(entry.type)"
              class="knot mt-2 flex size-10 items-center justify-center rounded-full text-lg"
              :class="ALERTS.has(entry.type) ? 'bg-warning' : 'bg-primary'"
              >{{ emojiOf(entry.type) }}</span
            >
            <span
              v-else
              class="knot flex size-8 items-center justify-center rounded-full bg-default text-sm"
              >{{ emojiOf(entry.type) }}</span
            >
          </span>

          <div
            v-if="MILESTONES.has(entry.type)"
            class="min-w-0 grow rounded-2xl bg-default px-4 py-3 shadow-sm ring-1 ring-black/5"
          >
            <p class="font-display text-lg leading-snug font-semibold">
              {{ entry.text }}
            </p>
            <time
              :datetime="entry.createdAt"
              class="mt-0.5 block text-xs text-muted"
              >{{ timeOf(entry.createdAt) }}</time
            >
          </div>
          <div v-else class="flex min-w-0 grow items-baseline gap-3 pt-1">
            <p class="min-w-0 grow leading-snug break-words">
              {{ entry.text }}
            </p>
            <time
              :datetime="entry.createdAt"
              class="shrink-0 text-xs text-dimmed tabular-nums"
              >{{ timeOf(entry.createdAt) }}</time
            >
          </div>
        </li>
      </ol>
    </section>
  </div>
</template>

<style scoped>
/* Each knot wears a ring in the page colour: the thread seems to stop
   just before it and to start again after. */
.knot {
  box-shadow:
    0 0 0 4px var(--color-kraft-50),
    0 2px 6px 3px rgb(60 30 10 / 0.06);
}
</style>
