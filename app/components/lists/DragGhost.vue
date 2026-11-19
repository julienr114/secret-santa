<script setup lang="ts">
import type { Avatar } from '#server/utils/avatars';

// What is lifted, under the finger (lot 24 ter, maquette ListeGlisser): a
// white card with a red outline and a shadow, slightly tilted, a handle
// on its right. An idea shows its text; a person folds into one line,
// their icon, their first name and how many ideas they have, so that a
// long list can be crossed.
defineProps<{
  /** Where the finger is, from the top of the screen. */
  y: number;
  /** The left edge and the width of the list, on the screen. */
  left: number;
  width: number;
  label: string;
  /** A person: their icon, and what is said under their name. */
  avatar?: Avatar;
  detail?: string;
}>();
</script>

<template>
  <div
    class="pointer-events-none fixed z-40 flex min-h-12 -rotate-1 items-center gap-3 rounded-2xl bg-default px-3 py-2 shadow-[0_10px_28px_rgba(90,40,60,0.28)] ring-2 ring-primary"
    :style="{ top: `${y - 24}px`, left: `${left}px`, width: `${width}px` }"
    aria-hidden="true"
    data-testid="drag-ghost"
  >
    <UiAvatar v-if="avatar" :avatar="avatar" size="sm" class="shrink-0" />
    <span class="flex min-w-0 grow flex-col">
      <span
        class="truncate"
        :class="avatar ? 'font-display text-xl font-bold' : 'text-base'"
        >{{ label }}</span
      >
      <span v-if="detail" class="text-sm text-toned">{{ detail }}</span>
    </span>
    <UIcon name="i-lucide-grip-vertical" class="size-5 shrink-0 text-toned" />
  </div>
</template>
