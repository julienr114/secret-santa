<script setup lang="ts">
// The link of an idea, on a line of its own under its text (Correction
// 29, maquette ListeTeneur): a small icon and the name of its site, in
// italics, at the size of the text, in dark lilac. Not a pill, not
// underlined, cut by « … » on one line; never struck through nor greyed
// when the idea is ticked. A new tab, and a target of 44 px in height by
// an invisible padding.
defineProps<{ url: string; host: string }>();
const { t } = useT();
</script>

<template>
  <a
    :href="url"
    target="_blank"
    rel="noopener noreferrer"
    draggable="false"
    class="relative z-10 mt-px flex max-w-full items-center gap-1.5 self-start text-base/[22px] text-idea-link italic after:absolute after:inset-x-0 after:-inset-y-[11px]"
    :aria-label="t('lists.doc.linkTo', { site: host })"
    data-testid="idea-link"
    data-no-drag
  >
    <UIcon name="i-lucide-link" class="size-3.5 shrink-0" aria-hidden="true" />
    <span class="truncate">{{ host }}</span>
  </a>
</template>
