<script setup lang="ts">
// The thread of a person on a list (Correction 30, maquette
// ListeGroupeFil): a thin peach line from under their icon of 40 px,
// down the middle of the left column, behind each box (their solid fill
// covers it), to the box of their last line. Decorative only. Its
// section is `relative`, the header first, the ideas after.
</script>

<template>
  <span
    class="pointer-events-none absolute top-[46px] bottom-[26px] left-[19px] w-0.5 rounded-full bg-person-thread"
    aria-hidden="true"
    data-testid="person-thread"
  />
</template>
