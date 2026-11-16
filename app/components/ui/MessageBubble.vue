<script setup lang="ts">
import { aroundLink } from '#shared/utils/links';

// A message as the recipient will read it, in a chat bubble: its words,
// then its link alone on its line, in bold, cut short if too long. While
// the text is on its way, the same bubble with three grey lines. `short`
// keeps the first two lines of it all, for a glimpse.
const props = defineProps<{
  /** The message; none while it loads. */
  text?: string;
  link?: string;
  /** "Chargement du message", read by screen readers while it loads. */
  loadingLabel?: string;
  /** A glimpse: the whole message, link included, on two lines. */
  short?: boolean;
}>();
const parts = computed(() => aroundLink(props.text ?? '', props.link ?? ''));
/** The message in one run, the link without its protocol. */
const glimpse = computed(() =>
  [parts.value.before, parts.value.shown, parts.value.after]
    .filter(Boolean)
    .join(' '),
);
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
    <p v-if="short" class="line-clamp-2">{{ glimpse }}</p>
    <template v-else>
      <p class="whitespace-pre-line">{{ parts.before }}</p>
      <p v-if="parts.shown" class="truncate font-semibold text-primary-ink">
        {{ parts.shown }}
      </p>
      <p v-if="parts.after" class="whitespace-pre-line">{{ parts.after }}</p>
    </template>
  </div>
</template>
