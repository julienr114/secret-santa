<script setup lang="ts">
// How much an idea is wanted (docs/spec/v3/listes.md, « Les étoiles »,
// ticket 152): one to three full stars, at the end of its text, read by
// everyone; « Envie : 2 sur 3 » for screen readers. Nothing at none.
defineProps<{ count: number }>();
const { t } = useT();
</script>

<template>
  <span
    v-if="count > 0"
    class="ml-1.5 inline-flex gap-px align-[-3px] whitespace-nowrap text-rating"
    role="img"
    :aria-label="t('lists.line.stars', { count })"
    data-testid="idea-stars"
    :data-stars="count"
  >
    <UiRatingStar v-for="n in count" :key="n" full class="size-3.5" />
  </span>
</template>
