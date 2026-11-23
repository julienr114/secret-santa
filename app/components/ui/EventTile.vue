<script setup lang="ts">
import type { PartyCategory } from '#shared/utils/categories';

// The icon of an event (ticket 143, docs/spec/v3/categories.md, « L'icône
// d'un événement est une tuile en couleur »): its emoji in a square tile
// with rounded corners, the gradient of its category (150°, from light to
// strong), a white edge and a light shadow. The category gives the
// colour, even when the emoji was chosen by hand. Decorative: the name of
// the event is beside it. 44 px in a card of the home, 36 px in « Les
// événements passés », 32 px in « Bientôt », 30 px in « Quoi de neuf »,
// 28 px in the bar of a list.
const props = withDefaults(
  defineProps<{
    emoji: string | null;
    category: PartyCategory;
    size?: 44 | 36 | 32 | 30 | 28;
  }>(),
  { size: 44 },
);
/** The gradient of each category, from the colours of the theme. */
const GRADIENTS: Record<PartyCategory, string> = {
  christmas: 'from-tile-christmas-from to-tile-christmas-to',
  birthday: 'from-tile-birthday-from to-tile-birthday-to',
  birth: 'from-tile-birth-from to-tile-birth-to',
  wedding: 'from-tile-wedding-from to-tile-wedding-to',
  housewarming: 'from-tile-housewarming-from to-tile-housewarming-to',
  other: 'from-tile-other-from to-tile-other-to',
};
/** Its box, its corners, its edge and the size of its emoji. */
const SIZES = {
  44: 'size-11 rounded-[13px] text-[23px] shadow-tile',
  36: 'size-9 rounded-[9px] text-[19px] shadow-tile',
  32: 'size-8 rounded-[9px] text-[17px] shadow-tile-sm',
  30: 'size-7.5 rounded-[9px] text-base shadow-tile-sm',
  28: 'size-7 rounded-[9px] text-[15px] shadow-tile-sm',
} as const;
const box = computed(() => SIZES[props.size]);
</script>

<template>
  <span
    class="flex shrink-0 items-center justify-center bg-linear-150/srgb from-0% to-115%"
    :class="[GRADIENTS[category], box]"
    aria-hidden="true"
    data-testid="event-tile"
  >
    <UiEmoji v-if="emoji" :emoji="emoji" />
  </span>
</template>
