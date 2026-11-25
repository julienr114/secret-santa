<script setup lang="ts">
import type { LineText } from '#shared/utils/lines';

// « Tu l'organises » (tickets 156 and 173): under the line of a Secret
// Santa I take part in and organise, hung on it without a divider,
// aligned under its title, without an icon; the organiser's text, and it
// opens the follow-up. The same on the home and on the event's page.
defineProps<{
  line: LineText;
  to: string;
}>();
const { t } = useT();
const words = useLineText();
</script>

<template>
  <li>
    <NuxtLink
      :to="to"
      class="flex min-h-[54px] items-center gap-3 pr-4 pb-2 pl-[68px] transition-colors active:bg-muted"
    >
      <span class="min-w-0 grow">
        <span class="line-clamp-2 font-semibold">{{ t('home.organise') }}</span>
        <span class="line-clamp-2 text-[13px] text-toned">{{
          words.line(line)
        }}</span>
      </span>
      <UIcon
        name="i-lucide-chevron-right"
        class="size-5 shrink-0 text-dimmed"
      />
    </NuxtLink>
  </li>
</template>
