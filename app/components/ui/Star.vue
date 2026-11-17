<script setup lang="ts">
// The four-pointed mustard star before an idea, filled. Decorative.
withDefaults(defineProps<{ size?: number }>(), { size: 14 });
</script>

<template>
  <svg
    aria-hidden="true"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    class="shrink-0 fill-current text-star"
  >
    <path d="M12 2l2.2 7.8L22 12l-7.8 2.2L12 22l-2.2-7.8L2 12l7.8-2.2z" />
  </svg>
</template>
