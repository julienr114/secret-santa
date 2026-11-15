<script setup lang="ts">
import type { WishItem } from '~/composables/queries/usePersonal';

// A wish list, read only, each idea after a star. A link is user
// content: shown as "Voir le lien", never as its address, and opened in
// a new tab without referrer or opener (README 6 bis.1).
defineProps<{ wishes: WishItem[] }>();
const { t } = useT();
</script>

<template>
  <ul class="flex flex-col gap-3">
    <li
      v-for="(wish, index) in wishes"
      :key="index"
      class="flex items-start gap-2.5"
    >
      <UIcon
        name="i-lucide-star"
        class="mt-1 size-4 shrink-0 text-star"
        aria-hidden="true"
      />
      <span class="flex min-w-0 flex-col items-start">
        <span class="break-words">{{ wish.label }}</span>
        <a
          v-if="wish.url"
          :href="wish.url"
          target="_blank"
          rel="noopener noreferrer nofollow"
          :aria-label="t('participant.wishes.openLink', { label: wish.label })"
          class="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-primary-ink underline"
        >
          {{ t('participant.reveal.seeLink') }}
          <UIcon
            name="i-lucide-external-link"
            class="size-3.5"
            aria-hidden="true"
          />
        </a>
      </span>
    </li>
  </ul>
</template>
