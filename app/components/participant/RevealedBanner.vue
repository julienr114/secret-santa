<script setup lang="ts">
import { formatEventDate } from '#server/utils/rules';
import type { OpenDrawPayload } from '~/composables/queries/usePersonal';

// « Le tirage n'est plus secret. » (README 22.18, maquettes
// TirageDevoileAvant and TirageDevoileAvantOrganisateur): in the colours
// of the journal's alerts, who revealed and when, and a link to the
// journal. Before the party only.
const props = defineProps<{
  revealedAt: string;
  revealedBy: OpenDrawPayload['revealedBy'];
  journalPath: string;
}>();
const { t, locale } = useT();
const organizers = useOrganizers();
const text = computed(() => {
  const date = formatEventDate(props.revealedAt.slice(0, 10), locale.value);
  const by = props.revealedBy;
  if (by?.kind === 'me') return t('participant.revealed.bannerMe', { date });
  return by
    ? t('participant.revealed.bannerBy', { name: by.name, date })
    : t('participant.revealed.bannerOrganizer', {
        date,
        count: organizers.value,
      });
});
</script>

<template>
  <div
    role="status"
    class="flex items-start gap-3 rounded-xl bg-mustard-100 px-4 py-3 text-mustard-900"
    data-testid="revealed-banner"
  >
    <span
      class="flex size-8 shrink-0 items-center justify-center rounded-full bg-alert text-alert-ink"
      aria-hidden="true"
    >
      <UIcon name="i-lucide-eye" class="size-4.5" />
    </span>
    <p class="text-[15px] leading-[1.45]">
      <strong class="font-bold">{{
        t('participant.revealed.bannerTitle')
      }}</strong>
      {{ text }}
      <NuxtLink :to="journalPath" class="font-bold underline">{{
        t('participant.revealed.journal')
      }}</NuxtLink>
    </p>
  </div>
</template>
