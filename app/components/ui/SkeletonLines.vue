<script setup lang="ts">
import type { SkeletonLine } from '#shared/utils/skeleton';

// Lines with an icon, on their way (V3ChargementAccueil, V3ChargementFete):
// a rounded square at the place of the icon, the title, the subtitle. Goes
// in a white list, separated by its dividers.
defineProps<{ lines: SkeletonLine[] }>();
</script>

<template>
  <li
    v-for="([title, subtitle], index) in lines"
    :key="index"
    class="flex min-h-15 items-center gap-3 px-4 py-2"
  >
    <USkeleton class="size-9 shrink-0 rounded-md bg-skeleton-soft" />
    <span class="flex grow flex-col gap-[7px]">
      <USkeleton
        class="h-4 rounded-full bg-skeleton-soft"
        :style="{ width: title }"
      />
      <USkeleton
        class="h-[11px] rounded-full bg-skeleton-soft"
        :style="{ width: subtitle }"
      />
    </span>
  </li>
</template>
