<script setup lang="ts">
import type { JournalEntry } from '#server/utils/audit';
import type { JournalDay } from '#shared/utils/journal';
import type { JournalPersonCard } from '#server/database/journal';

// The public journal (README section 9) as a timeline, newest first, by
// day. A thin brick thread runs down the left; every line hangs on it
// with its icon. Milestones of the edition are white cards, alerts are
// mustard cards with what they mean, everyday events plain lines, and
// the repeated ones a line that unfolds. Shared by the participant and
// the organiser.
defineProps<{
  days: JournalDay<JournalEntry>[];
  /** The people the lines are about, for the folded lines. */
  people: JournalPersonCard[];
}>();
const emit = defineEmits<{ explain: [entry: JournalEntry] }>();
const { t, locale } = useT();

const dayFormat = computed(
  () =>
    new Intl.DateTimeFormat(locale.value, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }),
);
const timeFormat = computed(
  () => new Intl.DateTimeFormat(locale.value, { timeStyle: 'short' }),
);
/**
 * The time of a moment.
 * @param iso - The moment.
 * @returns « 14:02 ».
 */
const timeOf = (iso: string) => timeFormat.value.format(new Date(iso));
/**
 * The heading of a day.
 * @param day - The day, as `YYYY-MM-DD`.
 * @returns « dimanche 15 novembre ».
 */
const dayLabel = (day: string) =>
  dayFormat.value.format(new Date(`${day}T12:00:00`));
</script>

<template>
  <p v-if="days.length === 0" class="text-sm text-muted">
    {{ t('participant.journal.empty') }}
  </p>
  <div v-else class="relative flex flex-col gap-7" data-testid="journal">
    <span
      class="absolute top-2.5 bottom-0 left-[19px] w-0.5 rounded-full bg-thread"
      aria-hidden="true"
    />
    <section
      v-for="day in days"
      :key="day.day"
      class="relative flex flex-col gap-4"
    >
      <h2 class="flex items-center font-sans">
        <span class="flex w-10 shrink-0 justify-center" aria-hidden="true">
          <span
            class="size-2.5 rounded-full bg-primary shadow-[0_0_0_4px_var(--color-page)]"
          />
        </span>
        <span
          class="pl-3 text-xs font-bold tracking-[0.06em] text-toned uppercase"
          >{{ dayLabel(day.day) }}</span
        >
      </h2>
      <ol class="flex flex-col gap-4.5">
        <li
          v-for="line in day.lines"
          :key="line.kind === 'one' ? line.entry.id : line.entries[0]!.id"
          class="flex items-start gap-3"
        >
          <template v-if="line.kind === 'one'">
            <span class="flex w-10 shrink-0 justify-center" aria-hidden="true">
              <span
                class="knot flex items-center justify-center rounded-full"
                :class="{
                  'size-10 bg-alert text-alert-ink':
                    journalLook(line.entry.type).level === 'alert',
                  'size-10 bg-primary text-white':
                    journalLook(line.entry.type).level === 'milestone',
                  'size-8 bg-default text-toned':
                    journalLook(line.entry.type).level === 'line',
                }"
              >
                <UIcon
                  :name="journalLook(line.entry.type).icon"
                  :class="
                    journalLook(line.entry.type).level === 'line'
                      ? 'size-4'
                      : 'size-5'
                  "
                />
              </span>
            </span>
            <div
              v-if="journalLook(line.entry.type).level !== 'line'"
              class="flex min-w-0 grow flex-col gap-1 rounded-2xl px-4 py-3"
              :class="
                journalLook(line.entry.type).level === 'alert'
                  ? 'bg-warning-tint ring-1 ring-warning-ring'
                  : 'bg-default shadow-[0_1px_2px_rgba(60,30,10,0.08)] ring-1 ring-black/5'
              "
            >
              <p
                class="font-display text-[17px] leading-[1.3] font-semibold break-words"
                :class="
                  journalLook(line.entry.type).level === 'alert'
                    ? 'text-alert-ink'
                    : 'text-highlighted'
                "
              >
                {{ line.entry.text }}
              </p>
              <time
                :datetime="line.entry.createdAt"
                class="text-xs text-toned"
                >{{ timeOf(line.entry.createdAt) }}</time
              >
              <button
                v-if="journalLook(line.entry.type).level === 'alert'"
                type="button"
                class="flex min-h-8 items-center self-start text-[13px] font-bold text-alert-link underline underline-offset-2"
                @click="emit('explain', line.entry)"
              >
                {{ t('journal.screen.whatMeans') }}
              </button>
            </div>
            <div v-else class="flex min-w-0 grow items-baseline gap-3 pt-[5px]">
              <p class="min-w-0 grow text-[15px] leading-[1.35] break-words">
                {{ line.entry.text }}
              </p>
              <time
                :datetime="line.entry.createdAt"
                class="shrink-0 text-xs text-toned tabular-nums"
                >{{ timeOf(line.entry.createdAt) }}</time
              >
            </div>
          </template>
          <JournalGroup
            v-else
            :type="line.type"
            :entries="line.entries"
            :people="people"
          />
        </li>
      </ol>
    </section>
  </div>
</template>
