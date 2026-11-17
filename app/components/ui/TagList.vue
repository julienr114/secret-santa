<script setup lang="ts">
// A few short words side by side, each in a kraft pill, wrapping to the
// next line: the answers of « Moi et les cadeaux ». The texts come from
// the parent.
defineProps<{ tags: string[] }>();
</script>

<template>
  <ul class="flex flex-wrap gap-2">
    <li
      v-for="tag in tags"
      :key="tag"
      class="rounded-full bg-muted px-3 py-1.5 text-sm leading-[1.3] font-semibold"
    >
      {{ tag }}
    </li>
  </ul>
</template>
