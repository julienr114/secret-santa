<script setup lang="ts">
import { envelopeState, personalPhase } from '#server/utils/personal';
import type { HomeDraw } from '~/composables/queries/useAuth';

// The one draw of an account that only takes part in one, as the top
// card of its home: its envelope, where it stands, the day of the party
// (all of it opens the draw), the button of the moment, and « Du nouveau
// au journal » when an alert waits (README 22.15). Once the draw is
// revealed before the party, who they give to (README 22.18,
// AccueilDevoileAvant).
const props = defineProps<{ draw: HomeDraw }>();
const emit = defineEmits<{ open: [] }>();
const { t } = useT();
const endText = useGuessEnd();
const party = usePartyText();

/** New hints from the person they give to, to read (lot 16 bis). */
const newHints = computed(
  () => props.draw.status === 'drawn' && props.draw.receiverHints === 'new',
);
/** « Devine qui » (22.17): its palmarès, or a guess to make. */
const palmares = computed(
  () =>
    props.draw.revealed &&
    Boolean(props.draw.game?.palmares && !props.draw.game.seen),
);
/** Revealed before the party, and no palmarès waiting first. */
const opened = computed(() => (palmares.value ? null : props.draw.opened));
const guessing = computed(
  () =>
    props.draw.revealed &&
    Boolean(props.draw.game?.open && !props.draw.game.played),
);
const envelope = computed(() =>
  newHints.value || guessing.value
    ? 'sealed'
    : envelopeState(
        personalPhase(props.draw.status),
        props.draw.revealed,
        false,
      ),
);
/** The line under the title: the party, after the news when there are. */
const partyLine = computed(() => {
  if (palmares.value) return t('auth.home.drawCard.palmaresBody');
  if (opened.value) {
    const when = party.long(props.draw.eventDate);
    return [t('auth.home.drawCard.openedBody'), when && `${when}.`]
      .filter(Boolean)
      .join(' ');
  }
  if (guessing.value && props.draw.game?.endsAt) {
    const end = endText(props.draw.game.endsAt);
    return props.draw.game.mode === 'santa'
      ? t('auth.home.drawCard.guessSanta', { end })
      : t('auth.home.drawCard.guessAll', { end });
  }
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
  if (palmares.value) {
    return {
      title: t('auth.home.drawCard.palmaresTitle'),
      button: t('auth.home.drawCard.palmaresButton'),
      to: `${draw.path}/devine/palmares`,
      variant: 'solid' as const,
    };
  }
  if (opened.value) {
    return {
      title: t('auth.home.drawCard.opened', { name: opened.value.name }),
      button: draw.hintsOn
        ? t('auth.home.drawCard.openedHints')
        : t('auth.home.drawCard.openedDraw'),
      to: draw.path,
      variant: 'solid' as const,
    };
  }
  if (guessing.value) {
    return {
      title: t('auth.home.drawCard.guessTitle'),
      button: t('auth.home.drawCard.guessButton'),
      to: `${draw.path}/devine`,
      variant: 'solid' as const,
    };
  }
  if (newHints.value) {
    return {
      title: t('auth.home.drawCard.newHints'),
      button: t('auth.home.drawCard.readHints'),
      to: draw.path,
      variant: 'solid' as const,
    };
  }
  // A draw made elsewhere: their answer, before anything else (22.12).
  if (draw.status === 'preparing' && draw.answer === 'toGive') {
    return {
      title: t('auth.home.drawCard.giveAnswer'),
      button: t('auth.home.drawCard.answer'),
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
  if (draw.status === 'preparing' && draw.answer === 'given') {
    return draw.hintsOn && !draw.hasHints
      ? {
          title: t('auth.home.drawCard.answerGiven'),
          button: t('auth.home.drawCard.hints'),
          to: `${draw.path}/pistes`,
          variant: 'solid' as const,
        }
      : { title: t('auth.home.drawCard.answerGiven'), button: null, to: null };
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
      <UiPodium v-if="palmares" />
      <UiAvatar v-else-if="opened" :avatar="opened.avatar" size="xl" />
      <UiEnvelope v-else :state="envelope" />
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
      :icon="
        newHints || palmares || guessing || opened ? undefined : 'i-lucide-gift'
      "
      :class="palmares ? 'bg-pine-700 hover:bg-pine-800' : ''"
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
