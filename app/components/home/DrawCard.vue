<script setup lang="ts">
import { envelopeState, personalPhase } from '#server/utils/personal';
import type { HomeDraw } from '~/composables/queries/useAuth';

// The one draw of an account that only takes part in one, as the top
// card of its home: its envelope, where it stands, the day of the party
// (all of it opens the draw), the button of the moment, and « Du nouveau
// au journal » when an alert waits (README 22.15).
const props = defineProps<{ draw: HomeDraw }>();
const emit = defineEmits<{ open: [] }>();
const { t } = useT();
const party = usePartyText();

/** New hints from the person they give to, to read (lot 16 bis). */
const newHints = computed(
  () => props.draw.status === 'drawn' && props.draw.receiverHints === 'new',
);
const envelope = computed(() =>
  newHints.value
    ? 'sealed'
    : envelopeState(
        personalPhase(props.draw.status),
        props.draw.revealed,
        false,
      ),
);
/** The line under the title: the party, after the news when there are. */
const partyLine = computed(() => {
  if (!newHints.value) return party.long(props.draw.eventDate);
  const when = party.short(props.draw.eventDate);
  return [
    t('auth.home.drawCard.newHintsBody'),
    when && `${when.charAt(0).toUpperCase()}${when.slice(1)}.`,
  ]
    .filter(Boolean)
    .join(' ');
});
/** Title and button of the card, by what the draw waits for. */
const state = computed(() => {
  const { draw } = props;
  if (newHints.value) {
    return {
      title: t('auth.home.drawCard.newHints'),
      button: t('auth.home.drawCard.readHints'),
      to: draw.path,
      variant: 'solid' as const,
    };
  }
  if (draw.status === 'drawn') {
    return draw.revealed
      ? {
          title: t('auth.home.drawCard.seeAgain'),
          button: t('auth.home.drawCard.revealAgain'),
          to: draw.path,
          variant: 'outline' as const,
        }
      : {
          title: t('auth.home.drawCard.discover'),
          button: t('auth.home.drawCard.reveal'),
          to: draw.path,
          variant: 'solid' as const,
        };
  }
  return draw.hintsOn && !draw.hasHints
    ? {
        title: t('auth.home.drawCard.addHints'),
        button: t('auth.home.drawCard.hints'),
        to: `${draw.path}/pistes`,
        variant: 'solid' as const,
      }
    : { title: t('auth.home.drawCard.waiting'), button: null, to: null };
});
</script>

<template>
  <UiCard
    padding="lg"
    class="flex flex-col items-center gap-3 text-center"
    data-testid="draw-card"
  >
    <NuxtLink
      :to="draw.path"
      class="flex flex-col items-center gap-3 rounded-lg focus-visible:ring-2 focus-visible:ring-primary"
      @click="emit('open')"
    >
      <UiEnvelope :state="envelope" />
      <span class="text-xs font-bold tracking-wide text-primary-ink uppercase">
        {{ draw.groupName }} · {{ draw.editionLabel }}
      </span>
      <h2 class="font-display text-[22px] leading-snug font-bold">
        {{ state.title }}
      </h2>
      <span v-if="partyLine" class="text-sm text-muted">
        {{ partyLine }}
      </span>
    </NuxtLink>
    <UButton
      v-if="state.button && state.to"
      :to="state.to"
      block
      size="xl"
      :icon="newHints ? undefined : 'i-lucide-gift'"
      :variant="state.variant"
      class="min-h-14 justify-center font-bold"
      :label="state.button"
      @click="emit('open')"
    />
    <HomeJournalSignal
      v-if="draw.journal"
      :signal="draw.journal"
      :path="draw.path"
      @open="emit('open')"
    />
  </UiCard>
</template>
