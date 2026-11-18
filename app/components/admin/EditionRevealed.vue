<script setup lang="ts">
import type { Participant } from '#server/database/editions';

// The results revealed (README 22.9, `Cloturee`): the edition stays open
// until closed. A card says so, then who gave to whom, seen by the
// organiser only, then the exclusions applied, the journal, closing (a
// second tap) and the next edition.
const props = defineProps<{
  slug: string;
  editionId: string;
  participants: Participant[];
  /** How many exclusions the draw applied. */
  appliedExclusions: number;
  closing: boolean;
}>();
const emit = defineEmits<{ close: [] }>();
const { t } = useT();
const base = computed(() => `/admin/${props.slug}/editions/${props.editionId}`);
const confirming = ref(false);
const closingShown = useBusy(() => props.closing);
</script>

<template>
  <UiCard
    padding="lg"
    class="flex items-start gap-3.5"
    data-testid="revealed-notice"
  >
    <span
      class="flex size-11 shrink-0 items-center justify-center rounded-full bg-success-soft text-success-ink"
      aria-hidden="true"
    >
      <UIcon name="i-lucide-archive" class="size-5.5" />
    </span>
    <div class="flex flex-col gap-1">
      <h2 class="font-display text-[22px] leading-[1.2] font-semibold">
        {{ t('adminEdition.screen.reveal.revealedTitle') }}
      </h2>
      <p class="text-sm leading-[1.45] text-toned">
        {{ t('adminEdition.screen.reveal.revealedHelp') }}
      </p>
    </div>
  </UiCard>
  <AdminEditionResults
    :id="editionId"
    :slug="slug"
    :people="participants"
    :title="
      t('adminEdition.screen.reveal.pairsTitle', {
        count: participants.length,
      })
    "
    :footer="t('adminEdition.screen.reveal.pairsFooter')"
  />
  <!-- « Devine qui », under the pairs (README 22.17). -->
  <slot name="after-pairs" />
  <UiList>
    <UiListItem
      :to="`${base}/exclusions`"
      icon="i-lucide-ban"
      icon-tone="neutral"
      :title="t('adminEdition.screen.closed.exclusions')"
      :subtitle="
        appliedExclusions > 0
          ? t('adminEdition.screen.prepare.exclusionsCount', {
              count: appliedExclusions,
            })
          : t('adminEdition.screen.closed.exclusionsNone')
      "
    />
    <UiListItem
      :to="`/admin/${slug}/journal`"
      icon="i-lucide-file-text"
      icon-tone="neutral"
      :title="t('adminEdition.screen.closed.journal')"
      :subtitle="t('adminEdition.screen.closed.journalHint')"
    />
    <UiListItem
      v-if="!confirming"
      icon="i-lucide-archive"
      icon-tone="neutral"
      :title="t('adminEdition.screen.follow.closeRow')"
      :subtitle="t('adminEdition.screen.reveal.closeHint')"
      :on-click="() => (confirming = true)"
      chevron
    />
    <li v-else class="flex flex-col gap-2 px-4 py-3">
      <p class="text-sm">{{ t('adminEdition.screen.follow.closeConfirm') }}</p>
      <div class="flex gap-2">
        <UButton
          :disabled="closing"
          :loading="closingShown"
          :label="
            closingShown
              ? t('adminEdition.screen.follow.closing')
              : t('adminEdition.screen.follow.closeRow')
          "
          @click="emit('close')"
        />
        <UButton
          variant="ghost"
          color="neutral"
          :disabled="closing"
          :label="t('common.actions.cancel')"
          @click="confirming = false"
        />
      </div>
    </li>
  </UiList>
  <UButton
    :to="`/admin/${slug}/editions/nouvelle`"
    block
    size="xl"
    variant="outline"
    icon="i-lucide-plus"
    class="min-h-12 justify-center font-bold"
    :label="t('adminEdition.screen.closed.next')"
  />
</template>
