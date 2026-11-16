<script setup lang="ts">
import { aroundLink } from '#shared/utils/links';

// A message as the recipient will read it, in a chat bubble: its words,
// then its link alone on its line, in bold, cut short if too long. While
// the text is on its way, the same bubble with three grey lines. `short`
// keeps two lines of words and what was added, for a preview.
const props = defineProps<{
  /** The message; none while it loads. */
  text?: string;
  link?: string;
  /** "Chargement du message", read by screen readers while it loads. */
  loadingLabel?: string;
  /** A glimpse: two lines of its words, then what was added below. */
  short?: boolean;
}>();
const parts = computed(() => aroundLink(props.text ?? '', props.link ?? ''));
/** Widths of the grey lines that stand for a message on its way. */
const LINES = ['w-full', 'w-[86%]', 'w-[55%]'];
</script>

<template>
  <div
    v-if="text === undefined"
    aria-busy="true"
    :aria-label="loadingLabel"
    class="flex w-[92%] flex-col gap-2.5 self-start rounded-2xl rounded-bl-[4px] bg-muted p-3.5"
  >
    <span
      v-for="width in LINES"
      :key="width"
      class="block h-3 rounded-lg bg-skeleton"
      :class="width"
    />
  </div>
  <div
    v-else
    class="flex max-w-[92%] flex-col gap-1.5 self-start rounded-2xl rounded-bl-[4px] bg-muted px-3.5 py-3 text-[15px] leading-[1.45] break-words"
  >
    <p class="whitespace-pre-line" :class="{ 'line-clamp-2': short }">
      {{ parts.before }}
    </p>
    <p
      v-if="parts.shown && !short"
      class="truncate font-semibold text-primary-ink"
    >
      {{ parts.shown }}
    </p>
    <p v-if="parts.after" class="whitespace-pre-line">{{ parts.after }}</p>
  </div>
</template>
