<script setup lang="ts">
import type { PastListBand } from '#server/http/lists';

// The band on top of a list of a year over (docs/spec/v3/listes.md, « Une
// liste d'une année passée », ticket 119, maquette V3ListeAnneePassee):
// « Liste de Noël 2025 » · « Une année passée », for everyone; a button
// to the list of this year taken from it, when I may open it. The list
// itself stays open.
const props = defineProps<{ band: PastListBand }>();
const { t } = useT();
const { yearName } = usePastText();
const next = computed(() => props.band.next);
</script>

<template>
  <div
    role="note"
    class="flex items-center gap-3 rounded-[18px] bg-warning-tint py-2.5 pr-2.5 pl-3.5"
    data-testid="list-past-band"
  >
    <UIcon name="i-lucide-clock" class="size-5 shrink-0 text-lilac-800" />
    <span class="flex min-w-0 grow flex-col">
      <span class="text-[15px] font-bold" data-testid="list-past-title">{{
        t(`lists.past.title.${band.category}`, { year: band.year })
      }}</span>
      <span class="text-[13px] text-toned">{{ t('lists.past.subtitle') }}</span>
    </span>
    <NuxtLink
      v-if="next"
      :to="next.to"
      class="flex h-9 shrink-0 items-center gap-1 rounded-full bg-default pr-2.5 pl-3 text-sm font-bold ring-1 ring-default"
      data-testid="list-past-next"
      >{{ yearName(band.category, next.year) }}
      <UIcon name="i-lucide-chevron-right" class="size-3 shrink-0" />
    </NuxtLink>
  </div>
</template>
