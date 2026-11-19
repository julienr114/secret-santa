<script setup lang="ts">
import type { PublicEdition } from '#server/database/editions';
import { participantCounters } from '#server/utils/editions';
import { daysUntil, formatEventDate, isIsoDay } from '#server/utils/rules';
import { useEditionQuery } from '~/composables/queries/useGroup';

// The edition going on, on the group's home: its name and party day, its
// stepper, then where it stands (how many found out their result, how
// many are still to notify) and the way in.
const props = defineProps<{
  slug: string;
  edition: PublicEdition;
  /** The group's party day, until the edition's own rules arrive. */
  groupDate: string;
}>();
const { t, locale } = useT();
const details = useEditionQuery(
  () => props.slug,
  () => props.edition.id,
);
const eventDate = computed(
  () => details.data.value?.rules.eventDate ?? props.groupDate,
);
const steps = useEditionSteps(
  () => props.edition.status,
  eventDate,
  () => Boolean(props.edition.revealedAt),
);
const today = new Date().toLocaleDateString('sv-SE');
const dateLine = computed(() => {
  if (!isIsoDay(eventDate.value)) return null;
  const date = formatEventDate(eventDate.value, locale.value);
  const days = daysUntil(eventDate.value, today);
  return days === null || days < 0
    ? t('adminGroup.dashboard.partyOn', { date })
    : t('adminGroup.dashboard.partyOnIn', { date, count: days });
});
const participants = computed(() => details.data.value?.participants ?? []);
const counts = computed(() => participantCounters(participants.value));
const drawn = computed(() => props.edition.status === 'drawn');
const progressLine = computed(() =>
  [
    t('adminGroup.dashboard.viewedOf', {
      count: counts.value.viewed,
      total: participants.value.length,
    }),
    counts.value.toNotify > 0
      ? t('adminGroup.dashboard.toNotify', { count: counts.value.toNotify })
      : '',
  ]
    .filter(Boolean)
    .join(' · '),
);
</script>

<template>
  <UiCard
    padding="none"
    class="flex flex-col gap-4 p-5"
    data-testid="current-edition"
  >
    <div class="flex flex-col gap-1">
      <p class="text-xs font-bold tracking-[0.04em] text-primary-ink uppercase">
        {{ t('adminGroup.dashboard.current') }}
      </p>
      <h2 class="font-display text-[22px] leading-[1.2] font-semibold">
        {{ edition.label }}
      </h2>
      <p v-if="dateLine" class="flex items-center gap-1.5 text-sm text-toned">
        <UIcon
          name="i-lucide-calendar"
          class="size-4 shrink-0"
          aria-hidden="true"
        />
        {{ dateLine }}
      </p>
    </div>
    <UiStepper :steps="steps" :label="t('adminEdition.screen.steps.label')" />
    <USkeleton
      v-if="details.isPending.value"
      class="h-5 w-3/4 rounded bg-skeleton-soft"
    />
    <div v-else-if="drawn" class="flex flex-col gap-1.5">
      <UProgress
        :model-value="counts.viewed"
        :max="Math.max(participants.length, 1)"
        color="secondary"
        :aria-label="t('adminGroup.dashboard.viewedLabel')"
        :ui="{ base: 'h-2 bg-track', indicator: 'bg-success' }"
      />
      <p class="text-[13px] text-toned">{{ progressLine }}</p>
    </div>
    <p v-else class="text-[13px] text-toned">
      {{
        edition.status === 'preparing'
          ? t('adminGroup.dashboard.preparing', {
              count: participants.length,
            })
          : t('common.count.participants', { count: participants.length })
      }}
    </p>
    <UButton
      :to="`/admin/${slug}/editions/${edition.id}`"
      block
      size="xl"
      class="h-12 justify-center font-bold"
      :label="t('adminGroup.dashboard.open')"
    />
  </UiCard>
</template>
