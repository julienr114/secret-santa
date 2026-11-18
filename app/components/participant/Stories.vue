<script setup lang="ts">
import type { Avatar } from '#server/utils/avatars';
import {
  STORY_SECONDS,
  storyScreens,
  storyStep,
  type AwardKind,
  type StoryScreen,
} from '#shared/utils/palmares';

// The palmarès of « Devine qui » in images (README 22.17, maquettes
// DevineStory1 to 7): full screens, a bar of progress on top. They start
// at once (asked by Julien on 18 November 2026): each screen stays 7
// seconds then the next one comes; a tap on
// the right goes on, on the left goes back; holding the screen pauses;
// the cross closes. When the device asks for less motion, nothing moves
// by itself. The last screen offers every result and starting again.
type Person = { id: string; name: string; avatar: Avatar };
type Award = {
  kind: AwardKind;
  winners: string[];
  count: number;
  value: number;
  total?: number;
};
const props = defineProps<{
  editionLabel: string;
  people: Person[];
  players: number;
  guesses: number;
  awards: Award[];
  /** The reader's own Santa: who it was, and who they had said. */
  santa: { actualId: string; guessedId: string | null } | null;
  /** How many guessed their own Santa. */
  unmasked: number;
  /** The small palmarès (Correction 12): one's own Santa, no award. */
  small?: boolean;
  /** The reader's first name, for « Joyeux Noël » ; none for an organiser. */
  firstName: string | null;
  /** Where « Voir tous les résultats » and the cross lead. */
  answersPath: string;
}>();
const emit = defineEmits<{ seen: [] }>();
const { t, tk, locale } = useT();

const screens = computed<StoryScreen[]>(() =>
  storyScreens({ awards: props.awards, hasSanta: Boolean(props.santa) }),
);
const at = ref(0);
const started = ref(false);
const paused = ref(false);
const elapsed = ref(0);
const screen = computed(() => screens.value[at.value]!);
const personOf = (id: string | null | undefined) =>
  props.people.find((p) => p.id === id) ?? null;
const reduced = ref(false);
onMounted(() => {
  reduced.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // The images start by themselves, unless less motion is asked for.
  started.value = true;
  run();
});

// The clock of the stories: 7 seconds per screen once started.
const TICK = 100;
const clock: { timer: ReturnType<typeof setInterval> | null } = {
  timer: null,
};
const stop = () => {
  if (clock.timer) clearInterval(clock.timer);
  clock.timer = null;
};
const run = () => {
  stop();
  if (reduced.value) return;
  clock.timer = setInterval(() => {
    if (paused.value || !started.value) return;
    elapsed.value += TICK;
    if (elapsed.value >= STORY_SECONDS * 1000) go('right');
  }, TICK);
};
onBeforeUnmount(stop);
/**
 * Shows another screen, its clock from zero.
 * @param side - Right goes on, left goes back.
 * @returns Nothing.
 */
const go = (side: 'left' | 'right') => {
  started.value = true;
  at.value = storyStep(at.value, screens.value.length, side);
  elapsed.value = 0;
  if (at.value === screens.value.length - 1) {
    stop();
    emit('seen');
  } else if (!clock.timer) run();
};
/** Starts again from the first screen, the clock running. */
const restart = () => {
  at.value = 0;
  elapsed.value = 0;
  run();
};

// A tap goes on or back; holding pauses.
const press = { at: 0 };
const onDown = () => {
  press.at = Date.now();
  paused.value = true;
};
const onUp = (event: PointerEvent) => {
  paused.value = false;
  if (Date.now() - press.at > 400) return;
  const target = event.currentTarget as HTMLElement;
  const { left, width } = target.getBoundingClientRect();
  go(event.clientX - left < width / 3 ? 'left' : 'right');
};

/** How full each segment of the bar is, from 0 to 1. */
const fill = (index: number) =>
  index < at.value
    ? 1
    : index > at.value
      ? 0
      : reduced.value || !started.value || at.value === screens.value.length - 1
        ? index === at.value && at.value === screens.value.length - 1
          ? 1
          : 0
        : Math.min(1, elapsed.value / (STORY_SECONDS * 1000));

