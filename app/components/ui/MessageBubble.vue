<script setup lang="ts">
import { aroundLink } from '#shared/utils/links';

// A message as the recipient will read it, in a chat bubble: its words,
// then its link alone on its line, in bold, cut short if too long.
const props = defineProps<{ text: string; link?: string }>();
const parts = computed(() => aroundLink(props.text, props.link ?? ''));
</script>

<template>
  <div
    class="flex max-w-[92%] flex-col gap-1.5 self-start rounded-2xl rounded-bl-[4px] bg-muted px-3.5 py-3 text-[15px] leading-[1.45] break-words"
  >
    <p class="whitespace-pre-line">{{ parts.before }}</p>
    <p v-if="parts.shown" class="truncate font-semibold text-primary-ink">
      {{ parts.shown }}
    </p>
    <p v-if="parts.after" class="whitespace-pre-line">{{ parts.after }}</p>
  </div>
</template>
