<script setup lang="ts">
// A small pill under a line (README 23, Correction 29): 12 px, semibold,
// 22 px high. Four families, by what it does:
// - `info`: something to read (a first name, « 7 personnes », « Au
//   complet »), peach, grey-plum text;
// - `mine` and `anonymous`: my own state, mint (« Tu l'offres », « Tu
//   participes ») or dark aubergine (« Tu l'offres en anonyme »), as the
//   bar of the anonymous mode;
// - `action`: something to touch (« Se joindre »), white with a line
//   around it. It is the only family with a line: a pill with a line is
//   touched, a full pill informs.
// My own state, which opens the sheet of what I give, says it is touched
// (Correction 30, maquette ListeJOffreAgir): a line around it, mint or
// lighter on the aubergine, and a small arrow at its end (`opens`).
// Several pills touched together (the first names under an idea, for
// those who hold the list: « Qui l'offre ? ») each have the line, and only
// the last the arrow: `ringed` gives the line alone.
// `selected` is an `info` pill touched, turned dark, while what it
// unfolds shows. As a button it keeps a target of 44 px in height, by an
// invisible padding. Its icon is decorative.
withDefaults(
  defineProps<{
    kind?: 'info' | 'mine' | 'anonymous' | 'action' | 'selected';
    /** A Lucide icon, before the text. */
    icon?: string;
    /** Touched: a button, with its target of 44 px. */
    button?: boolean;
    /** Opens something: a line around it and « › » at its end. */
    opens?: boolean;
    /** The line of `opens`, without the arrow. */
    ringed?: boolean;
  }>(),
  {
    kind: 'info',
    icon: undefined,
    button: false,
    opens: false,
    ringed: false,
  },
);
const KINDS = {
  info: 'bg-muted text-toned',
  mine: 'bg-success-soft text-success-ink',
  anonymous: 'bg-incognito text-white',
  action: 'bg-default text-default ring-[1.5px] ring-accented ring-inset',
  selected: 'bg-inverted text-inverted',
};
/** The line of a pill that opens something, by its family. */
const OPENS_RING: Partial<Record<keyof typeof KINDS, string>> = {
  mine: 'ring-[1.5px] ring-success-ring ring-inset',
  anonymous: 'ring-[1.5px] ring-incognito-ring ring-inset',
  info: 'ring-[1.5px] ring-accented ring-inset',
};
</script>

<template>
  <component
    :is="button ? 'button' : 'span'"
    :type="button ? 'button' : undefined"
    class="inline-flex max-w-full items-center gap-1 rounded-full py-px text-xs/5 font-semibold tracking-[0.01em] whitespace-nowrap"
    :class="[
      KINDS[kind],
      opens ? `pr-1.5 ${OPENS_RING[kind] ?? ''}` : 'pr-[9px]',
      ringed && !opens ? (OPENS_RING[kind] ?? '') : '',
      icon ? 'pl-[7px]' : 'pl-[9px]',
      button
        ? 'relative after:absolute after:inset-x-0 after:-inset-y-[11px]'
        : '',
    ]"
  >
    <UIcon
      v-if="icon"
      :name="icon"
      class="size-3 shrink-0"
      aria-hidden="true"
    />
    <span class="truncate"><slot /></span>
    <UIcon
      v-if="opens"
      name="i-lucide-chevron-right"
      class="-ml-0.5 size-3 shrink-0"
      aria-hidden="true"
    />
  </component>
</template>
