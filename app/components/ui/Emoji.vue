<script setup lang="ts">
import { emojiImagePath } from '#shared/utils/emojiImage';

// An avatar's emoji, drawn the same on every device: Apple's image, at
// the size of the text around it (lot 15). If the image does not load,
// the character itself. Decorative: the name is always beside it.
const props = defineProps<{ emoji: string }>();
const failed = ref(false);
watch(
  () => props.emoji,
  () => {
    failed.value = false;
  },
);
</script>

<template>
  <span v-if="failed" aria-hidden="true">{{ emoji }}</span>
  <img
    v-else
    :src="emojiImagePath(emoji)"
    alt=""
    width="64"
    height="64"
    class="inline-block size-[1.2em] shrink-0 select-none"
    draggable="false"
    @error="failed = true"
  />
</template>
