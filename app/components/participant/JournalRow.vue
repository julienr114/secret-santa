<script setup lang="ts">
// « Journal du groupe » on the page of a draw (README 22.16): a line of
// its own under the tiles, framed; with alerts since the last visit
// (lots 12 and 14), amber, its count in bold, and above the tiles.
defineProps<{ to: string; alerts: number }>();
const { t } = useT();
</script>

<template>
  <NuxtLink
    :to="to"
    class="flex min-h-16 items-center gap-3 rounded-2xl px-4 transition-colors"
    :class="
      alerts > 0
        ? 'bg-warning-tint py-3 text-alert-ink ring-1 ring-warning-ring'
        : 'py-2.5 ring-1 ring-default active:bg-muted'
    "
    data-testid="journal-row"
    :data-alert="alerts > 0 || undefined"
  >
    <span
      class="flex size-10 shrink-0 items-center justify-center rounded-full"
      :class="alerts > 0 ? 'bg-alert text-inverted' : 'bg-muted text-toned'"
      aria-hidden="true"
    >
      <UIcon name="i-lucide-file-text" class="size-5" />
    </span>
    <span class="flex min-w-0 grow flex-col gap-0.5">
      <span
        :class="
          alerts > 0
            ? 'font-display text-lg leading-[1.15] font-bold'
            : 'font-semibold'
        "
        >{{ t('participant.home.journal.title') }}</span
      >
      <span v-if="alerts > 0" class="text-sm font-bold text-warning-ink">{{
        t('participant.home.journal.alerts', { count: alerts })
      }}</span>
      <span v-else class="text-sm leading-[1.35] text-toned">{{
        t('participant.home.journal.subtitle')
      }}</span>
    </span>
    <UIcon
      name="i-lucide-chevron-right"
      class="size-5 shrink-0 text-dimmed"
      aria-hidden="true"
    />
  </NuxtLink>
</template>