/** The colours of a screen: background, text, and softer text. */
const LOOKS = {
  opening: 'bg-[#274e34] text-white',
  suspense: 'bg-[#a43a2f] text-white',
  santa: 'bg-[#a43a2f] text-white',
  unmasked: 'bg-[#274e34] text-white',
  detective: 'bg-[#e6b94a] text-[#3a240c]',
  transparent: 'bg-[#a43a2f] text-white',
  hidden: 'bg-[#5b3a55] text-white',
  suspect: 'bg-[#274e34] text-white',
  end: 'bg-[#f7f2e9] text-[#292524]',
} as const;
const look = computed(() =>
  screen.value.kind === 'award'
    ? LOOKS[screen.value.award]
    : LOOKS[screen.value.kind],
);
const dark = computed(
  () =>
    screen.value.kind === 'end' ||
    (screen.value.kind === 'award' && screen.value.award === 'detective'),
);

const list = (names: string[]) =>
  new Intl.ListFormat(locale.value, { type: 'conjunction' }).format(names);
/** What an award screen says. */
const awardWords = (award: Award) => {
  const winners = award.winners
    .map(personOf)
    .filter((p): p is Person => Boolean(p));
  const many = award.count > 1;
  const key = `participant.game.awards.${award.kind}`;
  return {
    eyebrow: tk(`${key}.${many ? 'titleMany' : 'title'}`),
    people: winners,
    name: winners.length > 0 ? list(winners.map((w) => w.name)) : '',
    // More than three: a sentence with a number, no name.
    crowd:
      winners.length === 0 ? tk(`${key}.crowd`, { count: award.count }) : '',
    body: tk(`${key}.${many ? 'bodyMany' : 'body'}`, {
      count: award.value,
      total: award.total ?? 0,
    }),
  };
};
/** The award of the screen shown, in words. */
const awardView = computed(() => {
  const current = screen.value;
  if (current.kind !== 'award') return null;
  const award = props.awards.find((a) => a.kind === current.award);
  return award ? awardWords(award) : null;
});
/** How many played, in the words of the small palmarès. */
const smallKey = (players: number) =>
  players <= 1 ? 'alone' : players === 2 ? 'two' : 'three';
const santaWords = computed(() => {
  const santa = props.santa;
  if (!santa) return null;
  const actual = personOf(santa.actualId);
  const guessed = personOf(santa.guessedId);
  const right = santa.guessedId === santa.actualId;
  return {
    actual,
    guessed,
    right,
    suspense: guessed
      ? t('participant.game.story.youSaid', { name: guessed.name })
      : t('participant.game.story.noGuess'),
    title: right
      ? t('participant.game.story.right', { name: actual?.name ?? '' })
      : t('participant.game.story.was', { name: actual?.name ?? '' }),
    body: right
      ? props.small
        ? t(`participant.game.story.rightSmall.${smallKey(props.players)}`)
        : t('participant.game.story.rightBody', {
            count: props.unmasked,
            total: props.players,
          })
      : guessed
        ? t('participant.game.story.wrongBody', { name: guessed.name })
        : t('participant.game.story.noGuessBody'),
  };
});
</script>

