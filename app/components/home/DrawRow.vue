<script setup lang="ts">
import type { HomeDraw } from '~/composables/queries/useAuth';

// A draw going on, on one row: an icon for where it stands (closed
// envelope to discover, clock before the draw, open envelope once seen,
// archive once closed), the group, its state and the party. The row opens
// the draw; a small button beside it, only when something is expected,
// goes straight to it.
const props = defineProps<{
  draw: HomeDraw;
  /** Replaces the name of the group, inside the card of that group. */
  title?: string;
  /** Leaves the party out, when the card around it already gives it. */
  noParty?: boolean;
  /** Its journal's news is already said in the card on top. */
  quietJournal?: boolean;
}>();
const emit = defineEmits<{ open: [] }>();
const { t } = useT();
const party = usePartyText();

/** What the row waits for: where its button leads, after the draw path. */
const ACTIONS = { discover: '', addWishes: '/souhaits' } as const;
const action = computed(() =>
  props.draw.step === 'discover' || props.draw.step === 'addWishes'
    ? {
        to: `${props.draw.path}${ACTIONS[props.draw.step]}`,
        label: t(`auth.home.step.${props.draw.step}.action`),
      }
    : null,
);
const icon = computed(() => {
  const { status, revealed } = props.draw;
  if (status === 'closed') return 'i-lucide-archive';
  if (status === 'preparing') return 'i-lucide-clock';
  return revealed ? 'i-lucide-mail-open' : 'i-lucide-mail';
});
/** « Du nouveau au journal » instead of where it stands (README 22.15). */
const news = computed(() => Boolean(props.draw.journal) && !props.quietJournal);
const subtitle = computed(() =>
  [
    t(`auth.home.step.${props.draw.step}.state`),
    !props.noParty && party.short(props.draw.eventDate),
  ]
    .filter(Boolean)
    .join(' · '),
);
</script>

<template>
  <li data-testid="draw-row" class="flex items-center">
    <NuxtLink
      :to="draw.path"
      class="flex min-h-16 min-w-0 grow items-center gap-3 py-3 pl-4 transition-colors active:bg-muted"
      :class="action ? 'pr-2' : 'pr-4'"
      @click="emit('open')"
    >
      <span
        class="flex size-10 shrink-0 items-center justify-center rounded-full"
        :class="
          action ? 'bg-primary-tint text-primary-ink' : 'bg-muted text-muted'
        "
        aria-hidden="true"
      >
        <UIcon :name="icon" class="size-5" />
      </span>
      <span class="min-w-0 grow">
        <span class="block truncate font-medium">{{
          title ?? draw.groupName
        }}</span>
        <span
          v-if="news"
          class="block truncate text-sm font-bold text-warning-ink"
          data-testid="journal-news"
          >{{ t('auth.home.journalSignal.row') }}</span
        >
        <span v-else class="block truncate text-sm text-muted">{{
          subtitle
        }}</span>
      </span>
      <span
        v-if="news"
        class="size-2.5 shrink-0 rounded-full bg-alert"
        aria-hidden="true"
      />
      <UIcon
        v-if="!action"
        name="i-lucide-chevron-right"
        class="size-5 shrink-0 text-dimmed"
      />
    </NuxtLink>
    <UButton
      v-if="action"
      :to="action.to"
      class="mr-4 min-h-11 shrink-0 rounded-full"
      :label="action.label"
      @click="emit('open')"
    />
  </li>
</template>
