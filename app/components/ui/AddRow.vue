<script setup lang="ts">
// The last row of a list that adds to it (V3): a plus and its words, in
// red, smaller than a row (« Un autre Secret Santa », « Nouvelle liste »).
defineProps<{ to: string; label: string }>();
</script>

<template>
  <li>
    <NuxtLink
      :to="to"
      class="flex min-h-12 items-center gap-2 pr-4 pl-5.5 text-sm font-bold text-primary transition-colors active:bg-muted"
    >
      <UIcon name="i-lucide-plus" class="size-4 shrink-0" />
      {{ label }}
    </NuxtLink>
  </li>
</template>
