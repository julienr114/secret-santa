<script setup lang="ts">
import type { JournalEntry } from '#server/utils/audit';
import { hasMessage } from '#shared/i18n';

// « Qu'est-ce que ça veut dire ? » on an alert of the journal: the line
// itself, when it happened, then what happened, why it is allowed and
// what it changes, for whoever reads it: the organiser, the person the
// alert is about, or another participant.
const props = defineProps<{
  entry: JournalEntry | null;
  /** The person the alert is about. */
  name: string | null;
  reader: 'organiser' | 'them' | 'other';
}>();
const open = defineModel<boolean>('open', { required: true });
const { t, tk, locale } = useT();

/** The kind of alert, or none for an event that is not one. */
const kind = computed(() =>
  props.entry && isJournalAlert(props.entry.type) ? props.entry.type : null,
);
/** When it happened: « dimanche 15 novembre à 14:02 ». */
const when = computed(() => {
  if (!props.entry) return '';
  const date = new Date(props.entry.createdAt);
  const day = new Intl.DateTimeFormat(locale.value, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(date);
  const time = new Intl.DateTimeFormat(locale.value, {
    timeStyle: 'short',
  }).format(date);
  return t('journal.alert.at', {
    day: day.charAt(0).toUpperCase() + day.slice(1),
    time,
  });
});
/** What it changes, as the reader sees it. */
const READER_PART = { organiser: 'changes', them: 'forMe', other: 'forOthers' };
/**
 * The text of a paragraph, for this reader when the alert has one.
 * @param alert - The kind of alert.
 * @param part - `happened`, `why` or `changes`.
 * @returns The paragraph.
 */
const textOf = (alert: string, part: 'happened' | 'why' | 'changes') => {
  const own = `journal.alert.${alert}.${READER_PART[props.reader]}`;
  const key =
    part === 'changes' && hasMessage(own)
      ? own
      : `journal.alert.${alert}.${part}`;
  return tk(key, { name: props.name ?? t('journal.someone') });
};
/** The three paragraphs, each led by its words in bold. */
const paragraphs = computed(() =>
  kind.value
    ? (['happened', 'why', 'changes'] as const).map((part) => ({
        part,
        lead: t(
          part === 'changes' && props.reader !== 'organiser'
            ? 'journal.alert.changesYou'
            : `journal.alert.${part}`,
        ),
        text: textOf(kind.value!, part),
      }))
    : [],
);
</script>

<template>
  <UiSheet
    v-model:open="open"
    :title="kind ? tk(`journal.alert.${kind}.title`) : ''"
  >
    <template #header>
      <div class="flex w-full items-center gap-3">
        <span
          class="flex size-12 shrink-0 items-center justify-center rounded-full bg-alert text-inverted"
          aria-hidden="true"
        >
          <UIcon :name="journalLook(entry?.type ?? '').icon" class="size-5.5" />
        </span>
        <div class="flex min-w-0 flex-col gap-0.5">
          <h2 class="font-display text-[22px] leading-[1.15] font-bold">
            {{ kind ? tk(`journal.alert.${kind}.title`) : '' }}
          </h2>
          <p class="text-sm text-toned">{{ when }}</p>
        </div>
      </div>
    </template>
    <div v-if="entry" class="flex flex-col gap-4">
      <p
        class="rounded-xl bg-warning-tint px-4 py-3 font-display text-[17px] leading-[1.3] font-semibold text-alert-ink ring-1 ring-warning-ring"
      >
        {{ entry.text }}
      </p>
      <p
        v-for="paragraph in paragraphs"
        :key="paragraph.part"
        class="text-[15px] leading-[1.45]"
      >
        <strong>{{ paragraph.lead }}</strong> {{ paragraph.text }}
      </p>
    </div>
    <template #footer>
      <UButton
        block
        size="xl"
        class="h-13 justify-center text-[17px] font-bold"
        :label="t('journal.screen.understood')"
        @click="open = false"
      />
    </template>
  </UiSheet>
</template>
