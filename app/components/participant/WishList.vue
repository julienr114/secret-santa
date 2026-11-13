<script setup lang="ts">
import type { WishItem } from '~/composables/queries/usePersonal';

// A wish list, read only. Links are user content: opened in a new tab,
// without referrer or opener (README 6 bis.1).
defineProps<{ wishes: WishItem[] }>();
</script>

<template>
  <ul class="flex flex-col gap-2">
    <li
      v-for="(wish, index) in wishes"
      :key="index"
      class="flex items-start gap-2"
    >
      <span class="mt-0.5" aria-hidden="true">🎁</span>
      <span class="min-w-0">
        <span class="block break-words">{{ wish.label }}</span>
        <a
          v-if="wish.url"
          :href="wish.url"
          target="_blank"
          rel="noopener noreferrer nofollow"
          class="block truncate text-sm text-primary underline"
          >{{ wish.url }}</a
        >
      </span>
    </li>
  </ul>
</template>
