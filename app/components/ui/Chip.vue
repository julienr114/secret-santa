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
  }>(),
  { kind: 'info', icon: undefined, button: false },
);
const KINDS = {
  info: 'bg-muted text-toned',
  mine: 'bg-success-soft text-success-ink',
  anonymous: 'bg-incognito text-white',
  action: 'bg-default text-default ring-[1.5px] ring-accented ring-inset',
  selected: 'bg-inverted text-inverted',
};
</script>

<template>
  <component
    :is="button ? 'button' : 'span'"
    :type="button ? 'button' : undefined"
    class="inline-flex max-w-full items-center gap-1 rounded-full py-px pr-[9px] text-xs/5 font-semibold tracking-[0.01em] whitespace-nowrap"
    :class="[
      KINDS[kind],
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
  </component>
</template>
