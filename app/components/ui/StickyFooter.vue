<script setup lang="ts">
// The main action of a screen, at its bottom (README 23.3).
// On a long screen where one chooses, it is a white band stuck to the
// bottom, in reach at all times, above the bottom bar when
// there is one. The band reaches down over the screen's and the layout's
// padding. On a wide screen the band and its top line run the whole width
// of the window, while the button stays in the column: the border image
// is painted beyond the box (outset) without widening the page.
// On a page where one writes (`inline`), the action is in the page, at
// the end of the content: nothing sits above the keyboard, which simply
// passes over it (decided by Julien on 19 November 2026: on a phone, a
// band stuck to the keyboard does not hold). Touching outside the field
// closes the keyboard.
const props = defineProps<{
  /** In the page, after the content: for a page where one writes. */
  inline?: boolean;
}>();
if (props.inline) useTapOutsideToBlur();
</script>

<template>
  <div v-if="inline" class="flex flex-col gap-2" data-testid="inline-footer">
    <slot />
  </div>
  <div
    v-else
    class="sticky bottom-(--tab-bar) z-10 mt-auto -mb-[calc(3.25rem+env(safe-area-inset-bottom))]"
  >
    <div
      class="-mx-4 flex flex-col gap-2 px-4 pt-3.5 pb-[max(1rem,calc(env(safe-area-inset-bottom)-var(--tab-bar)))] [border-image:linear-gradient(to_bottom,var(--ui-border)_1px,var(--ui-bg)_1px)_fill_0//0_100vmax]"
      data-testid="sticky-footer"
    >
      <slot />
    </div>
  </div>
</template>