<template>
  <div
    class="fixed inset-0 z-50 flex flex-col px-4 pt-[calc(0.875rem+env(safe-area-inset-top))] pb-[calc(1.75rem+env(safe-area-inset-bottom))] select-none"
    :class="look"
    data-testid="stories"
    :data-screen="screen.kind === 'award' ? screen.award : screen.kind"
  >
    <div
      role="img"
      :aria-label="
        t('participant.game.story.progress', {
          index: at + 1,
          count: screens.length,
        })
      "
      class="flex gap-1"
    >
      <span
        v-for="(_, index) in screens"
        :key="index"
        class="h-[3px] flex-1 overflow-hidden rounded-full"
        :class="dark ? 'bg-[#3a240c]/30' : 'bg-white/30'"
      >
        <span
          class="block h-full rounded-full"
          :class="dark ? 'bg-[#3a240c]' : 'bg-white'"
          :style="{ width: `${fill(index) * 100}%` }"
        />
      </span>
    </div>
    <div class="mt-2.5 flex items-center justify-between">
      <span class="flex items-center gap-1.5 font-display text-base font-bold">
        <UIcon name="i-lucide-sparkle" class="size-4.5" aria-hidden="true" />
        {{ t('participant.game.story.header', { label: editionLabel }) }}
      </span>
      <NuxtLink
        :to="answersPath"
        class="-mr-2.5 flex size-11 items-center justify-center"
        :aria-label="t('participant.game.story.close')"
        data-testid="stories-close"
      >
        <UIcon name="i-lucide-x" class="size-5.5" />
      </NuxtLink>
    </div>

    <div
      class="flex grow touch-none flex-col items-center justify-center gap-5.5 text-center"
      :class="screen.kind === 'end' ? '' : 'cursor-pointer'"
      data-testid="stories-stage"
      @pointerdown="screen.kind === 'end' ? undefined : onDown()"
      @pointerup="(e) => (screen.kind === 'end' ? undefined : onUp(e))"
      @pointerleave="paused = false"
    >
      <template v-if="screen.kind === 'opening'">
        <p class="text-sm font-bold tracking-[0.08em] uppercase opacity-90">
          {{ t('participant.game.story.openingEyebrow') }}
        </p>
        <p
          class="font-display text-[56px] leading-[1.05] font-bold whitespace-pre-line"
        >
          {{ t('participant.game.story.openingTitle') }}
        </p>
        <p class="max-w-75 text-lg leading-[1.4] opacity-90">
          {{
            t('participant.game.story.openingBody', {
              players,
              guesses,
            })
          }}
        </p>
      </template>

      <template v-else-if="screen.kind === 'suspense' && santaWords">
        <p class="text-sm font-bold tracking-[0.08em] uppercase opacity-90">
          {{ t('participant.game.story.mySanta') }}
        </p>
        <span
          class="flex size-32 items-center justify-center rounded-full border-2 border-dashed border-white/80 font-display text-6xl font-bold"
          aria-hidden="true"
          >?</span
        >
        <p
          class="font-display text-[44px] leading-[1.1] font-bold whitespace-pre-line"
        >
          {{ santaWords.suspense }}
        </p>
        <p class="text-lg opacity-90">
          {{ t('participant.game.story.soWell') }}
        </p>
      </template>

      <template v-else-if="screen.kind === 'santa' && santaWords">
        <p class="text-sm font-bold tracking-[0.08em] uppercase opacity-90">
          {{ t('participant.game.story.mySanta') }}
        </p>
        <UiAvatar
          v-if="santaWords.actual"
          :avatar="santaWords.actual.avatar"
          size="xl"
          class="size-32! text-6xl! shadow-[0_0_0_4px_rgba(255,253,249,0.9),0_12px_30px_rgba(0,0,0,0.25)]"
        />
        <p
          class="font-display text-[48px] leading-[1.08] font-bold whitespace-pre-line"
        >
          {{ santaWords.title }}
        </p>
        <p class="max-w-75 text-lg leading-[1.4] opacity-90">
          {{ santaWords.body }}
        </p>
      </template>

      <template v-else-if="awardView">
        <p class="text-sm font-bold tracking-[0.08em] uppercase opacity-90">
          {{ awardView.eyebrow }}
        </p>
        <span v-if="awardView.people.length > 0" class="flex">
          <UiAvatar
            v-for="(person, index) in awardView.people"
            :key="person.id"
            :avatar="person.avatar"
            size="xl"
            class="size-32! text-6xl! shadow-[0_0_0_4px_rgba(255,253,249,0.9),0_12px_30px_rgba(0,0,0,0.25)]"
            :class="index > 0 ? '-ml-6' : ''"
          />
        </span>
        <p class="font-display text-[52px] leading-[1.08] font-bold">
          {{ awardView.name || awardView.crowd }}
        </p>
        <p class="max-w-75 text-lg leading-[1.4] opacity-90">
          {{ awardView.body }}
        </p>
      </template>

      <template v-else-if="screen.kind === 'end'">
        <p class="text-sm font-bold tracking-[0.08em] uppercase opacity-80">
          {{ t('participant.game.story.endEyebrow') }}
        </p>
        <p
          class="font-display text-[48px] leading-[1.08] font-bold whitespace-pre-line"
        >
          {{
            firstName
              ? t('participant.game.story.endTitle', { name: firstName })
              : t('participant.game.story.endTitleAlone')
          }}
        </p>
        <UButton
          :to="answersPath"
          block
          size="xl"
          class="mt-2 max-w-80 justify-center font-bold"
          :label="t('participant.game.story.allResults')"
          data-testid="stories-all"
        />
        <button
          type="button"
          class="flex min-h-11 items-center text-[17px] underline opacity-80"
          @click="restart"
        >
          {{ t('participant.game.story.again') }}
        </button>
      </template>
    </div>
    <p
      v-if="screen.kind !== 'end'"
      class="text-center text-sm opacity-80"
      aria-live="polite"
    >
      {{ t('participant.game.story.tapNext') }}
    </p>
  </div>
</template>
