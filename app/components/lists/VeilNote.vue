<script setup lang="ts">
// A note pointed at something on a list, over a veil on the whole app
// (lot 27 ter, Correction 30, maquettes ListeVisiteurTirage,
// ListeCocheGuide): the veil covers everything, the top bar and the tabs
// included, as behind a sheet, and lets every touch through; only what
// the note points at (raised by its parent over the veil) and the note
// stay in the light. A title, a few words, « Compris ». The note of the
// anonymous mode is aubergine; the others are dark plum. Never two at a
// time: the page decides which one shows.
const props = defineProps<{
  tone: 'incognito' | 'plum';
  title: string;
  body: string;
  /** Where the tip is: towards a switch on the right, a pill on the left. */
  tip: 'left' | 'right';
  /** Names its parts for the tests: `mode-veil`, `mode-understood`. */
  name: string;
}>();
const emit = defineEmits<{ understood: [] }>();
const { t } = useT();
const incognito = computed(() => props.tone === 'incognito');
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
    class="relative flex flex-col gap-1.5 rounded-[28px] bg-default px-4 pt-3.5 pb-1.5 text-default"
    :class="
      incognito
        ? 'shadow-[0_0_0_1.5px_var(--color-incognito),0_14px_44px_6px_color-mix(in_srgb,var(--color-incognito)_45%,transparent)]'
        : 'shadow-[0_0_0_1.5px_var(--color-note),0_14px_44px_6px_color-mix(in_srgb,var(--color-note)_40%,transparent)]'
    "
    role="status"
  >
    <span
      class="absolute -top-[7px] size-3 rotate-45 border-t-[1.5px] border-l-[1.5px] bg-default"
      :class="[
        tip === 'right' ? 'right-[26px]' : 'left-[42px]',
        incognito ? 'border-incognito' : 'border-note',
      ]"
      aria-hidden="true"
    />
    <p class="text-[15px] leading-[1.35] font-bold">{{ title }}</p>
    <p class="text-sm leading-[1.45] text-toned">{{ body }}</p>
    <button
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
