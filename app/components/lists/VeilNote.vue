<script setup lang="ts">
// A note pointed at something on a list, over a veil on the whole app
// (lot 27 ter, Correction 30, maquettes ListeVisiteurTirage,
// ListeCocheGuide): the veil covers everything, the top bar and the tabs
// included, as behind a sheet, and lets every touch through; only what
// the note points at (raised by its parent over the veil) and the note
// stay in the light. A title, a few words, « Compris ». The note of the
// anonymous mode is aubergine; the others are dark plum. Never two at a
// time: the page decides which one shows.
// A step of the visit of a new list (ticket 149, V3ListeVisite*) is the
// same note, with « 2 sur 6 », « Passer » on the left and « Suivant » on
// the right, « Compris » alone at the last; it takes the focus, Échap
// skips; its tip points up, or down when the note is above.
const props = defineProps<{
  tone: 'incognito' | 'plum';
  title: string;
  body: string;
  /** Where the tip is: towards a switch on the right, a pill on the left. */
  tip: 'left' | 'right';
  /** Names its parts for the tests: `mode-veil`, `mode-understood`. */
  name: string;
  /** A step of the visit: its place, « n sur N »; null for a note alone. */
  step?: { at: number; count: number } | null;
  /** A note of the visit (a step, or the note of the first line). */
  tour?: boolean;
  /** Above what it points at: the tip down. */
  above?: boolean;
}>();
const emit = defineEmits<{ understood: []; skip: []; next: [] }>();
const { t } = useT();
const incognito = computed(() => props.tone === 'incognito');
const last = computed(() => !props.step || props.step.at === props.step.count);
const note = ref<HTMLElement | null>(null);
/** Échap is « Passer » during the visit, « Compris » on a note alone. */
const onKey = (event: KeyboardEvent) => {
  if (event.key !== 'Escape') return;
  if (props.step && !last.value) emit('skip');
  else emit('understood');
};
onMounted(() => {
  if (!props.tour) return;
  note.value?.focus({ preventScroll: true });
  window.addEventListener('keydown', onKey);
});
onBeforeUnmount(() => window.removeEventListener('keydown', onKey));
watch(
  () => props.step?.at,
  () => note.value?.focus({ preventScroll: true }),
);
</script>

<template>
  <!-- The veil: over the whole page, out of the column of the list; it
       goes with the note. Put at the root of the app, which is one layer
       of its own (`isolate`): what is raised (z-50) stays over it; from
       the body it would cover everything. -->
  <ClientOnly>
    <Teleport to="#__nuxt">
      <span
        class="pointer-events-none fixed inset-0 z-40"
        :class="incognito ? 'bg-incognito/35' : 'bg-note/35'"
        aria-hidden="true"
        :data-testid="`${name}-veil`"
      />
    </Teleport>
  </ClientOnly>
  <div
    ref="note"
    class="relative flex flex-col gap-1.5 rounded-[28px] bg-default px-4 pt-3.5 pb-1.5 text-default outline-none"
    :class="
      incognito
        ? 'shadow-[0_0_0_1.5px_var(--color-incognito),0_14px_44px_6px_color-mix(in_srgb,var(--color-incognito)_45%,transparent)]'
        : 'shadow-[0_0_0_1.5px_var(--color-note),0_14px_44px_6px_color-mix(in_srgb,var(--color-note)_40%,transparent)]'
    "
    :role="tour ? 'dialog' : 'status'"
    :aria-label="tour ? title : undefined"
    :tabindex="tour ? -1 : undefined"
    :data-testid="tour ? `${name}-note` : undefined"
  >
    <span
      class="absolute size-3 rotate-45 bg-default"
      :class="[
        tip === 'right' ? 'right-[26px]' : 'left-[42px]',
        above
          ? '-bottom-[7px] border-r-[1.5px] border-b-[1.5px]'
          : '-top-[7px] border-t-[1.5px] border-l-[1.5px]',
        incognito ? 'border-incognito' : 'border-note',
      ]"
      aria-hidden="true"
    />
    <div class="flex items-baseline justify-between gap-3">
      <p class="text-[15px] leading-[1.35] font-bold">{{ title }}</p>
      <span
        v-if="step"
        class="shrink-0 text-xs font-bold text-toned"
        :data-testid="`${name}-count`"
        >{{ t('lists.tour.of', step) }}</span
      >
    </div>
    <p class="text-sm leading-[1.45] text-toned">{{ body }}</p>
    <div v-if="step && !last" class="flex items-center justify-between">
      <button
        type="button"
        class="min-h-10 px-1 text-[15px] font-semibold text-toned"
        :data-testid="`${name}-skip`"
        @click="emit('skip')"
      >
        {{ t('lists.tour.skip') }}
      </button>
      <button
        type="button"
        class="min-h-10 px-1 text-[15px] font-bold text-highlighted"
        :data-testid="`${name}-next`"
        @click="emit('next')"
      >
        {{ t('lists.tour.next') }}
      </button>
    </div>
    <button
      v-else
      type="button"
      class="min-h-10 self-end px-1 text-[15px] font-bold"
      :class="incognito ? 'text-incognito' : 'text-highlighted'"
      :data-testid="`${name}-understood`"
      @click="emit('understood')"
    >
      {{ t('lists.mode.understood') }}
    </button>
  </div>
</template>
